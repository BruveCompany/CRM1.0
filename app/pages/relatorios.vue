<template>
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

                <!-- BOTÃO DEFINIR METAS (ADMIN ONLY) (Tarefa 2.1) -->
                <div v-if="isAdmin" class="hidden sm:block">
                  <button 
                    @click="showMetasModal = true"
                    class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all group scale-[0.95] hover:scale-100"
                  >
                    <Icon name="heroicons:outline:adjustments-horizontal" class="w-5 h-5 text-indigo-100 group-hover:rotate-12 transition-transform" />
                    <span class="text-sm font-bold">Definir Metas</span>
                  </button>
                </div>
              </div>

              <button @click="fetchReportData(false)" :disabled="loading" class="p-2 bg-slate-50 rounded-xl border border-slate-100">
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
                  <tr v-for="(item, index) in rankedSellers" :key="item.vendedor_id" class="odd:bg-slate-50/50 hover:bg-slate-100/30">
                    <td class="py-3 px-4 text-xs font-bold text-slate-700">
                      <div class="flex items-center gap-2">
                        <span v-if="index === 0" class="text-xs">🥇</span>
                        <span v-else-if="index === 1" class="text-xs">🥈</span>
                        <span v-else-if="index === 2" class="text-xs">🥉</span>
                        {{ item.vendedor_nome }}
                      </div>
                    </td>
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
            <!-- KPI CARDS GRID (UNIFICADO COM DASHBOARD) -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3">
              <UiKpiCard title="Novos Leads Gerados" :value="aggregatedStats.totalLeads" :variation="aggregatedStats.totalLeadsVariacao" icon="heroicons:user-group" color-classes="bg-primary-50 text-primary-600" />
              <UiKpiCard title="Taxa de Conversão" :value="aggregatedStats.avgConversion" :variation="aggregatedStats.avgConversionVariacao" suffix="%" icon="heroicons:presentation-chart-line" color-classes="bg-emerald-50 text-emerald-600" />
              <UiKpiCard title="Tempo Resposta" :value="aggregatedStats.avgResponseTime" suffix="h" icon="heroicons:clock" color-classes="bg-blue-50 text-blue-600" />
              <UiKpiCard title="Ciclo Venda" :value="aggregatedStats.avgConversionTime" suffix="d" icon="heroicons:calendar" color-classes="bg-rose-50 text-rose-600" />
              <UiKpiCard title="Agendamentos" :value="aggregatedStats.totalAppointments" :variation="aggregatedStats.totalAppointmentsVariacao" icon="heroicons:calendar-days" color-classes="bg-amber-50 text-amber-600" />
              <UiKpiCard title="Interações" :value="aggregatedStats.totalMessages" :variation="aggregatedStats.totalMessagesVariacao" icon="heroicons:chat-bubble-left-right" color-classes="bg-indigo-50 text-indigo-600" />
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
                <RelatoriosVendedorTable v-if="!loading" :data="rankedSellers" @select-vendedor="handleVendedorSelect" />
              </div>

              <!-- RANKING VISUAL (Col 1) -->
              <div class="lg:col-span-1 space-y-4">
                <RelatoriosBarrasVendedorChart v-if="!loading && rankedSellers.length > 0" :data="rankedSellers" />
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

  <!-- MODAL DE METAS (Tarefa 2.1) -->
  <RelatoriosMetasModal 
    :show="showMetasModal" 
    @close="showMetasModal = false" 
    @saved="fetchReportData" 
  />
</template>

<script setup lang="ts">
import { useRelatorios } from '~/composables/useRelatorios';

definePageMeta({
  layout: 'default'
});

useHead({
  title: 'Reports Prime - Analytics Dashboard'
});

const {
  loading,
  isAdmin,
  showMetasModal,
  reportData,
  showFilterPopover,
  showExportModal,
  isExporting,
  selectedPeriod,
  vendedorFiltro,
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
} = useRelatorios();
</script>

<style scoped>
select { appearance: none; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>
