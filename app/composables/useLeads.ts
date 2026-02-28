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

    const openDetails = (id: string) => {
        selectedLeadId.value = id
        showDetailsModal.value = true
    }

    // Busca de status no banco de dados
    const fetchStatuses = async () => {
        const { data, error } = await supabase
            .from('ag_lead_statuses')
            .select('*')
            .order('order_index', { ascending: true })

        if (!error && data) {
            leadStatuses.value = data
        }
    }

    /**
     * SUBSCRIPÇÃO REALTIME PARA STATUS
     * Mantém o Kanban atualizado em tempo real quando um administrador faz alterações.
     */
    const subscribeToStatusChanges = () => {
        return (supabase as any)
            .channel('public:ag_lead_statuses')
            .on('postgres_changes', { event: '*', table: 'ag_lead_statuses', schema: 'public' }, () => {
                fetchStatuses()
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
            .order('nome')

        if (!error && data) {
            vendedores.value = data
        }
    }

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

        // 2. Buscar vínculos faltantes na ag_clientes
        const autoClientIds: Record<string, number> = {};
        if (phonesToSearch.length > 0) {
            console.log(`🔍 [fetchNextAppointments] Tentando vincular ${phonesToSearch.length} leads via telefone...`);

            // Busca em blocos se necessário, mas aqui faremos direto (in)
            // Nota: O ideal é que o telefone no ag_clientes também esteja limpo, 
            // mas buscaremos de forma ampla se possível.
            const { data: clients, error: cErr } = await supabase
                .from('ag_clientes')
                .select('id, telefone')
                .or(phonesToSearch.map(p => `telefone.ilike.%${p}%`).join(','));

            if (!cErr && clients) {
                (clients as { id: number; telefone: string }[]).forEach(c => {
                    const cleanCPhone = String(c.telefone || '').replace(/\D/g, '');
                    // Se o telefone do cliente contém nossos dígitos ou vice-versa
                    for (const leadPhone in phoneToLeadMap) {
                        if (cleanCPhone.includes(leadPhone) || leadPhone.includes(cleanCPhone)) {
                            const matchingLeadIds = phoneToLeadMap[leadPhone];
                            if (matchingLeadIds) {
                                matchingLeadIds.forEach(lid => {
                                    autoClientIds[lid] = c.id;
                                });
                            }
                        }
                    }
                });
            }
        }

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

    const fetchLeads = async () => {
        // Sempre atualiza a lista de vendedores para garantir que o status online esteja fresco
        await fetchVendedores()

        // Voltamos para a busca simples para garantir que nenhum lead suma
        let query = supabase.from('view_leads_crm').select('*')

        if (showMyLeads.value) {
            if (profile.value && profile.value.id) {
                query = query.eq('vendedor_id', profile.value.id)
            } else {
                // Se o perfil não está carregado, buscamos na hora para garantir a filtragem
                const user = useSupabaseUser()
                if (user.value?.id) {
                    const { data: profileData } = await supabase
                        .from('ag_profiles')
                        .select('id')
                        .eq('user_id', user.value.id)
                        .maybeSingle() as { data: { id: number } | null }

                    if (profileData) {
                        query = query.eq('vendedor_id', profileData.id)
                    } else {
                        // Se não encontrar de jeito nenhum, forçamos um filtro que não retorne nada 
                        // em vez de mostrar tudo, para manter a privacidade do filtro
                        query = query.eq('vendedor_id', -1)
                    }
                }
            }
        } else if (selectedVendedorId.value && selectedVendedorId.value !== 'all' && selectedVendedorId.value !== 'undefined') {
            query = query.eq('vendedor_id', selectedVendedorId.value)
        }

        const { data: leadsData, error } = await query
            .order('criado_em', { ascending: false })

        if (error || !leadsData) {
            allLeads.value = []
            return
        }

        allLeads.value = (leadsData as any[]).map(lead => {
            const leadId = lead.id ? String(lead.id) : '';
            let statusFinal = lead.status || 'leads_novos';

            if (leadId && pendingStatusUpdates.value[leadId]) {
                const targetStatus = pendingStatusUpdates.value[leadId]
                const normalizedCurrent = String(statusFinal).toLowerCase().trim().replace(/\s+/g, '_')
                const normalizedTarget = String(targetStatus).toLowerCase().trim().replace(/\s+/g, '_')

                if (normalizedCurrent === normalizedTarget) {
                    delete pendingStatusUpdates.value[leadId]
                } else {
                    statusFinal = targetStatus
                }
            }

            const rawNomeVendedor = lead.vendedor_nome ||
                lead.vendedor_nome_display ||
                lead.nome_vendedor ||
                lead.profissional_nome ||
                lead.vendedor ||
                'Não Atribuído';

            const preposicoes = ['de', 'da', 'do', 'das', 'dos', 'e'];
            const allParts = String(rawNomeVendedor).trim().split(/\s+/);
            const filteredParts = allParts.filter((part: string) => !preposicoes.includes(part.toLowerCase()));

            const nomeVendedor = filteredParts.length >= 2
                ? `${filteredParts[0]} ${filteredParts[1]}`
                : filteredParts[0] || rawNomeVendedor;

            return {
                ...lead,
                id: leadId,
                status: statusFinal,
                vendedor_id: lead.vendedor_id || lead.profissional_id || null,
                vendedor_nome: nomeVendedor,
                vendedor_nome_full: rawNomeVendedor
            }
        })

        await fetchNextAppointments();
    }

    // NOVO: Propriedade computada para enriquecer os leads com dados de UI e presença
    const enrichedLeadsList = computed(() => {
        // Acessa o estado global de presença (socket)
        const { onlineUsers: socketOnlineUsers } = usePresence()

        return allLeads.value.map(l => {
            const vId = l.vendedor_id;

            // Busca informações do vendedor (seja o próprio ou outro)
            const vendedorOnline = (() => {
                if (!vId) return false;

                // 1. Checagem Principal: Socket Presence (CRM Prime)
                // Se o ID do vendedor está no mapa de sockets online, ele está 100% online agora.
                if (socketOnlineUsers.value[String(vId)]) return true;

                // 2. Fallback: Verificação do Banco de Dados (Usuários em outras abas ou polling antigo)
                const vInfo = vendedores.value.find(v => String(v.id) === String(vId));
                if (vInfo) {
                    const isOnlineDB = vInfo.is_online === true;
                    const lastActivity = vInfo.last_activity ? new Date(vInfo.last_activity).getTime() : 0;
                    const now = new Date().getTime();
                    return isOnlineDB && (now - lastActivity < 300000); // 5 minutos
                }

                return false;
            })();

            const vendedorLastSeenText = (() => {
                const isMe = profile.value && (
                    (vId && String(profile.value.id) === String(vId)) ||
                    (l.vendedor_nome_full && profile.value.nome === l.vendedor_nome_full)
                );

                if (isMe) return undefined; // Se sou eu, não precisa de "visto há..."

                const vInfo = vendedores.value.find(v =>
                    (vId && String(v.id) === String(vId)) ||
                    (l.vendedor_nome_full && v.nome === l.vendedor_nome_full)
                );

                if (vInfo?.last_activity) {
                    const time = formatRelativeTime(String(vInfo.last_activity));
                    return time ? `visto ${time}` : undefined;
                }
                return undefined;
            })();

            // Abreviação para o Avatar (JC para José Carlos)
            const avatarText = (() => {
                const vName = l.vendedor_nome || '';
                if (!vName || vName === 'Não Atribuído') return '??';

                const preposicoes = ['de', 'da', 'do', 'das', 'dos', 'e', 'para', 'com'];
                const ns = String(vName).trim().split(/\s+/)
                    .filter(part => !preposicoes.includes(part.toLowerCase()));

                const f = ns[0];
                const s = ns[1];
                if (ns.length >= 2 && f && s && f[0] && s[0]) {
                    return (f[0] + s[0]).toUpperCase();
                }
                return vName.substring(0, 2).toUpperCase() || '??';
            })();

            return {
                ...l,
                leadName: l.nome,
                phone: l.telefone,
                vendedorNome: l.vendedor_nome,
                vendedorOnline,
                vendedorLastSeenText,
                avatarText,
                lastActivityText: formatRelativeTime(l.ultima_mensagem_data),
                unreadMessages: (l.mensagens_nao_lidas || 0) > 0 ? l.mensagens_nao_lidas : undefined,
                statusIcon: getStatusIcon(l.status, l.mensagens_nao_lidas || 0),
                nextAppointment: appointmentsMap.value[String(l.id)]?.next || null,
                appointmentsCount: appointmentsMap.value[String(l.id)]?.count || 0
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
        fetchStatuses,
        subscribeToStatusChanges,
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
