<template>
  <div class="group bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-100 transition-all duration-300 cursor-default">
    <div class="flex items-start justify-between mb-2">
      <div class="space-y-0.5">
        <p class="text-[10px] font-medium text-slate-400 tracking-tight">{{ label }}</p>
        <h3 class="text-lg font-semibold text-slate-900 tracking-tight">
          {{ value }}<span v-if="suffix" class="text-xs font-normal text-slate-400 ml-0.5">{{ suffix }}</span>
        </h3>
      </div>
      
      <!-- Ícone sem fundo -->
      <div class="flex-shrink-0">
        <Icon 
          v-if="iconName"
          :name="iconName" 
          :class="['w-6 h-6', iconColorText]" 
        />
      </div>
    </div>
    
    <!-- Tendência (Estilo original restaurado) -->
    <div v-if="variation !== undefined" class="flex items-center gap-1 opacity-80">
      <div 
        class="flex items-center text-[10px] font-bold"
        :class="{
          'text-emerald-500': variation > 0,
          'text-rose-500': variation < 0,
          'text-slate-500': variation === 0 || variation == null
        }"
      >
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
        {{ variation != null ? Math.abs(variation).toFixed(1) : '0.0' }}%
      </div>
      <span class="text-[10px] font-normal text-slate-400">vs. período anterior</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  variation?: number;
  suffix?: string;
  iconName: string;
  iconBgColor: string;
  iconColorText: string;
}>();
</script>
