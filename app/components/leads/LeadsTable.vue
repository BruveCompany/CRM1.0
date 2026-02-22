<template>
  <div class="lead-list-view content-wrapper">
    <div class="list-header">
      <h2>Lista de Leads</h2>
    </div>
    <div class="table-container">
      <table>
        <thead>
            <th style="width: 15%;">Nome</th>
            <th style="width: 120px;">Telefone</th>
            <th style="width: 150px;">Status</th>
            <th style="width: 60px; text-align: center;">Score</th>
            <th style="width: 100px; text-align: center;">Temp.</th>
            <th style="width: 15%;">Vendedor</th>
            <th style="width: 110px;">Atividade</th>
            <th style="width: 100px; text-align: center;">Mensagens</th>
            <th class="actions-column">Ações</th>
        </thead>
        <tbody>
          <tr v-if="filteredLeadsList.length === 0">
            <td colspan="9" class="empty-table-message">Nenhum lead encontrado.</td>
          </tr>
          <tr v-for="lead in filteredLeadsList" :key="lead.id" @click="openDetails(lead.id)" class="cursor-pointer">
            <td :title="lead.nome">{{ lead.nome }}</td>
            <td :title="lead.telefone">{{ lead.telefone }}</td>
            <td :title="lead.status.replace(/_/g, ' ')">
              <span class="status-badge" :style="{ '--status-color': getStatusColor(lead.status) }">
                {{ lead.status.replace(/_/g, ' ') }}
              </span>
            </td>
            <td style="width: 60px; text-align: center;" :title="String(lead.score || '-')">{{ lead.score || '-' }}</td>
            <td style="width: 100px; text-align: center;" :title="lead.temperatura || '-'">
              <span v-if="lead.temperatura" class="temp-badge" :class="lead.temperatura.toLowerCase()">
                {{ lead.temperatura }}
              </span>
              <span v-else>-</span>
            </td>
            <td :title="lead.vendedor_nome || 'Não Atribuído'">{{ lead.vendedor_nome || 'Não Atribuído' }}</td>
            <td style="width: 110px;" :title="lead.ultima_mensagem_data ? formatRelativeTime(lead.ultima_mensagem_data) : 'N/A'">
              {{ lead.ultima_mensagem_data ? formatRelativeTime(lead.ultima_mensagem_data) : 'N/A' }}
            </td>
            <td style="width: 100px; text-align: center;" :title="String(lead.mensagens_nao_lidas || '0')">
              <span v-if="lead.mensagens_nao_lidas > 0" class="unread-count-table">
                {{ lead.mensagens_nao_lidas }}
              </span>
              <span v-else>-</span>
            </td>
            <td class="actions-column">
              <button class="icon-btn edit-btn" title="Editar"><Icon name="lucide:edit" /></button>
              <button class="icon-btn delete-btn" title="Excluir"><Icon name="lucide:trash-2" /></button>
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
const { filteredLeadsList, formatRelativeTime, openDetails } = useLeads();

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
  padding: 0.75rem 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.list-header h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.table-container {
  overflow: auto;
  flex-grow: 1;
  min-height: 0; /* Essencial para flex-grow + overflow funcionar em algumas situações */
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
  position: relative;
  overflow-x: hidden; /* Remove scroll horizontal */
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
  font-size: 0.85rem;
  text-align: left;
  table-layout: fixed; /* Força os tamanhos das colunas */
}

th, td {
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

th {
  background-color: #f8fafc; /* Cor sólida para não ficar transparente no scroll */
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  position: sticky;
  top: 0;
  z-index: 20;
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
  text-align: right;
  color: #94a3b8;
  padding: 0.5rem 0 0 0;
  font-size: 0.75rem;
  font-style: italic;
  flex-shrink: 0;
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

.temp-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.temp-badge.quente {
  background-color: #fff7ed;
  color: #f97316;
}

.temp-badge.frio {
  background-color: #eff6ff;
  color: #3b82f6;
}
</style>
