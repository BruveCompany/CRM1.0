<template>
  <div class="p-4 bg-white min-h-[calc(100vh-64px)] overflow-y-auto w-full custom-dashboard-scroll">
    <div class="max-w-7xl mx-auto space-y-12">
      
      <!-- Cabeçalho e KPIs (Layout Estabilizado) -->
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900 tracking-tight">Dashboard</h1>
          <p class="text-neutral-500 mt-1 font-medium">
            Bem-vindo 
            <ClientOnly fallback-tag="span">
              {{ userNameDisplay }}
              <template #fallback><span>...</span></template>
            </ClientOnly>! 
            Aqui está o resumo do seu CRM hoje.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Filtro de Período -->
          <div class="relative">
            <button 
              @click="showPeriodPopover = !showPeriodPopover"
              class="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <Icon name="heroicons:calendar" class="w-4 h-4 text-neutral-400" />
              <span>{{ periods.find(p => p.value === selectedPeriod)?.label || 'Calendário' }}</span>
            </button>
            <div v-if="showPeriodPopover" class="absolute right-0 mt-2 w-48 bg-white border border-neutral-100 rounded-xl shadow-xl z-50 p-2 space-y-1">
              <button 
                v-for="p in periods" :key="p.value"
                @click="selectedPeriod = p.value; showPeriodPopover = false"
                class="w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                :class="selectedPeriod === p.value ? 'bg-primary-50 text-primary-600' : 'text-neutral-600 hover:bg-neutral-50'"
              >
                {{ p.label }}
              </button>
              <div class="border-t border-neutral-50 my-1"></div>
              <button @click="showCustomDateModal = true; showPeriodPopover = false" class="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-primary-600 hover:bg-primary-50 transition-colors flex items-center gap-2">
                <Icon name="heroicons:adjustments-horizontal" class="w-4 h-4" />
                Personalizado...
              </button>
            </div>
          </div>
          <button @click="isCreateLeadModalOpen = true" class="px-4 py-2 bg-primary-600 rounded-lg text-sm font-semibold text-white hover:bg-primary-700 transition-colors shadow-sm flex items-center gap-2">
            <Icon name="heroicons:plus" class="w-4 h-4" />
            Novo Lead
          </button>
        </div>
      </header>

      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[140px]">
        <UiKpiCard title="Leads Ativos" :value="metricsLoading ? '...' : leadsAtivos" icon="heroicons-outline:user-group" color-classes="bg-primary-50 text-primary-600" />
        <UiKpiCard title="Próximas Ações" :value="metricsLoading ? '...' : proximasAcoesCount" icon="heroicons-outline:clock" color-classes="bg-blue-50 text-blue-600" />
        <UiKpiCard title="Taxa de Conversão" :value="metricsLoading ? '...' : formatarPercentual(taxaConversao)" icon="heroicons-outline:presentation-chart-line" color-classes="bg-emerald-50 text-emerald-600" />
        <UiKpiCard title="Valor em Negociação" :value="metricsLoading ? '...' : formatarMoeda(valorEmNegociacao)" icon="heroicons-outline:currency-dollar" color-classes="bg-amber-50 text-amber-600" />
      </section>

      <!-- Layout em Grade Principal -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        
        <!-- Minha Agenda (Funcional) -->
        <section class="lg:col-span-2 flex flex-col h-[450px]">
          <div class="flex items-center justify-between mb-4 px-1">
            <h2 class="text-xl font-semibold text-neutral-900 flex items-center gap-2">
              <ClientOnly>
                <Icon name="heroicons:calendar-days" class="w-5 h-5 text-primary-500" />
                <template #fallback><div class="w-5 h-5" /></template>
              </ClientOnly>
              Minha Agenda
            </h2>
            <NuxtLink to="/agenda" class="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">Ver agenda completa</NuxtLink>
          </div>
          
          <div class="flex-1 bg-white rounded-2xl border border-neutral-100 p-6 shadow-soft overflow-hidden">
            <ClientOnly>
              <DashboardMinhaAgendaWidget :items="proximasAcoes" />
              <template #fallback>
                <div class="space-y-4 animate-pulse">
                  <div v-for="i in 3" :key="i" class="h-16 bg-neutral-50 rounded-xl"></div>
                </div>
              </template>
            </ClientOnly>
          </div>
        </section>

        <!-- Funil de Vendas (Dinâmico) -->
        <section class="flex flex-col h-[450px]">
          <div class="flex flex-col mb-4 px-1">
            <h2 class="text-xl font-semibold text-neutral-900 flex items-center gap-2">
              <ClientOnly>
                <Icon name="heroicons:funnel" class="w-5 h-5 text-indigo-500" />
                <template #fallback><div class="w-5 h-5" /></template>
              </ClientOnly>
              Funil de Vendas
            </h2>
          </div>
          
          <div class="flex-1 bg-white rounded-2xl border border-neutral-100 p-6 shadow-soft overflow-hidden flex flex-col items-center justify-center">
            <ClientOnly v-if="funilChartData">
              <DashboardFunilVendasWidget :chart-data="funilChartData" />
              <template #fallback>
                <div class="w-full space-y-3 animate-pulse">
                  <div class="h-8 bg-neutral-50 rounded-lg w-full"></div>
                  <div class="h-8 bg-neutral-50 rounded-lg w-4/5"></div>
                  <div class="h-8 bg-neutral-50 rounded-lg w-3/4"></div>
                </div>
              </template>
            </ClientOnly>
            <div v-else-if="loading" class="flex flex-col gap-4 w-full animate-pulse p-4">
              <div class="h-8 bg-neutral-50 rounded-lg w-full"></div>
              <div class="h-8 bg-neutral-50 rounded-lg w-4/5"></div>
              <div class="h-8 bg-neutral-50 rounded-lg w-3/4"></div>
            </div>
            <div v-else class="text-center">
              <ClientOnly>
                <Icon name="heroicons:chart-bar" class="w-12 h-12 text-neutral-200 mx-auto mb-2" />
              </ClientOnly>
              <p class="text-xs text-neutral-400">Nenhum dado encontrado no funil.</p>
            </div>
          </div>
        </section>

        <!-- Atividades Recentes (Dinâmico) -->
        <section class="lg:col-span-3 flex flex-col">
          <div class="flex items-center justify-between mb-4 px-1">
            <h2 class="text-xl font-semibold text-neutral-900 flex items-center gap-2">
              <ClientOnly>
                <Icon name="heroicons:rocket-launch" class="w-5 h-5 text-amber-500" />
                <template #fallback><div class="w-5 h-5" /></template>
              </ClientOnly>
              Atividades Recentes
            </h2>
          </div>
          
          <div class="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <ClientOnly>
              <DashboardAtividadesRecentesWidget :atividades="atividadesRecentes" />
              <template #fallback>
                <div class="space-y-3 animate-pulse">
                  <div class="h-16 bg-white border border-neutral-100 rounded-xl"></div>
                  <div class="h-16 bg-white border border-neutral-100 rounded-xl"></div>
                </div>
              </template>
            </ClientOnly>
          </div>
        </section>
      </div>
    </div>

    <!-- Modais -->
    <CustomPeriodModal 
      v-model="showCustomDateModal" 
      @apply="handleCustomDateApply"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * Página: Dashboard
 */
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useLeads } from '~/composables/useLeads';
import { useTarefas } from '~/composables/useTarefas';
import { useDashboardMetrics } from '~/composables/useDashboardMetrics';
import CustomPeriodModal from '~/components/modals/CustomPeriodModal.vue';
import DashboardMinhaAgendaWidget from '~/components/dashboard/MinhaAgendaWidget.vue';
import DashboardFunilVendasWidget from '~/components/dashboard/FunilVendasWidget.vue';
import DashboardAtividadesRecentesWidget from '~/components/dashboard/AtividadesRecentesWidget.vue';
import UiKpiCard from '~/components/ui/KpiCard.vue';

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Dashboard | Sistema CRM',
  meta: [
    { name: 'description', content: 'Visão geral de performance e leads.' }
  ]
})

