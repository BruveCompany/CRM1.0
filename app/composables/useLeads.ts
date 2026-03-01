/**
 * Composable useLeads
 * Gerencia o estado global, busca e processamento de dados relacionados aos Leads.
 */
import { ref, computed } from 'vue'

export interface LeadTask {
    id: string;
    leadName: string;
    phone: string;
    avatarText: string;
    unreadMessages?: number;
    lastActivityText?: string;
    statusIcon?: string;
    vendedorNome?: string;
    vendedorLastSeenText?: string;
    status: string;
    nome?: string; // Original database fields
    telefone?: string;
    vendedor_nome?: string;
    ultima_mensagem_data?: string;
    mensagens_nao_lidas?: number;
    notas?: string;
    score?: number;
    vendedor_id?: string | number | null;
    vendedorOnline?: boolean;
    temperatura?: string;
    profissional_id?: string | number | null;
    vendedor_nome_full?: string;
    nextAppointment?: {
        appointment_date: string;
        status: string;
        titulo?: string;
        descricao?: string | null;
        hora_fim?: string;
        categoria?: string;
    } | null;
    appointmentsCount?: number;
    cliente_id?: number | null;
    email?: string;
    origem?: string;
}

export interface LeadStatus {
    id: string;
    display_name: string;
    color_bg: string;
    color_text: string;
    order_index: number;
    font_size?: string;  // Padrão: 'text-xs'
    font_weight?: string; // Padrão: 'font-bold'
    font_family?: string; // Padrão: 'font-sans'
    status_icon?: string;
}

export interface KanbanColumn extends LeadStatus {
    tasks: LeadTask[];
    totalDeals?: number;
}

