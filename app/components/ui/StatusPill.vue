<template>
  <span 
    :class="[
      'inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300',
    ]"
    :style="{ backgroundColor: config.bg, color: config.color }"
  >
    <div v-if="dot" class="w-1.5 h-1.5 rounded-full mr-2 animate-pulse" :style="{ backgroundColor: config.color }"></div>
    {{ displayName }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLeads } from '~/composables/useLeads';

const props = defineProps<{
  status: string;
  label?: string;
  dot?: boolean;
}>();

const { leadStatuses } = useLeads();

// Normaliza para comparação: 'Contato Feito' → 'contato_feito'
const normalize = (s: string) => String(s).toLowerCase().trim().replace(/\s+/g, '_');

const matchedStatus = computed(() => {
  const norm = normalize(props.status);
  return leadStatuses.value.find(s =>
    s.id.toLowerCase() === norm || normalize(s.display_name) === norm
  );
});

const config = computed(() => {
  const color = matchedStatus.value?.color_bg;
  if (!color) return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' };
  return {
    bg: `${color}22`, // ~13% opacidade como fundo
    color,
  };
});

const displayName = computed(() =>
  props.label || matchedStatus.value?.display_name || props.status
);
</script>
