<template>
  <span 
    :class="[
      'inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
    ]"
    :style="{ backgroundColor: config.bg, color: config.color }"
  >
    <div v-if="dot" class="w-1.5 h-1.5 rounded-full mr-2 animate-pulse" :style="{ backgroundColor: config.color }"></div>
    {{ label || status }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  status: string;
  label?: string;
  dot?: boolean;
}>();

const config = computed(() => {
  const statusMap: Record<string, { bg: string, color: string }> = {
    'leads_novos': { bg: 'rgba(52, 211, 153, 0.15)', color: '#34d399' },
    'em_negociacao': { bg: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' },
    'perdido': { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
    'ganho': { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }
  };

  return statusMap[props.status] || { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' };
});
</script>
