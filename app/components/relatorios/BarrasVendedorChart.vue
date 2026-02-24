<template>
  <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5">
    <div class="flex items-center justify-between">
      <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
        <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
        Comparativo de Conversão
      </h3>
    </div>

    <div class="space-y-4">
      <div v-for="vendedor in sortedData" :key="vendedor.vendedor_id" class="group space-y-1.5">
        <div class="flex items-center justify-between text-[11px] font-bold">
          <div class="flex items-center gap-2">
            <img 
              v-if="vendedor.vendedor_avatar" 
              :src="vendedor.vendedor_avatar" 
              class="w-5 h-5 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all"
            />
            <span class="text-slate-600 group-hover:text-slate-900 transition-colors">{{ vendedor.vendedor_nome }}</span>
          </div>
          <span :class="getTextColor(vendedor.taxa_conversao)">{{ (vendedor.taxa_conversao || 0).toFixed(1) }}%</span>
        </div>
        <div class="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-50/50">
          <div 
            class="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
            :class="getBarColor(vendedor.taxa_conversao)"
            :style="{ width: `${Math.min(vendedor.taxa_conversao || 0, 100)}%` }"
          ></div>
        </div>
      </div>
      
      <div v-if="data.length === 0" class="py-10 text-center">
        <p class="text-[10px] font-medium text-slate-300">Aguardando dados para comparação...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  data: any[];
}>();

const sortedData = computed(() => {
  return [...props.data].sort((a, b) => (b.taxa_conversao || 0) - (a.taxa_conversao || 0));
});

const getBarColor = (taxa: number) => {
  if (taxa >= 25) return 'bg-gradient-to-r from-emerald-400 to-emerald-500';
  if (taxa >= 10) return 'bg-gradient-to-r from-amber-400 to-amber-500';
  return 'bg-gradient-to-r from-rose-400 to-rose-500';
};

const getTextColor = (taxa: number) => {
  if (taxa >= 25) return 'text-emerald-600';
  if (taxa >= 10) return 'text-amber-600';
  return 'text-rose-600';
};
</script>
