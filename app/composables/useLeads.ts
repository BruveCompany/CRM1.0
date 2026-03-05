/**
 * Composable useLeads
 * Gerencia o estado global, busca e processamento de dados relacionados aos Leads.
 */
import { computed } from 'vue'
import { useLeadStatuses } from './useLeadStatuses'
import { useLeadAppointments } from './useLeadAppointments'

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
    const { profile, waitForProfile } = useAuth()

    // Core State
    const allLeads = useState<any[]>('leads-all-data', () => [])
    const searchQuery = useState<string>('leads-search-query', () => '')
    const showKanbanView = useState<boolean>('leads-view-mode-toggle', () => true)

    // Variáveis auxiliares de estado
    const pendingStatusUpdates = useState<Record<string, string>>('leads-pending-updates', () => ({}))
    const selectedLeadId = useState<string | null>('selected-lead-id', () => null)
    const showDetailsModal = useState<boolean>('show-details-modal', () => false)
    const vendedores = useState<any[]>('leads-vendedores', () => [])
    const selectedVendedorId = useState<string | null>('leads-selected-vendedor-id', () => null)
    const showMyLeads = useState<boolean>('leads-show-my-leads', () => false)
    const isCreateLeadModalOpen = useState<boolean>('leads-create-modal-open', () => false)
    const isLoadingLeads = useState<boolean>('leads-is-loading', () => false)
    const isFetching = useState<boolean>('leads-is-fetching-global', () => false)
    const lastFetchTime = useState<number>('leads-last-fetch-time', () => 0)

    // Extracted modules
    const {
        leadStatuses,
        isEditingStatuses,
        fetchStatuses,
        subscribeToStatusChanges,
        addStatus,
        updateStatus,
        deleteStatus,
        reorderStatuses
    } = useLeadStatuses()

    const {
        appointmentsMap,
        fetchNextAppointments,
        subscribeToAppointmentChanges
    } = useLeadAppointments()

    const openDetails = (id: string) => {
        selectedLeadId.value = id
        showDetailsModal.value = true
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
                fetchLeads(true) // Silent refresh
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
        try {
            await waitForProfile();

            const performFetch = async (retryCount = 0): Promise<any[]> => {
                const { data, error } = await supabase
                    .from('ag_profiles')
                    .select('id, user_id, nome, role, is_online, last_activity')
                    .order('nome');

                if (error) throw error;

                return data || [];
            };

            const data = await performFetch();
            vendedores.value = data;
            const lastVendedoresFetch = useState<number>('leads-last-vendedores-fetch', () => 0);
            lastVendedoresFetch.value = Date.now();
        } catch (err) {
            console.error('Erro ao buscar vendedores:', err);
        }
    };

    let fetchDebounceTimer: any = null;
    const fetchLeads = async (silent = false) => {
        if (isFetching.value) {
            // Se já está buscando, agendamos uma busca silenciosa para logo depois
            if (fetchDebounceTimer) clearTimeout(fetchDebounceTimer);
            fetchDebounceTimer = setTimeout(() => fetchLeads(true), 1200);
            return;
        }

        // Estratégia de Cache: Debounce Realtime e Guard de Frequência
        const now = Date.now();

        // Se o usuário acabou de autenticar e a lista está vazia, ignoramos o gap para permitir o carregamento inicial
        const isInitialAuthFetch = !silent && profile.value?.id && allLeads.value.length === 0;
        const minGap = silent ? 1500 : (isInitialAuthFetch ? 0 : 500);

        if (now - lastFetchTime.value < minGap && !isInitialAuthFetch) {
            // Se bloqueado pelo guard de tempo, agendamos um "catch-up" para garantir que a última mudança seja pega
            if (fetchDebounceTimer) clearTimeout(fetchDebounceTimer);
            fetchDebounceTimer = setTimeout(() => fetchLeads(true), minGap + 100);
            return;
        }

        isFetching.value = true;
        if (!silent) isLoadingLeads.value = true;
        if (fetchDebounceTimer) clearTimeout(fetchDebounceTimer);
        fetchDebounceTimer = null;

        try {
            // 1. GARANTE IDENTIDADE (RLS SYNC)
            const { waitForProfile } = useAuth();
            await waitForProfile();

            // 2. FUNÇÃO DE BUSCA COM RETRY
            const performFetch = async (retryCount = 0): Promise<any> => {
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

                const { data, error } = await query.order('criado_em', { ascending: false });

                return { data, error };
            };

            // 3. Dispara buscas de perfis em paralelo ao fetch principal
            const fetchProfilesTask = fetchVendedores();

            const [{ data }, _] = await Promise.all([
                performFetch(),
                fetchProfilesTask
            ]);

            if (data) {
                // 4. Normalização rápida dos Leads
                allLeads.value = (data as any[]).map(lead => {
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

                    const vIdRaw = lead.vendedor_id || lead.vendedor?.id;
                    const vNomeRaw = lead.vendedor?.nome || lead.vendedor_nome || lead.profissional_nome || 'Não Atribuído';
                    const normalizedVendedorId = (vIdRaw && vIdRaw !== 0 && vIdRaw !== '0') ? String(vIdRaw) : null;

                    return {
                        ...lead,
                        id: leadId,
                        status: statusFinal,
                        vendedor_id: normalizedVendedorId,
                        vendedor_nome: vNomeRaw === 'Não Atribuído' ? 'Não Atribuído' : (String(vNomeRaw).split(' ').slice(0, 2).join(' '))
                    }
                });

                lastFetchTime.value = now;

                // Dispara busca de agendamentos SEM dar await
                fetchNextAppointments().then(() => { });
            }
        } catch (error) {
            console.error('[fetchLeads] Falha:', error);
        } finally {
            isFetching.value = false;
            if (!silent) isLoadingLeads.value = false;
        }
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
