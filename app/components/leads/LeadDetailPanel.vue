<template>
  <aside class="lead-info-panel animate-slide-right shadow-2xl">
    <div class="panel-header">
      <h3 class="text-sm font-bold text-neutral-800">Detalhes do Lead</h3>
      <button @click="$emit('close')" class="close-panel-btn"> <Icon name="lucide:x" class="w-5 h-5" /> </button>
    </div>

    <div class="panel-content scrollbar-none">
      <!-- 1. IDENTIFICAÇÃO -->
      <section class="panel-section border-b border-neutral-100 pb-4">
        <div class="identification-block">
          <div class="avatar shadow-sm border border-indigo-100">{{ getInitials(lead?.nome || lead?.name) || 'L' }}</div>
          <div class="contact-info">
            <h4 class="font-bold text-neutral-900 text-sm truncate leading-tight">{{ lead?.nome || lead?.name || 'Lead' }}</h4>
            <NuxtLink :to="`/leads/${lead?.id}`" class="text-[10px] text-primary-600 font-extrabold flex items-center gap-1 hover:underline mt-1 bg-primary-50 w-fit px-1.5 py-0.5 rounded">
              <Icon name="lucide:eye" class="w-3 h-3" /> Ver Perfil
            </NuxtLink>
            <div class="mt-2 space-y-1 text-left">
              <p class="text-[10px] text-neutral-500 flex items-center gap-2">
                <Icon name="lucide:phone" class="w-3 h-3 text-neutral-400" /> {{ lead?.telefone || lead?.phone || 'Sem telefone' }}
              </p>
              <p class="text-[10px] text-neutral-500 flex items-center gap-2">
                <Icon name="lucide:mail" class="w-3 h-3 text-neutral-400" /> {{ lead?.email || 'E-mail não informado' }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. SCORE DO LEAD (CORRIGIDO - SOMENTE VISUALIZAÇÃO) -->
      <section class="panel-section border-b border-neutral-100 py-4">
        <h5 class="section-title">Score do Lead</h5>
        <div class="score-bar-container">
          <div class="score-bar-background">
             <div class="score-bar-progress" :style="{ width: `${lead?.score || 0}%` }"></div>
          </div>
          <span class="score-value">{{ lead?.score || 0 }}</span>
        </div>
      </section>

      <!-- 3. TAREFAS -->
      <section class="panel-section border-b border-neutral-100 py-4">
        <div class="section-header flex justify-between items-center mb-3">
          <h5 class="section-title !mb-0">Tarefas</h5>
          <button @click="showNewTaskForm = true" class="action-btn-secondary flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-200 rounded-lg text-[9px] font-bold text-neutral-600 hover:border-primary-300 transition-all"> 
            <Icon name="lucide:check-square" class="w-3 h-3 text-neutral-400" /> Tarefa
          </button>
        </div>
        
        <div v-if="loadingTasks" class="flex justify-center py-2">
          <Icon name="svg-spinners:ring-resize" class="w-4 h-4 text-neutral-200" />
        </div>
        <p v-else-if="tasks.length === 0" class="empty-state-small text-[10px] text-neutral-400 italic text-center py-2">Nenhuma tarefa pendente</p>
        <div v-else class="space-y-1.5 mb-3">
          <div v-for="task in tasks" :key="task.id" class="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg border border-neutral-100/50">
            <Icon name="lucide:calendar" class="w-3 h-3 text-primary-500" />
            <span class="text-[10px] font-bold text-neutral-700 truncate flex-1">{{ task.titulo || task.title }}</span>
          </div>
        </div>

        <button @click="showAppointmentModal = true" class="action-btn-primary w-full py-2.5 border-2 border-dashed border-primary-100 rounded-xl flex items-center justify-center gap-2 text-primary-600 font-bold text-[10px] hover:bg-primary-50 transition-all mt-2 group"> 
          <Icon name="lucide:calendar-plus" class="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> 
          Agendar Próximo Contato
        </button>
      </section>

      <!-- 4. ESTRATÉGIA / ETAPA -->
      <section class="panel-section border-b border-neutral-100 py-4 text-left">
        <h5 class="section-title">Estratégia / Etapa</h5>
        <div class="relative">
          <div 
            class="stage-select cursor-pointer flex items-center justify-between px-3 py-1 rounded-xl shadow-sm border border-black/5"
            :style="{ backgroundColor: currentStage?.color_bg || '#20c997', color: currentStage?.color_text || '#fff' }"
            @click="showStageSelector = !showStageSelector"
          >
            <span class="font-bold text-[11px] uppercase tracking-wider">{{ currentStage?.display_name || 'Ganho' }}</span>
            <Icon v-if="updatingStage" name="svg-spinners:18-dots-indicator" class="w-3.5 h-3.5 mr-1" />
            <Icon name="lucide:chevron-down" class="w-3.5 h-3.5 opacity-50 ml-auto" />
          </div>
          
          <div v-if="showStageSelector" class="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl border border-neutral-100 z-50 overflow-hidden animate-fade-in">
            <div 
              v-for="stage in availableStages" 
              :key="stage.id"
              @click="updateLeadStage(stage)"
              class="px-4 py-2 hover:bg-neutral-50 flex items-center gap-3 cursor-pointer transition-colors border-b last:border-0 border-neutral-50"
            >
              <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: stage.color_bg }"></div>
              <span class="text-[11px] font-bold text-neutral-700 uppercase tracking-tighter">{{ stage.display_name }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. ANOTAÇÃO E HISTÓRICO -->
      <section class="panel-section notes-section flex-1 flex flex-col pt-4">
        <h5 class="section-title">Anotação e Histórico</h5>
        <div class="new-note-form shrink-0 mb-4 bg-white p-3 rounded-2xl border border-indigo-100 shadow-sm relative">
          <textarea 
            v-model="newNoteContent" 
            placeholder="Digite aqui anotações rápidas..."
            rows="3"
            class="w-full bg-transparent border-none focus:ring-0 text-[11px] resize-none italic text-neutral-600 placeholder:text-neutral-300 leading-normal mb-8 scrollbar-none"
            @keydown.ctrl.enter="addNote"
          ></textarea>
          <button 
            @click="addNote" 
            :disabled="isSavingNote || !newNoteContent.trim()" 
            class="save-note-btn absolute bottom-3 right-3 px-4 py-1.5 bg-primary-600 text-white rounded-lg text-[10px] font-bold shadow-sm hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {{ isSavingNote ? 'Salvando...' : 'Salvar Nota' }}
          </button>
        </div>

        <div class="notes-list-container flex-1 overflow-y-auto scrollbar-none pr-1 min-h-0">
          <div v-if="isLoadingNotes && internalNotes.length === 0" class="loading-state text-center py-4 opacity-40 italic text-[10px] flex items-center justify-center gap-2">
             <Icon name="svg-spinners:ring-resize" class="w-4 h-4" /> Carregando histórico...
          </div>
          <p v-else-if="internalNotes.length === 0" class="empty-state-small text-center py-6 opacity-30 italic text-[10px]">Sem anotações no histórico</p>
          <ul v-else class="notes-timeline space-y-4">
            <li v-for="note in internalNotes" :key="note.id" class="note-entry">
              <div class="timeline-icon">
                <Icon name="lucide:pencil" class="w-3 h-3" />
              </div>
              <div class="timeline-content">
                <p class="text-[11px] text-neutral-600 leading-relaxed font-medium">{{ note.conteudo }}</p>
                <div class="note-meta mt-2 flex justify-between items-center opacity-70">
                  <span class="text-[8px] font-black text-primary-500 uppercase tracking-widest">{{ note.author?.nome || 'Consultor' }}</span>
                  <span class="text-[8px] font-bold text-neutral-400">{{ formatDate(note.criado_em) }}</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>

    <!-- Modais Reutilizáveis -->
    <NovaTarefaModal 
      v-model="showNewTaskForm"
      :lead-name="lead?.name || lead?.nome || 'Lead'"
      :current-user="{ id: userStore.user?.id || '', name: userStore.profile?.nome || '' }"
      :team-members="profissionais"
      @save="handlePremiumTaskSave"
    />
    <ModalNovoAgendamento 
      v-model="showAppointmentModal"
      :lead-id="lead?.id"
      :cliente-nome="lead?.nome || lead?.name"
      :profissionais="profissionais"
      :dias-semana="next30Days"
    />
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useSupabaseClient } from '#imports';
import { useUserStore } from '~/stores/user';
import { useProfissionais } from '~/composables/useProfissionais';
import { useNotification } from '~/composables/useNotification';
import NovaTarefaModal from '~/components/lead/NovaTarefaModal.vue';
import ModalNovoAgendamento from '~/components/agendamentos/ModalNovoAgendamento.vue';

