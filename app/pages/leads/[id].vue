<template>
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
      <div v-if="loading && !lead" class="h-[60vh] flex items-center justify-center">
        <div class="flex flex-col items-center gap-4">
          <Icon name="svg-spinners:18-dots-indicator" class="w-12 h-12 text-primary-600" />
          <p class="text-gray-400 font-normal animate-pulse text-[10px] uppercase tracking-[0.2em]">Sincronizando dados estratégicos...</p>
        </div>
      </div>

      <!-- Not Found State -->
      <div v-else-if="!loading && !lead" class="h-[60vh] flex items-center justify-center">
        <div class="text-center">
          <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 class="text-lg font-semibold text-gray-900 uppercase tracking-wider">Lead não encontrado</h2>
          <p class="text-gray-500 font-medium text-xs">A inteligência comercial não localizou este registro.</p>
        </div>
      </div>

      <!-- Main Content (The Orchestration) -->
      <div v-if="lead" class="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        <!-- 1. Header Component -->
        <LeadDetailHeader 
          :lead="lead" 
          @whatsapp="openWhatsApp"
          @edit="isEditModalOpen = true"
          @add-task="isTaskModalOpen = true"
          @schedule="handleSchedule"
        />

        <!-- 1.1 Funil de Vendas Stepper -->
        <ClientOnly>
          <LeadFunilVendasStepper 
            v-if="leadStatuses.length > 0"
            :stages="leadStatuses.map(s => ({ name: s.display_name, color: s.color_bg || '#4f46e5' }))" 
            :current-stage-name="leadStatuses.find(s => isCurrentStatus(s.id))?.display_name || ''" 
          />
        </ClientOnly>

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
            <ClientOnly>
              <LeadTimeline 
                :activities="timelineActivities" 
                :files="listaDeArquivos"
                @add-note="saveQuickNote" 
                @files-selected="processarUpload"
                @download-file="iniciarDownload"
                @delete-file="confirmarExclusao"
                @add-task="isTaskModalOpen = true"
              />
            </ClientOnly>
          </div>

          <!-- 4. Right Column: Strategic Actions (3 slots) -->
          <div class="lg:col-span-3 space-y-8">

            <!-- Próximo Passo Card -->
            <ClientOnly>
              <LeadProximoPassoCard
                :acao="proximaAcao"
                @agendar="handleSchedule"
              />
            </ClientOnly>

            <UiCard title="Ações Rápidas" icon="heroicons:bolt" padding>
              <div class="grid grid-cols-1 gap-3">

                <!-- Mudar Estágio: Dropdown com Teleport (escapa do overflow-hidden do Card) -->
                <div ref="stageMenuRef">
                  <UiActionButton
                    ref="stageBtnRef"
                    variant="outline"
                    class="justify-between w-full"
                    @click="toggleStageMenu"
                  >
                    Mudar Estágio
                    <Icon
                      name="heroicons:chevron-down"
                      class="transition-transform duration-200"
                      :class="{ 'rotate-180': showStageMenu }"
                    />
                  </UiActionButton>
                </div>

                <!-- Dropdown renderizado no body via Teleport -->
                <Teleport to="body">
                  <Transition
                    enter-active-class="transition ease-out duration-150"
                    enter-from-class="opacity-0 -translate-y-2"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition ease-in duration-100"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-2"
                  >
                    <div
                      v-if="showStageMenu"
                      :style="dropdownStyle"
                      class="fixed bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[9999] max-h-[480px]"
                    >
                      <button
                        v-for="status in leadStatuses"
                        :key="status.id"
                        @click="updateLeadStatus(status.id)"
                        class="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-normal text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                        :class="{ 'bg-indigo-50 text-indigo-700 font-semibold': isCurrentStatus(status.id) }"
                      >
                        <span
                          class="w-2 h-2 rounded-full flex-shrink-0"
                          :style="{ backgroundColor: status.color_bg || '#94a3b8' }"
                        />
                        {{ status.display_name }}
                        <Icon
                          v-if="isCurrentStatus(status.id)"
                          name="heroicons:check"
                          class="ml-auto w-4 h-4 text-indigo-600"
                        />
                      </button>
                    </div>
                  </Transition>
                </Teleport>

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
        <!-- Modais -->
        <LeadEditModal
          v-model="isEditModalOpen"
          :lead="lead"
          :is-editing="true"
          @save="handleSave"
          @open-schedule-modal="handleOpenSchedule"
        />

        <ModalNovoAgendamento
          v-model="isScheduleModalOpen"
          :lead-id="currentLeadId"
          :cliente-nome="lead.nome"
          :profissional-id="profile?.id"
          :profissionais="globalProfissionais"
          :dias-semana="globalDiasSemana"
          @salvar="handleScheduleSave"
        />

        <!-- Modal Nova Tarefa -->
        <LeadNovaTarefaModal
          v-if="isTaskModalOpen"
          v-model="isTaskModalOpen"
          :lead-name="lead?.nome || ''"
          :current-user="{ id: profile?.id, name: profile?.nome }"
          :team-members="globalProfissionais"
          @close="isTaskModalOpen = false"
          @save="handleSaveTask"
        />
      </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useLeads } from '~/composables/useLeads';
