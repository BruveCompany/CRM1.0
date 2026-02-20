<template>
  <NuxtLayout>
    <div class="page-container">
      <header class="page-header">
        <!-- Esquerda: Controles de Vista e Add Lead -->
        <div class="header-left-group">
          <div class="view-toggle-group">
            <button class="view-toggle-btn" @click="showKanbanView = true" :class="{ 'active': showKanbanView }">
                <Icon name="lucide:layout-columns" class="btn-icon" />
                <span>Kanban</span>
            </button>
            <button class="view-toggle-btn" @click="showKanbanView = false" :class="{ 'active': !showKanbanView }">
                <Icon name="lucide:list" class="btn-icon" />
                <span>Lista</span>
            </button>
          </div>
          <BaseButton variant="primary" size="sm" class="btn-no-wrap">
            Adicionar Lead
          </BaseButton>
        </div>

        <!-- Centro: Barra de Pesquisa -->
        <div class="header-center-group">
          <div class="search-container">
            <Icon name="lucide:search" class="search-icon" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Pesquisar leads..." 
              class="search-input"
            />
          </div>
        </div>

        <!-- Direita: Perfil do Vendedor e Status -->
        <div class="header-right-group">
          <div class="user-profile">
            <div class="user-info">
              <span class="user-name">Maria</span>
              <span class="user-status-text">online</span>
            </div>
            <div class="avatar-wrapper">
              <img :src="currentUser.avatar" alt="Avatar" class="user-avatar" />
              <div v-if="currentUser.online" class="online-indicator"></div>
            </div>
          </div>
        </div>
      </header>

      <div v-if="showKanbanView" class="kanban-board-wrapper">
        <div class="kanban-board" ref="board">
          <!-- Coluna individual -->
          <div 
            v-for="column in columnsWithTotals" 
            :key="column.id" 
            class="kanban-column" 
            :data-id="column.id"
          >
            <!-- Header Estilo Pipedrive (Chevron) -->
            <div class="column-header-wrapper">
              <div class="column-header-chevron" :style="{ borderBottom: '2px solid ' + column.color + '40' }">
                <div class="header-content">
                  <h3 class="header-title">{{ column.title }}</h3>
                  <div class="header-metrics">
                    <span class="metrics-deals" :style="{ backgroundColor: column.color + '20', color: column.color }">
                      {{ column.totalDeals }} {{ column.totalDeals === 1 ? 'lead' : 'leads' }}
                    </span>
                  </div>
                </div>
                <div class="chevron-arrow"></div>
              </div>
            </div>

            <!-- Lista de Cards -->
            <div class="card-list" :id="`list-${column.id}`" :data-column-id="column.id">
              <div v-for="task in column.tasks" :key="task.id" class="kanban-card" :data-id="task.id">
                <div class="card-main">
                  <div class="card-avatar">
                    <img v-if="task.avatar" :src="task.avatar" :alt="task.title" />
                    <div v-else class="avatar-placeholder">{{ task.title.charAt(0) }}</div>
                  </div>
                  <div class="card-body">
                    <h4 class="card-deal-title">{{ task.title }}</h4>
                    <div class="card-meta">
                      <span class="card-company" v-if="task.details">{{ task.details }}</span>
                    </div>
                  </div>
                  <div class="card-status">
                    <div class="status-indicator" :class="task.statusType || 'default'">
                      <Icon v-if="task.statusType === 'alert'" name="lucide:alert-triangle" />
                      <Icon v-else-if="task.statusType === 'done'" name="lucide:check-circle-2" />
                      <Icon v-else-if="task.statusType === 'warning'" name="lucide:circle" />
                      <Icon v-else name="lucide:chevron-right" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="lead-list-view">
        <h2>Lista de Leads</h2>
        <p>Aqui será implementada a tabela com a lista detalhada de todos os leads.</p>
        <div class="table-placeholder">
          <p>Carregando dados da tabela...</p>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import { dragAndDrop } from '@formkit/drag-and-drop';
