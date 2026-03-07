<!--
  Componente de Quadro Kanban para Leads
  Permite a visualização organizada por colunas e o movimento de cards via Drag and Drop.
  ADMIN: Inclui funcionalidades de gerenciamento de status (adicionar, editar, reordenar, excluir).
-->
<template>
  <div class="kanban-board-wrapper">


    <div class="kanban-board" ref="board">
      <div 
        v-for="(column, index) in columnsWithTotals" 
        :key="column.id" 
        class="kanban-column" 
        :data-id="column.id"
        :style="isEditingStatuses ? { borderTop: `4px solid ${column.color_bg}` } : {}"
      >
        <div class="column-header-wrapper">
          <!-- CABEÇALHO PADRÃO -->
          <div class="column-header-chevron" :style="{ borderBottom: `1px solid ${column.color_bg}40` }">
            <div class="header-content">
              <!-- Controles de Edição (Absolutos para não empurrar o texto) -->
              <div v-if="isEditingStatuses" class="editing-actions-wrapper">
                <button 
                  @click="openSettingsModal(column)"
                  class="settings-trigger-btn"
                  title="Editar Status"
                  :style="{ color: column.color_bg }"
                >
                  <Icon name="lucide:pencil" />
                </button>

                <div class="drag-handle-mini" title="Arraste para reordenar" @mousedown="startColumnDrag(index)">
                  <Icon name="lucide:menu" />
                </div>
              </div>

              <div 
                v-if="column.status_icon" 
                class="status-header-icon-circle"
                :style="{ background: column.color_bg + '15', color: column.color_bg, marginLeft: isEditingStatuses ? '55px' : '0' }"
              >
                <Icon :name="column.status_icon" />
              </div>

              <h3 
                class="header-title"
                :class="[column.font_size || 'text-lg', column.font_weight === 'font-bold' ? 'font-bold' : 'font-normal', column.font_family || 'font-sans']"
                :style="{ color: column.color_text }"
              >
                {{ column.display_name }}
              </h3>
              
              <div class="header-metrics">
                <ClientOnly>
                  <span 
                    class="metrics-deals"
                    :style="{ 
                      backgroundColor: column.color_bg + '15', 
                      color: column.color_bg,
                      borderColor: column.color_bg + '30'
                    }"
                  >
                    {{ column.totalDeals }}<template v-if="!isEditingStatuses">&nbsp;{{ column.totalDeals === 1 ? 'lead' : 'leads' }}</template>
                  </span>
                </ClientOnly>
              </div>
            </div>
            


          </div>
        </div>

        <!-- LISTA DE CARDS -->
        <div class="card-list" 
          :id="`list-${column.id}`" 
          :data-column-id="column.id"
          @dragover.prevent
          @drop="onDropCard($event, column.id)"
        >
          <KanbanCard 
            v-for="task in column.tasks" 
            :key="task.id"
            :task="task"
            :column-color="column.color_bg"
            @dragstart="onDragStartCard($event, task.id)"
            @open-appointment-new="(id) => handleOpenAppointmentModal(id, 'new')"
            @open-appointment-view="(id) => handleOpenAppointmentModal(id, 'view')"
          />
          
          <div v-if="column.tasks.length === 0" class="empty-column-placeholder">
            <Icon name="lucide:plus" class="w-5 h-5 opacity-20" />
            <span>Solte aqui</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modais de Gerenciamento -->
    <LeadsStatusDeleteModal 
      v-model="showDeleteModal"
      :status-to-delete="statusPendingDelete"
      @deleted="fetchLeads"
    />

    <LeadsColorPickerModal 
      v-model="colorPicker.show"
      :initial-color="colorPicker.color"
      :title="colorPicker.title"
      @save="onSavePickedColor"
    />

    <LeadsStatusSettingsModal
      v-model="showSettingsModal"
      :status="statusToEdit"
      @save="onSaveSettings"
      @delete="openDeleteModal"
    />

    <LeadsStatusCreateModal 
      v-model="showCreateModal"
      @create="onCreateStatus"
    />

    <!-- Modais de Agendamento JÁ EXISTENTES -->
    <ModalNovoAgendamento
      v-model="appointmentModals.new.show"
      :profissional-id="appointmentModals.new.profissionalId"
      :profissional-nome="appointmentModals.new.profissionalNome"
      :profissional-especialidade="appointmentModals.new.profissionalEspecialidade"
      :profissionais="globalState.profissionais"
      :cliente-id="appointmentModals.new.clienteId"
      :lead-id="appointmentModals.new.leadId"
      :cliente-nome="appointmentModals.new.leadName"
      :initial-description="appointmentModals.new.description"
      :clientes="globalState.clientes"
      :agendamentos="agendamentoStore.agendamentos"
      :dias-semana="agendamentoStore.diasSemana"
      @salvar="onAppointmentSaved"
    />

    <ModalEditarAgendamento
      v-model="appointmentModals.view.show"
      :agendamento="appointmentModals.view.agendamento"
      :profissional-nome="appointmentModals.view.profissionalNome"
      :profissional-especialidade="appointmentModals.view.profissionalEspecialidade"
      :clientes="globalState.clientes"
      @atualizado="onAppointmentSaved"
    />

    <ModalListaAgendamentosLead
      v-model="appointmentModals.list.show"
      :cliente-id="appointmentModals.list.clienteId"
      :lead-id="appointmentModals.list.leadId"
      :lead-name="appointmentModals.list.leadName"
      @editar="onEditFromList"
      @novo="onNewFromList"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * LÓGICA DO QUADRO KANBAN COM GERENCIAMENTO DE STATUS
 */
