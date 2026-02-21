<template>
  <div class="lead-list-view content-wrapper">
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
</template>

<script setup lang="ts">
import { useLeads } from '~/composables/useLeads';
const { filteredLeadsList, formatRelativeTime } = useLeads();

// Helper para obter a cor do status (usado na tabela de lista)
function getStatusColor(statusId: string) {
  const statusColors: Record<string, string> = {
    'leads_novos': '#3B82F6',
    'contato_feito': '#F59E0B',
    'necessidades': '#EC4899',
    'em_atendimento': '#6366f1',
    'qualificado': '#8B5CF6',
    'em_negociacao': '#06B6D4',
    'proposta': '#f97316',
    'ganho': '#10B981',
    'perdido': '#EF4444'
  };
  return statusColors[statusId] || '#64748b';
}
</script>

<style scoped>
.content-wrapper {
  background-color: transparent;
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 0; /* truque flexbox para forçar os filhos a scrolarem */
}

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

.table-container {
  overflow-x: auto;
  overflow-y: auto;
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
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.9rem;
  text-align: left;
}

th, td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
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
  width: 100px;
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

.unread-count-table {
  background-color: #dc2626;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  flex-shrink: 0;
  line-height: 1;
}
</style>
