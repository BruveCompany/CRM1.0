<template>
  <NuxtLayout>
    <div class="page-container">
      <header class="page-header">
        <!-- Esquerda: Controles de Vista e Add Lead -->
        <div class="header-left-group">
          <div class="view-toggle-group">
            <button class="view-toggle-btn" @click="showKanbanView = true" :class="{ 'active': showKanbanView }">
                <Icon name="lucide:columns-3" class="btn-icon" />
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

      <ClientOnly>
      <div v-if="showKanbanView" class="kanban-board-wrapper">
        <div class="kanban-board" ref="board">
          <!-- Coluna individual -->
          <div 
            v-for="column in displayColumns" 
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
              <div v-for="task in column.tasks" :key="task.id" class="kanban-card" :data-id="task.id" :style="{ '--column-color': column.color }">

                <div class="card-content">
                  <h4 class="card-title">{{ task.leadName }}</h4> <!-- Nome do Lead -->
                  <p class="card-phone-number">{{ task.phone }}</p> <!-- Telefone do Lead -->
                  <div class="card-meta">
                    <div class="card-meta-left">

                      <span v-if="task.lastActivityText" class="card-last-activity">{{ task.lastActivityText }}</span> <!-- Última atividade -->
                    </div>
                    <div class="card-meta-right">
                      <div v-if="task.unreadMessages" class="card-unread-messages">
                        <span class="message-count">{{ task.unreadMessages }}</span>
                        <span class="message-text">novas msgs</span>
                      </div>
                      <div v-if="task.statusIcon" class="card-status-icon-wrapper" :style="{ 'border-color': column.color }">
                        <Icon :name="`lucide:${task.statusIcon}`" :class="`status-icon status-${task.statusIcon}`" :style="{ 'color': column.color }" />
                      </div>
                      <div class="card-arrow-icon">
                        <Icon name="lucide:chevron-right" />
                      </div>
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
      </ClientOnly>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { dragAndDrop, animations } from '@formkit/drag-and-drop';

definePageMeta({
  layout: 'default'
});

interface LeadTask {
  id: string;
  leadName: string;
  phone: string;
  avatarText: string;
  unreadMessages?: number;
  lastActivityText?: string;
  statusIcon?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  tasks: LeadTask[];
}

const supabase = useSupabaseClient();
const showKanbanView = ref(true);
const searchQuery = ref('');

// Dados do UsuárioLogado (Mock)
const currentUser = ref({
  name: 'Maria',
  company: 'Pipes & More',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Maria',
  online: true
});

const initialColumns = ref<KanbanColumn[]>([
  {
    id: 'leads_novos',
    title: 'Leads Novos',
    color: '#3B82F6', // Azul
    tasks: [
      { id: '1', leadName: 'Maria Silva', phone: '11 98765-4321', avatarText: 'MS', unreadMessages: 2, lastActivityText: 'Há 5 min', statusIcon: 'alert-triangle' },
      { id: '2', leadName: 'João Pereira', phone: '21 91234-5678', avatarText: 'JP', lastActivityText: 'Há 1h' },
      { id: '3', leadName: 'Ana Costa', phone: '31 95555-4444', avatarText: 'AC', unreadMessages: 1, lastActivityText: 'Ontem' },
    ],
  },
  {
    id: 'contato_feito',
    title: 'Contato Feito',
    color: '#F59E0B', // Laranja
    tasks: [
      { id: '4', leadName: 'Carlos Andrade', phone: '41 97777-8888', avatarText: 'CA', lastActivityText: 'Há 2 dias', statusIcon: 'check-circle' },
      { id: '5', leadName: 'Fernanda Lima', phone: '51 96666-2222', avatarText: 'FL', lastActivityText: 'Há 3 dias' },
    ],
  },
  {
    id: 'necessidades',
    title: 'Necessidades',
    color: '#EC4899', // Rosa
    tasks: [
      { id: '6', leadName: 'Ricardo Souza', phone: '61 93333-1111', avatarText: 'RS', lastActivityText: 'Há 1 semana', statusIcon: 'alert-triangle' },
    ],
  },
  {
    id: 'proposta',
    title: 'Proposta',
    color: '#8B5CF6', // Roxo
    tasks: [
      { id: '7', leadName: 'Bruna Mendes', phone: '71 92222-3333', avatarText: 'BM', lastActivityText: 'Há 30 min', statusIcon: 'alert-triangle' },
    ],
  },
  {
    id: 'negociacao',
    title: 'Negociação',
    color: '#06B6D4', // Ciano
    tasks: [
      { id: '8', leadName: 'Paulo Roberto', phone: '81 94444-5555', avatarText: 'PR', lastActivityText: 'Há 1 dia' },
    ],
  },
  {
    id: 'ganho',
    title: 'Ganho',
    color: '#10B981', // Verde
    tasks: [
      { id: '9', leadName: 'Cliente Satisfeito', phone: '91 91111-2222', avatarText: 'CS', statusIcon: 'check-circle' },
    ],
  },
  {
    id: 'perdido',
    title: 'Perdido',
    color: '#EF4444', // Vermelho
    tasks: [
      { id: '10', leadName: 'Lead Desistente', phone: '01 93333-4444', avatarText: 'LD', statusIcon: 'x-circle' },
    ],
  },
]);

