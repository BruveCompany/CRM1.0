<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
      <div class="border-b px-6 py-4 flex items-center justify-between">
        <slot name="header">
          <h3 class="text-lg font-semibold">Modal</h3>
        </slot>
        <button @click="$emit('update:modelValue', false)" class="text-gray-400 hover:text-gray-600">
          <span class="sr-only">Fechar</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div class="px-6 py-4">
        <slot />
      </div>
      <div class="border-t px-6 py-3 flex justify-end gap-2">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean }>()
defineEmits(['update:modelValue', 'confirmar', 'cancelar'])
import BaseButton from './BaseButton.vue'
</script>