const props = defineProps<{
  lead: any;
}>();

const emit = defineEmits(['close', 'updated']);

const supabase = useSupabaseClient();
const userStore = useUserStore();
const { fetchProfissionais } = useProfissionais();
const { notifySuccess, notifyError } = useNotification();

// --- ESTADOS CRM ---
const showNewTaskForm = ref(false);
const showAppointmentModal = ref(false);
const showStageSelector = ref(false);
const updatingStage = ref(false);
const availableStages = ref<any[]>([]);
const profissionais = ref<any[]>([]);
const tasks = ref<any[]>([]);
const loadingTasks = ref(false);

// --- ESTADOS NOTAS ---
const internalNotes = ref<any[]>([]);
const newNoteContent = ref('');
const isLoadingNotes = ref(false);
const isSavingNote = ref(false);

const next30Days = computed(() => {
  const days = [];
  const start = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
});

const currentStage = computed(() => {
  if (!props.lead?.status) return null;
  // Procura por ID ou por display_name (caso o banco esteja com o nome legível)
  return availableStages.value.find(s => s.id === props.lead.status || s.display_name === props.lead.status);
});

async function fetchStages() {
  try {
    const { data } = await (supabase
      .from('ag_lead_statuses') as any)
      .select('id, display_name, color_bg, color_text')
      .order('order_index', { ascending: true });
    if (data) availableStages.value = data;
  } catch (err) { console.error('Erro stages:', err); }
}

