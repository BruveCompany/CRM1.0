<template>
  <div class="activity-timeline-wrapper flex flex-col h-full overflow-hidden">
    <div class="flex items-center justify-between mb-2 px-1">
      <h5 class="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Anotação e Histórico</h5>
      <div v-if="loading" class="animate-spin text-neutral-300">
        <Icon name="lucide:loader-2" class="w-3 h-3" />
      </div>
    </div>

    <!-- Formulário de Nova Nota -->
    <div class="new-note-form bg-white p-2.5 rounded-xl border border-indigo-100/40 mb-3 shadow-sm shrink-0">
      <textarea 
        v-model="newNoteContent" 
        placeholder="Digite aqui anotações rápidas..."
        rows="3"
        class="w-full bg-transparent border-none focus:ring-0 text-[11px] resize-none italic text-neutral-600 placeholder:text-neutral-300 leading-normal"
        @keydown.ctrl.enter="addNote"
      ></textarea>
      <div class="flex justify-end mt-1">
        <button 
          @click="addNote" 
          :disabled="isSavingNote || !newNoteContent.trim()"
          class="px-3 py-1 bg-[#00a884] text-white rounded-lg text-[10px] font-bold transition-all hover:bg-[#008f6f] shadow-sm disabled:opacity-50 flex items-center gap-1.5"
        >
          <Icon v-if="isSavingNote" name="lucide:loader-2" class="w-3 h-3 animate-spin" />
          <span>{{ isSavingNote ? 'Salvando...' : 'Salvar Nota' }}</span>
        </button>
      </div>
    </div>

    <!-- Lista de Atividades (Scrollable) -->
    <div class="notes-list-container flex-1 overflow-y-auto scrollbar-none space-y-3 pr-1">
      <div v-if="loading && items.length === 0" class="flex flex-col items-center justify-center py-8 gap-2 opacity-20">
        <Icon name="svg-spinners:ring-resize" class="w-6 h-6" />
        <p class="text-[10px] font-bold uppercase tracking-widest">Carregando histórico...</p>
      </div>

      <div v-else-if="items.length === 0" class="text-center py-10 opacity-30">
        <Icon name="lucide:sticky-note" class="w-8 h-8 mx-auto mb-2 text-neutral-300" />
        <p class="text-[10px] font-bold uppercase tracking-widest">Sem anotações no histórico</p>
      </div>

      <div v-else class="space-y-3 pb-4">
        <div 
          v-for="item in items" 
          :key="item.id" 
          class="sidebar-note-item bg-white p-3 rounded-xl border border-neutral-100 shadow-sm hover:border-primary-100 transition-all group"
        >
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
              <span class="text-[10px] font-bold text-neutral-700">{{ item.author?.nome || 'Profissional' }}</span>
            </div>
            <span class="text-[8px] text-neutral-400 font-medium">{{ formatDate(item.criado_em) }}</span>
          </div>
          <p class="text-[11px] text-neutral-600 leading-relaxed">{{ item.conteudo }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useSupabaseClient } from '#imports';

const props = defineProps<{
  lead: any;
}>();

const supabase = useSupabaseClient();

const items = ref<any[]>([]);
const loading = ref(false);
const isSavingNote = ref(false);
const newNoteContent = ref('');

// --- BUSCA DE DADOS ---
async function fetchTimeline() {
  if (!props.lead?.id) return;
  
  loading.value = true;
  try {
    const { data, error } = await (supabase
      .from('ag_notas_internas') as any)
      .select(`
        id,
        conteudo,
        criado_em,
        author:ag_profiles(nome)
      `)
      .eq('lead_id', props.lead.id)
      .order('criado_em', { ascending: false });

    if (error) throw error;
    items.value = data || [];
    
  } catch (err) {
    console.error('[Timeline] Erro ao carregar notas:', err);
  } finally {
    loading.value = false;
  }
}

// --- ADICIONAR NOTA ---
async function addNote() {
  const content = newNoteContent.value.trim();
  if (!content || !props.lead?.id || isSavingNote.value) return;

  isSavingNote.value = true;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado.");

    // Busca o ID do perfil na tabela ag_profiles
    const { data: profile, error: profileError } = await (supabase
      .from('ag_profiles') as any)
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) throw new Error("Perfil do profissional não encontrado.");

    const { error } = await (supabase
      .from('ag_notas_internas') as any)
      .insert({
        lead_id: props.lead.id,
        profissional_id: profile.id,
        conteudo: content
      });

    if (error) throw error;

    newNoteContent.value = '';
    await fetchTimeline();
  } catch (err) {
    console.error('[Timeline] Erro ao salvar nota:', err);
  } finally {
    isSavingNote.value = false;
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ' ' + 
         date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

onMounted(() => {
  fetchTimeline();
});

watch(() => props.lead?.id, () => {
  items.value = [];
  fetchTimeline();
});
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.sidebar-note-item {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-note-item:hover {
  transform: translateX(2px);
}
</style>