// --- ESTADO ---
const supabase = useSupabaseClient();
const { profile, profId, waitForProfile } = useAuth();
const { isCreateLeadModalOpen } = useLeads();
const { getProximasTarefas } = useTarefas();

const tarefas = ref<any[]>([]);
const agendamentos = ref<any[]>([]);
const atividadesRecentes = ref<any[]>([]);
const funilChartData = ref<any>(null);
const loading = ref(true);
const showPeriodPopover = ref(false);
const showCustomDateModal = ref(false);
const selectedPeriod = ref<number | string>(30);

// --- MÉTRICAS REAIS ---
const { 
    leadsAtivos, 
    proximasAcoes: proximasAcoesCount, 
    taxaConversao, 
    valorEmNegociacao, 
    loading: metricsLoading,
    fetchDashboardData: fetchMetrics,
    subscribeToDashboardChanges,
    unsubscribeFromDashboardChanges
} = useDashboardMetrics();

const periods = [
  { label: 'Últimos 7 dias', value: 7 },
  { label: 'Últimos 15 dias', value: 15 },
  { label: 'Últimos 30 dias', value: 30 },
  { label: 'Últimos 90 dias', value: 90 },
  { label: 'Todo o período', value: 3650 },
];

// --- COMPUTADOS ---
const userNameDisplay = computed(() => {
  if (!profile.value?.nome) return 'de volta';
  const names = profile.value.nome.trim().split(/\s+/);
  if (names.length <= 2) return profile.value.nome;
  return `${names[0]} ${names[1]}`;
});

