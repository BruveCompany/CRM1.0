<template>
  <!-- Modal de Reatribuição (Movido para fora da div .kanban-card para evitar conflitos de transform/hover) -->
  <BaseModal :modelValue="modelValue" @update:modelValue="$emit('update:modelValue', $event)">
    <template #header>
      <h3 class="text-lg font-bold text-neutral-900">Reatribuir Lead</h3>
    </template>

    <div class="reassign-modal-content">
      <p class="modal-subtitle">Selecione o novo vendedor para <strong>{{ leadName }}</strong>:</p>
      
      <div class="sellers-list-grid">
        <button 
          v-for="v in vendedores" 
          :key="v.id" 
          class="seller-selection-btn"
          @click="$emit('reassign', v.id, v.nome)"
        >
          <div class="seller-btn-info">
            <div class="seller-avatar-small" :style="{ backgroundColor: '#eef2ff', color: '#4f46e5' }">
              {{ getInitials(v.nome) }}
            </div>
            <span class="seller-name-atrib">{{ v.nome }}</span>
          </div>
          <Icon name="lucide:chevron-right" class="btn-arrow" />
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  leadName?: string;
  vendedores: any[];
}>();

const emit = defineEmits(['update:modelValue', 'reassign']);

const getInitials = (nome: string) => {
  if (!nome) return '?';
  const preposicoes = ['de', 'da', 'do', 'das', 'dos', 'e'];
  const parts = nome.trim().split(/\s+/)
    .filter(p => !preposicoes.includes(p.toLowerCase()));
  
  if (parts.length >= 2 && parts[0]?.[0] && parts[1]?.[0]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0] ? parts[0].substring(0, 2).toUpperCase() : '?';
};
</script>
