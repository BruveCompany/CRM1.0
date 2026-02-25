<template>
  <div :class="['rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden relative group', padding ? 'p-8' : '', !($attrs.class as string)?.includes('bg-') ? 'bg-white' : '']">
    <!-- Efeito de hover sutil -->
    <div v-if="hoverEffect" class="absolute inset-0 bg-primary-50/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    
    <div v-if="title || $slots.header" class="mb-6 flex items-center justify-between relative z-10">
      <slot name="header">
        <h2 class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Icon v-if="icon" :name="icon" class="w-4 h-4 opacity-70" />
          {{ title }}
        </h2>
      </slot>
      <slot name="header-action" />
    </div>

    <div class="relative z-10">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  icon?: string;
  padding?: boolean;
  hoverEffect?: boolean;
}>();
</script>
