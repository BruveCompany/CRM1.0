import { type LeadStatus } from './useLeads';

export const useLeadStatuses = () => {
    const supabase = useSupabaseClient();
    const { waitForProfile } = useAuth();

    // Shared states
    const leadStatuses = useState<LeadStatus[]>('leads-statuses', () => []);
    const isEditingStatuses = useState<boolean>('leads-is-editing-statuses', () => false);

    const fetchStatuses = async (silent = false) => {
        // Cache de 5 minutos para os status
        const now = Date.now();
        const lastStatusFetch = useState<number>('leads-last-status-fetch', () => 0);

        // Se já temos status e não passou tempo suficiente, ou se for silent e buscamos recentemente, pula
        if (leadStatuses.value.length > 0 && !silent && now - lastStatusFetch.value < 300000) return;
        if (silent && now - lastStatusFetch.value < 5000) return; // Mínimo 5s para refrescar status via Realtime

        try {
            // 1. ESPERA PELO PERFIL (GARANTIA DATABASE SYNC)
            await waitForProfile();

            const performFetch = async (retryCount = 0): Promise<any[]> => {
                const { data, error } = await supabase
                    .from('ag_lead_statuses')
                    .select('*')
                    .order('order_index', { ascending: true });

                if (error) throw error;

                return data || [];
            };

            const data = await performFetch();
            leadStatuses.value = data;
            lastStatusFetch.value = now;
        } catch (err) {
            console.error('Erro ao buscar status:', err);
        }
    };

    /**
     * SUBSCRIPÇÃO REALTIME PARA STATUS
     */
    const subscribeToStatusChanges = () => {
        return (supabase as any)
            .channel('public:ag_lead_statuses')
            .on('postgres_changes', { event: '*', table: 'ag_lead_statuses', schema: 'public' }, () => {
                fetchStatuses(true); // Silent refresh
            })
            .subscribe();
    };

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
            .select();
        return { data, error };
    };

    const updateStatus = async (id: string, updates: Partial<LeadStatus>) => {
        const { error } = await (supabase
            .from('ag_lead_statuses') as any)
            .update(updates)
            .eq('id', id);
        return { error };
    };

    const deleteStatus = async (id: string, reassignToId?: string) => {
        // Se houver leads e um novo status para reatribuição for fornecido
        if (reassignToId) {
            await (supabase
                .from('ag_leads') as any)
                .update({ status: reassignToId })
                .eq('status', id);
        }

        const { error } = await (supabase
            .from('ag_lead_statuses') as any)
            .delete()
            .eq('id', id);
        return { error };
    };

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
        }));

        const { error } = await (supabase
            .from('ag_lead_statuses') as any)
            .upsert(updates);
        return { error };
    };

    return {
        leadStatuses,
        isEditingStatuses,
        fetchStatuses,
        subscribeToStatusChanges,
        addStatus,
        updateStatus,
        deleteStatus,
        reorderStatuses
    };
};
