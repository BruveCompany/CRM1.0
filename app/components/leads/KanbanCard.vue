<template>
  <div 
    class="kanban-card" 
    :style="{ '--column-color': columnColor }"
    draggable="true"
    @dragstart="$emit('dragstart', $event)"
    @click="openDetails(task.id)"
  >
    <!-- Menu de Ações Rápidas -->
    <div class="quick-actions-trigger" @click.stop="showActionsMenu = !showActionsMenu">
      <Icon name="lucide:more-vertical" class="action-icon" />
      
      <!-- Popover de Ações -->
      <div v-if="showActionsMenu" class="actions-popover" v-click-outside="() => showActionsMenu = false">
        <button 
          v-if="!task.vendedorNome || task.vendedorNome === 'Não Atribuído'" 
          class="action-item" 
          @click.stop="assignToMe"
        >
          <div class="icon-circle">
            <Icon name="lucide:user-plus" class="item-icon" />
          </div>
          <span>Atribuir a mim</span>
        </button>
        
        <button class="action-item" @click.stop="openReassignModal">
          <div class="icon-circle">
            <Icon name="lucide:users" class="item-icon" />
          </div>
          <span class="flex-1">Reatribuir</span>
          <Icon name="lucide:chevron-right" class="submenu-arrow" />
        </button>
      </div>
    </div>

    <!-- Modal de Reatribuição (Para evitar que fique atrás da coluna) -->
    <BaseModal 
      v-model="showReassignModal"
    >
      <template #header>
        <h3 class="text-lg font-bold text-neutral-900">Reatribuir Lead</h3>
      </template>

      <div class="reassign-modal-content">
        <p class="modal-subtitle">Selecione o novo vendedor para <strong>{{ task.leadName }}</strong>:</p>
        
        <div class="sellers-list-grid">
          <button 
            v-for="v in vendedores" 
            :key="v.id" 
            class="seller-selection-btn"
            @click="reassignTo(v.id, v.nome)"
          >
            <div class="seller-btn-info">
              <div class="seller-avatar-small" :style="{ backgroundColor: '#eef2ff', color: '#4f46e5' }">
                {{ v.nome.charAt(0).toUpperCase() }}
              </div>
              <span>{{ v.nome }}</span>
            </div>
            <Icon name="lucide:chevron-right" class="btn-arrow" />
          </button>
        </div>
      </div>
    </BaseModal>

    <div class="card-content">
      <div class="card-header">
        <h4 class="card-title">{{ task.leadName }}</h4>
        <div v-if="task.statusIcon" class="card-status-icon-wrapper" :style="{ 'border-color': columnColor }">
          <Icon :name="`lucide:${task.statusIcon}`" :class="`status-icon status-${task.statusIcon}`" :style="{ 'color': columnColor }" />
        </div>
      </div>
      <p class="card-phone-number">{{ task.phone }}</p>
      
      <div class="card-meta">
        <div class="card-meta-left">
          <div class="vendedor-avatar" :style="{ backgroundColor: 'color-mix(in srgb, ' + columnColor + ', white 60%)' }">
            <span>{{ task.avatarText || '??' }}</span>
          </div>
          <div class="vendedor-info">
            <span class="vendedor-nome">{{ task.vendedorNome || 'Não Atribuído' }}</span>
            <span v-if="task.lastActivityText" class="card-last-activity-small">{{ task.lastActivityText }}</span>
          </div>
        </div>
        <div class="card-meta-right">
          <div v-if="task.unreadMessages" class="card-unread-messages">
            <span class="message-count">{{ task.unreadMessages }}</span>
          </div>
          <div class="card-arrow-icon">
            <Icon name="lucide:chevron-right" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLeads } from '~/composables/useLeads';
import type { LeadTask } from '~/composables/useLeads';
import { useNotification } from '~/composables/useNotification';

const props = defineProps<{
  task: LeadTask;
  columnColor: string;
}>();

const { openDetails, fetchLeads, vendedores } = useLeads();
const { notifySuccess, notifyError } = useNotification();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const showActionsMenu = ref(false);
const showReassignModal = ref(false);

