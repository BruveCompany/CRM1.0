<template>
  <div class="group bg-white p-5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-100 hover:-translate-y-0.5 transition-all duration-300 cursor-default">
    <div class="flex items-start justify-between mb-4">
      <div class="space-y-0.5">
        <p class="text-[11px] font-medium text-slate-400 tracking-tight">{{ label }}</p>
        <h3 class="text-xl font-semibold text-slate-900 tracking-tight">
          {{ value }}<span v-if="suffix" class="text-xs font-normal text-slate-400 ml-0.5">{{ suffix }}</span>
        </h3>
      </div>
      
      <div class="text-slate-200 group-hover:text-primary-400 transition-colors duration-300">
        <Icon :name="iconName" class="w-4 h-4" />
      </div>
    </div>
    
    <!-- Tendência e Comparação Dinâmica -->
    <div v-if="variation !== undefined" class="flex items-center gap-1 opacity-80">
      <div 
        class="flex items-center text-[10px] font-bold"
        :class="{
          'text-emerald-500': variation > 0,
          'text-red-500': variation < 0,
          'text-neutral-500': variation === 0
        }"
      >
        <!-- Ícones Condicionais -->
        <Icon 
          v-if="variation > 0" 
          name="heroicons:solid:arrow-trending-up" 
          class="w-3 h-3 mr-0.5" 
        />
        <Icon 
          v-else-if="variation < 0" 
          name="heroicons:solid:arrow-trending-down" 
          class="w-3 h-3 mr-0.5" 
        />
        <Icon 
          v-else 
          name="heroicons:solid:minus" 
          class="w-3 h-3 mr-0.5" 
        />

        {{ Math.abs(variation).toFixed(1) }}%
      </div>
      <span class="text-[10px] font-normal text-slate-400">vs. período anterior</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  variation?: number; // Nova prop para variação percentual
  suffix?: string;
  iconName: string;
  iconBgColor: string;
  iconColorText: string;
}>();
</script>
