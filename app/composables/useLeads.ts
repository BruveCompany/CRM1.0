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
    const pendingStatusUpdates = ref<Record<string, string>>({})

    // Estados reativos para modais e filtros
    const selectedLeadId = useState<string | null>('selected-lead-id', () => null)
    const showDetailsModal = useState<boolean>('show-details-modal', () => false)
    const vendedores = useState<any[]>('leads-vendedores', () => [])
    const selectedVendedorId = useState<string | null>('leads-selected-vendedor-id', () => null)
    const showMyLeads = useState<boolean>('leads-show-my-leads', () => false)
    const isEditingStatuses = useState<boolean>('leads-is-editing-statuses', () => false)

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
        if (!dateString || import.meta.server) return undefined;
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
    }

    // NOVO: Propriedade computada para enriquecer os leads com dados de UI e presença
    const enrichedLeadsList = computed(() => {
        return allLeads.value.map(l => {
            const vId = l.vendedor_id;

            // Busca informações do vendedor (seja o próprio ou outro)
            const vendedorOnline = (() => {
                if (!vId && !l.vendedor_nome) return false;

                // 1. Tenta pelo perfil logado (velocidade instantânea)
                // Usamos ID, UserID ou Nome (Full) como fallback caso o ID venha nulo da view
                if (profile.value && (
                    (vId && String(profile.value.id) === String(vId)) ||
                    (vId && String(profile.value.user_id) === String(vId)) ||
                    (l.vendedor_nome_full && profile.value.nome &&
                        l.vendedor_nome_full.trim().toLowerCase() === profile.value.nome.trim().toLowerCase())
                )) {
                    return isOnlineCalculated.value;
                }

                // 2. Tenta pela lista de vendedores (outros usuários)
                const vInfo = vendedores.value.find(v =>
                    (vId && String(v.id) === String(vId)) ||
                    (vId && String(v.user_id) === String(vId)) ||
                    (l.vendedor_nome_full && v.nome &&
                        l.vendedor_nome_full.trim().toLowerCase() === v.nome.trim().toLowerCase())
                );

                if (!vInfo) return false;

                const isOnline = vInfo.is_online === true;
                const lastActivity = vInfo.last_activity ? new Date(vInfo.last_activity).getTime() : 0;
                const now = new Date().getTime();
                return isOnline && (now - lastActivity < 300000); // 5 minutos
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
                statusIcon: getStatusIcon(l.status, l.mensagens_nao_lidas || 0)
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
        formatRelativeTime
    }
}
