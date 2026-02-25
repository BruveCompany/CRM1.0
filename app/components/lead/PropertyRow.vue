<template>
  <div class="group py-3 border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/50 -mx-2 px-2 rounded-lg">
    <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1 group-hover:text-primary-500 transition-colors">
      {{ label }}
    </label>
    <div class="text-sm font-semibold text-gray-900 break-words">
      <slot>{{ value || 'Não informado' }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value?: string | number;
}>();
</script>
