
<!-- ================= ModalConfirmacao ================= -->
<template>
  <BaseModal :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)">
    <template #header>
      <div class="flex flex-col items-start">
        <h3 class="text-lg font-bold text-black">{{ titulo || 'Confirmar Exclusão' }}</h3>
        <div class="text-xl font-bold text-black mt-1">Deletar Especialidade</div>
      </div>
    </template>
    <div class="py-2 px-2">
      <div class="flex items-start mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-500 mt-1 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 11-12.728 0M12 9v2m0 4h.01" /></svg>
        <div>
          <span class="font-semibold text-red-600 text-base">
            <span v-if="mensagem" v-html="mensagem"></span>
            <span v-else>Tem certeza que deseja continuar?</span>
          </span>
        </div>
      </div>
      <div class="text-black text-base font-semibold mt-2 ml-11">Esta ação não pode ser desfeita.</div>
    </div>
    <template #footer>
      <BaseButton class="!bg-green-600 !text-white hover:!bg-green-700 min-w-[110px]" @click="onCancelar" :disabled="loading">Cancelar</BaseButton>
      <BaseButton class="!bg-red-600 !text-white hover:!bg-red-700 min-w-[110px]" @click="onConfirmar" :loading="loading">Deletar</BaseButton>
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