import { ViewColumnsIcon, ListBulletIcon } from '@heroicons/vue/24/outline';

interface LeadTask {
  id: string;
  title: string;
  details: string; // Empresa
  value: number;
  badge?: string;
  avatar?: string;
  statusType?: 'default' | 'alert' | 'done' | 'warning';
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  tasks: LeadTask[];
}

definePageMeta({
  layout: 'default'
});

const supabase = useSupabaseClient();
const showKanbanView = ref(true);
const searchQuery = ref('');

// Dados do UsuárioLogado (Mock)
const currentUser = ref({
  name: 'Maria',
  company: 'Pipes & More',
  avatar: 'https://i.pravatar.cc/150?u=maria',
  online: true
});

const columns = ref<KanbanColumn[]>([
  {
    id: 'novos',
    title: 'Leads Novos',
    color: '#3B82F6',
    tasks: [
      { id: '1', title: 'Maria Silva', details: 'Tri State Realty', value: 4500, statusType: 'alert' },
      { id: '2', title: 'Erebor deal', details: 'Erebor', value: 33000, statusType: 'done' },
      { id: '3', title: 'Ingen deal', details: 'Ingen', value: 50000, statusType: 'done' },
    ],
  },
  {
    id: 'atendimento',
    title: 'Contato Feito',
    color: '#F59E0B',
    tasks: [
      { id: '4', title: 'GNB deal', details: 'GNB', value: 4500, statusType: 'done' },
      { id: '5', title: 'Bad Wolf deal', details: 'Bad Wolf', value: 4500, statusType: 'default' },
    ],
  },
  {
    id: 'negociacao',
    title: 'Necessidades',
    color: '#EC4899',
    tasks: [
      { id: '6', title: 'Erebor deal', details: 'Erebor', value: 33000, statusType: 'alert' },
    ],
  },
  {
    id: 'ganho',
    title: 'Proposta',
    color: '#10B981',
    tasks: [
      { id: '7', title: 'Bad Wolf deal', details: 'Bad Wolf', value: 4500, statusType: 'default' },
    ],
  },
  {
    id: 'perdido',
    title: 'Negociação',
    color: '#EF4444',
    tasks: [
      { id: '8', title: 'Boardwalk deal', details: 'Boardwalk', value: 33000, statusType: 'default' },
    ],
  },
]);

// Computed para totais e formatação
const columnsWithTotals = computed(() => {
  return columns.value.map(col => {
    const total = col.tasks.reduce((acc, curr) => acc + curr.value, 0);
    return {
      ...col,
      totalValueFormatted: total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }),
      totalDeals: col.tasks.length,
      tasks: col.tasks.map(task => ({
        ...task,
        valueFormatted: task.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
      }))
    };
  });
});

const initDragAndDrop = () => {
  if (!showKanbanView.value) return;
  
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
                await (supabase.from('leads') as any)
                  .update({ status: newColumnId })
                  .eq('id', movedTaskId);
                console.log(`Lead ${movedTaskId} -> ${newColumnId}`);
              } catch (error: any) {
                console.error('Erro:', error.message);
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

watch(showKanbanView, async (newVal) => {
  if (newVal) {
    await nextTick();
    initDragAndDrop();
  }
});
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f7f9fa;
  overflow: hidden;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e1e5e8;
  gap: 1.5rem;
}

.header-left-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 0 0 auto; /* Não deixa encolher */
  white-space: nowrap;
}

/* Centro: Pesquisa */
.header-center-group {
  flex: 2;
  display: flex;
  justify-content: center;
  padding: 0 2rem;
}

.search-container {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  width: 1rem;
  height: 1rem;
}

