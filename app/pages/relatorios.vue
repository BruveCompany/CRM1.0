<template>
  <NuxtLayout>
    <div class="p-4 bg-white min-h-[calc(100vh-64px)] overflow-y-auto w-full">
      <div class="max-w-7xl mx-auto space-y-12">
        <ClientOnly>
          <!-- All content inside ClientOnly to ensure SSR safety for dynamic data -->
          <div class="space-y-8">
            <!-- HEADER & FILTROS AVANÇADOS -->
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-gray-50">
              <div class="space-y-1.5">
                <h1 class="text-3xl font-semibold text-gray-900 tracking-tight">Relatórios</h1>
                <p class="text-sm text-slate-400 font-medium">Análise de performance e métricas comerciais</p>
              </div>

              <div class="flex items-center gap-3">
                <div v-if="vendedorFiltro" class="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
                  <span class="text-[10px] font-bold text-indigo-600 uppercase">{{ activeVendedorName }}</span>
                  <button @click="clearVendedorFilter" class="p-0.5 hover:bg-indigo-100 rounded-full transition-colors">
                    <Icon name="heroicons:outline:x-mark" class="w-3 h-3 text-indigo-500" />
                  </button>
                </div>

                <div class="relative">
                  <button 
                    @click="showFilterPopover = !showFilterPopover"
                    class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-primary-500 transition-all group"
                  >
                    <Icon name="heroicons:outline:adjustments-horizontal" class="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                    <span class="text-sm font-semibold text-gray-700">Filtros</span>
                    <Icon :name="showFilterPopover ? 'heroicons:outline:chevron-up' : 'heroicons:outline:chevron-down'" class="w-4 h-4 text-gray-400" />
                  </button>

                  <div v-if="showFilterPopover" class="absolute right-0 mt-3 w-72 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-6 space-y-6">
                    <div class="space-y-2.5">
                      <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Período de Análise</label>
                      <select v-model="selectedPeriod" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700">
                        <option v-for="p in periods" :key="p.value" :value="p.value">{{ p.label }}</option>
                      </select>
                    </div>

                    <div v-if="isAdmin" class="space-y-2.5">
                      <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Filtrar Especialista</label>
                      <select v-model="vendedorFiltro" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700">
                        <option :value="null">Todos os Consultores</option>
                        <option v-for="v in vendedores" :key="v.id" :value="v.id">{{ v.nome }}</option>
                      </select>
                    </div>

                    <div class="pt-2">
                      <button @click="applyFilters" class="w-full py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold">Aplicar Filtros</button>
                    </div>
                  </div>
                </div>

                <button @click="fetchReportData" :disabled="loading" class="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <Icon name="heroicons:outline:arrow-path" class="w-5 h-5 text-slate-400" :class="{ 'animate-spin': loading }" />
                </button>
              </div>
            </div>

            <!-- KPI CARDS GRID (MAIS COMPACTO) -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3">
              <RelatoriosKPICard label="Novos Leads Gerados" :value="aggregatedStats.totalLeads" :variation="aggregatedStats.totalLeadsVariacao" icon-name="heroicons:user-group" icon-bg-color="bg-primary-600" icon-color-text="text-primary-600" />
              <RelatoriosKPICard label="Taxa de Conversão" :value="aggregatedStats.avgConversion" :variation="aggregatedStats.avgConversionVariacao" suffix="%" icon-name="heroicons:presentation-chart-line" icon-bg-color="bg-emerald-600" icon-color-text="text-emerald-600" />
              <RelatoriosKPICard label="Tempo Resposta" :value="aggregatedStats.avgResponseTime" suffix="h" icon-name="heroicons:clock" icon-bg-color="bg-blue-600" icon-color-text="text-blue-600" />
              <RelatoriosKPICard label="Ciclo Venda" :value="aggregatedStats.avgConversionTime" suffix="d" icon-name="heroicons:calendar" icon-bg-color="bg-rose-600" icon-color-text="text-rose-600" />
              <RelatoriosKPICard label="Agendamentos" :value="aggregatedStats.totalAppointments" :variation="aggregatedStats.totalAppointmentsVariacao" icon-name="heroicons:calendar-days" icon-bg-color="bg-amber-600" icon-color-text="text-amber-600" />
              <RelatoriosKPICard label="Interações" :value="aggregatedStats.totalMessages" :variation="aggregatedStats.totalMessagesVariacao" icon-name="heroicons:chat-bubble-left-right" icon-bg-color="bg-indigo-600" icon-color-text="text-indigo-600" />
            </div>

            <!-- CHARTS SECTION -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div class="lg:col-span-2">
                <RelatoriosPerformanceChart :data="dailyData" />
              </div>
              <div class="lg:col-span-1">
                <RelatoriosFunnelChart :total="Number(aggregatedStats.totalLeads)" :converted="Number(aggregatedStats.totalLeadsConvertidos)" :scheduled="Number(aggregatedStats.totalAppointments)" />
              </div>
            </div>

            <!-- DETALHAMENTO E RANKING -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <!-- TABELA COM DRILL-DOWN (Col 2) -->
              <div class="lg:col-span-2 space-y-4">
                <div class="flex items-center justify-between">
                  <h2 class="text-lg font-bold text-gray-900 tracking-tight">Detalhamento operacional</h2>
                  <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Clique para filtrar especialista</p>
                </div>
                <RelatoriosVendedorTable v-if="!loading" :data="reportData" @select-vendedor="handleVendedorSelect" />
                <div v-else class="bg-white rounded-2xl border border-gray-100 h-96 flex items-center justify-center">
                  <div class="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
                </div>
              </div>

              <!-- RANKING VISUAL (Col 1) -->
              <div class="lg:col-span-1 space-y-4">
                <RelatoriosBarrasVendedorChart v-if="!loading && reportData.length > 0" :data="reportData" />
              </div>
            </div>
          </div>

          <template #fallback>
            <div class="h-[600px] flex items-center justify-center">
              <div class="animate-pulse text-slate-400 font-bold uppercase tracking-widest">Sincronizando Dashboard...</div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useLeads } from '~/composables/useLeads';

