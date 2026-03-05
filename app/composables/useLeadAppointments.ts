import { type LeadTask } from './useLeads';

export const useLeadAppointments = () => {
    const supabase = useSupabaseClient();
    const { waitForProfile } = useAuth();

    // Access the shared leads state
    const allLeads = useState<any[]>('leads-all-data', () => []);
    const appointmentsMap = useState<Record<string, any>>('leads-appointments-map', () => ({}));

    /**
     * Busca o próximo agendamento futuro para todos os leads carregados.
     * Tenta vincular leads a clientes pelo telefone caso o cliente_id esteja ausente.
     */
    const fetchNextAppointments = async () => {
        if (allLeads.value.length === 0) return;

        // 1. Preparar lista de telefones para busca de vínculos (Leads SEM cliente_id)
        const leadsWithoutClient = (allLeads.value as LeadTask[]).filter(l => !l.cliente_id && (l.telefone || l.phone));
        const phoneToLeadMap: Record<string, string[]> = {};
        const phonesToSearch: string[] = [];

        leadsWithoutClient.forEach((l: LeadTask) => {
            const rawPhone = String(l.telefone || l.phone || '').replace(/\D/g, '');
            if (rawPhone.length >= 8) {
                if (!phoneToLeadMap[rawPhone]) phoneToLeadMap[rawPhone] = [];
                phoneToLeadMap[rawPhone].push(String(l.id));
                // Adicionamos variações comuns de busca ilike para garantir
                phonesToSearch.push(rawPhone);
            }
        });

        // 2. Simplificação drástica: Não fazer buscas pesadas por ILIKE de telefone em todas as consultas.
        // O vínculo deve ser feito na criação do lead ou em um processo separado.
        const autoClientIds: Record<string, number> = {};

        // 3. Montar mapa final de LeadID -> ClienteID e lista de ClientIDs únicos
        const leadToClientMapping: Record<string, number> = {};
        const allTargetClientIds = new Set<number>();
        const allLeadIds: string[] = [];

        allLeads.value.forEach(l => {
            const lid = String(l.id);
            allLeadIds.push(lid);
            const cid = l.cliente_id || autoClientIds[lid];
            const numCid = Number(cid);
            if (cid && !isNaN(numCid) && numCid > 0) {
                leadToClientMapping[lid] = numCid;
                allTargetClientIds.add(numCid);
                // Atualiza localmente o lead para que futuras consultas saibam o vínculo
                l.cliente_id = numCid;
            }
        });

        if (allTargetClientIds.size === 0 && allLeadIds.length === 0) {
            console.log('⚠️ [fetchNextAppointments] Nenhum lead ou cliente para buscar agendamentos.');
            appointmentsMap.value = {};
            return;
        }

        // 4. Buscar TODOS os agendamentos ativos dos clientes OU leads encontrados
        let query = supabase
            .from('ag_agendamentos')
            .select('cliente_id, lead_id, data, hora_inicio, hora_fim, titulo, descricao, categoria')
            .eq('cancelado', false);

        const filters: string[] = [];
        if (allTargetClientIds.size > 0) {
            filters.push(`cliente_id.in.(${Array.from(allTargetClientIds).join(',')})`);
        }
        if (allLeadIds.length > 0) {
            // Usa aspas para IDs de string/UUID, filtrando apenas UUIDs reais
            // para evitar erro 22P02 no PostgreSQL quando tentar buscar leads com ID numérico
            const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
            const validLeadIds = allLeadIds.filter(isUuid);

            if (validLeadIds.length > 0) {
                filters.push(`lead_id.in.(${validLeadIds.map(id => `"${id}"`).join(',')})`);
            }
        }

        if (filters.length > 0) {
            query = query.or(filters.join(','));
        } else {
            console.log('⚠️ [fetchNextAppointments] Nenhum lead ou cliente com ID válido para buscar.');
            appointmentsMap.value = {};
            return;
        }

        await waitForProfile();

        const performFetch = async (retryCount = 0) => {
            const { data, error } = await query
                .order('data', { ascending: true })
                .order('hora_inicio', { ascending: true });

            if (error) {
                console.error('❌ [fetchNextAppointments] Erro:', error);
                return;
            }

            return data;
        };

        const data = await performFetch();

        if (!data) {
            console.warn('⚠️ [fetchNextAppointments] Mapeamento cancelado devido a erro na busca.');
            return;
        }

        console.log(`📡 [fetchNextAppointments] ${data?.length || 0} agendamentos totais encontrados para ${allTargetClientIds.size} clientes e ${allLeadIds.length} leads.`);

        const newMap: Record<string, any> = {};
        const now = new Date();
        const nowTs = now.getTime();

        // Inverte o mapeamento: ClienteID -> Lista de LeadIDs
        const clientToLeads: Record<number, string[]> = {};
        for (const lid in leadToClientMapping) {
            const cid = leadToClientMapping[lid];
            if (cid !== undefined) {
                if (!clientToLeads[cid]) clientToLeads[cid] = [];
                clientToLeads[cid].push(lid);
            }
        }

        data?.forEach((app: any) => {
            // Identifica quais leads este agendamento atende (via lead_id direto ou via cliente_id)
            const leadsMatching: string[] = [];

            if (app.lead_id) {
                leadsMatching.push(String(app.lead_id));
            }

            if (app.cliente_id) {
                const leadsByClient = clientToLeads[app.cliente_id];
                if (leadsByClient) {
                    leadsByClient.forEach(lid => {
                        if (!leadsMatching.includes(lid)) leadsMatching.push(lid);
                    });
                }
            }

            if (leadsMatching.length > 0) {
                leadsMatching.forEach(leadId => {
                    if (!newMap[leadId]) {
                        newMap[leadId] = { count: 0, next: null };
                    }

                    // Corrige parsing de data ISO removendo offset se necessário ou tratando UTC
                    const horaInicioLimpa = (app.hora_inicio || '00:00:00').split(/[-+]/)[0] || '00:00:00';
                    const appDate = `${app.data}T${horaInicioLimpa}`;
                    const appObj = {
                        appointment_date: appDate,
                        status: 'active',
                        titulo: app.titulo,
                        descricao: app.descricao,
                        hora_fim: app.hora_fim,
                        categoria: app.categoria
                    };

                    newMap[leadId].count++;
                    const appTs = new Date(appDate).getTime();

                    // Lógica de seleção do "Próximo" ou "Atrasado"
                    if (!newMap[leadId].next) {
                        newMap[leadId].next = appObj;
                    } else {
                        const currTs = new Date(newMap[leadId].next.appointment_date).getTime();

                        if (appTs >= nowTs) {
                            // Se o novo é futuro e o atual era passado, o futuro ganha.
                            // Se ambos são futuro, o mais próximo ganha.
                            if (currTs < nowTs || appTs < currTs) {
                                newMap[leadId].next = appObj;
                            }
                        } else {
                            // Se ambos são passado, o mais recente ganha.
                            if (currTs < nowTs && appTs > currTs) {
                                newMap[leadId].next = appObj;
                            }
                        }
                    }
                });
            }
        });

        console.log('✅ [fetchNextAppointments] Mapeamento concluído para', Object.keys(newMap).length, 'leads. Keys recebidas:', Object.keys(newMap));
        appointmentsMap.value = newMap;
    };

    /**
     * Inscrição Realtime para Agendamentos
     */
    const subscribeToAppointmentChanges = () => {
        return (supabase as any)
            .channel('agendamentos-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'ag_agendamentos' },
                () => {
                    // Debounce simples para não sobrecarregar
                    setTimeout(() => fetchNextAppointments(), 500);
                }
            )
            .subscribe();
    };

    return {
        appointmentsMap,
        fetchNextAppointments,
        subscribeToAppointmentChanges
    };
};
