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
    const allLeads = useState<any[]>('leads-all-data', () => [])
    const searchQuery = useState<string>('leads-search-query', () => '')
    const showKanbanView = useState<boolean>('leads-view-mode-toggle', () => true)
    const pendingStatusUpdates = ref<Record<string, string>>({})
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
            .select('id, user_id, nome, is_admin')
            .order('nome')

        if (!error && data) {
            vendedores.value = data
        }
    }

    const fetchLeads = async () => {
        let query = supabase.from('view_leads_crm').select('*')

        if (showMyLeads.value) {
            const user = useSupabaseUser()
            if (user.value && user.value.id) {
                const { data: profile } = await supabase
                    .from('ag_profiles')
                    .select('id')
                    .eq('user_id', user.value.id)
                    .single()

                if (profile && (profile as any).id) {
                    query = query.eq('vendedor_id', (profile as any).id)
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

            const nomeVendedor = lead.vendedor_nome ||
                lead.vendedor_nome_display ||
                lead.nome_vendedor ||
                lead.profissional_nome ||
                lead.vendedor ||
                'Não Atribuído';

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
                    avatarText: l.vendedor_nome && l.vendedor_nome !== 'Não Atribuído' ? l.vendedor_nome.substring(0, 2).toUpperCase() : '??',
                    unreadMessages: l.mensagens_nao_lidas > 0 ? l.mensagens_nao_lidas : undefined,
                    lastActivityText: formatRelativeTime(l.ultima_mensagem_data),
                    vendedorNome: l.vendedor_nome,
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
