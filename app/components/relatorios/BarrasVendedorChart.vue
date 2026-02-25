<template>
  <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5">
    <div class="flex items-center justify-between">
      <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
        <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
        Comparativo de Conversão
      </h3>
    </div>

    <div class="space-y-4">
      <div v-for="(vendedor, index) in sortedData" :key="vendedor.vendedor_id" class="group space-y-1.5">
        <div class="flex items-center justify-between text-[11px] font-bold">
            <div class="flex items-center gap-1.5 leading-none">
              <div v-if="index < 3" class="shrink-0 transition-all duration-300 group-hover:scale-125 group-hover:-translate-y-0.5">
                <img src="https://img.icons8.com/color/96/trophy.png" 
                  alt="Rank" 
                  class="w-6 h-7 object-contain scale-y-110"
                  :class="{
                    'brightness-110 contrast-110': index === 0,
                    'grayscale brightness-110 contrast-[1.5]': index === 1,
                    'sepia saturate-[1.8] hue-rotate-[-15deg] brightness-[0.8]': index === 2
                  }"
                />
              </div>
              <span class="text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{{ vendedor.vendedor_nome }}</span>
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
