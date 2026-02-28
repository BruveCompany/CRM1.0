<template>
  <div class="flex flex-col h-full bg-white relative">
    <!-- Header do Chat -->
    <header class="p-4 border-b border-neutral-100 flex items-center gap-3 bg-white z-10 shadow-sm">
      <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600 text-sm">
        {{ getAvatarLetters(contactData?.nome) }}
      </div>
      <div class="flex-1">
        <h2 class="font-bold text-neutral-900 leading-none mb-1">{{ contactData?.nome || 'Conversa Ativa' }}</h2>
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 bg-emerald-500 rounded-full"></span>
          <span class="text-[11px] text-neutral-400 font-medium">Online no WhatsApp</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button class="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 transition-colors">
          <Icon name="heroicons:phone" class="w-5 h-5" />
        </button>
        <button class="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 transition-colors">
          <Icon name="heroicons:ellipsis-vertical" class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- Área de Mensagens -->
    <div 
      ref="messageContainer" 
      class="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/50 flex flex-col custom-scrollbar scroll-smooth"
    >
      <div v-if="loadingMessages" class="flex flex-col gap-4 py-8 animate-pulse text-center text-neutral-300">
        Carregando histórico...
      </div>
      
      <div 
        v-for="(msg, index) in messages" 
        :key="msg.id"
        class="flex w-full"
        :class="msg.direcao === 'out' ? 'justify-end' : 'justify-start'"
      >
        <div 
          class="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm relative transition-all duration-300 transform opacity-0 translate-y-2 animate-slide-in"
          :class="msg.direcao === 'out' 
            ? 'bg-primary-600 text-white rounded-br-none shadow-lg shadow-primary-500/10' 
            : 'bg-white text-neutral-800 rounded-bl-none border border-neutral-100 shadow-sm'
          "
        >
          {{ msg.conteudo }}
          <div 
            class="text-[10px] mt-1 flex items-center justify-end gap-1 opacity-70"
            :class="msg.direcao === 'out' ? 'text-white/80' : 'text-neutral-400'"
          >
            {{ formatTime(msg.created_at) }}
            <Icon v-if="msg.direcao === 'out'" name="heroicons:check-badge" class="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>

    <!-- Barra de Input -->
    <div class="p-4 border-t border-neutral-100 bg-white">
      <div class="flex items-end gap-3 max-w-4xl mx-auto">
        <div class="flex-1 relative">
          <textarea 
            v-model="newMessage"
            @keydown.enter.prevent="sendMessage"
            rows="1"
            placeholder="Digite sua mensagem (Shift + Enter para pular linha)..."
            class="w-full pl-4 pr-12 py-3 bg-neutral-100 border-none rounded-2xl text-sm resize-none focus:ring-2 focus:ring-primary-500/20 transition-all max-h-32"
          ></textarea>
          <button class="absolute right-3 bottom-2.5 p-1.5 text-neutral-400 hover:text-primary-500 transition-colors">
            <Icon name="heroicons:paper-clip" class="w-5 h-5" />
          </button>
        </div>
        <button 
          @click="sendMessage"
          :disabled="!newMessage.trim() || sending"
          class="p-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 transition-all hover:scale-105 active:scale-95"
        >
          <Icon v-if="sending" name="svg-spinners:18-dots-indicator" class="w-5 h-5" />
          <Icon v-else name="heroicons:paper-airplane" class="w-6 h-6" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';

const props = defineProps<{ 
  conversaId: number; 
  contactData: any;
}>();

const supabase = useSupabaseClient();
const messages = ref<any[]>([]);
const newMessage = ref('');
const loadingMessages = ref(true);
const sending = ref(false);
const messageContainer = ref<HTMLElement | null>(null);

const fetchMessages = async () => {
  loadingMessages.value = true;
  try {
    const { data, error } = await (supabase
      .from('ag_chat') as any)
      .select('*')
      .eq('conversa_id', props.conversaId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    messages.value = data || [];
    await scrollToBottom();
  } catch (err) {
    console.error('Erro ao buscar mensagens:', err);
  } finally {
    loadingMessages.value = false;
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || sending.value) return;

  const content = newMessage.value.trim();
  newMessage.value = '';
  sending.value = true;

  try {
    // 1. Inserir no Chat
    const { data: insertData, error: insertError } = await (supabase
      .from('ag_chat') as any)
      .insert({
        conversa_id: props.conversaId,
        conteudo: content,
        direcao: 'out',
        status: 'sent'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // 2. Atualizar Conversa (ultima_mensagem_em)
    await (supabase
      .from('ag_conversas') as any)
      .update({ ultima_mensagem_em: new Date().toISOString() })
      .eq('id', props.conversaId);

  } catch (err) {
    console.error('Erro ao enviar mensagem:', err);
    newMessage.value = content; // Devolve p/ o input se falhar
  } finally {
    sending.value = false;
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

const subscribeToChat = () => {
  return (supabase as any)
    .channel(`chat-${props.conversaId}`)
    .on(
      'postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'ag_chat', filter: `conversa_id=eq.${props.conversaId}` }, 
      (payload: any) => {
        messages.value.push(payload.new);
        scrollToBottom();
      }
    )
    .subscribe();
};

const getAvatarLetters = (nome?: string) => {
  if (!nome || !nome.trim()) return '??';
  const parts = nome.trim().split(/\s+/);
  const first = parts[0] ? parts[0].charAt(0) : '';
  const second = parts[1] ? parts[1].charAt(0) : '';
  
  if (first && second) {
    return (first + second).toUpperCase();
  }
  return nome.trim().substring(0, 2).toUpperCase();
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

// Reiniciar o chat quando a conversaID mudar
watch(() => props.conversaId, () => {
  fetchMessages();
  // Reiniciar subscription se necessário
});

const chatSubscription = ref<any>(null);

onMounted(() => {
  fetchMessages();
  chatSubscription.value = subscribeToChat();
});

onUnmounted(() => {
  if (chatSubscription.value) chatSubscription.value.unsubscribe();
});
</script>

<style scoped>
.animate-slide-in {
  animation: slideIn 0.3s ease-out forwards;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
