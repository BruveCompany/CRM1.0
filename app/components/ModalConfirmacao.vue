
<!-- ================= ModalConfirmacao ================= -->
<template>
  <BaseModal :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900">
        {{ titulo || 'Excluir Especialidade' }}
      </h3>
    </template>
    
    <div class="space-y-3">
      <div class="flex items-start gap-3.5">
        <div class="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-900">
            <span v-if="mensagem" v-html="mensagem"></span>
            <span v-else>Tem certeza que deseja continuar?</span>
          </p>
          <p class="text-xs text-gray-600 mt-1.5">Esta ação não pode ser desfeita.</p>
        </div>
      </div>
    </div>
    
    <template #footer>
      <BaseButton 
        variant="secondary" 
        @click="onCancelar" 
        :disabled="loading"
      >
        Cancelar
      </BaseButton>
      <BaseButton 
        class="!bg-red-600 !text-white hover:!bg-red-700" 
        @click="onConfirmar" 
        :loading="loading"
      >
        Excluir
      </BaseButton>
    </template>
  </BaseModal>
</template>


<!-- ================= Script ================= -->
<script setup lang="ts">
// Imports
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

// Props e emits
const props = defineProps<{
  modelValue: boolean
  titulo?: string
  mensagem?: string
  loading?: boolean
}>()
const emit = defineEmits(['update:modelValue', 'confirmar', 'cancelar'])

// Funções
function onConfirmar() {
  emit('confirmar')
}
function onCancelar() {
  emit('cancelar')
  emit('update:modelValue', false)
}
</script>
