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
}

export interface KanbanColumn {
    id: string;
    title: string;
    color: string;
    tasks: LeadTask[];
    totalDeals?: number;
}

export const useLeads = () => {
    const supabase = useSupabaseClient()
    const { profile } = useAuth()
    const allLeads = useState<any[]>('leads-all-data', () => [])
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

    const openDetails = (id: string) => {
        selectedLeadId.value = id
        showDetailsModal.value = true
    }

    // Colunas do Kanban (Status originais da View)
    const columns = ref<KanbanColumn[]>([
        { id: 'leads_novos', title: 'Leads Novos', color: '#3B82F6', tasks: [] },
        { id: 'contato_feito', title: 'Contato Feito', color: '#F59E0B', tasks: [] },
        { id: 'necessidades', title: 'Necessidades', color: '#EC4899', tasks: [] },
        { id: 'em_atendimento', title: 'Em Atendimento', color: '#6366f1', tasks: [] },
        { id: 'qualificado', title: 'Qualificado', color: '#8B5CF6', tasks: [] },
        { id: 'em_negociacao', title: 'Em Negociação', color: '#06B6D4', tasks: [] },
        { id: 'proposta', title: 'Proposta', color: '#f97316', tasks: [] },
        { id: 'ganho', title: 'Ganho', color: '#10B981', tasks: [] },
        { id: 'perdido', title: 'Perdido', color: '#EF4444', tasks: [] },
    ])

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
                if (user.value) {
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
        } else if (selectedVendedorId.value && selectedVendedorId.value !== 'all') {
            query = query.eq('vendedor_id', selectedVendedorId.value)
        }

        const { data: leadsData, error } = await query
            .order('criado_em', { ascending: false })

        if (error || !leadsData) {
            allLeads.value = []
            return
        }

        allLeads.value = (leadsData as any[]).map(lead => {
            const leadId = String(lead.id)
            let statusFinal = lead.status

            if (pendingStatusUpdates.value[leadId]) {
                const targetStatus = pendingStatusUpdates.value[leadId]
                const normalizedCurrent = (statusFinal as string)?.toLowerCase().trim().replace(/\s+/g, '_')
                const normalizedTarget = (targetStatus as string).toLowerCase().trim().replace(/\s+/g, '_')

                if (normalizedCurrent === normalizedTarget) {
                    delete pendingStatusUpdates.value[leadId]
                } else {
                    statusFinal = targetStatus
                }
            }

            /**
             * LÓGICA DE NORMALIZAÇÃO DO NOME DO VENDEDOR
             * Tenta obter o nome por diversas chaves possíveis vindas da View.
             * Aplica filtro para remover preposições e manter Nome + Sobrenome.
             */
            const rawNomeVendedor = lead.vendedor_nome ||
                lead.vendedor_nome_display ||
                lead.nome_vendedor ||
                lead.profissional_nome ||
                lead.vendedor ||
                'Não Atribuído';

            const preposicoes = ['de', 'da', 'do', 'das', 'dos', 'e'];
            const allParts = rawNomeVendedor.trim().split(/\s+/);
            const filteredParts = allParts.filter((part: string) => !preposicoes.includes(part.toLowerCase()));

            const nomeVendedor = filteredParts.length >= 2
                ? `${filteredParts[0]} ${filteredParts[1]}`
                : filteredParts[0] || rawNomeVendedor;

            return {
                ...lead,
                id: leadId,
                status: statusFinal,
                vendedor_nome: nomeVendedor
            }
        })
    }

    const filteredLeadsList = computed(() => {
        if (!searchQuery.value) return allLeads.value
        const query = searchQuery.value.toLowerCase()
        return allLeads.value.filter(lead =>
            (lead.nome && lead.nome.toLowerCase().includes(query)) ||
            (lead.telefone && lead.telefone.toLowerCase().includes(query)) ||
            (lead.vendedor_nome && lead.vendedor_nome.toLowerCase().includes(query))
        )
    })

    // Popula o Kanban com os dados do Original
    const columnsWithTotals = computed(() => {
        return columns.value.map(col => {
            const tasks = filteredLeadsList.value
                .filter(l => {
                    const normalLeadStatus = String(l.status).toLowerCase().trim().replace(/\s+/g, '_');
                    const normalColId = col.id.toLowerCase().trim();
                    return normalLeadStatus === normalColId || l.status === col.id;
                })
                .map(l => ({
                    id: String(l.id),
                    leadName: l.nome,
                    phone: l.telefone,
                    avatarText: (() => {
                        const vName = l.vendedor_nome || '';
                        if (!vName || vName === 'Não Atribuído') return '??';

                        const preposicoes = ['de', 'da', 'do', 'das', 'dos', 'e'];
                        const ns = String(vName).trim().split(/\s+/)
                            .filter(part => !preposicoes.includes(part.toLowerCase()));

                        const f = ns[0];
                        const s = ns[1];
                        if (ns.length >= 2 && f && s && f[0] && s[0]) {
                            return (f[0] + s[0]).toUpperCase();
                        }
                        return vName.substring(0, 2).toUpperCase() || '??';
                    })(),
                    unreadMessages: l.mensagens_nao_lidas > 0 ? l.mensagens_nao_lidas : undefined,
                    lastActivityText: formatRelativeTime(l.ultima_mensagem_data),
                    vendedorNome: l.vendedor_nome,
                    vendedorOnline: (() => {
                        if (!l.vendedor_id) return false;

                        // Se for o próprio usuário logado, usa o perfil reativo dele para velocidade instantânea
                        if (profile.value && (
                            String(profile.value.id) === String(l.vendedor_id) ||
                            String(profile.value.user_id) === String(l.vendedor_id)
                        )) {
                            // Usamos a lógica de cálculo baseada no perfil local
                            const isOnline = profile.value.is_online === true;
                            const lastActivity = profile.value.last_activity ? new Date(profile.value.last_activity).getTime() : 0;
                            const now = new Date().getTime();
                            return isOnline && (now - lastActivity < 300000);
                        }

                        // Senão, busca o status na lista de vendedores sincronizada
                        const vInfo = vendedores.value.find(v =>
                            String(v.id) === String(l.vendedor_id) ||
                            String(v.user_id) === String(l.vendedor_id)
                        );
                        if (!vInfo) return false;

                        const isOnline = vInfo.is_online === true;
                        const lastActivity = vInfo.last_activity ? new Date(vInfo.last_activity).getTime() : 0;
                        const now = new Date().getTime();

                        return isOnline && (now - lastActivity < 300000);
                    })(),
                    statusIcon: getStatusIcon(l.status, l.mensagens_nao_lidas || 0),
                    status: l.status,
                    nome: l.nome,
                    telefone: l.telefone,
                    score: l.score,
                    ultima_mensagem_data: l.ultima_mensagem_data,
                    vendedor_id: l.vendedor_id
                })) as LeadTask[];

            return {
                ...col,
                tasks,
                totalDeals: tasks.length
            }
        })
    })

    return {
        allLeads,
        searchQuery,
        showKanbanView,
        pendingStatusUpdates,
        selectedLeadId,
        showDetailsModal,
        vendedores,
        selectedVendedorId,
        showMyLeads,
        openDetails,
        columnsWithTotals,
        filteredLeadsList,
        fetchLeads,
        fetchVendedores,
        formatRelativeTime
    }
}
