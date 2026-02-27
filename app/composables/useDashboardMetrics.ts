import { ref } from 'vue';
// useSupabaseClient e useAuth serão resolvidos via auto-import do Nuxt

export const useDashboardMetrics = () => {
    const supabase = useSupabaseClient();
    const { profile } = useAuth();

    // Estados Reativos
    const leadsAtivos = ref(0);
    const proximasAcoes = ref(0);
    const taxaConversao = ref(0);
    const valorEmNegociacao = ref(0);
    const loading = ref(false);

    const fetchDashboardData = async (periodoEmDias: number | string) => {
        if (!profile.value?.id) return;
        loading.value = true;

        let startDate: Date;
        if (periodoEmDias === 'all') {
            startDate = new Date(0);
        } else {
            startDate = new Date();
            startDate.setDate(startDate.getDate() - Number(periodoEmDias));
        }
        const startDateISO = startDate.toISOString();

        try {
            await Promise.all([
                _fetchLeadsAtivos(startDateISO),
                _fetchProximasAcoes(),
                _fetchTaxaConversao(startDateISO),
                _fetchValorEmNegociacao(startDateISO)
            ]);
        } catch (error) {
            console.error('[useDashboardMetrics] Erro:', error);
        } finally {
            loading.value = false;
        }
    };

    const _fetchLeadsAtivos = async (startDate: string) => {
        try {
            const { count } = await supabase
                .from('ag_leads')
                .select('*', { count: 'exact', head: true })
                .eq('vendedor_id', profile.value?.id)
                .gte('criado_em', startDate)
                .not('status', 'in', '("Ganho","Perdido","Arquivado")');
            leadsAtivos.value = count || 0;
        } catch (e) {
            console.error('Erro ao buscar leads ativos:', e);
        }
    };

    const _fetchProximasAcoes = async () => {
        try {
            const agora = new Date().toISOString();
            const { count } = await supabase
                .from('ag_tarefas')
                .select('*', { count: 'exact', head: true })
                .eq('profissional_id', profile.value?.id)
                .eq('concluida', false)
                .gte('data_vencimento', agora);
            proximasAcoes.value = count || 0;
        } catch (e) {
            console.error('Erro ao buscar próximas ações:', e);
        }
    };

    const _fetchTaxaConversao = async (startDate: string) => {
        try {
            const { count: ganhos } = await supabase
                .from('ag_leads')
                .select('*', { count: 'exact', head: true })
                .eq('vendedor_id', profile.value?.id)
                .gte('criado_em', startDate)
                .eq('status', 'Ganho');

            const { count: perdidos } = await supabase
                .from('ag_leads')
                .select('*', { count: 'exact', head: true })
                .eq('vendedor_id', profile.value?.id)
                .gte('criado_em', startDate)
                .eq('status', 'Perdido');

            const total = (ganhos || 0) + (perdidos || 0);
            taxaConversao.value = total > 0 ? ((ganhos || 0) / total) * 100 : 0;
        } catch (e) {
            console.error('Erro ao buscar taxa de conversão:', e);
        }
    };

    const _fetchValorEmNegociacao = async (startDate: string) => {
        try {
            const { data, error } = await (supabase as any).rpc('get_valor_total_negociacao', {
                p_profile_id: profile.value?.id,
                p_start_date: startDate
            });
            if (error) {
                console.error('[RPC Error Valor]:', error);
                valorEmNegociacao.value = 0;
            } else {
                valorEmNegociacao.value = data || 0;
            }
        } catch (e) {
            console.error('Erro ao buscar valor em negociação:', e);
        }
    };

    return {
        leadsAtivos,
        proximasAcoes,
        taxaConversao,
        valorEmNegociacao,
        loading,
        fetchDashboardData
    };
};