async function fetchTasks() {
  if (!props.lead?.id) return;
  loadingTasks.value = true;
  try {
    const { data } = await (supabase
      .from('ag_tarefas') as any)
      .select('*')
      .eq('lead_id', props.lead.id)
      .eq('concluida', false)
      .order('data_vencimento', { ascending: true });
    if (data) tasks.value = data;
  } catch (err) { console.error('Erro tasks:', err); }
  finally { loadingTasks.value = false; }
}

async function updateLeadStage(stage: any) {
  if (!props.lead?.id || updatingStage.value) return;
  updatingStage.value = true;
  console.log(`[STATUS] Tentando mudar lead ${props.lead.id} para stage:`, stage.id);
  try {
    const { error } = await (supabase
      .from('ag_leads') as any)
      .update({ status: stage.id })
      .eq('id', props.lead.id);

    if (error) {
      console.error('[STATUS ERRO] Erro ao atualizar no Supabase:', error.message);
      notifyError('Erro ao atualizar etapa do lead');
      throw error;
    }
    
    console.log('[STATUS SUCESSO] Lead atualizado no banco.');
    notifySuccess(`Etapa alterada para: ${stage.display_name}`);
    emit('updated');
  } catch (err) { 
    console.error('Erro stage update:', err);
    notifyError('Não foi possível mudar a etapa');
  }
  finally {
    updatingStage.value = false;
    showStageSelector.value = false;
  }
}

