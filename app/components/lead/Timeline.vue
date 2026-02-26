<template>
  <div class="bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-[750px] overflow-hidden">
    <!-- Tabs -->
    <div class="flex items-center gap-6 px-8 pt-6 pb-2 border-b border-gray-100/50">
      <button 
        v-for="tab in [{id: 'ATIVIDADES', label: 'Atividades'}, {id: 'NOTAS', label: 'Notas'}, {id: 'MENSAGENS', label: 'Mensagens'}]" 
        :key="tab.id"
        @click="setFilter(tab.id)"
        :class="['text-[10px] font-bold uppercase tracking-widest pb-2 transition-all relative', activeFilter === tab.id ? 'active-tab text-primary-600' : 'text-slate-400 hover:text-slate-600']"
      >
        {{ tab.label }}
        <span v-if="activeFilter === tab.id" class="absolute bottom-0 left-0 w-full h-[2px] bg-primary-600 rounded-full animate-in fade-in slide-in-from-left-2"></span>
      </button>
    </div>

    <!-- Timeline Content -->
    <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div class="space-y-5">
        <!-- New Note Input -->
        <div class="relative group">
          <textarea 
            v-model="internalNote"
            placeholder="Anote algo importante sobre este lead..."
            class="w-full min-h-[100px] bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-primary-500/5 focus:border-primary-400 outline-none transition-all resize-none"
          ></textarea>
          <div class="absolute bottom-4 right-4 translate-y-2 opacity-0 group-focus-within:translate-y-0 group-focus-within:opacity-100 transition-all">
            <UiActionButton size="sm" @click="handleSave" class="scale-90 transform origin-right">Salvar Nota</UiActionButton>
          </div>
        </div>

        <!-- Timeline List -->
        <div v-if="filteredActivities.length > 0" class="relative pl-8 space-y-5">
          <div class="absolute left-0 top-2 bottom-0 w-[1px] bg-slate-100 border-l border-dashed border-slate-200"></div>
          <LeadTimelineItem 
            v-for="(activity, idx) in filteredActivities" 
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

// --- GERENCIAMENTO DE ESTADO ---
const activeFilter = ref('ATIVIDADES');

function setFilter(filterName: string) {
  activeFilter.value = filterName;
}

// --- LÓGICA DE FILTRAGEM ---
const filteredActivities = computed(() => {
  if (activeFilter.value === 'NOTAS') {
    return props.activities.filter(a => a.type === 'note');
  }
  if (activeFilter.value === 'MENSAGENS') {
    return props.activities.filter(a => a.type === 'message');
  }
  return props.activities; // 'ATIVIDADES' (todas)
});

function handleSave() {
  if (!internalNote.value.trim()) return;
  emit('add-note', internalNote.value);
  internalNote.value = '';
}
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(203, 213, 225, 0.4) transparent;
  overflow-x: hidden;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(203, 213, 225, 0.4);
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.6);
}

/* Estilo para Aba Ativa */
.active-tab {
  text-shadow: 0 0 1px currentColor; /* Leve negrito sem alterar largura */
  letter-spacing: 0.1em;
}
</style>
