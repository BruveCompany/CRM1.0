<template>
  <NuxtLayout name="default">
    <ClientOnly>
      <div class="min-h-screen bg-[#f8fafc] p-6 lg:p-8">
        <!-- Back Link -->
        <div class="mb-6">
          <NuxtLink to="/leads" class="group inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors">
            <Icon name="heroicons:arrow-left" class="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Voltar para Leads
          </NuxtLink>
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
            <p class="text-gray-500 font-medium">A inteligência comercial não localizou este registro.</p>
          </div>
        </div>

        <!-- Main Content (The Orchestration) -->
        <div v-else class="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
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
                    <p class="text-2xl font-bold">{{ timelineItems.length }}</p>
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
                :activities="timelineItems" 
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
const id = route.params.id; // ID da URL (ex: "1")
const supabase = useSupabaseClient();

// --- STATE ---
const lead = ref<any>(null);
const loading = ref(true);
const timelineItems = ref<any[]>([]);

// --- COMPUTED PROPERTIES ---
const diasAberto = computed(() => {
  if (!lead.value?.criado_em) return 0;
  // Garante que a data é um objeto Date válido antes de calcular
  const dataCriacao = new Date(lead.value.criado_em);
  if (isNaN(dataCriacao.getTime())) return 0; // Retorna 0 se a data for inválida
  return Math.floor((Date.now() - dataCriacao.getTime()) / (1000 * 3600 * 24));
});

// --- LIFECYCLE HOOKS ---
onMounted(async () => {
  // Inicializa a timeline apenas no cliente para evitar erros de hidratação
  timelineItems.value = [
    { date: new Date(), content: 'Perfil acessado pela inteligência comercial.', author: 'Sistema', type: 'activity' },
    { date: new Date(Date.now() - 3600000), content: 'Lead movido para estágio de negociação.', author: 'Gerente Comercial', type: 'status', metadata: 'em_negociacao' },
    { date: new Date(Date.now() - 86400000), content: 'Cliente solicitou orçamento via WhatsApp.', author: 'Lead', type: 'message' }
  ];
  await fetchData();
});

// --- DATA FETCHING (VERSÃO CORRIGIDA E COM DIAGNÓSTICO) ---
const fetchData = async () => {
  loading.value = true;
  try {
    // Verificação de UUID vs Inteiro para evitar erro 400 do Supabase
    // A tabela ag_leads usa UUID como chave primária. Se o ID não for um UUID, não fazemos a busca.
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id as string);
    
    if (!isUuid) {
      console.warn(`[ETAPA 1.2] ID "${id}" não é um UUID válido. Pulando busca para evitar erro de sintaxe no banco.`);
      loading.value = false;
      return;
    }

    console.log(`[ETAPA 1.5] Iniciando busca Supabase com UUID: "${id}"`);
    
    const { data, error } = await supabase
      .from('ag_leads')
      .select('*, ag_profiles(nome)')
      .eq('id', id as any) 
      .maybeSingle();

    // LOG CRÍTICO PARA DIAGNÓSTICO
    console.log('[ETAPA 2] Resposta do Supabase:', {
      dadosRecebidos: data,
      erroDaBusca: error
    });

    if (error) {
      // Se houver um erro, o registramos no console para análise
      console.error('ERRO DETALHADO DO SUPABASE:', error.message);
    }

    if (data) {
      console.log('[ETAPA 3] Dados encontrados! Atualizando o estado do lead.');
      // Atribuímos os dados ao estado reativo
      lead.value = {
        ...(data as object),
        vendedor_nome: (data as any).ag_profiles?.nome
      };
    } else {
      // Se não vieram dados, avisamos no console
      console.warn('[ETAPA 3] Nenhum dado retornado para este ID. A variável "lead" permanecerá nula, exibindo a tela "Não encontrado".');
    }

  } catch (err) {
    // Captura qualquer outro erro inesperado durante o processo
    console.error('Falha crítica na função fetchData:', err);
  } finally {
    // Garante que o estado de carregamento seja desativado, mesmo se houver erro
    // Um pequeno delay melhora a percepção visual do carregamento
    setTimeout(() => { loading.value = false; }, 600);
  }
};

// --- MÉTODOS DE AÇÃO ---
const saveQuickNote = (content: string) => {
  // Lógica para salvar a nota no banco de dados viria aqui
  // Por enquanto, apenas adicionamos localmente para feedback visual
  timelineItems.value.unshift({
    date: new Date(),
    content: content,
    author: 'Vendedor logado', // Substituir pelo nome do usuário real
    type: 'note'
  });
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