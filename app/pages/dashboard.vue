<template>
  <div class="p-6 lg:p-8 space-y-8 animate-fade-in max-w-[1600px] mx-auto">
    <!-- Cabeçalho da Página -->
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900 tracking-tight">Dashboard</h1>
        <p class="text-neutral-500 mt-1 font-medium">Bem-vindo de volta! Aqui está o resumo do seu CRM hoje.</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm flex items-center gap-2">
          <ClientOnly>
            <Icon name="heroicons:calendar" class="w-4 h-4" />
          </ClientOnly>
          Últimos 30 dias
        </button>
        <button 
          @click="isCreateLeadModalOpen = true"
          class="px-4 py-2 bg-primary-600 rounded-lg text-sm font-semibold text-white hover:bg-primary-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <ClientOnly>
            <Icon name="heroicons:plus" class="w-4 h-4" />
          </ClientOnly>
          Novo Lead
        </button>
      </div>
    </header>

    <!-- Grade de KPIs -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <UiKpiCard 
        title="Leads Ativos" 
        :value="leadsAtivosCount" 
        icon="heroicons:user-group" 
      />
      <UiKpiCard 
        title="Próximas Ações" 
        :value="proximasAcoes.length" 
        icon="heroicons:clock" 
      />
      <UiKpiCard 
        title="Taxa de Conversão" 
        value="24.8%" 
        icon="heroicons:arrow-trending-up" 
      />
      <UiKpiCard 
        title="Valor em Negociação" 
        value="R$ 158.400" 
        icon="heroicons:currency-dollar" 
      />
    </section>

    <!-- Layout em Grade Principal -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Minha Agenda (Funcional) -->
      <section class="lg:col-span-2 flex flex-col h-[480px]">
        <div class="flex items-center justify-between mb-4 px-1">
          <h2 class="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <ClientOnly>
              <Icon name="heroicons:calendar-days" class="w-5 h-5 text-primary-500" />
            </ClientOnly>
            Minha Agenda
          </h2>
          <NuxtLink to="/agenda" class="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">Ver agenda completa</NuxtLink>
        </div>
        
        <div class="flex-1 bg-white rounded-2xl border border-neutral-100 p-6 shadow-soft overflow-hidden">
          <ClientOnly>
            <DashboardMinhaAgendaWidget :items="proximasAcoes" />
            <template #fallback>
              <div class="flex flex-col gap-3 animate-pulse">
                <div class="h-20 bg-neutral-50 rounded-xl"></div>
                <div class="h-20 bg-neutral-50 rounded-xl"></div>
              </div>
            </template>
          </ClientOnly>
        </div>
      </section>

      <!-- Funil de Vendas (Dinâmico) -->
      <section class="flex flex-col h-[480px]">
        <div class="flex flex-col mb-4 px-1">
          <h2 class="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <ClientOnly>
              <Icon name="heroicons:funnel" class="w-5 h-5 text-indigo-500" />
            </ClientOnly>
            Funil de Vendas
          </h2>
          <p class="text-xs text-neutral-400 font-medium mt-0.5">Fluxo de efetividade comercial</p>
        </div>
        
        <div class="flex-1 bg-white rounded-2xl border border-neutral-100 p-6 shadow-soft overflow-hidden flex flex-col items-center justify-center">
          <ClientOnly v-if="funilChartData">
            <DashboardFunilVendasWidget :chart-data="funilChartData" />
          </ClientOnly>
          <div v-else-if="loading" class="flex flex-col gap-4 w-full animate-pulse">
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
          <h2 class="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <ClientOnly>
              <Icon name="heroicons:rocket-launch" class="w-5 h-5 text-warning-500" />
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
</template>

<script setup lang="ts">
/**
 * Página: Dashboard
 */
import { ref, onMounted, computed } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useLeads } from '~/composables/useLeads';

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
const { profile } = useAuth();
const { isCreateLeadModalOpen } = useLeads();
const { getProximasTarefas } = useTarefas();

const tarefas = ref<any[]>([]);
const agendamentos = ref<any[]>([]);
const atividadesRecentes = ref<any[]>([]);
const funnelResult = ref<any[]>([]);
const funilChartData = ref<any>(null);
const leadsAtivosCount = ref(0);
const loading = ref(true);

// --- AUXILIARES ---
/**
 * Converte HEX para RGBA para suavizar as cores do gráfico
 */
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

// 4. Função carregarAgenda (Renomeada conforme pedido)
const fetchDashboardData = async () => {
  if (!profile.value?.id) return;
  
  loading.value = true;
  try {
    // 1. Buscar ID do profissional logado
    const { data: profissionalData }: any = await supabase
      .from('ag_profissionais')
      .select('id')
      .eq('profile_id', profile.value.id)
      .maybeSingle();
    
    const profId = profissionalData?.id;

    if (profId) {
      // 2. Chamar a função do composable (Passo 4 do seu pedido)
      tarefas.value = await getProximasTarefas(profId, 5);
      console.log('Tarefas carregadas:', tarefas.value.length);
    }

    // 3. Buscar Agendamentos (Visão Geral da Empresa)
    const today = new Date().toLocaleDateString('en-CA');
    const { data: agData } = await supabase
      .from('ag_view_agendamentos_completo')
      .select('*')
      .eq('cancelado', false)
      .gte('data', today)
      .order('data', { ascending: true })
      .order('hora_inicio', { ascending: true })
      .limit(10);
    
    agendamentos.value = agData || [];

    // 4. Buscar KPI
    const { count } = await supabase
      .from('ag_leads')
      .select('*', { count: 'exact', head: true })
      .eq('vendedor_id', profile.value.id);
    
    leadsAtivosCount.value = count || 0;

    // 5. Buscar Dados do Funil via RPC (Por Status)
    const { data: funilData, error: funilError } = await (supabase.rpc as any)('get_funil_vendas_dashboard', { 
      user_id_param: profile.value.user_id 
    });

    if (!funilError && funilData) {
      funilChartData.value = {
        labels: funilData.map((d: any) => d.status_nome),
        datasets: [{
          data: funilData.map((d: any) => d.lead_count),
          // Cores dinâmicas (conforme a imagem) com gradiente invertido (suave encima, sólida embaixo)
          backgroundColor: funilData.map((d: any, index: number) => {
            const opacity = Math.min(1.0, 0.3 + (index * 0.12)); 
            return hexToRgba(d.cor, opacity);
          }),
          borderRadius: 20,
          barThickness: 24,
          borderWidth: 0
        }]
      };
    }

    // 6. Buscar Atividades Recentes (Nova View)
    const { data: actData } = await supabase
      .from('view_atividades_recentes')
      .select('*')
      .order('data_criacao', { ascending: false })
      .limit(10);
    
    atividadesRecentes.value = actData || [];

  } catch (err) {
    console.error('Erro ao carregar dashboard:', err);
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
      lead_id: ag.cliente_id, // Corrigido: cliente_id é a coluna correta na view
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
onMounted(() => {
  fetchDashboardData();
});

// Watch para recarregar se o profile mudar (ex: login tardio)
watch(() => profile.value?.id, (newId) => {
  if (newId) fetchDashboardData();
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.shadow-soft {
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
}
</style>
