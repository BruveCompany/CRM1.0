import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useLeads } from '~/composables/useLeads';

export const useRelatorios = () => {
    const supabase = useSupabaseClient();
    const { profile, checkIsAdmin, waitForProfile } = useAuth();
    const { vendedores, fetchVendedores } = useLeads();

    const loading = ref(false);
    const isAdmin = ref(false);
    const showMetasModal = ref(false);
    const reportData = ref<any[]>([]);
    const showFilterPopover = ref(false);
    const showExportModal = ref(false);
    const isExporting = ref(false);
    const lastFetchTime = ref(0);

    // Filtros
    const selectedPeriod = ref('30d');
    const vendedorFiltro = ref<number | null>(null);
    const customDateStart = ref('');
    const customDateEnd = ref('');

    const periods = [
        { label: 'Últimos 7 dias', value: '7d' },
        { label: 'Últimos 30 dias', value: '30d' },
        { label: 'Últimos 90 dias', value: '90d' },
        { label: 'Visão Global', value: 'all' },
        { label: 'Personalizado', value: 'custom' },
    ];

    const dailyData = ref<any[]>([]);

    // --- COMPUTADOS ---
    const rankedSellers = computed(() => {
        if (!reportData.value) return [];
        return [...reportData.value].sort((a, b) => {
            const taxaA = a.taxa_conversao || 0;
            const taxaB = b.taxa_conversao || 0;
            return taxaB - taxaA;
        });
    });

    const activeVendedorName = computed(() => {
        if (!vendedorFiltro.value) return '';
        const v = vendedores.value.find(v => Number(v.id) === Number(vendedorFiltro.value));
        return v ? v.nome : 'Especialista';
    });

    const aggregatedStats = computed(() => {
        if (!reportData.value || reportData.value.length === 0) {
            return {
                totalLeads: 0, avgConversion: 0, totalAppointments: 0, totalMessages: 0,
                totalLeadsConvertidos: 0,
                avgResponseTime: 0, avgConversionTime: 0,
                totalLeadsVariacao: 0, avgConversionVariacao: 0,
                totalAppointmentsVariacao: 0, totalMessagesVariacao: 0
            };
        }

        const totals = reportData.value.reduce((acc, curr) => ({
            leads: acc.leads + (Number(curr.total_leads) || 0),
            convertidos: acc.convertidos + (Number(curr.leads_convertidos) || 0),
            agendamentos: acc.agendamentos + (Number(curr.total_agendamentos) || 0),
            mensagens: acc.mensagens + (Number(curr.total_mensagens) || 0),
            prevLeads: acc.prevLeads + (Number((curr as any).prev_leads) || 0),
            prevConv: acc.prevConv + (Number((curr as any).prev_leads_convertidos) || 0),
            prevAgend: acc.prevAgend + (Number((curr as any).prev_agendamentos) || 0),
            prevMsg: acc.prevMsg + (Number((curr as any).prev_mensagens) || 0)
        }), { leads: 0, convertidos: 0, agendamentos: 0, mensagens: 0, prevLeads: 0, prevConv: 0, prevAgend: 0, prevMsg: 0 });

        const calcVar = (curr: number, prev: number) => {
            if (prev > 0) return ((curr - prev) / prev) * 100;
            return curr > 0 ? 100 : 0;
        };

        const currConvRate = totals.leads > 0 ? (totals.convertidos / totals.leads) * 100 : 0;
        const prevConvRate = totals.prevLeads > 0 ? (totals.prevConv / totals.prevLeads) * 100 : 0;

        return {
            totalLeads: totals.leads,
            totalLeadsConvertidos: totals.convertidos,
            avgConversion: Number(currConvRate.toFixed(1)),
            totalAppointments: totals.agendamentos,
            totalMessages: totals.mensagens,
            avgResponseTime: 4.5,
            avgConversionTime: 7.2,
            totalLeadsVariacao: calcVar(totals.leads, totals.prevLeads),
            avgConversionVariacao: calcVar(currConvRate, prevConvRate),
            totalAppointmentsVariacao: calcVar(totals.agendamentos, totals.prevAgend),
            totalMessagesVariacao: calcVar(totals.mensagens, totals.prevMsg)
        };
    });

    const getDatesFromPeriod = () => {
        if (selectedPeriod.value === 'all') return { start: null, end: null };
        if (selectedPeriod.value === 'custom') {
            return {
                start: customDateStart.value ? new Date(customDateStart.value + 'T00:00:00') : null,
                end: customDateEnd.value ? new Date(customDateEnd.value + 'T23:59:59') : null
            };
        }

        const days = parseInt(selectedPeriod.value);
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        start.setHours(0, 0, 0, 0);

        return { start: start.toISOString(), end: end.toISOString() };
    };

    const fetchReportData = async (silent = false) => {
        if (loading.value) return;

        const now = Date.now();
        if (silent && now - lastFetchTime.value < 2000) return;

        try {
            if (!silent) loading.value = true;
            lastFetchTime.value = now;

            await waitForProfile();

            const dates = getDatesFromPeriod();
            let filterId = vendedorFiltro.value;

            if (!isAdmin.value && profile.value?.id) {
                filterId = Number(profile.value.id);
            }

            const params = {
                p_inicio: dates.start ? String(dates.start) : null,
                p_fim: dates.end ? String(dates.end) : null,
                p_vendedor: filterId ? Number(filterId) : null
            };

            const performFetch = async (retryCount = 0): Promise<any[]> => {
                const { data, error } = await (supabase as any).rpc('fn_relatorio_vendedores_prime', params);
                if (error) throw error;
                return data || [];
            };

            const data = await performFetch();

            reportData.value = data.map((item: any) => ({
                ...item,
                taxa_conversao: item.total_leads > 0
                    ? (Number(item.leads_convertidos) / Number(item.total_leads)) * 100
                    : 0
            }));

        } catch (err: any) {
            console.error('⚠️ Falha crítica ao buscar dados:', err);
            reportData.value = [];
        } finally {
            if (!silent) loading.value = false;
        }
    };

    const applyFilters = () => {
        showFilterPopover.value = false;
        fetchReportData();
    };

    const handleVendedorSelect = (v: any) => {
        vendedorFiltro.value = Number(v.vendedor_id);
        fetchReportData();
    };

    const clearVendedorFilter = () => {
        vendedorFiltro.value = null;
        fetchReportData();
    };

    const exportToCSV = () => {
        if (reportData.value.length === 0) return;
        const headers = ["Consultor", "Leads", "Conversão", "Taxa %", "Score", "Tempo Resp. (h)", "Agend."];
        const rows = reportData.value.map(item => [
            `"${item.vendedor_nome || 'N/A'}"`,
            item.total_leads || 0,
            item.leads_convertidos || 0,
            (item.taxa_conversao || 0).toFixed(2),
            (item.score_medio || 0).toFixed(2),
            (Number(item.tempo_medio_resposta) || 0).toFixed(2),
            item.total_agendamentos || 0
        ]);
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `relatorio_desempenho_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
    };

    const exportToXLSX = async () => {
        if (reportData.value.length === 0) return;
        try {
            const XLSX = await import('xlsx');
            const headers = ["Consultor", "Leads", "Conversão", "Taxa %", "Score", "Tempo Resp. (h)", "Agend."];
            const rows = reportData.value.map(item => [
                item.vendedor_nome || 'N/A',
                item.total_leads || 0,
                item.leads_convertidos || 0,
                Number((item.taxa_conversao || 0).toFixed(2)),
                Number((item.score_medio || 0).toFixed(2)),
                Number((Number(item.tempo_medio_resposta) || 0).toFixed(2)),
                item.total_agendamentos || 0
            ]);
            const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Desempenho");
            XLSX.writeFile(wb, `relatorio_desempenho_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (err) {
            console.error('❌ Erro Excel:', err);
        }
    };

    const exportToPDF = async () => {
        if (!process.client || reportData.value.length === 0) return;
        try {
            isExporting.value = true;
            await new Promise(resolve => setTimeout(resolve, 200));
            const element = document.getElementById('formal-report-content');
            if (!element) return;

            const Lib = await import('html2pdf.js');
            const html2pdf = Lib.default || Lib;

            const opt = {
                margin: 0.5,
                filename: `Relatorio_Operacional_${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
            };

            await html2pdf().set(opt).from(element).save();
            isExporting.value = false;
        } catch (err) {
            console.error('❌ Erro PDF:', err);
            isExporting.value = false;
        }
    };

    // --- REALTIME ---
    let reportsChannel: any = null;
    let reportsDebounceTimer: any = null;
    const subscribeToReportsChanges = () => {
        if (reportsChannel) return;
        reportsChannel = supabase
            .channel('reports-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ag_leads' }, () => {
                if (reportsDebounceTimer) clearTimeout(reportsDebounceTimer);
                reportsDebounceTimer = setTimeout(() => fetchReportData(true), 1000);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ag_tarefas' }, () => {
                if (reportsDebounceTimer) clearTimeout(reportsDebounceTimer);
                reportsDebounceTimer = setTimeout(() => fetchReportData(true), 1000);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ag_agendamentos' }, () => {
                if (reportsDebounceTimer) clearTimeout(reportsDebounceTimer);
                reportsDebounceTimer = setTimeout(() => fetchReportData(true), 1000);
            })
            .subscribe();
    };

    const closeOnEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            showFilterPopover.value = false;
            showExportModal.value = false;
        }
    };

    onMounted(async () => {
        isAdmin.value = await checkIsAdmin();
        await fetchReportData();
        if (isAdmin.value) fetchVendedores();

        subscribeToReportsChanges();

        const days = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
        dailyData.value = days.map(d => ({
            label: d,
            value: Math.floor(Math.random() * 30) + 5
        }));
        window.addEventListener('keydown', closeOnEsc);
    });

    watch(() => profile.value?.id, async (newId) => {
        if (newId) {
            isAdmin.value = await checkIsAdmin();
            fetchReportData();
        }
    });

    watch(selectedPeriod, () => {
        fetchReportData();
    });

    onUnmounted(() => {
        window.removeEventListener('keydown', closeOnEsc);
        if (reportsChannel) supabase.removeChannel(reportsChannel);
    });

    return {
        loading,
        isAdmin,
        showMetasModal,
        reportData,
        showFilterPopover,
        showExportModal,
        isExporting,
        selectedPeriod,
        vendedorFiltro,
        customDateStart,
        customDateEnd,
        periods,
        dailyData,
        vendedores,
        rankedSellers,
        activeVendedorName,
        aggregatedStats,
        fetchReportData,
        applyFilters,
        handleVendedorSelect,
        clearVendedorFilter,
        exportToCSV,
        exportToXLSX,
        exportToPDF
    };
}