async function handlePremiumTaskSave(taskData: any) {
  if (!taskData.title || !taskData.dueDate || !props.lead?.id) return;
  try {
    const { error } = await (supabase
      .from('ag_tarefas') as any)
      .insert({
        lead_id: props.lead.id,
        criado_por: userStore.profile?.id,
        profissional_id: taskData.assigneeId,
        titulo: taskData.title,
        descricao: taskData.description,
        data_vencimento: taskData.dueDate
      });

    if (error) throw error;
    showNewTaskForm.value = false;
    await fetchTasks();
  } catch (err) { console.error('Erro task save:', err); }
}

async function fetchNotes() {
  if (!props.lead?.id) return;
  isLoadingNotes.value = true;
  try {
    const { data, error } = await (supabase
      .from('ag_notas_internas') as any)
      .select(`
        id,
        conteudo,
        criado_em,
        author:ag_profiles(nome)
      `)
      .eq('lead_id', props.lead.id)
      .order('criado_em', { ascending: false });
    if (error) throw error;
    internalNotes.value = data || [];
  } catch (error: any) { console.error("Erro notas:", error.message); }
  finally { isLoadingNotes.value = false; }
}

async function addNote() {
  const content = newNoteContent.value.trim();
  if (!content || !props.lead?.id || isSavingNote.value) return;
  
  const profileId = userStore.profile?.id;
  if (!profileId) {
    console.error("Perfil do usuário não carregado.");
    return;
  }

  isSavingNote.value = true;
  try {
    const { error } = await (supabase
      .from('ag_notas_internas') as any)
      .insert({ 
        lead_id: props.lead.id, 
        profissional_id: profileId, 
        conteudo: content 
      });
    
    if (error) throw error;
    notifySuccess('Anotação salva com sucesso!');
    newNoteContent.value = '';
    await fetchNotes();
    emit('updated');
  } catch (error: any) { 
    console.error("Erro nota:", error.message);
    notifyError('Erro ao salvar anotação');
  }
  finally { isSavingNote.value = false; }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ' ' + 
         date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function getInitials(name: string | null | undefined) {
  if (!name || typeof name !== 'string') return 'L';
  const parts = name.trim().split(/\s+/).filter(p => p.length > 0);
  if (parts.length >= 2) {
    const firstChar = parts[0]?.charAt(0) || '';
    const lastChar = parts[parts.length - 1]?.charAt(0) || '';
    return (firstChar + lastChar).toUpperCase();
  }
  return (parts[0]?.charAt(0) || 'L').toUpperCase();
}

let leadDetailChannel: any = null;

const setupRealtime = () => {
    if (!props.lead?.id) return;
    if (leadDetailChannel) supabase.removeChannel(leadDetailChannel);

    leadDetailChannel = supabase.channel(`sidebar-lead-${props.lead.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ag_leads', filter: `id=eq.${props.lead.id}` }, () => {
            // Emite evento para o pai atualizar os dados do lead, se necessário
            emit('updated');
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ag_tarefas', filter: `lead_id=eq.${props.lead.id}` }, () => {
            fetchTasks();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ag_notas_internas', filter: `lead_id=eq.${props.lead.id}` }, () => {
            fetchNotes();
        })
        .subscribe();
}

onMounted(async () => {
  fetchStages();
  fetchTasks();
  fetchNotes();
  setupRealtime();
  const profs = await fetchProfissionais();
  if (profs) profissionais.value = profs;
});

onUnmounted(() => {
  if (leadDetailChannel) supabase.removeChannel(leadDetailChannel);
});

watch(() => props.lead?.id, (newId) => {
  if (newId) {
    fetchTasks();
    fetchNotes();
    setupRealtime();
  }
});
</script>

<style src="./LeadDetailPanel.css" scoped></style>
