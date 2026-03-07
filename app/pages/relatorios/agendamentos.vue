<template>
  <div class="p-4 bg-slate-50 min-h-[calc(100vh-64px)] w-full overflow-y-auto custom-scrollbar">
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-black/5">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
             <NuxtLink to="/relatorios" class="p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-black/5">
              <Icon name="lucide:arrow-left" class="w-4 h-4 text-slate-400" />
            </NuxtLink>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight uppercase">Analytics de Agenda</h1>
          </div>
          <p class="text-xs text-slate-400 font-bold uppercase tracking-widest pl-9">Métricas de ocupação e status dos agendamentos</p>
        </div>

        <!-- Filtros de Período -->
        <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div class="flex items-center gap-2 bg-white p-1 rounded-xl border border-black/5 shadow-sm">
            <button 
              v-for="p in periods" 
              :key="p.value"
              @click="selectedPeriod = p.value"
              class="px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200"
              :class="selectedPeriod === p.value ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'"
            >
              {{ p.label }}
            </button>
          </div>

          <!-- Seletores de Data Personalizada -->
          <div v-if="selectedPeriod === 'personalizado'" class="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
            <input 
              v-model="customDateStart" 
              type="date" 
              class="px-3 py-2 bg-white border border-black/5 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              @change="loadData"
            />
            <span class="text-[10px] font-black text-slate-300 uppercase">até</span>
            <input 
              v-model="customDateEnd" 
              type="date" 
              class="px-3 py-2 bg-white border border-black/5 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              @change="loadData"
            />
          </div>
        </div>
      </div>

      <!-- Métricas Principais (Cards) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <UiKpiCard 
          title="Total Agendamentos" 
          :value="stats.total" 
          icon="lucide:calendar-check" 
          color-classes="bg-indigo-50 text-indigo-600" 
        />
        <UiKpiCard 
          title="Confirmados" 
          :value="stats.confirmados" 
          :variation="getPercentage(stats.confirmados, stats.total)"
          suffix=""
          icon="lucide:check-circle-2" 
          color-classes="bg-emerald-50 text-emerald-600" 
        />
        <UiKpiCard 
          title="Pendentes" 
          :value="stats.pendentes" 
          :variation="getPercentage(stats.pendentes, stats.total)"
          icon="lucide:clock" 
          color-classes="bg-amber-50 text-amber-600" 
        />
        <UiKpiCard 
          title="Concluídos" 
          :value="stats.concluidos" 
          :variation="getPercentage(stats.concluidos, stats.total)"
          icon="lucide:done-all" 
          color-classes="bg-blue-50 text-blue-600" 
        />
        <UiKpiCard 
          title="Cancelados" 
          :value="stats.cancelados" 
          :variation="getPercentage(stats.cancelados, stats.total)"
          icon="lucide:x-circle" 
          color-classes="bg-rose-50 text-rose-600" 
        />
        <UiKpiCard 
          title="No-Show" 
          :value="stats.noShow" 
          :variation="getPercentage(stats.noShow, stats.total)"
          icon="lucide:user-x" 
          color-classes="bg-orange-50 text-orange-600" 
        />
      </div>

      <!-- Dashboard Visual (Gráficos e Detalhes) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Gráfico de Distribuição de Status -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-black/5 p-6 shadow-sm overflow-hidden">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Icon name="lucide:pie-chart" class="w-4 h-4 text-indigo-500" />
              Distribuição por Status
            </h3>
          </div>

          <!-- Visualização de Barras Horizontais (Gráfico Simples Premium) -->
          <div class="space-y-6">
            <div v-for="item in distribution" :key="item.label" class="space-y-1.5">
              <div class="flex justify-between items-end px-1">
                <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">{{ item.label }}</span>
                <span class="text-xs font-black text-slate-900">{{ item.count }} ({{ item.percent }}%)</span>
              </div>
              <div class="h-3 bg-slate-50 rounded-full overflow-hidden border border-black/5">
                <div 
                  class="h-full transition-all duration-1000 ease-out rounded-full"
                  :class="item.color"
                  :style="{ width: `${item.percent}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Card de Insights / Taxa de No-Show -->
        <div class="bg-white rounded-2xl border border-black/5 p-6 shadow-sm">
           <div class="flex flex-col h-full">
            <h3 class="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Icon name="lucide:trending-up" class="w-4 h-4 text-orange-500" />
              Métrica de No-Show
            </h3>
            
            <div class="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div class="relative w-32 h-32 flex items-center justify-center">
                <svg class="w-full h-full transform -rotate-90">
                  <circle
                    cx="64" cy="64" r="58"
                    stroke="currentColor"
                    stroke-width="8"
                    fill="transparent"
                    class="text-slate-100"
                  />
                  <circle
                    cx="64" cy="64" r="58"
                    stroke="currentColor"
                    stroke-width="8"
                    fill="transparent"
                    stroke-dasharray="364.4"
                    :stroke-dashoffset="364.4 - (364.4 * stats.noShowRate / 100)"
                    class="text-orange-500 transition-all duration-1000 ease-in-out"
                    stroke-linecap="round"
                  />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-2xl font-black text-slate-900 leading-none">{{ stats.noShowRate.toFixed(1) }}%</span>
                  <span class="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Ausências</span>
                </div>
              </div>
              
              <p class="text-[11px] text-slate-500 font-medium max-w-[200px] leading-relaxed">
                Esta métrica representa a porcentagem de agendamentos em que o cliente não compareceu no período selecionado.
              </p>
            </div>

            <div class="mt-8 pt-6 border-t border-black/5">
              <div class="flex items-center justify-between text-[10px] font-black uppercase">
                <span class="text-slate-400 tracking-widest">Comparecimento Total</span>
                <span class="text-emerald-600 tracking-wider">{{ (100 - stats.noShowRate).toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

       <!-- Detalhamento por Profissional (Simulado) -->
      <div class="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-black/5 flex items-center justify-between bg-slate-50/50">
          <h3 class="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <Icon name="lucide:users" class="w-4 h-4 text-indigo-500" />
            Performance por Profissional
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-white">
                <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-black/5">Profissional</th>
                <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-black/5 text-center">Total</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-black/5 text-center text-emerald-600">Confirmados</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-black/5 text-center text-blue-600">Concluídos</th>
                <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b border-black/5 text-center text-orange-600">No-Show</th>
                <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-black/5 text-right">Aproveitamento</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-black/5">
              <tr v-for="prof in professionalStats" :key="prof.nome" class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
                      {{ prof.nome.charAt(0) }}
                    </div>
                    <span class="text-xs font-black text-slate-700 uppercase tracking-tight">{{ prof.nome }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center font-bold text-slate-600 text-xs">{{ prof.total }}</td>
                <td class="px-6 py-4 text-center font-bold text-emerald-600 text-xs">{{ prof.confirmados }}</td>
                <td class="px-6 py-4 text-center font-bold text-blue-600 text-xs">{{ prof.concluidos }}</td>
                <td class="px-6 py-4 text-center font-bold text-orange-600 text-xs">{{ prof.noShow }}</td>
                <td class="px-6 py-4 text-right">
                  <div class="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-black/5 rounded-lg">
                    <span class="text-xs font-black text-slate-900">{{ ((prof.concluidos / prof.total) * 100).toFixed(1) }}%</span>
                  </div>
                </td>
              </tr>
              <tr v-if="professionalStats.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-slate-400 text-xs italic">Nenhum dado disponível.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <Icon name="svg-spinners:ring-resize" class="w-10 h-10 text-indigo-600" />
        <span class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] animate-pulse">Sincronizando Dados...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAgendamento } from '~/composables/useAgendamento'
import { useStatusPalette } from '~/composables/useStatusPalette'

// Layout e Títulos
definePageMeta({ layout: 'default' })
useHead({ title: 'Relatórios de Agendamentos | Bruve Prime' })

const { buscarRelatorioAgendamentos } = useAgendamento()
const { getPaletteByName } = useStatusPalette()

// Estados Reativos
const loading = ref(true)
const selectedPeriod = ref('ultimos_7_dias')
const rawData = ref<any[]>([])

// Datas para período personalizado
const customDateStart = ref<string>(new Date().toISOString().split('T')[0] || '')
const customDateEnd = ref<string>(new Date().toISOString().split('T')[0] || '')

// Definição dos Períodos
const periods = [
  { label: 'Últimos 7 dias', value: 'ultimos_7_dias' },
  { label: 'Mês Atual', value: 'mes_atual' },
  { label: 'Mês Anterior', value: 'mes_anterior' },
  { label: 'Personalizado', value: 'personalizado' }
]

// Mapeamento de Status para cálculos (baseados no normalize do useStatusPalette)
const STATUS_KEYS = {
  CONFIRMADO: 'confirmado',
  PENDENTE: 'pendente',
  CONCLUIDO: 'concluido',
  CANCELADO: 'cancelado',
  NO_SHOW: 'nao compareceu'
}

/**
 * Cálculos Agregados (KPIs)
 */
const stats = computed(() => {
  const total = rawData.value.length
  
  const counts = rawData.value.reduce((acc, ag) => {
    // Normalização manual simples para bater com useStatusPalette se necessário
    const status = ag.status_nome?.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim() || ''

    if (ag.cancelado) acc.cancelados++
    else if (status === STATUS_KEYS.CONFIRMADO) acc.confirmados++
    else if (status === STATUS_KEYS.PENDENTE) acc.pendentes++
    else if (status === STATUS_KEYS.CONCLUIDO) acc.concluidos++
    else if (status === STATUS_KEYS.NO_SHOW) acc.noShow++
    
    return acc
  }, { confirmados: 0, pendentes: 0, concluidos: 0, cancelados: 0, noShow: 0 })

  const noShowRate = total > 0 ? (counts.noShow / total) * 100 : 0

  return {
    total,
    ...counts,
    noShowRate
  }
})

/**
 * Distribuição para Gráfico de Barras
 */
const distribution = computed(() => [
  { label: 'Confirmados', count: stats.value.confirmados, percent: getPercentage(stats.value.confirmados, stats.value.total), color: 'bg-emerald-500' },
  { label: 'Pendentes', count: stats.value.pendentes, percent: getPercentage(stats.value.pendentes, stats.value.total), color: 'bg-amber-500' },
  { label: 'Concluídos', count: stats.value.concluidos, percent: getPercentage(stats.value.concluidos, stats.value.total), color: 'bg-blue-500' },
  { label: 'Cancelados', count: stats.value.cancelados, percent: getPercentage(stats.value.cancelados, stats.value.total), color: 'bg-rose-500' },
  { label: 'No-Show', count: stats.value.noShow, percent: getPercentage(stats.value.noShow, stats.value.total), color: 'bg-orange-500' }
])

/**
 * Agregado por Profissional
 */
const professionalStats = computed(() => {
  const map = new Map<string, any>()

  rawData.value.forEach(ag => {
    const prof = ag.profissional_nome || 'Não Definido'
    if (!map.has(prof)) {
      map.set(prof, { nome: prof, total: 0, confirmados: 0, concluidos: 0, cancelados: 0, noShow: 0 })
    }
    
    const s = map.get(prof)
    s.total++
    
    const status = ag.status_nome?.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim() || ''
      
    if (ag.cancelado) s.cancelados++
    else if (status === STATUS_KEYS.CONFIRMADO) s.confirmados++
    else if (status === STATUS_KEYS.CONCLUIDO) s.concluidos++
    else if (status === STATUS_KEYS.NO_SHOW) s.noShow++
  })

  return Array.from(map.values()).sort((a, b) => b.total - a.total)
})

/**
 * Helpers
 */
function getPercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Busca de Dados
 */
async function loadData() {
  loading.value = true
  
  let startDate: Date
  let endDate = new Date()
  
  const now = new Date()
  
  if (selectedPeriod.value === 'ultimos_7_dias') {
    startDate = new Date(now)
    startDate.setDate(now.getDate() - 7)
  } else if (selectedPeriod.value === 'mes_atual') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  } else if (selectedPeriod.value === 'mes_anterior') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    endDate = new Date(now.getFullYear(), now.getMonth(), 0)
  } else if (selectedPeriod.value === 'personalizado') {
    startDate = new Date(customDateStart.value)
    endDate = new Date(customDateEnd.value)
  } else {
    startDate = new Date(now)
    startDate.setDate(now.getDate() - 7)
  }

  const res = await buscarRelatorioAgendamentos({
    dataInicio: startDate.toISOString().split('T')[0],
    dataFim: endDate.toISOString().split('T')[0],
    silent: true
  })

  if (res && res.data) {
    rawData.value = res.data
  }
  
  loading.value = false
}

// Watchers
watch(selectedPeriod, loadData)

onMounted(loadData)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}
</style>
