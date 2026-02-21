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
          <button class="btn-add-lead btn-success-fill">+ Criar Lead</button> <!-- Texto padronizado -->
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
        <div v-if="showKanbanView" key="kanban" class="kanban-board-wrapper">
          <div class="kanban-board" ref="board">
            <div 
              v-for="column in displayColumns" 
              :key="column.id" 
              class="kanban-column" 
              :data-id="column.id"
            >
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
                <div class="card-list" 
                  :id="`list-${column.id}`" 
                  :data-column-id="column.id"
                  @dragover.prevent
                  @drop="onDropCard($event, column.id)"
                >
                  <div 
                    v-for="task in column.tasks" 
                    :key="task.id" 
                    class="kanban-card" 
                    :data-id="task.id" 
                    :style="{ '--column-color': column.color }"
                    draggable="true"
                    @dragstart="onDragStartCard($event, task.id)"
                  >
                    <div class="card-content">
                      <h4 class="card-title">{{ task.leadName }}</h4>
                      <p class="card-phone-number">{{ task.phone }}</p>
                      <div class="card-meta">
                        <div class="card-meta-left">
                          <span v-if="task.lastActivityText" class="card-last-activity">{{ task.lastActivityText }}</span>
                          <span v-if="task.vendedorNome" class="card-vendedor-tag">
                            <Icon name="lucide:user" class="vendedor-icon" />
                            <span>{{ task.vendedorNome }}</span>
                          </span>
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
        <div v-else key="list" class="lead-list-view content-wrapper">
          <div class="list-header">
            <h2>Lista de Leads</h2>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Status</th>
                  <th>Vendedor</th>
                  <th>Última Atividade</th>
                  <th>Mensagens Não Lidas</th>
                  <th class="actions-column">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredLeadsList.length === 0">
                  <td colspan="7" class="empty-table-message">Nenhum lead encontrado.</td>
                </tr>
                <tr v-for="lead in filteredLeadsList" :key="lead.id">
                  <td>{{ lead.nome }}</td>
                  <td>{{ lead.telefone }}</td>
                  <td>
                    <span class="status-badge" :style="{ '--status-color': getStatusColor(lead.status) }">
                      {{ lead.status.replace(/_/g, ' ') }}
                    </span>
                  </td>
                  <td>{{ lead.vendedor_nome || 'Não Atribuído' }}</td>
                  <td>{{ lead.ultima_mensagem_data ? formatRelativeTime(lead.ultima_mensagem_data) : 'N/A' }}</td>
                  <td>
                    <span v-if="lead.mensagens_nao_lidas > 0" class="unread-count-table">
                      {{ lead.mensagens_nao_lidas }}
                    </span>
                    <span v-else>-</span>
                  </td>
                  <td class="actions-column">
                    <button class="icon-btn edit-btn"><Icon name="lucide:edit" /></button>
                    <button class="icon-btn delete-btn"><Icon name="lucide:trash-2" /></button>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-if="filteredLeadsList.length > 0" class="loading-placeholder">Exibindo {{ filteredLeadsList.length }} leads.</p>
          </div>
        </div>
      </ClientOnly>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useDragAndDrop } from '@formkit/drag-and-drop/vue';

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
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Maria',
  online: true
});

interface LeadTask {
  id: string;
  leadName: string;
  phone: string;
  avatarText: string;
  unreadMessages?: number;
  lastActivityText?: string;
  statusIcon?: string;
  vendedorNome?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  tasks: LeadTask[];
}

// Estrutura de colunas para o Kanban
const columns = ref<KanbanColumn[]>([
  { id: 'leads_novos', title: 'Leads Novos', color: '#3B82F6', tasks: [] },
  { id: 'contato_feito', title: 'Contato Feito', color: '#F59E0B', tasks: [] },
  { id: 'necessidades', title: 'Necessidades', color: '#EC4899', tasks: [] },
  { id: 'proposta', title: 'Proposta', color: '#8B5CF6', tasks: [] },
  { id: 'negociacao', title: 'Negociação', color: '#06B6D4', tasks: [] },
  { id: 'ganho', title: 'Ganho', color: '#10B981', tasks: [] },
  { id: 'perdido', title: 'Perdido', color: '#EF4444', tasks: [] },
]);

