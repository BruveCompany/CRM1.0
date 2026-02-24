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
import LeadsColorPickerModal from './LeadsColorPickerModal.vue';
import LeadsStatusSettingsModal from './LeadsStatusSettingsModal.vue';

const { 
  columnsWithTotals, 
  allLeads, 
  pendingStatusUpdates, 
  isEditingStatuses,
  fetchLeads, 
  fetchStatuses,
  subscribeToStatusChanges,
  addStatus,
  updateStatus,
  reorderStatuses,
  leadStatuses
} = useLeads();

const { profile } = useAuth();
const supabase = useSupabaseClient();

const showDeleteModal = ref(false);
const showSettingsModal = ref(false);
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

onMounted(async () => {
  await fetchStatuses();
  await fetchLeads();
  statusSubscription = subscribeToStatusChanges();
});

onUnmounted(() => {
  if (statusSubscription) statusSubscription.unsubscribe();
});

const toast = useState('leads-local-toast', () => ({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
}));

const showLocalToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 4000);
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

<style scoped>
/* Importação de Fontes Premium */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@400;700;900&family=Caveat:wght@400;700&family=Lexend:wght@400;700&family=Space+Grotesk:wght@400;700&display=swap');

/* Classes de Fontes Customizadas */
.font-outfit { font-family: 'Outfit', sans-serif; }
.font-playfair { font-family: 'Playfair Display', serif; }
.font-montserrat { font-family: 'Montserrat', sans-serif; }
.font-caveat { font-family: 'Caveat', cursive; }
.font-lexend { font-family: 'Lexend', sans-serif; }
.font-space { font-family: 'Space Grotesk', sans-serif; }

.kanban-board-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}



.kanban-board {
  display: flex;
  flex-grow: 1;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  scrollbar-width: thin;
}

.kanban-column {
  flex: 0 0 20%; 
  width: 20%;
  max-width: 20%; /* Garante que não expanda além de 1/5 da tela */
  min-width: 150px; /* Reduzi ainda mais para caber 5 colunas em qualquer tela */
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e1e5e8;
  background-color: #f8fafc;
  box-sizing: border-box;
}

.kanban-column:last-child {
  border-right: none;
}

.column-header-edit {
  padding: 0.75rem;
  background: #fdfdfd;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid #e1e5e8;
}

.drag-handle { color: #cbd5e1; cursor: grab; padding: 2px; }

.edit-inputs { flex-grow: 1; display: flex; flex-direction: column; gap: 8px; }

.edit-name-input {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 4px 8px;
  color: #1e293b;
  outline: none;
  background: white;
}

.advanced-controls { display: flex; align-items: center; gap: 8px; }
.control-group { display: flex; align-items: center; gap: 4px; }
.divider-v { width: 1px; height: 20px; background: #e2e8f0; margin: 0 4px; }

.picker-item {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: white;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s;
}

.picker-item:hover {
    border-color: #6366f1;
    color: #6366f1;
    background: #f8fafc;
}

.typo-select {
  font-size: 0.7rem;
  padding: 2px 4px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: white;
  color: #475569;
  max-width: 80px;
}

.typo-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.typo-btn.is-active { background: #eef2ff; color: #4f46e5; border-color: #c7d2fe; }

.delete-status-btn { color: #94a3b8; padding: 6px; border-radius: 6px; }
.delete-status-btn:hover { color: #ef4444; background: #fef2f2; }

.column-header-chevron {
  height: 48px; /* Altura reduzida para visual 'slim' */
  background: #fdfdfd;
  display: flex;
  align-items: center;
  padding: 0 0.4rem; /* Reduzi o padding horizontal */
  border-bottom: 1px solid #e1e5e8;
  position: relative;
}

.editing-actions-wrapper {
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 2px;
  z-index: 10;
  background: rgba(253, 253, 253, 0.9);
  padding-right: 4px;
  border-radius: 4px;
}

.settings-trigger-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  font-size: 0.85rem;
}

.settings-trigger-btn:hover {
  background: #f8fafc;
  border-color: #6366f1;
}

.drag-handle-mini {
  color: #cbd5e1;
  cursor: grab;
  padding: 2px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 0.9rem;
}

.column-delete-btn {
  color: #94a3b8;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.column-delete-btn:hover {
  color: #ef4444;
  background: #fef2f2;
}

.header-content { 
  flex-grow: 1; 
  display: flex; 
  align-items: center;
  gap: 0.35rem; /* Gap menor para caber os botões de edição */
  width: 100%;
}

.status-header-icon-circle {
  width: 24px;
  height: 24px;
  border-radius: 6px; /* Quadrado arredondado */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
  background: white !important;
  border: 1px solid #e2e8f0;
}

.header-title { 
  margin: 0;
  white-space: nowrap; /* Volta para uma linha */
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
  font-size: 0.95rem; /* Tamanho otimizado */
}

.header-metrics {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 5;
}

.metrics-deals { 
  font-size: 9px;
  font-weight: 800; 
  padding: 1px 5px;
  border-radius: 6px;
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.card-list {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0.6rem 0.15rem; /* Padding horizontal mínimo para máximo aproveitamento */
  display: flex;
  flex-direction: column;
  gap: 0.25rem; /* Apertei ainda mais o gap vertical */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.card-list::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.empty-column-placeholder {
  flex-grow: 1;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.7rem;
  min-height: 100px;
}
</style>
