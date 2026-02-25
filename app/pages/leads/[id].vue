<template>
  <NuxtLayout name="default">
    <ClientOnly>
      <div class="min-h-screen bg-[#f8fafc] p-6 lg:p-8">
        <!-- Page Title & Back Link -->
        <div class="mb-6 relative flex items-center justify-center pb-2 pt-2">
          <!-- Back Link (Compacto) -->
          <NuxtLink to="/leads" class="absolute left-0 group inline-flex items-center text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary-600 transition-all bg-white/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-100 shadow-sm hover:shadow-indigo-500/5">
            <Icon name="heroicons:arrow-left" class="w-3 h-3 mr-2 transition-transform group-hover:-translate-x-1" />
            Voltar
          </NuxtLink>

          <!-- Centered Title (Compact Premium) -->
          <div class="text-center group cursor-default select-none">
            <div class="inline-flex flex-col items-center">
              <h1 class="text-2xl font-black text-slate-900 tracking-tightest leading-none mb-1.5">
                Visão <span class="relative inline-block">
                  <span class="bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 via-primary-600 to-violet-600">360º do Lead</span>
                  <span class="absolute -bottom-0.5 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-600/0 via-indigo-600/40 to-indigo-600/0 rounded-full"></span>
                </span>
              </h1>
              <div class="flex items-center gap-3">
                <div class="h-[1px] w-5 bg-gradient-to-r from-transparent to-slate-200"></div>
                <p class="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-0">
                  Painel de <span class="text-indigo-500/80">Inteligência</span> Comercial
                </p>
                <div class="h-[1px] w-5 bg-gradient-to-l from-transparent to-slate-200"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="h-[60vh] flex items-center justify-center">
          <div class="flex flex-col items-center gap-4">
            <Icon name="svg-spinners:18-dots-indicator" class="w-12 h-12 text-primary-600" />
            <p class="text-gray-400 font-normal animate-pulse text-[10px] uppercase tracking-[0.2em]">Sincronizando dados estratégicos...</p>
          </div>
        </div>

        <!-- Not Found State -->
        <div v-else-if="!lead" class="h-[60vh] flex items-center justify-center">
          <div class="text-center">
            <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 class="text-lg font-semibold text-gray-900 uppercase tracking-wider">Lead não encontrado</h2>
            <p class="text-gray-500 font-medium text-xs">A inteligência comercial não localizou este registro.</p>
          </div>
        </div>

        <!-- Main Content (The Orchestration) -->
        <div v-if="!loading && lead" class="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <!-- 1. Header Component -->
          <LeadDetailHeader 
            :lead="lead" 
            @whatsapp="openWhatsApp"
            @edit="handleEdit"
            @schedule="handleSchedule"
          />

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <!-- 2. Left Column: Information (4 slots) -->
            <div class="lg:col-span-4 space-y-8">
              <LeadInfoCard :lead="lead" />
              
              <!-- Strategic Stats (Using UI Card) -->
              <UiCard class="bg-slate-900 text-white p-8 overflow-hidden" hover-effect>
                <Icon name="heroicons:rocket-launch" class="absolute -right-4 -bottom-4 w-40 h-40 text-white/5 -rotate-12" />
                <h2 class="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-6">Métricas de Conversão</h2>
                <div class="grid grid-cols-2 gap-6 relative z-10">
                  <div>
                    <p class="text-[10px] font-medium text-white/50 mb-1 uppercase tracking-wider">Tempo de Vida</p>
                    <p class="text-2xl font-bold">{{ diasAberto }} Dias</p>
                  </div>
                  <div>
                    <p class="text-[10px] font-medium text-white/50 mb-1 uppercase tracking-wider">Interações</p>
                    <p class="text-2xl font-bold">{{ timelineActivities.length }}</p>
                  </div>
                  <div class="col-span-2">
                    <p class="text-[10px] font-semibold text-white/50 mb-1 uppercase tracking-wider">Confiança no Fechamento</p>
                    <div class="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                      <div class="h-full bg-primary-400" :style="{ width: (lead.score || 0) + '%' }"></div>
                    </div>
                  </div>
                </div>
              </UiCard>
            </div>

            <!-- 3. Center Column: Timeline (5 slots) -->
            <div class="lg:col-span-5">
              <LeadTimeline 
                :activities="timelineActivities" 
                @add-note="saveQuickNote" 
              />
            </div>

            <!-- 4. Right Column: Strategic Actions (3 slots) -->
            <div class="lg:col-span-3 space-y-8">
              <UiCard title="Ações Rápidas" icon="heroicons:bolt" padding>
                <div class="grid grid-cols-1 gap-3">
                  <UiActionButton variant="outline" class="justify-between" @click="handleEdit">
                    Mudar Estágio
                    <Icon name="heroicons:chevron-right" />
                  </UiActionButton>
                  <UiActionButton variant="outline" class="justify-between" @click="handleSchedule">
                    Agendar Reunião
                    <Icon name="heroicons:calendar" />
                  </UiActionButton>
                  <UiActionButton variant="outline" class="justify-between" @click="handleEdit">
                    Gerar Proposta
                    <Icon name="heroicons:document-text" />
                  </UiActionButton>
                </div>
              </UiCard>

              <!-- Insight Card -->
              <div class="bg-white rounded-[2rem] p-6 border-2 border-dashed border-slate-200">
                <div class="flex items-center gap-2 mb-3">
                  <div class="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                  <h2 class="text-xs font-semibold text-gray-900 uppercase tracking-[0.2em]">IA Insight</h2>
                </div>
                <p class="text-xs font-medium text-gray-500 leading-relaxed italic">
                  Lead apresenta comportamento de compra acelerado no setor tecnológico. Recomendo envio de case de sucesso imediato.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </ClientOnly>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// --- SETUP ---