// Nova ref para a lista plana de todos os leads (para a visualização de tabela)
const allLeads = ref<any[]>([]);

// Função para buscar leads do Supabase
const fetchLeads = async () => {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  let currentVendedorId = null;

  if (user) {
    // ASSUNÇÃO TEMPORÁRIA: Para teste, vamos usar um ID BIGINT fixo (ex: 101)
    currentVendedorId = 101; 
  }

  let query = supabase.from('ag_leads').select(`
      *,
      vendedor:ag_profissionais(nome_display)  /* FAZENDO JOIN para buscar o nome do vendedor */
    `).order('criado_em', { ascending: false });

  if (currentVendedorId) {
    query = query.eq('vendedor_id', currentVendedorId);
  } else {
    console.warn('Nenhum vendedor logado ou ID de vendedor para filtro. Carregando todos os leads (se RLS permitir).');
  }

  const { data, error } = await query;
  const leadsData = data as any[] | null;

  if (error || !leadsData) {
    console.error('Erro ao buscar leads:', error?.message);
    allLeads.value = []; 
    populateKanbanColumns([]);
    return;
  }

  // Popula a lista plana de leads
  allLeads.value = (leadsData as any[]).map((lead: any) => {
    const l = lead as any;
    // Tenta pegar o nome do vendedor lidando com objeto ou array retornado pelo JOIN
    const vRef = l.vendedor;
    const vNome = Array.isArray(vRef) ? vRef[0]?.nome_display : vRef?.nome_display;
    
    return { 
      ...l, 
      id: String(l.id), 
      vendedor_nome: vNome || 'Não Atribuído'
    };
  });

  // Popula as colunas do Kanban
  populateKanbanColumns(allLeads.value);
};


// Função para popular as colunas do Kanban a partir de uma lista de leads
const populateKanbanColumns = (leads: any[]) => {
  columns.value.forEach(col => (col.tasks = [])); // Limpa colunas
  
  leads.forEach(lead => {
    const column = columns.value.find(col => col.id === lead.status);
    if (column) {
      column.tasks.push({
        id: String(lead.id), // Garante que o ID seja string para o D&D
        leadName: lead.nome,
        phone: lead.telefone,
        avatarText: lead.nome ? lead.nome.substring(0, 2).toUpperCase() : '??',
        unreadMessages: lead.mensagens_nao_lidas > 0 ? lead.mensagens_nao_lidas : undefined,
        lastActivityText: lead.ultima_mensagem_data ? formatRelativeTime(lead.ultima_mensagem_data) : undefined,
        statusIcon: getStatusIcon(lead.status, lead.mensagens_nao_lidas),
        vendedorNome: lead.vendedor_nome,
      });
    }
  });
};

// Helper para formatar a data
function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears >= 1) return `Há ${diffYears} ano${diffYears > 1 ? 's' : ''}`;
  if (diffMonths >= 1) return `Há ${diffMonths} mês${diffMonths > 1 ? 'es' : ''}`;
  if (diffDays >= 1) return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  if (diffHours >= 1) return `Há ${diffHours}h`;
  if (diffMinutes < 1) return 'Agora';
  if (diffMinutes >= 1) return `Há ${diffMinutes} min`;
  return date.toLocaleDateString('pt-BR');
}

// Helper para definir o ícone de status
function getStatusIcon(status: string, unreadMessages: number) {
  if (unreadMessages > 0) return 'alert-triangle'; // Alerta para novas mensagens
  if (status === 'ganho') return 'check-circle';
  if (status === 'perdido') return 'x-circle';
  return 'message-square'; // Ícone padrão para outras etapas
}


// Helper para obter a cor do status (usado na tabela de lista)
function getStatusColor(statusId: string) {
  const column = columns.value.find(col => col.id === statusId);
  return column ? column.color : '#64748b'; // Cor padrão se não encontrar
}


