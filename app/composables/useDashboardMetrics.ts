import { ref, onUnmounted } from 'vue';

export const useDashboardMetrics = () => {
    const supabase = useSupabaseClient();
    const { waitForProfile, profile, profId: cachedProfId } = useAuth();

    // Estados Reativos
    const leadsAtivos = ref(0);
    const proximasAcoes = ref(0);
    const taxaConversao = ref(0);
    const valorEmNegociacao = ref(0);
    const loading = ref(false);
    const currentPeriod = ref<number | string>(30);
    const lastFetchTime = ref(0);

    const fetchDashboardData = async (periodoEmDias?: number | string) => {
        if (loading.value) return;

        // Rate limit: Mínimo 2 segundos entre atualizações automáticas do dashboard
        const now = Date.now();
        if (periodoEmDias === undefined && now - lastFetchTime.value < 2000) return;

        if (periodoEmDias !== undefined) currentPeriod.value = periodoEmDias;
        loading.value = true;
        lastFetchTime.value = now;

        try {
            // 1. ESPERA PELO PERFIL (GARANTIA DATABASE SYNC)
            const profileData = await waitForProfile();
            const profileId = profileData?.id;

            if (!profileId) {
                console.warn('[DASHBOARD] Perfil não identificado no tempo limite.');
                return;
            }

            // 2. Resolve o profId (Prioridade: Cache > DB)
            let profId = cachedProfId.value;
            if (!profId) {
                const { data: profData } = await (supabase
                    .from('ag_profissionais') as any)
                    .select('id')
                    .eq('profile_id', profileId)
                    .maybeSingle();
                profId = (profData as any)?.id;
                if (profId) cachedProfId.value = profId;
            }

            let startDate: Date;
            if (currentPeriod.value === 'all') {
                startDate = new Date(0);
            } else {
                startDate = new Date();
                startDate.setDate(startDate.getDate() - Number(currentPeriod.value));
            }
            const startDateISO = startDate.toISOString();

            // 3. FUNÇÃO DE BUSCA CONSOLIDADA COM RETRY
            const performFetch = async (retryCount = 0) => {
                await Promise.all([
                    _fetchLeadsAtivos(profileId, startDateISO),
                    _fetchProximasAcoes(profId || undefined),
                    _fetchTaxaConversao(profileId, startDateISO),
                    _fetchValorEmNegociacao(profileId, startDateISO)
                ]);

                // Nota: O retry baseado em `totalMetrics === 0` foi removido.
                // Zero é um estado válido (novo usuário, sem atividades na semana).
                // A garantia do banco já é dada pelo `waitForProfile` no início.
            };

            await performFetch();

        } catch (error) {
            console.error('[useDashboardMetrics] Erro:', error);
        } finally {
            loading.value = false;
        }
    };

    const _fetchLeadsAtivos = async (pId: string | number, startDate: string) => {
        try {
            const { count } = await supabase
                .from('ag_leads')
                .select('*', { count: 'exact', head: true })
                .eq('vendedor_id', pId)
                .gte('criado_em', startDate)
                .not('status', 'in', '("Ganho","Perdido","Arquivado")');
            leadsAtivos.value = count || 0;
        } catch (e) {
            console.error('Erro ao buscar leads ativos:', e);
        }
    };

    const _fetchProximasAcoes = async (profId?: number | string) => {
        if (!profId) {
            proximasAcoes.value = 0;
            return;
        }
        try {
            const agora = new Date().toISOString();
            const { count } = await supabase
                .from('ag_tarefas')
                .select('*', { count: 'exact', head: true })
                .eq('profissional_id', profId)
                .eq('concluida', false)
                .gte('data_vencimento', agora);
            proximasAcoes.value = count || 0;
        } catch (e) {
            console.error('Erro ao buscar próximas ações:', e);
        }
    };

    const _fetchTaxaConversao = async (pId: string | number, startDate: string) => {
        try {
            const { data } = await (supabase
                .from('ag_leads') as any)
                .select('status')
                .eq('vendedor_id', pId)
                .gte('criado_em', startDate)
                .in('status', ['Ganho', 'Perdido']);

            const ganhos = (data as any[])?.filter(l => l.status === 'Ganho').length || 0;
            const perdidos = (data as any[])?.filter(l => l.status === 'Perdido').length || 0;
            const total = ganhos + perdidos;
            taxaConversao.value = total > 0 ? (ganhos / total) * 100 : 0;
        } catch (e) {
            console.error('Erro ao buscar taxa de conversão:', e);
        }
    };

    const _fetchValorEmNegociacao = async (pId: string | number, startDate: string) => {
        try {
            const { data, error } = await (supabase as any).rpc('get_valor_total_negociacao', {
                p_profile_id: pId,
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

    // --- Lógica Realtime Prime para Dashboard ---
    let dashboardChannel: any = null;

    /**
     * Inscreve para mudanças no banco que afetam o Dashboard.
     * @param onUpdate Callback opcional para atualizar dados extras na página (ex: tarefas, funil)
     */
    const subscribeToDashboardChanges = (onUpdate?: () => void) => {
        if (!profile.value?.id || dashboardChannel) return;

        console.log('🔌 Dashboard: Ativando monitoramento em tempo real...');

        dashboardChannel = supabase
            .channel('dashboard-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'ag_leads' },
                () => {
                    // Debounce para não processar cada pequena mudança instantaneamente
                    setTimeout(() => {
                        console.log('📈 Dashboard: Atualizando métricas de Leads...');
                        fetchDashboardData();
                        if (onUpdate) onUpdate();
                    }, 500);
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'ag_tarefas' },
                () => {
                    setTimeout(() => {
                        console.log('📈 Dashboard: Atualizando métricas de Tarefas...');
                        fetchDashboardData();
                        if (onUpdate) onUpdate();
                    }, 500);
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'ag_agendamentos' },
                () => {
                    setTimeout(() => {
                        console.log('📈 Dashboard: Atualizando métricas de Agendamentos...');
                        fetchDashboardData();
                        if (onUpdate) onUpdate();
                    }, 500);
                }
            )
            .subscribe();
    };

    const unsubscribeFromDashboardChanges = () => {
        if (dashboardChannel) {
            supabase.removeChannel(dashboardChannel);
            dashboardChannel = null;
        }
    };

    return {
        leadsAtivos,
        proximasAcoes,
        taxaConversao,
        valorEmNegociacao,
        loading,
        fetchDashboardData,
        subscribeToDashboardChanges,
        unsubscribeFromDashboardChanges
    };
};