import ModalNovoAgendamento from '~/components/agendamentos/ModalNovoAgendamento.vue';
import { useAgendamentoStore } from '~/stores/agendamento';
import { useAuth } from '~/composables/useAuth';
import { useLeadDetail } from '~/composables/useLeadDetail';

const route = useRoute();
const currentLeadId = computed(() => route.params.id as string);

definePageMeta({
  layout: 'default'
});

const { profile } = useAuth();
const agendamentoStore = useAgendamentoStore();
const globalDiasSemana = computed(() => agendamentoStore.diasSemana);

const { leadStatuses, fetchStatuses } = useLeads();

const {
  lead,
  loading,
  timelineActivities,
  listaDeArquivos,
  proximoAgendamento,
  globalProfissionais,
  diasAberto,
  proximaAcao,
  isCurrentStatus,
  showStageMenu,
  stageMenuRef,
  stageBtnRef,
  dropdownStyle,
  toggleStageMenu,
  processarUpload,
  iniciarDownload,
  confirmarExclusao,
  saveQuickNote,
  openWhatsApp,
  handleSaveTask,
  handleSave,
  handleScheduleSave,
  updateLeadStatus,
  fetchData,
  subscribeToLeadChanges,
  loadGlobalProfissionais,
  cleanupRealtime,
  isEditModalOpen,
  isScheduleModalOpen,
  isTaskModalOpen
} = useLeadDetail(currentLeadId);

const handleEdit = () => { isEditModalOpen.value = true; };
const handleSchedule = () => { isScheduleModalOpen.value = true; };
const handleOpenSchedule = () => {
  isEditModalOpen.value = false;
  isScheduleModalOpen.value = true;
};

// --- LIFECYCLE HOOKS ---
onMounted(async () => {
  fetchData();
  subscribeToLeadChanges();
  await loadGlobalProfissionais();
  
  if (agendamentoStore.diasSemana.length === 0) {
    await agendamentoStore.carregarAgendamentos(); 
  }

  if (leadStatuses.value.length === 0) {
    await fetchStatuses();
  }
});

onUnmounted(() => {
  cleanupRealtime();
});
</script>

<style>
/* Scrollbar fina e discreta para o dropdown de estágios */
.stage-dropdown {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  transition: scrollbar-color 0.3s;
}
.stage-dropdown:hover {
  scrollbar-color: #c7d2fe transparent;
}
.stage-dropdown::-webkit-scrollbar {
  width: 3px;
}
.stage-dropdown::-webkit-scrollbar-track {
  background: transparent;
}
.stage-dropdown::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 99px;
  transition: background-color 0.3s;
}
.stage-dropdown:hover::-webkit-scrollbar-thumb {
  background-color: #c7d2fe;
}
</style>