const route = useRoute();
const id = route.params.id as string;
const supabase = useSupabaseClient();

// --- STATE ---
const lead = ref<any>(null);
const loading = ref(true);
const timelineActivities = ref<any[]>([]);

// --- COMPUTED PROPERTIES ---
const diasAberto = computed(() => {
  if (!lead.value?.criado_em) return 0;
  const dataCriacao = new Date(lead.value.criado_em);
  if (isNaN(dataCriacao.getTime())) return 0;
  return Math.floor((Date.now() - dataCriacao.getTime()) / (1000 * 3600 * 24));
});

// --- FETCH DATA ---
const fetchData = async () => {
  loading.value = true;
  console.log(`[DIAGNÓSTICO] Iniciando busca unificada para o Lead ID: ${id}`);

  try {
    // 1. Validação de UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      console.warn('[AVISO] O ID fornecido não é um UUID válido.');
      loading.value = false;
      return;
    }

    // 2. Busca Dados Principais do Lead
    const { data: leadData, error: leadError } = await supabase
      .from('ag_leads')
      .select('*, ag_profiles(nome)')
      .eq('id', id)
      .maybeSingle();

    if (leadError) throw leadError;
    
    if (leadData) {
      lead.value = {
        ...(leadData as any),
        vendedor_nome: (leadData as any).ag_profiles?.nome
      };
    }

    // 3. Busca Timeline via RPC (Envolvida em try-catch isolado para não travar a página)
    try {
      console.log(`[RPC] Chamando get_lead_timeline com parâmetro lead_id_param: ${id}`);
      const { data: timelineData, error: timelineError } = await (supabase as any)
        .rpc('get_lead_timeline', { lead_id_param: id });

      if (timelineError) {
        console.error('[RPC ERRO] Falha ao carregar timeline:', timelineError.message);
      } else {
        console.log('[RPC SUCESSO] Dados da timeline recebidos:', (timelineData as any[])?.length || 0, 'itens');
        timelineActivities.value = (timelineData as any[]) || [];
      }
    } catch (rpcErr: any) {
      console.error('[RPC FALHA CRÍTICA] Erro ao tentar acessar a função da timeline:', rpcErr.message);
    }

  } catch (error: any) {
    console.error('[FALHA CRÍTICA] Erro durante o carregamento dos dados:', error.message);
  } finally {
    // Pequeno atraso para suavizar a transição visual
    setTimeout(() => { loading.value = false; }, 500);
  }
};

// --- LIFECYCLE HOOKS ---
onMounted(() => {
  fetchData();
});

// --- MÉTODOS DE AÇÃO ---
const saveQuickNote = async (content: string) => {
  try {
    const { profile } = useAuth();
    if (!profile.value?.id) {
      alert('Sessão expirada ou profissional não identificado.');
      return;
    }

    const { error } = await (supabase.from('ag_notas_internas') as any)
      .insert({
        lead_id: id,
        profissional_id: profile.value.id,
        conteudo: content
      });

    if (error) throw error;
    
    // Recarrega os dados para mostrar a nova nota na timeline
    await fetchData();
  } catch (error: any) {
    console.error('[ERRO AO SALVAR NOTA]', error.message);
    alert('Não foi possível salvar a nota no banco de dados.');
  }
};

const openWhatsApp = () => {
  if (lead.value?.telefone) {
    const numeroLimpo = lead.value.telefone.replace(/\D/g, '');
    window.open(`https://wa.me/${numeroLimpo}`, '_blank');
  }
};

const handleEdit = () => alert('Ação de editar acionada');
const handleSchedule = () => alert('Ação de agendar acionada');

</script>
