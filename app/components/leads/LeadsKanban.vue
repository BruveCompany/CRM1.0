<template>
  <div class="kanban-board-wrapper">
    <div class="kanban-board" ref="board">
      <div 
        v-for="column in columnsWithTotals" 
        :key="column.id" 
        class="kanban-column" 
        :data-id="column.id"
      >
        <div class="column-header-wrapper">
          <div class="column-header-chevron" :style="{ borderBottom: '1px solid #e1e5e8' }">
            <div class="header-content">
              <h3 class="header-title">{{ column.title }}</h3>
              <div class="header-metrics">
                <span class="metrics-deals" :style="{ backgroundColor: column.color + '20', color: column.color }">
                  {{ column.totalDeals }} {{ column.totalDeals === 1 ? 'lead' : 'leads' }}
                </span>
              </div>
            </div>
            <div class="chevron-arrow" :style="{ background: '#fdfdfd' }"></div>
          </div>
        </div>
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
            :column-color="column.color"
            @dragstart="onDragStartCard($event, task.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLeads } from '~/composables/useLeads';
import KanbanCard from './KanbanCard.vue';

const { columnsWithTotals, allLeads, pendingStatusUpdates, fetchLeads } = useLeads();
const supabase = useSupabaseClient();
const supabaseUser = useSupabaseUser();

// Acessa o estado do toast definido no index.vue
const toast = useState('leads-local-toast', () => ({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
}));

const showLocalToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 4000);
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

  const currentUserId = (supabaseUser.value as any)?.id || (supabaseUser.value as any)?.sub;
  const leadIdx = allLeads.value.findIndex(l => String(l.id) === taskId);
  const targetColumn = columnsWithTotals.value.find(c => c.id === newStatus);
  
  if (leadIdx === -1 || !targetColumn) return;
  
  const leadLocal = allLeads.value[leadIdx];
  if (!leadLocal) return;

  const originalStatus = leadLocal.status;
  
  // 1. ATUALIZAÇÃO OTIMISTA
  pendingStatusUpdates.value[taskId] = newStatus;
  if (allLeads.value[leadIdx]) {
    allLeads.value[leadIdx].status = newStatus;
  }

  try {
    const { data: profile } = await supabase.from('ag_profiles')
      .select('id, role').eq('user_id', currentUserId).maybeSingle();
    
    const userProfileId = (profile as any)?.id;
    const isAdmin = (profile as any)?.role === 'admin';

    const statusVariations = [
      targetColumn.title,
      newStatus.replace(/_/g, ' ').toUpperCase(),
      newStatus
    ];

    let success = false;
    for (const statusToTry of statusVariations) {
      const updatePayload: any = { status: statusToTry };
      if (userProfileId && !isAdmin) {
        updatePayload.vendedor_id = userProfileId;
      }

      const { data, error } = await (supabase.from('ag_leads') as any)
        .update(updatePayload).eq('id', taskId).select();

      if (error?.code === '22P02' || (!data?.length)) {
         const { data: leadBySearch } = await (supabase.from('ag_leads') as any)
           .select('id').ilike('nome', leadLocal.nome || (leadLocal as any).leadName).maybeSingle();
         if (leadBySearch) {
           const { data: d2, error: e2 } = await (supabase.from('ag_leads') as any)
             .update(updatePayload).eq('id', (leadBySearch as any).id).select();
           if (!e2 && d2?.length) { success = true; break; }
         }
      } else if (!error && data?.length) {
        success = true;
        break;
      }
    }

    if (success) {
      showLocalToast('Movido para ' + targetColumn.title + '!', 'success');
      setTimeout(async () => { await fetchLeads(); }, 1500);
    } else {
      throw new Error('Falha ao atualizar status no banco.');
    }

  } catch (error: any) {
    console.error('Falha ao salvar movimento:', error.message);
    showLocalToast(error.message, 'error');
    delete pendingStatusUpdates.value[taskId];
    if (allLeads.value[leadIdx]) {
      allLeads.value[leadIdx].status = originalStatus;
    }
  }
};
</script>

<style scoped>
.kanban-board-wrapper {
  flex-grow: 1;
  overflow: auto;
  padding: 0;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

.kanban-board {
  display: flex;
  height: 100%;
  width: 100%;
  padding: 0;
  gap: 0;
  box-sizing: border-box;
}

.kanban-column {
  flex: 0 0 20%; 
  width: 20%;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e1e5e8;
  box-sizing: border-box;
  background-color: #f8fafc;
}

.column-header-wrapper {
  background: white;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.column-header-chevron {
  height: 50px;
  background: #fdfdfd;
  border-bottom: 1px solid #e1e5e8;
  display: flex;
  align-items: center;
  position: relative;
  padding: 0 1rem;
}

.header-content {
  flex-grow: 1;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  min-width: 0;
}

.header-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #26292c;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.metrics-deals {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: lowercase;
  white-space: nowrap;
}

.chevron-arrow {
  position: absolute;
  right: -10px;
  top: 0;
  bottom: 0;
  width: 20px;
  z-index: 5;
  clip-path: polygon(0% 0%, 50% 0%, 100% 50%, 50% 100%, 0% 100%, 50% 50%);
  border-right: 1px solid #e1e5e8;
}

.card-list {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0.75rem 0.5rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.card-list::-webkit-scrollbar {
  display: none;
}
</style>
