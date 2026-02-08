<template>
  <Transition name="modal">
    <div 
      v-if="modelValue" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="$emit('update:modelValue', false)"
    >
      <div class="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 transform transition-all">
        <!-- Header -->
        <div class="px-5 py-3.5 flex items-center justify-between border-b border-gray-100">
          <slot name="header">
            <h3 class="text-lg font-semibold text-gray-900">Modal</h3>
          </slot>
          <button 
            @click="$emit('update:modelValue', false)" 
            class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
            type="button"
          >
            <span class="sr-only">Fechar</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Body -->
        <div class="px-5 py-4">
          <slot />
        </div>
        
        <!-- Footer (apenas se tiver conteúdo) -->
        <div v-if="$slots.footer" class="px-5 py-3 bg-gray-50 rounded-b-lg flex justify-end gap-2.5 border-t border-gray-100">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean }>()
defineEmits(['update:modelValue', 'confirmar', 'cancelar'])
import BaseButton from './BaseButton.vue'
</script>

<style scoped>
/* Animação do modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
  opacity: 0;
}
</style>
