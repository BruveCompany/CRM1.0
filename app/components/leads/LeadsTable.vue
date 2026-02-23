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
            <th v-if="isAdmin" class="actions-column">Ações</th>
        </thead>
        <tbody>
          <tr v-if="filteredLeadsList.length === 0">
            <td :colspan="isAdmin ? 9 : 8" class="empty-table-message">Nenhum lead encontrado.</td>
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
            <td :title="lead.vendedor_nome || 'Não Atribuído'">
              <div class="flex items-center gap-2">
                <span class="status-dot-mini" :class="{ 'is-online': lead.vendedorOnline }"></span>
                {{ lead.vendedor_nome || 'Não Atribuído' }}
              </div>
            </td>
            <td style="width: 110px;" :title="lead.ultima_mensagem_data ? formatRelativeTime(lead.ultima_mensagem_data) : 'N/A'">
              <ClientOnly>
                {{ lead.ultima_mensagem_data ? formatRelativeTime(lead.ultima_mensagem_data) : 'N/A' }}
                <template #placeholder>---</template>
              </ClientOnly>
            </td>
            <td style="width: 100px; text-align: center;" :title="String(lead.mensagens_nao_lidas || '0')">
              <span v-if="lead.mensagens_nao_lidas > 0" class="unread-count-table">
                {{ lead.mensagens_nao_lidas }}
              </span>
              <span v-else>-</span>
            </td>
            <td v-if="isAdmin" class="actions-column">
              <button 
                class="icon-btn edit-btn" 
                @click.stop="openDetails(lead.id)"
                title="Editar Lead"
              >
                <Icon name="lucide:edit" />
              </button>

              <button 
                class="icon-btn delete-btn" 
                @click.stop="confirmDeleteLead(lead)"
                title="Excluir Lead"
              >
                <Icon name="lucide:trash-2" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="filteredLeadsList.length > 0" class="loading-placeholder">Exibindo {{ filteredLeadsList.length }} leads.</p>
    </div>

    <!-- Modal de Confirmação de Exclusão (Ultra Prime & Minimalist) -->
    <BaseModal v-model="showConfirmDeleteModal" size="sm" hideHeader>
      <div class="prime-confirm-modal">
        <!-- Botão Fechar Customizado -->
        <button @click="showConfirmDeleteModal = false" class="close-btn-custom">
          <Icon name="lucide:x" class="w-5 h-5" />
        </button>

        <div class="icon-header">
          <div class="icon-circle-red-glow">
            <Icon name="lucide:trash-2" class="w-7 h-7" />
          </div>
        </div>
        
        <h3 class="modal-title-prime">Arquivar Lead</h3>
        
        <p class="modal-desc-prime">
          Você tem certeza de que deseja mover <span class="highlight-name">"{{ leadToDelete?.nome }}"</span> para o arquivo? 
        </p>
        
        <p class="modal-subdesc-prime text-rose-500 font-medium pt-1">O lead não aparecerá mais na lista ativa do CRM.</p>

        <div class="prime-modal-actions-compact">
          <button 
            class="btn-prime-secondary-slim" 
            @click="showConfirmDeleteModal = false"
          >
            Não, cancelar
          </button>
          <button 
            class="btn-prime-danger-slim" 
            @click="handleExecuteDelete"
          >
            Sim, arquivar
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { useLeads, type LeadTask } from '~/composables/useLeads';
import { useNotification } from '~/composables/useNotification';
import BaseModal from '../BaseModal.vue';

const { filteredLeadsList, formatRelativeTime, openDetails, fetchLeads } = useLeads();
const { notifySuccess, notifyError } = useNotification();
const { checkIsAdmin } = useAuth();
const supabase = useSupabaseClient();

const isAdmin = ref(true);
const showConfirmDeleteModal = ref(false);
const leadToDelete = ref<LeadTask | null>(null);

onMounted(async () => {
  isAdmin.value = await checkIsAdmin();
});

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

const confirmDeleteLead = (lead: LeadTask) => {
  leadToDelete.value = lead;
  showConfirmDeleteModal.value = true;
};

const handleExecuteDelete = async () => {
  if (!leadToDelete.value) return;

  const leadId = leadToDelete.value.id;
  const leadNome = leadToDelete.value.nome;
  
  showConfirmDeleteModal.value = false;

  try {
    // REALIZA A EXCLUSÃO LÓGICA (ARQUIVAMENTO)
    // Nota: Requer que a coluna 'ativo' exista na tabela 'ag_leads'
    const { error } = await (supabase
      .from('ag_leads') as any)
      .update({ ativo: false })
      .eq('id', leadId);

    if (error) {
      throw error;
    }

    notifySuccess(`Lead "${leadNome}" arquivado com sucesso!`);
    await fetchLeads(); // Recarrega a lista para remover o lead (a VIEW deve filtrar por ativo=true)
    leadToDelete.value = null;
  } catch (err: any) {
    console.error('Erro ao arquivar lead:', err.message);
    notifyError('Erro ao arquivar lead: ' + err.message);
  }
};
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

.flex { display: flex; }
.items-center { align-items: center; }
.gap-2 { gap: 0.5rem; }

.status-dot-mini {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: #94a3b8;
  flex-shrink: 0;
  transition: all 0.3s;
}

.status-dot-mini.is-online {
  background-color: #22c55e;
  box-shadow: 0 0 0 1px #22c55e40;
  animation: pulse-presence 2s infinite;
}

@keyframes pulse-presence {
  0% { box-shadow: 0 0 0 0px rgba(34, 197, 94, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0px rgba(34, 197, 94, 0); }
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

/* --- MODAL DE CONFIRMAÇÃO ULTRA PRIME --- */
.prime-confirm-modal {
  padding: 2.5rem 1.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  background: white;
}

.close-btn-custom {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn-custom:hover {
  background: #f1f5f9;
  color: #1e293b;
  transform: rotate(90deg);
}

.icon-header {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.icon-circle-red-glow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  background-color: #fef2f2;
  color: #ef4444;
  border-radius: 20px;
  box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.1), 0 4px 6px -2px rgba(239, 68, 68, 0.05);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.prime-confirm-modal:hover .icon-circle-red-glow {
  transform: scale(1.1) rotate(-5deg);
  background-color: #fee2e2;
}

.modal-title-prime {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.75rem;
  letter-spacing: -0.025em;
}

.modal-desc-prime {
  font-size: 1rem;
  color: #475569;
  line-height: 1.6;
  max-width: 280px;
}

.highlight-name {
  color: #0f172a;
  font-weight: 800;
}

.modal-subdesc-prime {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2.5rem;
}

.prime-modal-actions-compact {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
}

.btn-prime-danger-slim {
  background-color: #e11d48;
  color: white;
  padding: 0.45rem 1.25rem;
  border-radius: 9px;
  font-size: 0.8rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 10px rgba(225, 29, 72, 0.2);
  min-width: 120px;
}

.btn-prime-danger-slim:hover {
  background-color: #be123c;
  box-shadow: 0 6px 14px rgba(225, 29, 72, 0.3);
  transform: translateY(-1.5px);
}

.btn-prime-secondary-slim {
  background-color: #ffffff;
  color: #64748b;
  padding: 0.45rem 1.25rem;
  border-radius: 9px;
  font-size: 0.8rem;
  font-weight: 700;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 120px;
}

.btn-prime-secondary-slim:hover {
  background-color: #f8fafc;
  color: #1e293b;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}
</style>