import { ref, onMounted, onUnmounted } from 'vue';
import { useLeads } from '~/composables/useLeads';
import { useAuth } from '~/composables/useAuth';
import KanbanCard from './KanbanCard.vue';
import LeadsStatusDeleteModal from './LeadsStatusDeleteModal.vue';
import LeadsStatusSettingsModal from './LeadsStatusSettingsModal.vue';
import LeadsStatusCreateModal from './LeadsStatusCreateModal.vue';
import LeadsColorPickerModal from './LeadsColorPickerModal.vue';
import { useNotification } from '~/composables/useNotification';
import ModalNovoAgendamento from '~/components/agendamentos/ModalNovoAgendamento.vue';
import ModalEditarAgendamento from '~/components/agendamentos/ModalEditarAgendamento.vue';
import ModalListaAgendamentosLead from '~/components/agendamentos/ModalListaAgendamentosLead.vue';
import { useKanbanAppointments } from '~/composables/useKanbanAppointments';

const { 
  columnsWithTotals, 
  allLeads, 
  pendingStatusUpdates, 
  isEditingStatuses,
  fetchLeads, 
  fetchStatuses,
  subscribeToStatusChanges,
  subscribeToAppointmentChanges,
  fetchNextAppointments,
  addStatus,
  updateStatus,
  deleteStatus,
  reorderStatuses,
  leadStatuses
} = useLeads();

const { notifySuccess, notifyError } = useNotification();
const supabase = useSupabaseClient();
const agendamentoStore = useAgendamentoStore();

const {
  globalState,
  appointmentModals,
  loadDependencies,
  handleOpenAppointmentModal,
  onEditFromList,
  onNewFromList,
  onAppointmentSaved
} = useKanbanAppointments(allLeads as any, fetchNextAppointments);

const onCreateStatus = async (newStatus: any) => {
  await addStatus(newStatus);
  showLocalToast('Novo status criado!', 'success');
};

const showDeleteModal = ref(false);
const showSettingsModal = ref(false);
const showCreateModal = ref(false); // Added for LeadsStatusCreateModal
const statusToEdit = ref<any>(null);
const statusPendingDelete = ref<any>(null);

// Estado do Seletor de Cores Moderno
const colorPicker = ref({
  show: false,
  color: '#ffffff',
  title: '',
  targetStatusId: null as string | null,
  targetField: '' as 'color_bg' | 'color_text'
});

const openColorPicker = (status: any, field: 'color_bg' | 'color_text', title: string) => {
  colorPicker.value = {
    show: true,
    color: status[field] || (field === 'color_bg' ? '#f1f5f9' : '#1e293b'),
    title,
    targetStatusId: status.id,
    targetField: field
  };
};