// --- AUXILIARES ---
const hexToRgba = (hex: string, opacity: number = 1) => {
  let c: any;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',')},${opacity})`;
  }
  return hex;
};

const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

const formatarPercentual = (valor: number) => {
  return `${(valor || 0).toFixed(1)}%`;
};

const handleCustomDateApply = (dates: { start: string, end: string }) => {
  selectedPeriod.value = 'custom';
  fetchDashboardData(); 
};

/**
 * Função fetchDashboardData centralizada e Otimizada
 */
const fetchDashboardData = async (silent = false) => {
  // Garantia: Aguarda o perfil estar carregado (Essencial para F5/Reload)
  await waitForProfile();
  if (!profile.value?.id) return;
  
  if (!silent) loading.value = true;
  try {
    const startDate = new Date();
    const dias = typeof selectedPeriod.value === 'number' ? selectedPeriod.value : 30;
    startDate.setDate(startDate.getDate() - dias);
    const startDateISO = startDate.toISOString();
    const todayISO = new Date().toISOString().split('T')[0];

    // DISPARA TUDO EM PARALELO (Otimização Máxima)
    const [agRes, metricsRes, funilRes, actRes]: any = await Promise.all([
      supabase.from('ag_view_agendamentos_completo').select('*').eq('cancelado', false).gte('data', todayISO).order('data').order('hora_inicio').limit(10),
      fetchMetrics(selectedPeriod.value),
      (supabase.rpc as any)('get_funil_vendas_dashboard', { user_id_param: profile.value.user_id }),
      supabase.from('view_atividades_recentes').select('*').gte('data_criacao', startDateISO).order('data_criacao', { ascending: false }).limit(10)
    ]);

    // Busca tarefas de forma reativa sem bloquear
    const currentProfId = profId.value;
    if (currentProfId) {
      getProximasTarefas(currentProfId as string, 5).then(res => tarefas.value = res);
    }

    agendamentos.value = agRes.data || [];

    if (!funilRes.error && funilRes.data) {
      funilChartData.value = {
        labels: (funilRes.data as any[]).map((d: any) => d.status_nome),
        datasets: [{
          data: (funilRes.data as any[]).map((d: any) => d.quantidade || d.lead_count || 0),
          backgroundColor: (funilRes.data as any[]).map((d: any) => {
             const baseColor = d.status_cor || d.cor || '#6366f1';
             return hexToRgba(baseColor, 0.85);
          }),
          borderColor: (funilRes.data as any[]).map((d: any) => d.status_cor || d.cor || '#6366f1'),
        }]
      };
    }

    atividadesRecentes.value = actRes.data || [];
  } catch (err) {
    console.error('[Dashboard] Erro Crítico:', err);
  } finally {
    loading.value = false;
  }
};

// 5. Unificar os dados para o widget de agenda
const proximasAcoes = computed(() => {
  const agsMapeados = agendamentos.value.map(ag => {
    // Formata a data e hora para um padrão ISO válido (YYYY-MM-DDTHH:mm:ss)
    const dataISO = ag.data && ag.hora_inicio 
      ? `${ag.data}T${ag.hora_inicio.split('-')[0].split('+')[0]}` // Remove timezone se houver
      : ag.data + 'T00:00:00';

    return {
      id: `ag-${ag.id}`,
      id_original: ag.id,
      lead_id: ag.cliente_id, 
      tipo: 'agendamento' as const,
      titulo: ag.titulo || 'Compromisso',
      lead_nome: ag.cliente_nome || ag.nome_contato || 'Lead s/ nome',
      data: dataISO,
      hora_fim: ag.hora_fim ? ag.hora_fim.split('-')[0].split('+')[0] : null
    };
  });

  const tasksMapeadas = tarefas.value.map(t => ({
    id: `task-${t.id}`,
    id_original: t.id,
    lead_id: t.lead_id,
    tipo: 'tarefa' as const,
    titulo: t.titulo,
    lead_nome: t.lead?.nome || 'Lead s/ nome',
    data: t.data_vencimento || agendamentos.value?.[0]?.data || new Date().toISOString().split('T')[0]
  }));

  return [...agsMapeados, ...tasksMapeadas]
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 5);
});

// Executa ao montar o componente
onMounted(async () => {
  await waitForProfile();
  fetchDashboardData();
  subscribeToDashboardChanges(() => fetchDashboardData(true)); 
});

onUnmounted(() => {
  unsubscribeFromDashboardChanges(); 
});

// Watch para recarregar quando o período mudar
watch(selectedPeriod, () => {
  fetchDashboardData();
});
</script>

<style scoped>
.shadow-soft {
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
}

/* Scrollbar Identica ao Relatorio */
.custom-dashboard-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-dashboard-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
