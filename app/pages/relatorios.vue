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

                <div class="flex items-center gap-2">
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

                  <!-- POPOVER DE EXPORTAÇÃO (ESTILO MODAL ANCORADO) -->
                  <div class="relative">
                    <button 
                      @click="showExportModal = !showExportModal"
                      :disabled="reportData.length === 0"
                      class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon name="heroicons:outline:arrow-down-tray" class="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                      <span class="text-sm font-semibold text-gray-700">Exportar</span>
                      <Icon :name="showExportModal ? 'heroicons:outline:chevron-up' : 'heroicons:outline:chevron-down'" class="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    <!-- Popover Superior (Estilo Premium) -->
                    <div 
                      v-if="showExportModal" 
                      class="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in slide-in-from-top-1 duration-200"
                    >
                      <div class="px-4 py-2.5 bg-slate-50/50 border-b border-slate-100/50">
                        <p class="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Formato de Exportação</p>
                      </div>
                      
                      <div class="p-1.5 space-y-0.5">
                        <!-- Opção CSV -->
                        <button 
                          @click="exportToCSV(); showExportModal = false"
                          class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-emerald-50/40 transition-all group/item"
                        >
                          <div class="w-6 h-6 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                            <img src="https://img.icons8.com/fluency/144/csv.png" alt="CSV" class="w-full h-full object-contain" />
                          </div>
                          <p class="text-xs font-normal text-slate-500 group-hover/item:text-slate-700">Relatório CSV</p>
                        </button>

                        <!-- Opção Excel -->
                        <button 
                          @click="exportToXLSX(); showExportModal = false"
                          class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-emerald-50 transition-all group/item"
                        >
                          <div class="w-6 h-6 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                            <img src="https://img.icons8.com/color/144/microsoft-excel-2019--v1.png" alt="Excel" class="w-full h-full object-contain" />
                          </div>
                          <p class="text-xs font-normal text-slate-500 group-hover/item:text-slate-700">Planilha Excel</p>
                        </button>

                        <!-- Opção PDF -->
                        <button 
                          @click="exportToPDF(); showExportModal = false"
                          class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-rose-50 transition-all group/item"
                        >
                          <div class="w-6 h-6 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                            <img src="https://img.icons8.com/office/144/pdf.png" alt="PDF" class="w-full h-full object-contain" />
                          </div>
                          <p class="text-xs font-normal text-slate-500 group-hover/item:text-slate-700">Salvar como PDF</p>
                        </button>
                      </div>
                      
                      <div class="p-1.5 border-t border-slate-100/50">
                        <button @click="showExportModal = false" class="w-full py-1 text-[9px] font-medium text-slate-400 hover:text-slate-500 uppercase tracking-wider transition-colors">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button @click="fetchReportData" :disabled="loading" class="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <Icon name="heroicons:outline:arrow-path" class="w-5 h-5 text-slate-400" :class="{ 'animate-spin': loading }" />
                </button>
              </div>
            </div>


            <!-- ÁREA DE CAPTURA DO PDF (Renderizada apenas durante a exportação para garantir captura) -->
            <div v-if="isExporting" id="formal-report-content" class="bg-white p-10 text-slate-900 border border-slate-200" style="width: 1050px; margin: 0 auto;">
              <!-- Cabeçalho do Relatório -->
              <div class="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
                <div>
                  <h1 class="text-2xl font-bold text-slate-800 tracking-tight">Bruve Prime - Analytics</h1>
                  <p class="text-slate-400 font-medium uppercase tracking-widest text-[10px]">Relatório de Desempenho Operacional</p>
                </div>
                <div class="text-right space-y-1">
                  <p class="text-[10px] font-bold text-slate-300 uppercase">Gerado em</p>
                  <p class="text-sm font-bold text-slate-600">{{ new Date().toLocaleString('pt-BR') }}</p>
                </div>
              </div>

              <!-- Resumo Executivo (KPIs) -->
              <div class="grid grid-cols-4 gap-6 mb-10">
                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p class="text-[9px] font-bold text-slate-400 uppercase mb-1">Total de Leads</p>
                  <p class="text-xl font-bold text-slate-800">{{ aggregatedStats.totalLeads }}</p>
                </div>
                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p class="text-[9px] font-bold text-slate-400 uppercase mb-1">Conversão Média</p>
                  <p class="text-xl font-bold text-slate-800">{{ aggregatedStats.avgConversion }}%</p>
                </div>
                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p class="text-[9px] font-bold text-slate-400 uppercase mb-1">Tempo de Resposta</p>
                  <p class="text-xl font-bold text-slate-800">{{ aggregatedStats.avgResponseTime }}h</p>
                </div>
                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p class="text-[9px] font-bold text-slate-400 uppercase mb-1">Agendamentos</p>
                  <p class="text-xl font-bold text-slate-800">{{ aggregatedStats.totalAppointments }}</p>
                </div>
              </div>

              <!-- Tabela Formal -->
              <div class="space-y-4">
                <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest border-l-4 border-indigo-500 pl-3">Detalhamento por Especialista</h2>
                <table class="w-full border-collapse">
                  <thead>
                    <tr class="bg-slate-800 text-white">
                      <th class="py-3 px-4 text-left text-[10px] font-bold uppercase rounded-tl-xl text-white">Consultor</th>
                      <th class="py-3 px-2 text-center text-[10px] font-bold uppercase text-white">Leads</th>
                      <th class="py-3 px-2 text-center text-[10px] font-bold uppercase text-white">Conv.</th>
                      <th class="py-3 px-2 text-center text-[10px] font-bold uppercase text-white">Taxa %</th>
                      <th class="py-3 px-2 text-center text-[10px] font-bold uppercase text-white">Score</th>
                      <th class="py-3 px-2 text-center text-[10px] font-bold uppercase text-white">T. Resp.</th>
                      <th class="py-3 px-4 text-right text-[10px] font-bold uppercase rounded-tr-xl text-white">Agend.</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="item in reportData" :key="item.vendedor_id" class="odd:bg-slate-50/50 hover:bg-slate-100/30">
                      <td class="py-3 px-4 text-xs font-bold text-slate-700">{{ item.vendedor_nome }}</td>
                      <td class="py-3 px-2 text-center text-xs text-slate-600">{{ item.total_leads }}</td>
                      <td class="py-3 px-2 text-center text-xs text-slate-600">{{ item.leads_convertidos }}</td>
                      <td class="py-3 px-2 text-center text-xs font-bold text-slate-800">{{ (item.taxa_conversao || 0).toFixed(1) }}%</td>
                      <td class="py-3 px-2 text-center text-xs text-slate-500">{{ (item.score_medio || 0).toFixed(1) }}</td>
                      <td class="py-3 px-2 text-center text-xs text-slate-500">{{ (Number(item.tempo_medio_resposta) || 0).toFixed(1) }}h</td>
                      <td class="py-3 px-4 text-right text-xs font-bold text-slate-700">{{ item.total_agendamentos }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Rodapé do PDF -->
              <div class="mt-20 pt-8 border-t border-slate-100 flex justify-between items-center text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                <p>© 2026 BRUVE PRIME - SISTEMA DE GESTÃO</p>
                <p>Página 1 de 1</p>
              </div>
            </div>

            <!-- DASHBOARD VISUAL (O que continua na tela) -->
            <div id="report-view-content" class="space-y-8">
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
                  <div class="flex items-center justify-between px-2">
                    <h2 class="text-lg font-bold text-gray-900 tracking-tight">Detalhamento operacional</h2>
                  </div>
                  <RelatoriosVendedorTable v-if="!loading" :data="reportData" @select-vendedor="handleVendedorSelect" />
                </div>

                <!-- RANKING VISUAL (Col 1) -->
                <div class="lg:col-span-1 space-y-4">
                  <RelatoriosBarrasVendedorChart v-if="!loading && reportData.length > 0" :data="reportData" />
                </div>
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
const showExportModal = ref(false);
const isExporting = ref(false); // Novo estado para controle de exportação

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

// Função para exportar os dados da tabela para CSV
const exportToCSV = () => {
  if (reportData.value.length === 0) return;

  // 1. Definir Cabeçalhos
  const headers = ["Consultor", "Leads", "Conversão", "Taxa %", "Score", "Tempo Resp. (h)", "Agend."];
  
  // 2. Mapear os dados para as linhas do CSV
  const rows = reportData.value.map(item => [
    `"${item.vendedor_nome || 'N/A'}"`, // Aspas duplas para evitar erro com nomes que tenham vírgula
    item.total_leads || 0,
    item.leads_convertidos || 0,
    (item.taxa_conversao || 0).toFixed(2),
    (item.score_medio || 0).toFixed(2),
    (Number(item.tempo_medio_resposta) || 0).toFixed(2),
    item.total_agendamentos || 0
  ]);

  // 3. Unir cabeçalhos e linhas com quebras de linha (\n)
  const csvContent = [
    headers.join(","),
    ...rows.map(r => r.join(","))
  ].join("\n");

  // 4. Criar o arquivo (Blob) e acionar o download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  // Nome do arquivo com data atual
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `relatorio_desempenho_${dateStr}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Função robusta para exportar para Excel (.xlsx)
const exportToXLSX = async () => {
  if (reportData.value.length === 0) return;

  try {
    // Carregamento dinâmico da biblioteca padrão xlsx
    const XLSX = await import('xlsx');

    // 1. Preparar os dados
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

    // 2. Criar a Worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // 3. Ajustar largura das colunas
    ws['!cols'] = [
      { wch: 25 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 10 }
    ];

    // 4. Criar o Workbook e anexar a aba
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Desempenho");
    
    // 5. Gerar o arquivo e disparar download
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `relatorio_desempenho_${dateStr}.xlsx`);
    
  } catch (err: any) {
    console.error('❌ Erro na exportação Excel:', err);
    alert('Erro ao gerar Excel. Por favor, use o formato CSV por enquanto.');
  }
};

// Função definitiva para salvar o Relatório Formal em PDF
const exportToPDF = async () => {
  if (!process.client) return;
  if (!reportData.value || reportData.value.length === 0) {
    alert('Não há dados para exportar.');
    return;
  }
  
  try {
    // 1. Ativar modo de exportação e aguardar renderização
    isExporting.value = true;
    
    // Pequeno delay e nextTick para garantir que o Vue montou o DOM do relatório
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const element = document.getElementById('formal-report-content');
    if (!element) {
      isExporting.value = false;
      return;
    }

    const Lib = await import('html2pdf.js');
    const html2pdf = Lib.default || Lib;
    
    const dateStr = new Date().toISOString().split('T')[0];
    
    const opt = {
      margin: 0.5,
      filename: `Relatorio_Operacional_${dateStr}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'in', 
        format: 'a4', 
        orientation: 'portrait' as const
      }
    };

    // 2. Gerar o PDF
    await html2pdf().set(opt).from(element).save();
    
    // 3. Limpar estado
    isExporting.value = false;
    
  } catch (err) {
    console.error('❌ Erro no relatório PDF:', err);
    alert('Erro ao gerar relatório formal.');
    isExporting.value = false;
  }
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
  if (e.key === 'Escape') {
    showFilterPopover.value = false;
    showExportModal.value = false;
  }
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