useHead({
  title: 'Reports Prime - Analytics Dashboard'
});

const supabase = useSupabaseClient();
const { profile, checkIsAdmin } = useAuth();
const { vendedores, fetchVendedores } = useLeads();

const loading = ref(false);
const isAdmin = ref(false);
const reportData = ref<any[]>([]);
const showFilterPopover = ref(false);

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

onMounted(async () => {
  isAdmin.value = await checkIsAdmin();
  if (isAdmin.value) await fetchVendedores();
  await fetchReportData();
  
  // Dados do gráfico simulados apenas no cliente para evitar erro de hidratação
  const days = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
  dailyData.value = days.map(d => ({
    label: d,
    value: Math.floor(Math.random() * 30) + 5
  }));
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
    // Totais do período anterior para cálculo de variação global
    prevLeads: acc.prevLeads + (Number((curr as any).prev_leads) || 0),
    prevConv: acc.prevConv + (Number((curr as any).prev_leads_convertidos) || 0), // Assumindo que esta coluna existe ou é calculada
    prevAgend: acc.prevAgend + (Number((curr as any).prev_agendamentos) || 0),
    prevMsg: acc.prevMsg + (Number((curr as any).prev_mensagens) || 0)
  }), { leads: 0, convertidos: 0, agendamentos: 0, mensagens: 0, prevLeads: 0, prevConv: 0, prevAgend: 0, prevMsg: 0 });

  // Função auxiliar para variação %
  const calcVar = (curr: number, prev: number) => {
    if (prev > 0) return ((curr - prev) / prev) * 100;
    return curr > 0 ? 100 : 0;
  };

  const currConvRate = totals.leads > 0 ? (totals.convertidos / totals.leads) * 100 : 0;
  const prevConvRate = totals.prevLeads > 0 ? (totals.prevConv / totals.prevLeads) * 100 : 0;

  const result = {
    totalLeads: totals.leads,
    totalLeadsConvertidos: totals.convertidos,
    avgConversion: Number(currConvRate.toFixed(1)),
    totalAppointments: totals.agendamentos,
    totalMessages: totals.mensagens,
    // Valores de demonstração para métricas de tempo (até termos dados reais suficientes)
    avgResponseTime: 4.5,
    avgConversionTime: 7.2,
    totalLeadsVariacao: calcVar(totals.leads, totals.prevLeads),
    avgConversionVariacao: calcVar(currConvRate, prevConvRate),
    totalAppointmentsVariacao: calcVar(totals.agendamentos, totals.prevAgend),
    totalMessagesVariacao: calcVar(totals.mensagens, totals.prevMsg)
  };

  return result;
});

const fetchReportData = async () => {
  loading.value = true;
  try {
    const dates = getDatesFromPeriod();
    let filterId = vendedorFiltro.value;
    
    // Se não for admin, forçar o filtro do próprio vendedor
    if (!isAdmin.value && profile.value?.id) {
      filterId = Number(profile.value.id);
    }

    const params = {
      p_inicio: dates.start ? String(dates.start) : null,
      p_fim: dates.end ? String(dates.end) : null,
      p_vendedor: filterId ? Number(filterId) : null
    };

    console.log('📡 Chamando RPC com:', params);

    const { data, error } = await (supabase as any).rpc('fn_relatorio_vendedores_prime', params);

    if (error) {
      console.error('❌ Erro Supabase RPC:', error);
      reportData.value = [];
    } else {
      // Calcular as taxas de conversão individualmente no frontend para garantir precisão
      reportData.value = (data || []).map((item: any) => ({
        ...item,
        taxa_conversao: item.total_leads > 0 
          ? (Number(item.leads_convertidos) / Number(item.total_leads)) * 100 
          : 0
      }));
    }
  } catch (err: any) {
    console.error('⚠️ Falha crítica ao buscar dados do dashboard:', err.message || err);
  } finally {
    setTimeout(() => { loading.value = false; }, 400);
  }
};

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

const closeOnEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape') showFilterPopover.value = false;
};

onMounted(() => {
  window.addEventListener('keydown', closeOnEsc);
});
</script>

<style scoped>
select { appearance: none; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>
