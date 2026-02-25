<template>
  <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-[750px] overflow-hidden">
    <!-- Tabs -->
    <div class="flex items-center gap-6 px-8 pt-8 pb-4 border-b border-gray-50">
      <button 
        v-for="tab in ['Atividades', 'Notas', 'Mensagens']" 
        :key="tab"
        @click="activeTab = tab"
        :class="['text-xs font-semibold uppercase tracking-widest pb-4 transition-all relative', activeTab === tab ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600']"
      >
        {{ tab }}
        <span v-if="activeTab === tab" class="absolute bottom-0 left-0 w-full h-[2px] bg-primary-600"></span>
      </button>
    </div>

    <!-- Timeline Content -->
    <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div class="space-y-8">
        <!-- New Note Input -->
        <div class="relative group">
          <textarea 
            v-model="internalNote"
            placeholder="Anote algo importante sobre este lead..."
            class="w-full min-h-[120px] bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-primary-500/5 focus:border-primary-400 outline-none transition-all resize-none"
          ></textarea>
          <div class="absolute bottom-4 right-4 translate-y-2 opacity-0 group-focus-within:translate-y-0 group-focus-within:opacity-100 transition-all">
            <UiActionButton size="sm" @click="handleSave">Salvar Nota</UiActionButton>
          </div>
        </div>

        <!-- Timeline List -->
        <div v-if="activities.length > 0" class="relative pl-8 space-y-10">
          <div class="absolute left-0 top-2 bottom-0 w-[1px] bg-slate-100 border-l border-dashed border-slate-200"></div>
          <LeadTimelineItem 
            v-for="(activity, idx) in activities" 
            :key="idx" 
            :activity="activity" 
          />
        </div>
        
        <div v-else class="text-center py-20 opacity-30 italic text-slate-400">
           Nenhuma atividade registrada ainda.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  activities: any[];
}>();

const emit = defineEmits(['add-note']);
const internalNote = ref('');
const activeTab = ref('Atividades');

function handleSave() {
  if (!internalNote.value.trim()) return;
  emit('add-note', internalNote.value);
  internalNote.value = '';
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