export const useLeads = () => {
    const supabase = useSupabaseClient()
    const { profile, isOnlineCalculated } = useAuth()
    const allLeads = useState<any[]>('leads-all-data', () => [])
    const leadStatuses = useState<LeadStatus[]>('leads-statuses', () => [])
    const searchQuery = useState<string>('leads-search-query', () => '')
    const showKanbanView = useState<boolean>('leads-view-mode-toggle', () => true)

    // Armazena IDs de leads sendo movidos para atualização otimista na interface
    const pendingStatusUpdates = useState<Record<string, string>>('leads-pending-updates', () => ({}))
    const appointmentsMap = useState<Record<string, any>>('leads-appointments-map', () => ({}))
    // Estados reativos para modais e filtros
    const selectedLeadId = useState<string | null>('selected-lead-id', () => null)
    const showDetailsModal = useState<boolean>('show-details-modal', () => false)
    const vendedores = useState<any[]>('leads-vendedores', () => [])
    const selectedVendedorId = useState<string | null>('leads-selected-vendedor-id', () => null)
    const showMyLeads = useState<boolean>('leads-show-my-leads', () => false)
    const isEditingStatuses = useState<boolean>('leads-is-editing-statuses', () => false)
    const isCreateLeadModalOpen = useState<boolean>('leads-create-modal-open', () => false)
    const isLoadingLeads = useState<boolean>('leads-is-loading', () => false)
    const isFetching = useState<boolean>('leads-is-fetching-global', () => false)
    const lastFetchTime = useState<number>('leads-last-fetch-time', () => 0)

    const openDetails = (id: string) => {
        selectedLeadId.value = id
        showDetailsModal.value = true
    }

    const fetchStatuses = async () => {
        // Cache de 5 minutos para os status
        const now = Date.now();
        const lastStatusFetch = useState<number>('leads-last-status-fetch', () => 0);
        if (leadStatuses.value.length > 0 && now - lastStatusFetch.value < 300000) return;

        const { data, error } = await supabase
            .from('ag_lead_statuses')
            .select('*')
            .order('order_index', { ascending: true })

        if (!error && data) {
            leadStatuses.value = data
            lastStatusFetch.value = now;
        }
    }

    /**
     * SUBSCRIPÇÃO REALTIME PARA STATUS
     */
    const subscribeToStatusChanges = () => {
        return (supabase as any)
            .channel('public:ag_lead_statuses')
            .on('postgres_changes', { event: '*', table: 'ag_lead_statuses', schema: 'public' }, () => {
                fetchStatuses()
            })
            .subscribe()
    }

    /**
     * SUBSCRIPÇÃO REALTIME PARA LEADS
     * Essencial para que o Kanban e a Lista atualizem sozinhos.
     */
    const subscribeToLeadChanges = () => {
        return (supabase as any)
            .channel('public:ag_leads_changes')
            .on('postgres_changes', {
                event: '*',
                table: 'ag_leads',
                schema: 'public'
            }, (payload: any) => {
                console.log('Realtime Lead Change:', payload.event)
                fetchLeads()
            })
            .subscribe()
    }

    // Helpers de Formatação
    const formatRelativeTime = (dateString: string) => {
        if (!dateString) return '';
        if (import.meta.server) return '...';
        const date = new Date(dateString);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays >= 1) return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
        if (diffHours >= 1) return `Há ${diffHours}h`;
        if (diffMinutes < 1) return 'Agora';
        return `Há ${diffMinutes} min`;
    }

    const getStatusIcon = (status: string, unreadMessages: number) => {
        if (unreadMessages > 0) return 'message-circle';
        if (status === 'ganho') return 'check-circle';
        if (status === 'perdido') return 'x-circle';
        return 'user';
    }

    const fetchVendedores = async () => {
        const { data, error } = await supabase
            .from('ag_profiles')
            .select('id, user_id, nome, role, is_online, last_activity')
            .order('nome');

        if (error) {
            console.error('Erro ao buscar vendedores:', error);
            return;
        }

        if (data) {
            vendedores.value = data;
            const lastVendedoresFetch = useState<number>('leads-last-vendedores-fetch', () => 0);
            lastVendedoresFetch.value = Date.now();
        }
    };

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
            if (cid) {
                leadToClientMapping[lid] = Number(cid);
                allTargetClientIds.add(Number(cid));
                // Atualiza localmente o lead para que futuras consultas saibam o vínculo
                l.cliente_id = cid;
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
            // Usa aspas para IDs de string/UUID
            filters.push(`lead_id.in.(${allLeadIds.map(id => `"${id}"`).join(',')})`);
        }

        if (filters.length > 0) {
            query = query.or(filters.join(','));
        }

        const { data, error } = await query
            .order('data', { ascending: true })
            .order('hora_inicio', { ascending: true });

        if (error) {
            console.error('❌ [fetchNextAppointments] Erro:', error);
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

        console.log('✅ [fetchNextAppointments] Mapeamento concluído para', Object.keys(newMap).length, 'leads.');
        appointmentsMap.value = newMap;
    }

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
                    fetchNextAppointments();
                }
            )
            .subscribe();
    }

    const fetchLeads = async (silent = false) => {
        if (isFetching.value) return;

        // Estratégia de Cache: Se buscou nos últimos 0.5 segundos em modo não-silencioso, pula
        const now = Date.now();
        if (!silent && now - lastFetchTime.value < 500) return;

        isFetching.value = true;
        if (!silent) isLoadingLeads.value = true;

        try {
            // 1. Dispara buscas em paralelo
            const fetchProfilesTask = fetchVendedores();

            // 2. Busca leads da tabela ag_leads com JOIN explícito para garantir o nome do vendedor
            let query = supabase
                .from('ag_leads')
                .select(`
                    *,
                    vendedor:vendedor_id (id, nome)
                `)

            if (showMyLeads.value && profile.value?.id) {
                query = query.eq('vendedor_id', profile.value.id)
            } else if (selectedVendedorId.value && selectedVendedorId.value !== 'all') {
                query = query.eq('vendedor_id', selectedVendedorId.value)
            }

            // Executa a Query principal e a busca de vendedores em paralelo
            const [leadsResult] = await Promise.all([
                query.order('criado_em', { ascending: false }),
                fetchProfilesTask
            ]);

            if (leadsResult.error) throw leadsResult.error;

            if (leadsResult.data) {
                // 3. Normalização dos Leads
                allLeads.value = (leadsResult.data as any[]).map(lead => {
                    const leadId = lead.id ? String(lead.id) : '';
                    let statusFinal = lead.status || 'leads_novos';

                    if (leadId && pendingStatusUpdates.value[leadId]) {
                        const targetStatus = pendingStatusUpdates.value[leadId]
                        if (String(statusFinal).toLowerCase().trim().replace(/\s+/g, '_') === String(targetStatus).toLowerCase().trim().replace(/\s+/g, '_')) {
                            delete pendingStatusUpdates.value[leadId]
                        } else {
                            statusFinal = targetStatus
                        }
                    }

                    // Tenta obter o nome do vendedor DIRETAMENTE do objeto (do JOIN vendedor)
                    const vIdRaw = lead.vendedor_id || lead.vendedor?.id;
                    const vNomeRaw = lead.vendedor?.nome || lead.vendedor_nome || lead.profissional_nome || 'Não Atribuído';

                    // Normalização do vendedor_id: trata 0 ou '0' como null (Não Atribuído)
                    const normalizedVendedorId = (vIdRaw && vIdRaw !== 0 && vIdRaw !== '0') ? String(vIdRaw) : null;

                    return {
                        ...lead,
                        id: leadId,
                        status: statusFinal,
                        vendedor_id: normalizedVendedorId,
                        vendedor_nome: (() => {
                            if (!vNomeRaw || vNomeRaw === 'Não Atribuído' || vNomeRaw === 'Sem Vendedor') return 'Não Atribuído';
                            // Limpeza básica do nome
                            const parts = String(vNomeRaw).trim().split(/\s+/).filter(p => !['de', 'da', 'do', 'das', 'dos', 'e'].includes(p.toLowerCase()));
                            return parts.length >= 2 ? `${parts[0]} ${parts[1]}` : parts[0] || vNomeRaw;
                        })()
                    }
                });

                lastFetchTime.value = now;
                // Busca agendamentos logo após ter os leads (depende dos IDs)
                await fetchNextAppointments();
            }
        } catch (error) {
            console.error('[fetchLeads] Falha:', error);
        } finally {
            isFetching.value = false;
            if (!silent) isLoadingLeads.value = false; // Removido setTimeout de 300ms
        }
    }

    // Monitora o carregamento do perfil para buscar leads assim que a identidade for confirmada
    if (import.meta.client) {
        watch(() => profile.value?.id, (newId) => {
            if (newId) fetchLeads();
        }, { immediate: true });
    }

    // VERSÃO OTIMIZADA: Propriedade computada para enriquecer os leads com dados de UI e presença
    const enrichedLeadsList = computed(() => {
        const { onlineUsers: socketOnlineUsers } = usePresence()
        const currentVendedores = vendedores.value || [];
        const currentLeads = allLeads.value || [];
        const presence = socketOnlineUsers.value || {};
        const myProfile = profile.value;

        // Pré-cache de vendedores para busca O(1)
        const vMap = new Map();
        currentVendedores.forEach(v => {
            if (v.id) vMap.set(String(v.id), v);
        });

        return currentLeads.map(l => {
            const vId = l.vendedor_id ? String(l.vendedor_id) : null;
            const lid = String(l.id);

            // Busca no mapa por ID (string) ou por user_id se vId for um UUID
            // Adicionamos redundância para garantir o match do ID
            let vInfo = vId ? (vMap.get(vId) || currentVendedores.find(v => String(v.user_id) === vId || String(v.id) === vId)) : null;

            // Se não encontrou no mapa global, mas vId coincide com o perfil logado, usa o perfil logado
            if (!vInfo && vId && myProfile) {
                if (String(myProfile.id) === vId || String(myProfile.user_id) === vId) {
                    vInfo = myProfile;
                }
            }

            // Presença (Socket > DB)
            const isOnline = !!(vId && presence[vId]);
            const nextApp = appointmentsMap.value[lid];

            // Tenta obter o nome do vendedor de forma mais robusta possível
            const dbNome = l.vendedor_nome === 'Não Atribuído' ? null : l.vendedor_nome;
            let vNome = vInfo?.nome || dbNome || l.vendedor_nome_display || 'Livre';

            // Limpeza final para exibição curta no card
            if (vNome !== 'Livre') {
                const parts = vNome.split(' ').filter((p: string) => p.length > 2 || p.match(/[A-Z]/));
                if (parts.length >= 2) vNome = `${parts[0]} ${parts[1]}`;
                else vNome = parts[0] || vNome;
            }

            return {
                ...l,
                leadName: l.nome,
                phone: l.telefone,
                vendedorOnline: isOnline,
                vendedorNome: vNome,
                lastActivityText: formatRelativeTime(l.ultima_mensagem_data),
                unreadMessages: (l.mensagens_nao_lidas || 0) > 0 ? l.mensagens_nao_lidas : undefined,
                statusIcon: getStatusIcon(l.status, l.mensagens_nao_lidas || 0),
                nextAppointment: nextApp?.next || null,
                appointmentsCount: nextApp?.count || 0,
                // Texto do avatar (JC) - Calculado apenas uma vez
                avatarText: vNome === 'Livre' ? '??' : vNome.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
            } as LeadTask;
        });
    });

    const filteredLeadsList = computed(() => {
        const list = enrichedLeadsList.value;
        if (!searchQuery.value) return list;
        const query = searchQuery.value.toLowerCase();
        return list.filter(lead =>
            (lead.nome && lead.nome.toLowerCase().includes(query)) ||
            (lead.telefone && lead.telefone.toLowerCase().includes(query)) ||
            (lead.vendedor_nome && lead.vendedor_nome.toLowerCase().includes(query))
        );
    });

    // Funções Administrativas para Gerenciamento de Status
    const addStatus = async (status: Partial<LeadStatus>) => {
        const { data, error } = await (supabase
            .from('ag_lead_statuses') as any)
            .insert([{
                ...status,
                id: status.display_name?.toLowerCase().trim().replace(/\s+/g, '_'),
                order_index: leadStatuses.value.length + 1,
                font_size: status.font_size || 'text-xs',
                font_weight: status.font_weight || 'font-bold',
                font_family: status.font_family || 'font-sans',
                status_icon: status.status_icon || null
            }])
            .select()
        return { data, error }
    }

    const updateStatus = async (id: string, updates: Partial<LeadStatus>) => {
        const { error } = await (supabase
            .from('ag_lead_statuses') as any)
            .update(updates)
            .eq('id', id)
        return { error }
    }

    const deleteStatus = async (id: string, reassignToId?: string) => {
        // Se houver leads e um novo status para reatribuição for fornecido
        if (reassignToId) {
            await (supabase
                .from('ag_leads') as any)
                .update({ status: reassignToId })
                .eq('status', id)
        }

        const { error } = await (supabase
            .from('ag_lead_statuses') as any)
            .delete()
            .eq('id', id)
        return { error }
    }

    const reorderStatuses = async (newOrderedStatuses: LeadStatus[]) => {
        const updates = newOrderedStatuses.map((s, index) => ({
            id: s.id,
            display_name: s.display_name,
            color_bg: s.color_bg,
            color_text: s.color_text,
            order_index: index + 1,
            font_size: s.font_size,
            font_weight: s.font_weight,
            font_family: s.font_family,
            status_icon: s.status_icon
        }))

        const { error } = await (supabase
            .from('ag_lead_statuses') as any)
            .upsert(updates)
        return { error }
    }

    // Popula o Kanban com os dados dinâmicos da tabela ag_lead_statuses
    const columnsWithTotals = computed(() => {
        return leadStatuses.value.map(status => {
            const tasks = filteredLeadsList.value
                .filter(l => {
                    const normalLeadStatus = String(l.status).toLowerCase().trim().replace(/\s+/g, '_');
                    const normalStatusId = status.id.toLowerCase().trim();
                    return normalLeadStatus === normalStatusId || l.status === status.id;
                });

            return {
                ...status,
                tasks,
                totalDeals: tasks.length
            }
        })
    })

    return {
        allLeads,
        leadStatuses,
        searchQuery,
        showKanbanView,
        pendingStatusUpdates,
        selectedLeadId,
        showDetailsModal,
        vendedores,
        selectedVendedorId,
        showMyLeads,
        isEditingStatuses,
        openDetails,
        columnsWithTotals,
        filteredLeadsList,
        fetchLeads,
        isLoadingLeads,
        fetchStatuses,
        subscribeToStatusChanges,
        subscribeToLeadChanges,
        fetchVendedores,
        addStatus,
        updateStatus,
        deleteStatus,
        reorderStatuses,
        formatRelativeTime,
        subscribeToAppointmentChanges,
        fetchNextAppointments,
        isCreateLeadModalOpen
    }
}
