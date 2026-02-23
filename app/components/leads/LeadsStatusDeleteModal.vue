<script setup lang="ts">
import { ref, computed } from 'vue';
import { useLeads } from '~/composables/useLeads';
import type { LeadStatus } from '~/composables/useLeads';

const props = defineProps<{
    modelValue: boolean;
    statusToDelete: LeadStatus | null;
}>();

const emit = defineEmits(['update:modelValue', 'deleted']);

const { leadStatuses, allLeads, deleteStatus } = useLeads();
const isDeleting = ref(false);
const reassignToId = ref('');
const errorMsg = ref('');

// Filtra os leads que pertencem ao status que será deletado
const affectedLeads = computed(() => {
    if (!props.statusToDelete) return [];
    return allLeads.value.filter(l => String(l.status) === String(props.statusToDelete?.id));
});

// Outros status disponíveis para reatribuição (excluindo o atual)
const otherStatuses = computed(() => {
    return leadStatuses.value.filter(s => s.id !== props.statusToDelete?.id);
});

const handleClose = () => {
    emit('update:modelValue', false);
    reassignToId.value = '';
    errorMsg.value = '';
};

const confirmDelete = async () => {
    if (!props.statusToDelete) return;
    
    if (affectedLeads.value.length > 0 && !reassignToId.value) {
        errorMsg.value = 'Selecione um status de destino para os leads.';
        return;
    }

    isDeleting.value = true;
    errorMsg.value = '';
    
    try {
        const { error } = await deleteStatus(props.statusToDelete.id, reassignToId.value);
        if (error) throw error;
        
        emit('deleted');
        handleClose();
    } catch (err: any) {
        errorMsg.value = 'Erro ao excluir: ' + err.message;
    } finally {
        isDeleting.value = false;
    }
};
</script>

<template>
  <BaseModal 
    :model-value="modelValue" 
    @update:model-value="handleClose" 
    size="md"
    class="delete-modal-high-z"
  >
    <template #header>
      <div class="delete-header">
        <div class="alert-icon-circle">
          <Icon name="lucide:alert-triangle" />
        </div>
        <div class="header-texts">
          <h3 class="title">Excluir Status</h3>
          <p class="subtitle">Esta ação não poderá ser desfeita</p>
        </div>
      </div>
    </template>

    <div class="delete-content">
      <div class="status-info-box">
        <p class="desc">
          Você está removendo a coluna: 
          <span class="status-pill" :style="{ background: statusToDelete?.color_bg + '20', color: statusToDelete?.color_bg }">
            {{ statusToDelete?.display_name }}
          </span>
        </p>
      </div>

      <!-- Alerta de Leads Afetados -->
      <div v-if="affectedLeads.length > 0" class="leads-warning-box">
        <div class="warning-header">
          <Icon name="lucide:users" class="icon" />
          <span>{{ affectedLeads.length }} leads detectados</span>
        </div>
        
        <p class="warning-msg">
          Todos os leads nesta coluna precisam ser movidos para outro status antes da exclusão.
        </p>

        <div class="reassign-field">
          <label>Mover leads para:</label>
          <select v-model="reassignToId" class="prime-select">
            <option value="" disabled>Selecione o destino...</option>
            <option v-for="s in otherStatuses" :key="s.id" :value="s.id">
              {{ s.display_name }}
            </option>
          </select>
        </div>
      </div>

      <div v-else class="empty-warning">
        <Icon name="lucide:shield-check" />
        <span>Nenhum lead será afetado por esta exclusão.</span>
      </div>

      <p v-if="errorMsg" class="error-alert">
        <Icon name="lucide:x-circle" />
        {{ errorMsg }}
      </p>
    </div>

    <template #footer>
      <div class="delete-footer-actions">
        <button class="btn-cancel" @click="handleClose">Desistir</button>
        <button 
          class="btn-confirm-delete" 
          @click="confirmDelete"
          :disabled="isDeleting || (affectedLeads.length > 0 && !reassignToId)"
        >
          <Icon v-if="isDeleting" name="lucide:loader-2" class="animate-spin" />
          <Icon v-else name="lucide:trash-2" />
          {{ isDeleting ? 'Excluindo...' : 'Confirmar Exclusão' }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.delete-modal-high-z {
  z-index: 100;
}

.delete-header { display: flex; align-items: center; gap: 1rem; }
.alert-icon-circle {
  width: 42px; height: 42px;
  background: #fef2f2; color: #ef4444;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem;
}

.header-texts { display: flex; flex-direction: column; }
.title { font-size: 1.1rem; font-weight: 800; color: #1e293b; margin: 0; }
.subtitle { font-size: 0.75rem; color: #64748b; margin: 0; }

.delete-content { padding: 0.5rem 0; }
.status-info-box { margin-bottom: 1.25rem; }
.desc { font-size: 0.9rem; color: #475569; display: flex; align-items: center; gap: 0.5rem; }
.status-pill { padding: 2px 10px; border-radius: 20px; font-weight: 800; font-size: 0.85rem; }

.leads-warning-box {
  background: #fffbeb;
  border: 1.5px solid #fde68a;
  border-radius: 14px;
  padding: 1rem;
}

.warning-header { display: flex; align-items: center; gap: 0.5rem; color: #92400e; font-weight: 800; font-size: 0.9rem; margin-bottom: 0.5rem; }
.warning-msg { font-size: 0.8rem; color: #92400e; opacity: 0.9; line-height: 1.4; margin-bottom: 1rem; }

.reassign-field label { display: block; font-size: 0.7rem; font-weight: 800; color: #92400e; text-transform: uppercase; margin-bottom: 0.4rem; }
.prime-select {
  width: 100%; padding: 0.6rem; border-radius: 8px; border: 1.5px solid #fcd34d;
  background: white; font-size: 0.85rem; font-weight: 600; outline: none;
}

.empty-warning {
  background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px;
  padding: 0.75rem; color: #166534; font-size: 0.85rem;
  display: flex; align-items: center; gap: 0.6rem; font-weight: 600;
}

.error-alert {
  margin-top: 1rem; background: #fff1f2; color: #e11d48;
  padding: 0.75rem; border-radius: 10px; font-size: 0.8rem;
  font-weight: 600; display: flex; align-items: center; gap: 0.5rem;
}

.delete-footer-actions { display: flex; gap: 0.75rem; width: 100%; justify-content: flex-end; }
.btn-cancel { padding: 0.7rem 1.25rem; border-radius: 10px; font-weight: 700; color: #64748b; background: #f1f5f9; border: none; cursor: pointer; }
.btn-confirm-delete {
  padding: 0.7rem 1.5rem; border-radius: 10px; font-weight: 800; color: white;
  background: #ef4444; border: none; cursor: pointer;
  display: flex; align-items: center; gap: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2);
}

.btn-confirm-delete:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
