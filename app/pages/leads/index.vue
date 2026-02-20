<template>
  <NuxtLayout>
    <div class="page-container">
      <header class="page-header">
        <h1 class="text-2xl font-bold text-neutral-800">Funil de Vendas (Leads)</h1>
        <div class="header-actions">
          <BaseButton 
            :variant="showKanbanView ? 'primary' : 'outline'" 
            size="sm" 
            class="view-toggle-btn" 
            @click="showKanbanView = true"
          >
            <ViewColumnsIcon class="w-4 h-4 mr-2" />
            <span>Kanban</span>
          </BaseButton>
          <BaseButton 
            :variant="!showKanbanView ? 'primary' : 'outline'" 
            size="sm" 
            class="view-toggle-btn" 
            @click="showKanbanView = false"
          >
            <ListBulletIcon class="w-4 h-4 mr-2" />
            <span>Lista</span>
          </BaseButton>
          <BaseButton variant="primary" size="sm" class="ml-4">
            Adicionar Lead
          </BaseButton>
        </div>
      </header>

      <div v-if="showKanbanView" class="kanban-board">
        <!-- Loop para criar cada coluna -->
        <div v-for="column in columns" :key="column.id" class="kanban-column" :data-id="column.id">
          <div class="column-title">
            <h3>{{ column.title }}</h3>
            <span class="task-count">{{ column.tasks.length }}</span>
          </div>
          
          <!-- Lista de cards da coluna (Registrada no onMounted) -->
          <div class="card-list" :id="`list-${column.id}`" :data-column-id="column.id">
            <!-- Loop para criar cada card dentro da coluna -->
            <div v-for="task in column.tasks" :key="task.id" class="kanban-card" :data-id="task.id">
              <h4 class="card-title">{{ task.title }}</h4>
              <p class="card-details">{{ task.details }}</p>
              <span v-if="task.badge" class="card-badge">{{ task.badge }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="lead-list-view">
        <h2>Lista de Leads</h2>
        <p>Aqui será implementada a tabela com a lista detalhada de todos os leads.</p>
        <div class="table-placeholder">
          <!-- Futura tabela de leads será renderizada aqui -->
          <p>Carregando dados da tabela...</p>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
/**
 * ================= Página: Leads (Funil de Vendas) =================
 * Descrição: Esta página implementa o quadro Kanban para a gestão de leads.
 * Funcionalidades:
 * - Visualização do fluxo de vendas em 5 estágios.
 * - Arrastar e soltar (Drag and Drop) para mudar o status do lead.
 * - Sincronização automática com o Supabase.
 * - Alternância entre visualização em Kanban e Lista.
 * ===================================================================
 */
import { ref, onMounted, watch, nextTick } from 'vue';
import { dragAndDrop } from '@formkit/drag-and-drop';
import { ViewColumnsIcon, ListBulletIcon } from '@heroicons/vue/24/outline';

interface LeadTask {
  id: string;
  title: string;
  details: string;
  badge?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  tasks: LeadTask[];
}

definePageMeta({
  layout: 'default'
});

const supabase = useSupabaseClient();
const showKanbanView = ref(true);

const columns = ref<KanbanColumn[]>([
  {
    id: 'novos',
    title: 'Novos Leads',
    tasks: [
      { id: '1', title: 'Maria Silva', details: '11 98765-4321', badge: '2 novas msgs' },
      { id: '2', title: 'João Pereira', details: '21 91234-5678' },
      { id: '3', title: 'Ana Costa', details: '31 95555-4444', badge: '1 nova msg' },
    ],
  },
  {
    id: 'atendimento',
    title: 'Em Atendimento',
    tasks: [
      { id: '4', title: 'Carlos Andrade', details: '41 97777-8888' },
      { id: '5', title: 'Fernanda Lima', details: '51 96666-2222' },
    ],
  },
  {
    id: 'negociacao',
    title: 'Negociação',
    tasks: [
      { id: '6', title: 'Ricardo Souza', details: '61 93333-1111' },
    ],
  },
  {
    id: 'ganho',
    title: 'Ganho',
    tasks: [
      { id: '7', title: 'Cliente Satisfeito', details: '71 92222-3333' },
    ],
  },
  {
    id: 'perdido',
    title: 'Perdido',
    tasks: [],
  },
]);

const initDragAndDrop = () => {
  if (!showKanbanView.value) return;
  
  // Inicializa o drag and drop para cada coluna de cards
  columns.value.forEach((column) => {
    const el = document.getElementById(`list-${column.id}`);
    if (el) {
      dragAndDrop({
        parent: el,
        getValues: () => column.tasks,
        setValues: (newValues) => { column.tasks = newValues },
        config: {
          group: 'kanban',
          handleEnd: async (data: any) => {
            const movedTaskId = data.draggedNode.data.id;
            const newColumnId = data.target.parent.el.parentElement?.dataset.id;
            
            if (movedTaskId && newColumnId) {
              try {
                const { error } = await (supabase.from('leads') as any)
                  .update({ status: newColumnId })
                  .eq('id', movedTaskId);

                if (error) throw error;
                console.log(`Lead ${movedTaskId} atualizado para ${newColumnId}.`);
              } catch (error: any) {
                console.error('Erro:', error.message);
                alert('❌ Erro ao salvar mudança.');
              }
            }
          }
        },
      });
    }
  });
};

onMounted(() => {
  initDragAndDrop();
});

// Reinicializa o drag and drop quando volta para a vista Kanban
watch(showKanbanView, async (newVal) => {
  if (newVal) {
    await nextTick();
    initDragAndDrop();
  }
});
</script>

<style scoped>
.page-container {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 20px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Botão Adicionar Lead e Switcher agora usam BaseButton */
.view-toggle-btn {
  padding: 0.5rem 1rem !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
}

.kanban-board {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  flex-grow: 1;
  padding-bottom: 1rem;
}

.kanban-column {
  flex: 0 0 320px;
  background-color: #f4f5f7;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.column-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
}

.column-title h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #172b4d;
}

.task-count {
  background-color: #dfe1e6;
  color: #42526e;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: bold;
}

.card-list {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
  min-height: 200px;
}

.kanban-card {
  background-color: #ffffff;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: grab;
  user-select: none;
}

.card-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #333;
}

.card-details {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.75rem;
}

.card-badge {
  background-color: #e34055;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
  display: inline-block;
}

/* Visualização em Lista */
.lead-list-view {
  padding: 3rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.lead-list-view h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
}

.table-placeholder {
  margin-top: 2rem;
  padding: 3rem;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  color: #64748b;
  width: 100%;
  max-width: 500px;
}
</style>