// Computed property para filtrar as colunas e calcular os totais
const columnsWithTotals = computed(() => {
  const filteredColumns = columns.value.map(column => {
    const filteredTasks = column.tasks.filter(task =>
      task.leadName && task.leadName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      task.phone && task.phone.toLowerCase().includes(searchQuery.value.toLowerCase())
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

// Computed property para filtrar a lista plana de leads (para a visualização de tabela)
const filteredLeadsList = computed(() => {
  if (!searchQuery.value) {
    return allLeads.value;
  }
  const query = searchQuery.value.toLowerCase();
  return allLeads.value.filter(lead =>
    (lead.nome && lead.nome.toLowerCase().includes(query)) ||
    (lead.telefone && lead.telefone.toLowerCase().includes(query)) ||
    (lead.status && lead.status.toLowerCase().includes(query)) ||
    (lead.vendedor_nome && lead.vendedor_nome.toLowerCase().includes(query)) 
  );
});

// Lógica do Drag and Drop Nativa para os Cards
const onDragStartCard = (event: DragEvent, taskId: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('taskId', taskId);
    event.dataTransfer.effectAllowed = 'move';
  }
};

const onDropCard = async (event: DragEvent, newStatus: string) => {
  const taskId = event.dataTransfer?.getData('taskId');
  if (!taskId) return;

  console.log(`Movendo Lead ${taskId} para status ${newStatus}`);

  try {
    const { error } = await (supabase.from('ag_leads') as any)
      .update({ status: newStatus })
      .eq('id', taskId);

    if (error) throw error;
    fetchLeads(); // Recarrega para refletir a mudança
  } catch (error: any) {
    console.error('Erro ao mover lead:', error.message);
  }
};

const board = ref(null);
const dndTasks = ref([]);

// Para que o template do Kanban use as colunas filtradas e com totais
const displayColumns = computed(() => columnsWithTotals.value);


// Carregar leads ao montar o componente
onMounted(() => {
  fetchLeads();
});
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8fafc; /* Fundo padrão mais moderno e limpo */
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
  opacity: 0.8; /* Ajustado para 80% conforme solicitado */
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
  background-color: #eef2ff; /* Fundo indigo pastel suave */
  color: #4f46e5; /* Texto indigo principal */
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
  background-color: #eef2ff !important; /* Indigo pastel (Mesmo do Kanban ativo) */
  color: #4f46e5 !important; /* Texto Indigo */
  border: 1px solid #dbeafe !important; /* Borda suave */
  box-shadow: none !important;
  font-weight: 600 !important;
}

.btn-no-wrap:hover {
  background-color: #e0e7ff !important;
  border-color: #c7d2fe !important;
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
  width: 100%;
  padding: 0;
  gap: 0;
  box-sizing: border-box;
}

.kanban-column {
  flex: 0 0 20%; /* Força exatamente 5 colunas por tela */
  width: 20%;
  min-width: 180px; /* Largura mínima pequena para não cortar */
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e1e5e8;
  box-sizing: border-box;
}

/* Estilos para o botão adicionar lead no header (Igual ao toggle ativo) */
.btn-add-lead {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 1rem; /* Ajustado para bater a altura */
  height: 34px;    /* Mesma altura do toggle */
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background-color: #eef2ff; /* Indigo pastel suave */
  color: #4f46e5;           /* Texto Indigo principal */
  white-space: nowrap;
}

.btn-add-lead:hover {
  background-color: #e0e7ff;
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
  overflow-y: overlay;
  background: transparent; /* Usa o fundo do container pai */
  padding: 0.2rem 0 0.2rem 0.5rem;
}

/* KANBAN CARD */
.kanban-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  margin-right: 0.5rem; /* Margem para manter o card longe da borda/barra */
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
  font-size: 0.75rem;
  color: #94a3b8;
}

.card-vendedor-tag {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 4px;
}

.vendedor-icon {
  width: 0.75rem;
  height: 0.75rem;
  color: #94a3b8;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto; /* Empurra os metadados para baixo no card */
  font-size: 0.85rem;
  gap: 0.5rem;
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

.card-unread-badge {
  background-color: #dc2626;
  color: white;
  min-width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0 4px;
}

.card-status-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid var(--column-color);
  background-color: white;
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

/* SCROLLBAR HORIZONTAL (VISÍVEL E SUTIL) */
:global(.kanban-board-wrapper) {
  scrollbar-width: thin !important;
  scrollbar-color: #e2e8f0 transparent !important;
}

:global(.kanban-board-wrapper::-webkit-scrollbar) {
  height: 6px !important;
  display: block !important;
}

:global(.kanban-board-wrapper::-webkit-scrollbar-track) {
  background: transparent !important;
}

:global(.kanban-board-wrapper::-webkit-scrollbar-thumb) {
  background: #e2e8f0 !important;
  border-radius: 10px !important;
}

:global(.kanban-board-wrapper::-webkit-scrollbar-thumb:hover) {
  background: #cbd5e1 !important;
}

/* SCROLLBAR VERTICAL DAS COLUNAS (TOTALMENTE INVISÍVEL) */
:global(.card-list) {
  scrollbar-width: none !important; /* Firefox */
  -ms-overflow-style: none !important; /* IE and Edge */
}

:global(.card-list::-webkit-scrollbar) {
  display: none !important; /* Chrome, Safari and Opera */
  width: 0 !important;
}


/* Remover botões/setas de todas as barras */
:global(.card-list::-webkit-scrollbar-button),
:global(.kanban-board-wrapper::-webkit-scrollbar-button) {
  display: none !important;
}

/* OUTROS ESTILOS MANTIDOS */
/* Estilos para o wrapper de conteúdo (reutilizado) */
.content-wrapper {
  background-color: transparent; /* Remove o fundo branco para padronizar com o Kanban */
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 0; /* truque flexbox para forçar os filhos a scrolarem */
}

/* Estilos do cabeçalho da lista */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.list-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #334155;
}

.btn-primary-action {
  background-color: #4f46e5;
  color: white;
  padding: 0.6rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-primary-action:hover {
  background-color: #4338ca;
}

/* Estilos para a tabela */
.table-container {
  overflow-x: auto;
  overflow-y: auto; /* Adicionado scroll vertical */
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

.table-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

table {
  width: 100%;
  border-collapse: separate; /* Necessário para sticky header */
  border-spacing: 0;
  font-size: 0.9rem;
  text-align: left;
}

th, td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap; /* Evita quebra de linha em colunas pequenas */
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  font-size: 0.8rem;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 2px solid #e2e8f0;
}

td {
  color: #334155;
}

tbody tr:hover {
  background-color: #fefefe;
}

.actions-column {
  text-align: center;
  width: 100px; /* Largura fixa para as ações */
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}
.icon-btn:hover {
  background-color: #e2e8f0;
}

.edit-btn {
  color: #4f46e5;
}
.delete-btn {
  color: #dc2626;
}

.empty-table-message {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
  font-style: italic;
}

.loading-placeholder {
  text-align: center;
  color: #94a3b8;
  padding: 1rem;
  font-style: italic;
}

/* Estilos para o badge de status na tabela */
.status-badge {
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--status-color, #64748b);
  background-color: color-mix(in srgb, var(--status-color, #64748b), transparent 85%);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  white-space: nowrap;
  display: inline-block;
}

/* Estilos para a contagem de não lidas na tabela */
.unread-count-table {
  background-color: #dc2626;
  color: white;
  width: 20px; /* Largura para o círculo */
  height: 20px; /* Altura para o círculo */
  border-radius: 50%; /* Círculo */
  display: flex; /* Para centralizar o número */
  align-items: center;
  justify-content: center;
  font-size: 0.75rem; /* Tamanho da fonte do número */
  font-weight: bold;
  flex-shrink: 0;
  line-height: 1; /* Para alinhar o texto verticalmente */
}
</style>
