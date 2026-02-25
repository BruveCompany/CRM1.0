<template>
  <div class="relative group">
    <!-- Dot / Icon -->
    <div 
      class="absolute -left-10 top-1 w-4 h-4 rounded-full border-4 border-white z-10 shadow-sm transition-all group-hover:scale-125"
      :class="typeConfig?.bg || 'bg-gray-200'"
    ></div>
    
    <div class="animate-in fade-in slide-in-from-left-2 duration-500">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{{ formatDate(props.activity?.date) }}</span>
        <div class="flex items-center gap-2">
          <Icon :name="typeConfig?.icon || 'lucide:activity'" class="w-3 h-3 text-gray-300" />
          <span class="text-[9px] font-medium text-gray-300 uppercase italic">{{ props.activity?.author || 'Sistema' }}</span>
        </div>
      </div>
      
      <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm group-hover:border-primary-100 group-hover:bg-gray-50/30 transition-all text-sm">
        <p class="font-semibold text-gray-900 leading-relaxed">{{ props.activity?.content }}</p>
        
        <div v-if="props.activity?.type === 'status'" class="mt-3 flex items-center gap-2">
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
    'activity': { icon: 'lucide:activity', bg: 'bg-gray-200 group-hover:bg-primary-500' },
    'note': { icon: 'lucide:sticky-note', bg: 'bg-amber-400 group-hover:bg-amber-500' },
    'message': { icon: 'lucide:message-circle', bg: 'bg-[#25D366] group-hover:bg-green-600' },
    'status': { icon: 'lucide:refresh-ccw', bg: 'bg-blue-400 group-hover:bg-blue-500' }
  };
  return configs[props.activity?.type] || configs['activity'];
});

function formatDate(date: any) {
  if (!date) return '';
  const d = new Date(date);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(d);
}
</script>
