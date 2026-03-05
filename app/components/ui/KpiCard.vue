<template>
  <div class="kpi-card bg-white p-6 rounded-xl border border-neutral-200 shadow-soft hover:shadow-medium transition-shadow duration-300 group">
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <p class="text-xs font-semibold text-neutral-400 mb-1 tracking-wider uppercase">{{ title }}</p>
        <div class="flex items-baseline gap-1">
          <h3 class="text-2xl font-bold text-neutral-900">{{ value }}</h3>
          <span v-if="suffix" class="text-sm font-semibold text-neutral-400">{{ suffix }}</span>
        </div>
        
        <!-- Variação (opcional) -->
        <div v-if="variation !== undefined" class="flex items-center gap-1 mt-1">
          <div :class="['flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold', variation >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600']">
            <ClientOnly>
              <Icon :name="variation >= 0 ? 'heroicons:arrow-trending-up' : 'heroicons:arrow-trending-down'" class="w-3 h-3" />
            </ClientOnly>
            {{ Math.abs(variation).toFixed(1) }}%
          </div>
        </div>
      </div>

      <div 
        v-if="icon" 
        :class="[
          'p-3 rounded-lg transition-all duration-300 group-hover:scale-110', 
          colorClasses || 'bg-primary-50 text-primary-600'
        ]"
      >
        <ClientOnly>
          <Icon :name="icon" class="w-6 h-6 custom-icon" />
          <template #fallback>
            <div class="w-6 h-6" />
          </template>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Componente Unificado de Card de KPI
 */
interface Props {
  title: string
  value: string | number
  icon?: string
  suffix?: string
  variation?: number
  colorClasses?: string // Ex: 'bg-emerald-50 text-emerald-600'
}

defineProps<Props>()
</script>

<style scoped>
@keyframes scale-in-subtle {
  0% { transform: scale(0.98); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}



.custom-icon :deep(svg) {
  stroke-width: 1.0px !important;
}
</style>
