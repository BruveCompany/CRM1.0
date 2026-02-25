<template>
  <NuxtLayout name="default">
    <div class="min-h-screen bg-[#f8fafc] p-6 lg:p-8">
      <!-- Breadcrumb / Back -->
      <div class="mb-6">
        <NuxtLink to="/leads" class="group inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors">
          <Icon name="heroicons:arrow-left" class="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Voltar para Leads
        </NuxtLink>
      </div>

      <div v-if="loadingLead" class="h-[60vh] flex items-center justify-center">
        <div class="flex flex-col items-center gap-4">
          <Icon name="svg-spinners:18-dots-indicator" class="w-12 h-12 text-primary-600" />
          <p class="text-slate-400 font-bold animate-pulse text-sm uppercase tracking-widest">Carregando inteligência do lead...</p>
        </div>
      </div>

      <div v-else-if="!lead" class="h-[60vh] flex items-center justify-center">
        <div class="text-center">
          <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 class="text-xl font-bold text-slate-800">Lead não encontrado</h2>
          <p class="text-slate-500">O lead solicitado não existe ou foi removido.</p>
        </div>
      </div>

      <div v-else class="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <!-- HEADER: Visão Geral -->
        <header class="relative mb-8 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden">
          <!-- Efeito Decorativo -->
          <div class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-50 -z-0"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="flex items-center gap-5">
              <div class="relative">
                <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-100 uppercase">
                  {{ lead.nome?.substring(0, 2) || 'LD' }}
                </div>
                <!-- Lead Score Badge -->
                <div 
                  class="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-lg text-[10px] font-black border-2 border-white shadow-md uppercase tracking-tighter"
                  :style="{ backgroundColor: getScoreColor(lead.score || 0) + '20', color: getScoreColor(lead.score || 0), borderColor: '#ffffff' }"
                >
                  Score: {{ lead.score || 0 }}
                </div>
              </div>
              
              <div>
                <div class="flex items-center gap-3 mb-1">
                  <h1 class="text-2xl font-black text-slate-800 tracking-tight">{{ lead.nome }}</h1>
                  <span 
                    class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    :style="{ backgroundColor: getStatusColor(lead.status) + '15', color: getStatusColor(lead.status) }"
                  >
                    {{ lead.status?.replace(/_/g, ' ') || 'Novo' }}
                  </span>
                </div>
                <div class="flex items-center gap-4 text-sm text-slate-500 font-medium">
                  <span class="flex items-center gap-1.5 line-clamp-1">
                    <Icon name="heroicons:envelope" class="w-4 h-4 opacity-70" />
                    {{ lead.email || 'N/A' }}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <Icon name="heroicons:device-phone-mobile" class="w-4 h-4 opacity-70" />
                    {{ lead.telefone || 'N/A' }}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <Icon name="heroicons:user" class="w-4 h-4 opacity-70" />
                    Resp: {{ lead.vendedor_nome || 'NÃO ATRIBUÍDO' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button class="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95">
                <Icon name="heroicons:share" class="w-4 h-4" />
                Exportar
              </button>
              <button 
                @click="openWhatsApp"
                class="flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-2xl text-sm font-bold shadow-lg shadow-green-100 hover:brightness-105 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Icon name="simple-icons:whatsapp" class="w-5 h-5" />
                Iniciar Atendimento
              </button>
            </div>
          </div>
        </header>

        <!-- GRID PRINCIPAL -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- COLUNA ESQUERDA: Dados e CRM (4 colunas) -->
          <div class="lg:col-span-4 space-y-8">
            <!-- Painel de Informações -->
            <section class="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
              <h2 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Icon name="heroicons:identification" class="w-4 h-4" />
                Dados do Lead
              </h2>
              
              <div class="space-y-6">
                <div class="group">
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 transition-colors group-hover:text-primary-500">Origem do contato</label>
                  <div class="flex items-center gap-2">
                    <span class="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">{{ lead.origem || 'Social Media' }}</span>
                  </div>
                </div>

                <div class="group">
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Interesse principal</label>
                  <p class="text-sm font-bold text-slate-700 leading-relaxed">{{ lead.interesse || 'Serviços Corporativos / Software SaaS' }}</p>
                </div>

                <div class="group">
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Empresa / Cargo</label>
                  <p class="text-sm font-bold text-slate-700">{{ lead.empresa || 'Não informado' }}</p>
                </div>

                <div class="pt-6 border-t border-slate-50">
                  <button @click="editLeadDetail" class="w-full py-3 rounded-xl bg-slate-50 text-xs font-black text-slate-500 hover:bg-primary-50 hover:text-primary-600 transition-colors uppercase tracking-widest">
                    Editar Cadastro Completo
                  </button>
                </div>
              </div>
            </section>

            <!-- Painel de Métricas Rápidas -->
            <section class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 shadow-xl text-white overflow-hidden relative group">
              <Icon name="heroicons:rocket-launch" class="absolute -right-4 -bottom-4 w-40 h-40 text-white/5 -rotate-12 transition-transform group-hover:scale-110" />
              
              <h2 class="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-6 relative z-10">Inteligência Comercial</h2>
              
              <div class="grid grid-cols-2 gap-6 relative z-10">
                <div>
                  <p class="text-[10px] font-bold text-white/50 mb-1">Dias em aberto</p>
                  <p class="text-2xl font-black">{{ diasAberto }}d</p>
                </div>
                <div>
                  <p class="text-[10px] font-bold text-white/50 mb-1">Interações</p>
                  <p class="text-2xl font-black">{{ totalInteracoes }}</p>
                </div>
                <div class="col-span-2">
                  <p class="text-[10px] font-bold text-white/50 mb-1">Probabilidade de Fechamento</p>
                  <div class="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div class="h-full bg-primary-400 animate-pulse transition-all duration-1000" :style="{ width: (lead.score || 0) + '%' }"></div>
                  </div>
                  <p class="text-right text-[10px] font-bold mt-2 text-primary-400 uppercase">{{ lead.score }}% de Confiança</p>
                </div>
              </div>
            </section>
          </div>

          <!-- COLUNA CENTRAL: Timeline (5 colunas) -->
          <div class="lg:col-span-5 space-y-8">
            <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-[750px]">
              <!-- Tabs Timeline -->
              <div class="flex items-center gap-6 px-8 pt-8 pb-4 border-b border-slate-50">
                <button 
                  v-for="tab in ['Atividades', 'Notas', 'Mensagens']" 
                  :key="tab"
                  @click="activeTab = tab"
                  :class="['text-xs font-black uppercase tracking-widest pb-4 transition-all relative', activeTab === tab ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600']"
                >
                  {{ tab }}
                  <span v-if="activeTab === tab" class="absolute bottom-0 left-0 w-full h-1 bg-primary-600 rounded-t-full"></span>
                </button>
              </div>

              <!-- Content Timeline -->
              <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div class="space-y-8">
                  <!-- Bloco de Nova Nota -->
                  <div class="relative group">
                    <textarea 
                      v-model="newNote"
                      placeholder="Anote algo importante sobre este lead..."
                      class="w-full min-h-[120px] bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-primary-500/5 focus:border-primary-400 outline-none transition-all resize-none"
                    ></textarea>
                    <div class="absolute bottom-4 right-4 flex items-center gap-2 translate-y-2 opacity-0 group-focus-within:translate-y-0 group-focus-within:opacity-100 transition-all">
                      <button @click="saveQuickNote" class="px-4 py-2 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-200 hover:bg-primary-700 transition-colors">
                        Salvar Nota
                      </button>
                    </div>
                  </div>

                  <!-- Itens da Timeline -->
                  <div class="relative pl-8 space-y-10">
                    <!-- Linha central -->
                    <div class="absolute left-0 top-2 bottom-0 w-[1px] bg-slate-100 border-l border-dashed border-slate-200"></div>

                    <div v-for="(item, idx) in timelineItems" :key="idx" class="relative group">
                      <!-- Dot -->
                      <div class="absolute -left-10 top-1 w-4 h-4 rounded-full border-4 border-white bg-slate-200 group-hover:bg-primary-500 transition-colors z-10 shadow-sm"></div>
                      
                      <div class="animate-in fade-in slide-in-from-left-2 duration-500" :style="{ transitionDelay: idx * 100 + 'ms' }">
                        <div class="flex items-center justify-between mb-2">
                          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ formatItemDate(item.date) }}</span>
                          <span class="text-[9px] font-bold text-slate-300 uppercase italic">{{ item.author || 'Sistema' }}</span>
                        </div>
                        <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm group-hover:border-primary-100 group-hover:bg-slate-50/30 transition-all">
                          <p class="text-sm font-bold text-slate-700">{{ item.content }}</p>
                          <div v-if="item.type === 'status'" class="mt-3 flex items-center gap-2">
                            <span class="text-[10px] font-bold text-slate-400">Novo Status:</span>
                            <span class="px-2 py-0.5 rounded bg-green-50 text-green-600 text-[9px] font-black uppercase">{{ item.metadata }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- COLUNA DIREITA: Ações e Próximos Passos (3 colunas) -->
          <div class="lg:col-span-3 space-y-8">
            <!-- Painel Gerencial -->
            <section class="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
              <h2 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Ações Estratégicas</h2>
              <div class="grid grid-cols-1 gap-3">
                <button class="flex items-center justify-between w-full p-4 rounded-2xl border border-slate-50 hover:border-primary-100 hover:bg-primary-50 group transition-all">
                  <span class="text-xs font-bold text-slate-600 group-hover:text-primary-700">Mudar Estágio</span>
                  <Icon name="heroicons:chevron-right" class="w-4 h-4 text-slate-400 group-hover:text-primary-600" />
                </button>
                <button class="flex items-center justify-between w-full p-4 rounded-2xl border border-slate-50 hover:border-orange-100 hover:bg-orange-50 group transition-all">
                  <span class="text-xs font-bold text-slate-600 group-hover:text-orange-700">Agendar Reunião</span>
                  <Icon name="heroicons:calendar" class="w-4 h-4 text-slate-400 group-hover:text-orange-600" />
                </button>
                <button class="flex items-center justify-between w-full p-4 rounded-2xl border border-slate-50 hover:border-purple-100 hover:bg-purple-50 group transition-all">
                  <span class="text-xs font-bold text-slate-600 group-hover:text-purple-700">Gerar Proposta</span>
                  <Icon name="heroicons:document-text" class="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
                </button>
              </div>
            </section>

            <!-- Card de Agendamento em Destaque -->
            <div class="bg-primary-600 rounded-[2rem] p-6 text-white shadow-xl shadow-primary-200 relative overflow-hidden group">
              <Icon name="heroicons:sparkles" class="absolute top-0 right-0 w-24 h-24 text-white/10 -translate-y-4 translate-x-4" />
              <h2 class="text-[10px] font-black text-white/50 uppercase tracking-widest mb-4">Próximo Agendamento</h2>
              
              <div v-if="proximoAgendamento" class="relative z-10">
                <p class="text-lg font-black mb-1 leading-tight">{{ proximoAgendamento.title || 'Reunião de Alinhamento' }}</p>
                <p class="text-xs font-medium text-white/80 mb-4">{{ formatAgendamentoDate(proximoAgendamento.date) }}</p>
                
                <button class="w-full py-3 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">
                  Ver Detalhes na Agenda
                </button>
              </div>
              <div v-else class="relative z-10 py-4 text-center">
                <p class="text-[11px] font-bold text-white/60 mb-2 italic">Nenhum agendamento futuro detectado</p>
                <button class="text-[10px] font-black uppercase border-b border-white/30 hover:border-white transition-colors">Criar agora</button>
              </div>
            </div>

            <!-- Card IA Summary -->
            <div class="bg-white rounded-[2rem] p-6 border-2 border-dashed border-slate-200">
               <div class="flex items-center gap-2 mb-3">
                 <div class="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                 <h2 class="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">IA Insights</h2>
               </div>
               <p class="text-[11px] font-medium text-slate-500 leading-relaxed italic">
                 "Lead demonstra alto interesse tecnológico, porém preocupação com prazo de implementação. Recomendo focar no case de sucesso 'X' na próxima conversa."
               </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
const route = useRoute();
const id = route.params.id;
const supabase = useSupabaseClient();

const lead = ref<any>(null);
const loadingLead = ref(true);
const activeTab = ref('Atividades');
const newNote = ref('');
const proximoAgendamento = ref<any>(null);

const timelineItems = ref<any[]>([
  { date: new Date(), content: 'Abriu página de detalhes pela primeira vez.', author: 'Sistema', type: 'activity' },
  { date: new Date(Date.now() - 3600000), content: 'Status alterado para "Em Negociação"', author: 'João Vendedor', type: 'status', metadata: 'Negociação' },
  { date: new Date(Date.now() - 86400000), content: 'Cliente enviou mensagem via WhatsApp: "Gostaria de saber o preço do plano Enterprise."', author: 'Lead', type: 'message' },
  { date: new Date(Date.now() - 172800000), content: 'Nota interna: Prospect bem qualificado, orçamento aprovado para Q2.', author: 'Maria Admin', type: 'note' }
]);

const diasAberto = computed(() => {
  if (!lead.value?.criado_em) return 0;
  const start = new Date(lead.value.criado_em);
  const end = new Date();
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
});

const totalInteracoes = computed(() => timelineItems.value.length);

onMounted(async () => {
  await fetchLeadData();
});

async function fetchLeadData() {
  loadingLead.value = true;
  try {
    const { data, error } = await supabase
      .from('ag_leads')
      .select('*, ag_profiles(nome)')
      .eq('id', id as any)
      .maybeSingle();

    if (data) {
      lead.value = {
        ...(data as object),
        vendedor_nome: (data as any).ag_profiles?.nome
      };
      
      // Simular busca de mensagens reais se houver tempo
      // await loadRealTimeline();
    }
  } catch (err) {
    console.error('Erro ao buscar lead:', err);
  } finally {
    setTimeout(() => { loadingLead.value = false; }, 600);
  }
}

function saveQuickNote() {
  if (!newNote.value.trim()) return;
  timelineItems.value.unshift({
    date: new Date(),
    content: newNote.value,
    author: 'Você',
    type: 'note'
  });
  newNote.value = '';
}

function openWhatsApp() {
  if (!lead.value?.telefone) return;
  const phone = lead.value.telefone.replace(/\D/g, '');
  window.open(`https://wa.me/${phone}`, '_blank');
}

function getStatusColor(status?: string) {
  const colors: Record<string, string> = {
    'leads_novos': '#34d399',
    'em_negociacao': '#6366f1',
    'perdido': '#ef4444',
    'ganho': '#10b981'
  };
  return colors[status || ''] || '#94a3b8';
}

function getScoreColor(score: number) {
  if (score >= 80) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function formatItemDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
}

function formatAgendamentoDate(date?: Date) {
  return 'Amanhã às 14:30';
}

function editLeadDetail() {
  alert('Funcionalidade de edição completa em breve!');
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

@keyframes slide-in-bottom {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-in {
  animation: slide-in-bottom 0.6s ease-out forwards;
}
</style>
