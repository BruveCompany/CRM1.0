<template>
  <div class="lead-list-view content-wrapper">
    <div class="table-container">
      <table>
        <thead>
          <tr class="bg-gray-50">
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">
              Nome do Lead
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
              Contato
            </th>
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">
              Status
            </th>
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
              Score
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
              Vendedor
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
              Atividade
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="filteredLeadsList.length === 0">
            <td colspan="7" class="px-6 py-12 text-center text-sm text-gray-500 font-medium">
              Nenhum lead encontrado estrategicamente.
            </td>
          </tr>
          <tr 
            v-for="lead in filteredLeadsList" 
            :key="lead.id" 
            class="hover:bg-neutral-50 transition-colors group"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <NuxtLink :to="`/leads/${lead.id}`" class="block group">
                <span class="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{{ lead.nome }}</span>
                <span v-if="lead.origem" class="block text-[10px] text-gray-400 font-medium uppercase tracking-tight mt-0.5">{{ lead.origem }}</span>
              </NuxtLink>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-col">
                <span class="text-sm text-gray-500 truncate max-w-[180px]">{{ lead.email || '-' }}</span>
                <span class="text-xs text-gray-400 font-medium">{{ lead.telefone || '-' }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-center">
              <UiStatusPill :status="lead.status" dot />
            </td>
            <td class="px-6 py-4 text-center">
              <div 
                v-if="lead.score"
                class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                :class="lead.score >= 50 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-600'"
              >
                {{ lead.score }}
              </div>
              <span v-else class="text-gray-300">-</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <div 
                  class="w-2 h-2 rounded-full" 
                  :class="lead.vendedorOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-gray-300'"
                ></div>
                <span class="text-sm text-gray-600">{{ lead.vendedor_nome || 'Não Atribuído' }}</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-xs font-medium text-gray-400 uppercase">
                {{ lead.ultima_mensagem_data ? formatRelativeTime(lead.ultima_mensagem_data) : 'N/A' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center justify-end gap-2">
                <NuxtLink 
                  :to="`/leads/${lead.id}`" 
                  class="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                  title="Ver Perfil 360°"
                >
                  <Icon name="heroicons:eye" class="w-5 h-5 stroke-[1.5]" />
                </NuxtLink>
                
                <button 
                  class="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                  @click.stop="openDetails(lead.id)"
                  title="Editar Lead"
                >
                  <Icon name="heroicons:pencil-square" class="w-5 h-5 stroke-[1.5]" />
                </button>

                <button 
                  v-if="isAdmin"
                  class="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  @click.stop="confirmDeleteLead(lead)"
                  title="Arquivar Lead"
                >
                  <Icon name="heroicons:trash" class="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>
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
// BaseModal é auto-importado no Nuxt 4, por isso foi removido daqui
// ref, watch, onMounted e etc também são auto-importados nativamente no Nuxt 4.

const { filteredLeadsList, formatRelativeTime, openDetails, fetchLeads } = useLeads();
const { notifySuccess, notifyError } = useNotification();
const { profile, checkIsAdmin } = useAuth();
const supabase = useSupabaseClient();

const isAdmin = ref(false);
const showConfirmDeleteModal = ref(false);
const leadToDelete = ref<LeadTask | null>(null);

// Monitora o perfil para atualizar admin status reativamente (Tarefa: Sincronismo de Permissões)
watch(() => profile.value, (newProf) => {
  if (newProf) {
    const role = newProf.role?.toLowerCase();
    if (role === 'admin' || role === 'administrador') {
      isAdmin.value = true;
    }
  }
}, { immediate: true });

onMounted(async () => {
  // 1. Tenta via RPC (mais seguro)
  isAdmin.value = await checkIsAdmin();
  
  // 2. Se falhar, o watch acima já cuidará da reatividade via profile
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

<style src="./LeadsTable.css" scoped></style>
