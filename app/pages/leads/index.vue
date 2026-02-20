<template>
  <NuxtLayout>
    <div class="page-container">
      <header class="page-header">
        <h1 class="text-2xl font-bold text-neutral-800">Funil de Vendas (Leads)</h1>
        <button class="btn-primary">Adicionar Lead</button>
      </header>

      <div class="kanban-board" ref="board">
        <!-- Loop para criar cada coluna -->
        <div v-for="column in columns" :key="column.id" class="kanban-column" :data-id="column.id">
          <div class="column-title">
            <h3>{{ column.title }}</h3>
            <span class="task-count">{{ column.tasks.length }}</span>
          </div>
          
          <!-- Lista de cards da coluna -->
          <div class="card-list" :id="column.id">
            <div v-for="task in column.tasks" :key="task.id" class="kanban-card" :data-id="task.id">
              <h4 class="card-title">{{ task.title }}</h4>
              <p class="card-details">{{ task.details }}</p>
              <span v-if="task.badge" class="card-badge">{{ task.badge }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { dragAndDrop } from '@formkit/drag-and-drop';

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

const board = ref<HTMLElement | null>(null);

onMounted(() => {
  // Inicializa o drag and drop para cada lista de cards
  columns.value.forEach((column) => {
    const el = document.getElementById(column.id);
    if (el) {
      dragAndDrop({
        parent: el,
        getValues: () => column.tasks,
        setValues: (newValues) => { column.tasks = newValues },
        config: {
          group: 'kanban-tasks',
        },
      });
    }
  });
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
  min-height: 200px; /* Área maior para facilitar soltar em colunas vazias */
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

.kanban-card:active {
  cursor: grabbing;
}

.kanban-card:hover {
  background-color: #f8f9fa;
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

.btn-primary {
    background-color: #4f46e5;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-primary:hover {
    background-color: #4338ca;
}
</style>