const columnsWithTotals = computed<(KanbanColumn & { totalDeals: number })[]>(() => {
  const filteredColumns = initialColumns.value.map(column => {
    const filteredTasks = column.tasks.filter(task =>
      task.leadName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      task.phone?.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
    const totalDeals = filteredTasks.length;

    return {
      ...column,
      tasks: filteredTasks,
      totalDeals: totalDeals,
    };
  });
  return filteredColumns;
});

const initDragAndDrop = () => {
  if (!showKanbanView.value) return;
  
  // Aguarda o próximo tick para garantir que o DOM renderizou as colunas
  nextTick(() => {
    initialColumns.value.forEach((column) => {
      const el = document.getElementById(`list-${column.id}`);
      if (el) {
        dragAndDrop({
          parent: el,
          getValues: () => column.tasks,
          setValues: (newValues) => { column.tasks = newValues },
          config: {
            group: 'kanban',
            draggingClass: 'kanban-card-dragged', // Classe para ocultar o original
            plugins: [
              animations({
                duration: 2500, // Ajustado para 2.5 segundos conforme solicitado
              }),
            ],
            handleEnd: async (data: any) => {
              // Quando o item é solto, identificamos o ID do lead e o ID da nova coluna
              const movedTaskId = data.draggedNode.data.id;
              // Verifica se o alvo é válido para evitar o erro de "reading parent"
              const targetParent = data.target?.parent?.el;
              const newColumnId = targetParent?.dataset?.columnId;
              
              if (movedTaskId && newColumnId) {
                console.log(`Mover Lead ${movedTaskId} para ${newColumnId}`);
                try {
                  const { error } = await (supabase.from('leads') as any)
                    .update({ status: newColumnId })
                    .eq('id', movedTaskId);

                  if (error) throw error;
                  console.log('Status atualizado no Supabase.');
                } catch (error: any) {
                  console.error('Erro:', error.message);
                }
              }
            }
          },
        });
      }
    });
  });
};

onMounted(() => {
  initDragAndDrop();
});

watch(showKanbanView, (val) => {
  if (val) initDragAndDrop();
});

const displayColumns = computed(() => columnsWithTotals.value);
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
  background-color: #ffffff;
  border-radius: 8px;
  padding: 1rem; /* Padding que dá altura */
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: box-shadow 0.2s ease-in-out, border-color 0.2s;
  position: relative;
  display: flex;
  align-items: stretch;
  border: 1px solid #e2e8f0; /* Borda bem leve e sutil para o card */
  min-height: 100px; /* Altura mínima para o card */
  cursor: grab; /* Mão aberta para indicar que pode arrastar */
}

.kanban-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border-color: #cbd5e1;
}


.card-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem; /* Espaçamento menor entre os itens para um visual mais compacto */
}

.card-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: #334155;
}

.card-phone-number {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.2rem; /* Pequena margem para separar do título */
}

.card-last-activity {
  font-size: 0.7rem; /* Menor que o telefone */
  color: #94a3b8; /* Cor mais suave */
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto; /* Empurra os metadados para baixo no card */
  font-size: 0.85rem;
}

.card-meta-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}


.card-meta-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-unread-messages {
  display: flex;
  align-items: center;
  gap: 0.2rem; /* Espaçamento entre o número e o texto */
  background-color: #fee2e2; /* Fundo vermelho bem claro */
  border-radius: 12px;
  padding: 2px 6px;
}

.card-unread-messages .message-count {
  background-color: #dc2626; /* Círculo vermelho para o número */
  color: white;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
  flex-shrink: 0;
}

.card-unread-messages .message-text {
  font-size: 0.7rem;
  color: #dc2626;
  font-weight: 600;
  white-space: nowrap;
}

.card-status-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid var(--column-color); /* Borda com a cor da coluna */
  background-color: white; /* Fundo branco */
}

.status-icon {
  width: 1rem;
  height: 1rem;
}

.status-alert-triangle { color: #f59e0b; } /* Laranja */
.status-check-circle { color: #10B981; } /* Verde */
.status-x-circle { color: #EF4444; } /* Vermelho */
.status-message-square { color: #4f46e5; } /* Azul */

.card-arrow-icon {
  color: #cbd5e1;
  transition: color 0.2s;
}

.kanban-card:hover .card-arrow-icon {
  color: #64748b;
}

/* ESTILOS PARA CORRIGIR O RASTRO/FANTASMA AO ARRASTAR */

/* 1. Faz o card original, que está sendo arrastado, desaparecer completamente */
.kanban-card.kanban-card-dragged {
  opacity: 0 !important; /* Invisibilidade total */
  transform: none !important; 
  box-shadow: none !important; 
  border-color: transparent !important; 
  transition: none !important; 
}

/* 2. Estilo para o "fantasma" (a cópia que você realmente arrasta) */
:global(.drag-node) {
  opacity: 1 !important; /* Totalmente visível para clareza */
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2) !important; 
  transform: rotate(0deg) !important; 
  transition: none !important; 
  border-radius: 8px !important; 
  cursor: grabbing !important; 
  background-color: white !important; 
  border: 1px solid #cdd4dc !important; 
  display: flex !important;
  z-index: 100000 !important;
}

/* 3. Estilo para o espaço de destino (Placeholder) */
:global(.kanban-card[data-placeholder="true"]) {
  background-color: #f1f5f9 !important;
  border: 2px dashed #cbd5e1 !important;
  opacity: 0.5 !important;
  box-shadow: none !important;
  transform: none !important;
}

:global(.kanban-card[data-placeholder="true"] *) {
  visibility: hidden !important; /* Esconde o texto/conteúdo para não "sujar" o visual */
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

/* OUTROS ESTILOS MANTIDOS */
.lead-list-view {
  padding: 2rem;
  text-align: center;
  color: #64748b;
}

.table-placeholder {
  margin-top: 1rem;
  padding: 2rem;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
}
</style>