const onSavePickedColor = async (newColor: string) => {
  if (!colorPicker.value.targetStatusId) return;
  
  const status = leadStatuses.value.find(s => s.id === colorPicker.value.targetStatusId);
  if (status) {
    (status as any)[colorPicker.value.targetField] = newColor;
    await handleUpdateStatus(status);
    showLocalToast('Cor atualizada!', 'success');
  }
};

let statusSubscription: any = null;
let appointmentSubscription: any = null;

onMounted(async () => {
  await fetchStatuses();
  await fetchLeads();
  // REMOVIDO: Inscrições Realtime duplicadas (já estão em leads/index.vue)
  // statusSubscription = subscribeToStatusChanges();
  // appointmentSubscription = subscribeToAppointmentChanges();

  // Carrega dados e dependências dos modais de agendamento do Kanban
  await loadDependencies();
});

onUnmounted(() => {
  // console.log('👋 Saindo do Kanban - Limpando referências locais');
});

const showLocalToast = (message: string, type: 'success' | 'error' = 'success') => {
  if (type === 'success') notifySuccess(message);
  else notifyError(message);
};

const onDragStartCard = (event: DragEvent, taskId: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('taskId', taskId);
    event.dataTransfer.effectAllowed = 'move';
  }
};

const onDropCard = async (event: DragEvent, newStatus: string) => {
  const taskId = event.dataTransfer?.getData('taskId');
  if (!taskId) return;
  const leadIdx = allLeads.value.findIndex(l => String(l.id) === taskId);
  const targetColumn = columnsWithTotals.value.find(c => c.id === newStatus);
  if (leadIdx === -1 || !targetColumn) return;
  const leadLocal = allLeads.value[leadIdx];
  const originalStatus = leadLocal.status;
  pendingStatusUpdates.value[taskId] = newStatus;
  allLeads.value[leadIdx].status = newStatus;
  try {
    const { error } = await (supabase.from('ag_leads') as any).update({ status: newStatus }).eq('id', taskId);
    if (error) throw error;
    showLocalToast('Movido para ' + targetColumn.display_name + '!', 'success');
  } catch (error: any) {
    showLocalToast('Erro ao mover lead', 'error');
    delete pendingStatusUpdates.value[taskId];
    allLeads.value[leadIdx].status = originalStatus;
  }
};



// (A Lógica de manipulação de Modais de Agendamento como `handleOpenAppointmentModal`, `onEditFromList` foram extraídas para o composable `useKanbanAppointments` para reduzir o tamanho deste arquivo)

const handleUpdateStatus = async (status: any) => {
  const { error } = await updateStatus(status.id, {
    display_name: status.display_name,
    color_bg: status.color_bg,
    color_text: status.color_text,
    font_size: status.font_size,
    font_weight: status.font_weight,
    font_family: status.font_family,
    status_icon: status.status_icon
  });
  if (error) showLocalToast('Erro ao atualizar status', 'error');
};

const toggleFontWeight = (status: any) => {
  status.font_weight = status.font_weight === 'font-bold' ? 'font-normal' : 'font-bold';
  handleUpdateStatus(status);
};

const openSettingsModal = (status: any) => {
  statusToEdit.value = status;
  showSettingsModal.value = true;
};

const onSaveSettings = async (updatedStatus: any) => {
  // Atualiza no banco
  await handleUpdateStatus(updatedStatus);
  
  // Atualiza localmente no array leadStatuses para refletir no Kanban
  const idx = leadStatuses.value.findIndex(s => s.id === updatedStatus.id);
  if (idx !== -1) {
    leadStatuses.value[idx] = updatedStatus;
  }
  
  await fetchStatuses(); // Recarrega para garantir sincronia com os cálculos de totais
  showLocalToast('Configurações salvas!', 'success');
};

const openDeleteModal = (status: any) => {
  statusPendingDelete.value = status;
  showDeleteModal.value = true;
};

const startColumnDrag = (index: number) => {
  console.log('Iniciando reordenação da coluna:', index);
};
</script>

<style src="./LeadsKanban.css" scoped></style>
