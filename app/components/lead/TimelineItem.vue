<template>
  <div class="relative group">
    <!-- Activity Icon Indicator -->
    <div 
      class="absolute -left-[42px] top-1 w-6 h-6 rounded-full border-2 border-white z-20 shadow-sm flex items-center justify-center transition-all group-hover:scale-110"
      :class="typeConfig?.bg || 'bg-slate-200'"
    >
      <Icon :name="typeConfig?.icon || 'heroicons:information-circle'" class="w-3.5 h-3.5 text-white" />
    </div>
    
    <div class="animate-in fade-in slide-in-from-left-2 duration-500">
      <div class="flex items-center justify-between mb-1">
        <span class="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{{ formatDate(props.activity?.date) }}</span>
        <div class="flex items-center gap-2">
          <span class="text-[9px] font-bold text-gray-300 uppercase italic opacity-0 group-hover:opacity-100 transition-opacity">{{ props.activity?.author || 'Sistema' }}</span>
        </div>
      </div>
      
      <div class="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm group-hover:border-primary-100 group-hover:bg-gray-50/20 transition-all text-sm">
        <p class="font-medium text-gray-900 leading-relaxed">{{ props.activity?.content }}</p>
        
        <div v-if="props.activity?.type === 'status'" class="mt-2 flex items-center gap-2">
          <span class="text-[10px] font-semibold text-gray-400 uppercase tracking-tighter">Novo Status:</span>
          <UiStatusPill :status="props.activity?.metadata" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  activity: any;
}>();

const typeConfig = computed(() => {
  const configs: Record<string, { icon: string, bg: string }> = {
    'activity': { icon: 'heroicons:information-circle', bg: 'bg-slate-400' },
    'note': { icon: 'heroicons:pencil-square', bg: 'bg-yellow-500' },
    'message': { icon: 'heroicons:chat-bubble-left-right', bg: 'bg-green-500' },
    'status': { icon: 'heroicons:tag', bg: 'bg-blue-500' },
    'call': { icon: 'heroicons:phone', bg: 'bg-purple-500' }
  };
  return configs[props.activity?.type] || configs['activity'];
});

function formatDate(date: any) {
  if (!date) return '';
  const d = new Date(date);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(d);
}
</script>