.search-input {
  width: 100%;
  height: 34px;
  padding: 0 1rem 0 2.5rem;
  background: #f1f5f9;
  border: 1px solid transparent;
  border-radius: 20px;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.search-input:focus {
  background: white;
  border-color: #cbd5e1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

/* Direita: Perfil */
.header-right-group {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-left: 1rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  text-align: right;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 2px;
}

.user-company, .user-status-text {
  font-size: 0.7rem;
  color: #22c55e;
  font-weight: 600;
  text-transform: lowercase;
}

.avatar-wrapper {
  position: relative;
  width: 32px;
  height: 32px;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 0 0 1px #e2e8f0;
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background-color: #22c55e;
  border: 2px solid white;
  border-radius: 50%;
}

/* Grupo de toggle (Kanban/Lista) */
.view-toggle-group {
  display: flex;
  align-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  overflow: hidden;
  background: white;
}

.view-toggle-btn {
  height: 34px;
  padding: 0 0.9rem;
  border: none;
  background: white;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.15s;
}

.view-toggle-btn:hover {
  background-color: #f8fafc;
  color: #1e293b;
}

.view-toggle-btn.active {
  background-color: #4f46e5;
  color: white;
}

.view-toggle-btn span {
  white-space: nowrap; /* Impede quebra de linha no texto do botão */
}

.view-toggle-btn .btn-icon {
  width: 1rem;
  height: 1rem;
}

.btn-no-wrap {
  white-space: nowrap !important;
  flex-shrink: 0;
}

/* KANBAN BOARD */
.kanban-board-wrapper {
  flex-grow: 1;
  overflow: auto;
  padding: 0;
}

.kanban-board {
  display: flex;
  height: 100%;
  padding: 0;
}

.kanban-column {
  flex: 0 0 20%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e1e5e8;
}

/* HEADER CHEVRON STYLE */
.column-header-wrapper {
  background: white;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.column-header-chevron {
  height: 60px;
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
  font-size: 0.9rem;
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

/* Chevron arrow effect */
.chevron-arrow {
  position: absolute;
  right: -10px;
  top: 0;
  bottom: 0;
  width: 20px;
  background: inherit;
  z-index: 5;
  clip-path: polygon(0% 0%, 50% 0%, 100% 50%, 50% 100%, 0% 100%, 50% 50%);
  border-right: 1px solid #e1e5e8;
}

/* CARD LIST */
.card-list {
  flex-grow: 1;
  overflow-y: auto;
  background: #f7f9fa;
  padding: 0.2rem;
}

/* KANBAN CARD */
.kanban-card {
  background: white;
  margin-bottom: 0.2rem;
  border: 1px solid #e1e5e8;
  border-radius: 6px;
  padding: 1.6rem 1rem;
  min-height: 126px;
  cursor: grab;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Permitir quebra apenas no corpo do card se necessário */
.card-deal-title, .card-company {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kanban-card:hover {
  background: #f0f4f8;
}

.card-main {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.card-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  background: #cbd5e1;
  flex-shrink: 0;
  margin-top: 2px;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #94a3b8;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
}

.card-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-body {
  flex-grow: 1;
  min-width: 0;
}

.card-deal-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #26292c;
  margin: 0 0 0.1rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  display: flex;
  flex-direction: column;
}

.card-value {
  font-size: 0.8rem;
  font-weight: 700;
  color: #444;
}

.card-company {
  font-size: 0.75rem;
  color: #6a6e73;
}

.card-status {
  flex-shrink: 0;
  margin-top: 5px;
}

.status-indicator {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e1e5e8;
  border-radius: 50%;
  color: #94a3b8;
}

.status-indicator.alert {
  color: #ef4444;
  border-color: #fee2e2;
  background: #fef2f2;
}

.status-indicator.done {
  color: #22c55e;
  border-color: #dcfce7;
  background: #f0fdf4;
}

.status-indicator.warning {
  color: #f59e0b;
  border-color: #fef3c7;
  background: #fffbeb;
}

/* SCROLLBARS */
.kanban-board-wrapper::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.kanban-board-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.card-list::-webkit-scrollbar {
  width: 4px;
}

.card-list::-webkit-scrollbar-thumb {
  background: transparent;
}

.card-list:hover::-webkit-scrollbar-thumb {
  background: #cbd5e1;
}
</style>