const openReassignModal = () => {
  showActionsMenu.value = false;
  showReassignModal.value = true;
};

const assignToMe = async () => {
  showActionsMenu.value = false;
  try {
    if (!user.value) throw new Error('Usuário não logado');
    
    const { data: profile } = await supabase
      .from('ag_profiles')
      .select('id')
      .eq('user_id', user.value.id)
      .single();
    
    if (!profile) throw new Error('Perfil não encontrado');

    const { error } = await (supabase.from('ag_leads') as any)
      .update({ vendedor_id: (profile as any).id })
      .eq('id', props.task.id);

    if (error) throw error;

    notifySuccess('Lead atribuído com sucesso!');
    await fetchLeads();
  } catch (err: any) {
    notifyError('Erro ao atribuir lead: ' + err.message);
  }
};

const reassignTo = async (vendedorId: string, vendedorNome: string) => {
  showActionsMenu.value = false;
  try {
    const { error } = await (supabase.from('ag_leads') as any)
      .update({ vendedor_id: vendedorId })
      .eq('id', props.task.id);

    if (error) throw error;

    notifySuccess(`Lead reatribuído para ${vendedorNome}`);
    await fetchLeads();
  } catch (err: any) {
    notifyError('Erro ao reatribuir lead: ' + err.message);
  }
};

// Diretiva simples para fechar ao clicar fora
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el: any) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  }
};

defineEmits(['dragstart']);
</script>

<style scoped>
.kanban-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 0;
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  cursor: grab;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  display: flex;
  align-items: stretch;
  border: 1px solid #e2e8f0;
  min-height: 100px;
  overflow: visible; /* Mudado para permitir o menu sair do card */
  user-select: none;
}

.kanban-card:hover {
  background-color: #fcfdfe;
  border-color: #cbd5e1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.quick-actions-trigger {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-actions-trigger:hover {
  background-color: #f1f5f9;
  color: #475569;
}

.action-icon {
  width: 14px;
  height: 14px;
}

/* --- Popover de Ações --- */
.actions-popover {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  padding: 0.4rem;
  min-width: 180px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.6rem;
  border: none;
  background: none;
  width: 100%;
  color: #475569;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.action-item:hover {
  background-color: #f8fafc;
  color: #4f46e5;
}

.icon-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #64748b;
  transition: all 0.2s;
}

.action-item:hover .icon-circle {
  background-color: #eef2ff;
  color: #4f46e5;
}

.item-icon {
  width: 0.9rem;
  height: 0.9rem;
}

.flex-1 { flex: 1; }

.has-submenu {
  justify-content: space-between;
}

.submenu-arrow {
  width: 12px;
  height: 12px;
  opacity: 0.4;
}

/* --- Modal de Reatribuição --- */
.reassign-modal-content {
  padding: 0.5rem 0;
}

.modal-subtitle {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 1.25rem;
}

.sellers-list-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.seller-selection-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.seller-selection-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateX(4px);
}

.seller-btn-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.seller-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
}

.seller-selection-btn span {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
}

.btn-arrow {
  width: 1.1rem;
  height: 1.1rem;
  color: #cbd5e1;
}

/* --- Resto do Estilo --- */
.card-content {
  flex-grow: 1;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.1rem;
  padding-right: 20px; /* Espaço para o menu */
}

.card-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: #334155;
  margin: 0;
}

.card-phone-number {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid color-mix(in srgb, var(--column-color), transparent 92%);
}

.card-meta-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vendedor-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.vendedor-info {
  display: flex;
  flex-direction: column;
}

.vendedor-nome {
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  line-height: 1.2;
}

.card-last-activity-small {
  font-size: 0.7rem;
  color: #94a3b8;
}

.card-meta-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-unread-messages {
  background-color: #dc2626;
  color: white;
  min-width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0 4px;
}

.card-status-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid transparent;
  background-color: white;
}

.status-icon {
  width: 1rem;
  height: 1rem;
}

.card-arrow-icon {
  color: #cbd5e1;
  display: flex;
  align-items: center;
}
</style>
