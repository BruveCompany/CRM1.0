<template>
  <Transition name="modal">
    <div 
      v-if="modelValue" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      :style="$attrs.class && String($attrs.class).includes('delete-modal-high-z') ? 'z-index: 100' : ''"
      @click.self="$emit('update:modelValue', false)"
    >
      <div 
        :class="['bg-white rounded-lg shadow-2xl w-full mx-4 transform transition-all flex flex-col max-h-[calc(100vh-2rem)]', maxWidthClass]"
        :style="$attrs.class && String($attrs.class).includes('delete-modal-high-z') ? 'z-index: 100' : ''"
      >
        <!-- Header -->
        <div v-if="!hideHeader" class="px-5 py-3.5 flex items-center justify-between border-b border-neutral-100 flex-shrink-0">
          <slot name="header">
            <h3 class="text-lg font-semibold text-neutral-900">Modal</h3>
          </slot>
          <button 
            @click="$emit('update:modelValue', false)" 
            class="text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg p-1.5 transition-colors"
            type="button"
          >
            <span class="sr-only">Fechar</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Body -->
        <div class="px-5 py-3 overflow-y-auto flex-1 min-h-0" style="-ms-overflow-style: none; scrollbar-width: none;">
          <slot />
        </div>
        
        <!-- Footer (apenas se tiver conteúdo) -->
        <div v-if="$slots.footer" class="px-5 py-3 bg-neutral-50 rounded-b-lg flex justify-end gap-2.5 border-t border-neutral-100 flex-shrink-0">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ 
  modelValue: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
  hideHeader?: boolean
}>(), {
  size: 'md',
  hideHeader: false
})

defineEmits(['update:modelValue', 'confirmar', 'cancelar'])

const maxWidthClass = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl'
  }
  return sizes[props.size] || 'max-w-md'
})

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
