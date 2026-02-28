<template>
  <div class="flex flex-col h-full bg-[#e5ddd5] relative chat-container">
    <!-- Header do Chat -->
    <header class="p-4 border-b border-neutral-100 flex items-center gap-3 bg-[#f0f2f5] z-10 shadow-sm chat-header">
      <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600 text-sm">
        {{ getAvatarLetters(contactData?.nome) }}
      </div>
      <div class="flex-1">
        <h2 class="font-bold text-neutral-900 leading-none mb-1">{{ contactData?.nome || 'Conversa Ativa' }}</h2>
        <div class="flex items-center gap-1.5 contact-status">
          <template v-if="isTyping">
            <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span class="typing-indicator font-medium">digitando...</span>
          </template>
          <template v-else>
            <span class="w-2 h-2 bg-emerald-500 rounded-full"></span>
            <span class="text-[11px] text-neutral-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Online no WhatsApp</span>
          </template>
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
          class="message-bubble transition-all duration-300 transform opacity-0 translate-y-2 animate-slide-in"
          :class="[
            msg.direcao === 'out' ? 'sent' : 'received'
          ]"
        >
          {{ msg.conteudo }}
          <div 
            class="message-meta"
          >
            {{ formatTime(msg.created_at) }}
            <span v-if="msg.direcao === 'out'" class="status-icon">
              <Icon v-if="msg.status === 'sending'" name="lucide:clock" class="w-3 h-3" />
              <Icon v-else-if="msg.status === 'sent'" name="lucide:check" class="w-3 h-3" />
              <Icon v-else-if="msg.status === 'delivered'" name="lucide:check-check" class="w-3 h-3" />
              <Icon v-else-if="msg.status === 'read'" name="lucide:check-check" class="w-3 h-3 status-read" />
              <!-- Fallback caso não tenha status definido ainda -->
              <Icon v-else name="lucide:check" class="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Barra de Input -->
    <div class="p-4 border-t border-neutral-100 bg-[#f0f2f5] chat-footer">
      <div class="flex items-center gap-3 w-full">
        <div class="flex items-center">
          <Icon name="heroicons:face-smile" class="footer-icon" />
          <QuickReplies @select="insertQuickReply" />
        </div>
        <div class="flex-1 relative chat-input-wrapper">
          <textarea 
            v-model="newMessage"
            @keydown.enter.prevent="sendMessage"
            @keydown="handleTyping"
            rows="1"
            placeholder="Digite uma mensagem"
            class="chat-input"
          ></textarea>
          <button class="absolute right-3 bottom-2.5 p-1.5 text-neutral-400 hover:text-primary-500 transition-colors">
            <Icon name="heroicons:paper-clip" class="w-5 h-5" />
          </button>
        </div>
        <button 
          @click="sendMessage"
          :disabled="!newMessage.trim() || sending"
          class="p-2 text-[#54656f] hover:text-primary-600 transition-all"
        >
          <Icon v-if="sending" name="svg-spinners:18-dots-indicator" class="w-6 h-6" />
          <Icon v-else :name="newMessage.trim() ? 'heroicons:paper-airplane' : 'heroicons:microphone'" class="w-7 h-7" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import QuickReplies from '~/components/chat/QuickReplies.vue';
import { useUserStore } from '~/stores/user';

const props = defineProps<{ 
  conversaId: number; 
  contactData: any;
}>();

const supabase = useSupabaseClient();
const userStore = useUserStore();
const messages = ref<any[]>([]);
const newMessage = ref('');
const loadingMessages = ref(true);
const sending = ref(false);
const messageContainer = ref<HTMLElement | null>(null);

// Estados para Digitando...
const isTyping = ref(false);
let typingTimer: any = null;
const currentProfileId = userStore.profile?.id;

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

const insertQuickReply = (content: string) => {
  newMessage.value = content;
};

/**
 * Gerencia a transmissão do estado "Digitando" via Supabase Broadcast.
 * Envia TYPING_START e agenda TYPING_STOP após 2 segundos de inatividade.
 */
const handleTyping = () => {
  if (!messagesChannel.value || !currentProfileId) return;

  // Cancela timer anterior para renovar o tempo
  if (typingTimer) clearTimeout(typingTimer);

  // Envia evento de início (Broadcast não salva no banco)
  messagesChannel.value.send({
    type: 'broadcast',
    event: 'TYPING_START',
    payload: { userId: currentProfileId }
  });

  // Agenda fim do estado após 2 segundos
  typingTimer = setTimeout(() => {
    messagesChannel.value.send({
      type: 'broadcast',
      event: 'TYPING_STOP',
      payload: { userId: currentProfileId }
    });
  }, 2000);
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
        // Se receber uma mensagem, cancela o "digitando" se estiver ativo
        isTyping.value = false;
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
const messagesChannel = ref<any>(null);

/**
 * Inscreve no canal de atualizações de status das mensagens.
 * Ouve eventos de UPDATE na tabela ag_chat para refletir lido/entregue em tempo real.
 */
const subscribeToStatusUpdates = () => {
  messagesChannel.value = (supabase as any)
    .channel('message-status-updates')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'ag_chat' },
      (payload: any) => {
        // Localiza a mensagem no array local e atualiza apenas o status
        const index = messages.value.findIndex(m => m.id === payload.new.id);
        if (index !== -1) {
          messages.value[index].status = payload.new.status;
        }
      }
    )
    // Ouve eventos de Broadcast para "Digitando"
    .on('broadcast', { event: 'TYPING_START' }, (payload: any) => {
      // Apenas mostra se for outro usuário
      if (payload.payload.userId !== currentProfileId) {
        isTyping.value = true;
      }
    })
    .on('broadcast', { event: 'TYPING_STOP' }, (payload: any) => {
      if (payload.payload.userId !== currentProfileId) {
        isTyping.value = false;
      }
    })
    .subscribe();
};

onMounted(() => {
  fetchMessages();
  chatSubscription.value = subscribeToChat();
  subscribeToStatusUpdates();
});

onUnmounted(() => {
  if (chatSubscription.value) chatSubscription.value.unsubscribe();
  if (messagesChannel.value) supabase.removeChannel(messagesChannel.value);
});
</script>

<style scoped>
/* Estilo WhatsApp Web */
.chat-container {
  background-color: #e5ddd5;
  background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d05f5395bb.png');
  background-repeat: repeat;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.chat-header, .chat-footer {
  background-color: #f0f2f5;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.chat-header {
  border-bottom: 1px solid #e9edef;
}

/* Balões de Mensagem */
.message-bubble {
  max-width: 65%;
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 1px 1px rgba(11, 20, 26, 0.1);
  word-wrap: break-word;
  margin-bottom: 4px;
  font-size: 0.9rem;
  position: relative;
  line-height: 1.4;
}

.message-bubble.received {
  background-color: #ffffff;
  align-self: flex-start;
  border-top-left-radius: 0;
}

.message-bubble.sent {
  background-color: #dcf8c6;
  align-self: flex-end;
  border-top-right-radius: 0;
}

/* Metadados */
.message-meta {
  float: right;
  margin-left: 10px;
  margin-top: 4px;
  font-size: 0.65rem;
  color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  gap: 3px;
}

.sent .message-meta {
  color: #667781;
}

/* Ícones de Status */
.status-icon {
  display: inline-flex;
  align-items: center;
  margin-left: 2px;
}

.status-read {
  color: #34b7f1;
}

/* Indicador de Digitando */
.contact-status {
  font-size: 11px;
  color: #667781;
}

.typing-indicator {
  color: #00a884; /* Verde WhatsApp */
  font-style: italic;
  font-size: 11px;
  animation: typing-fade 1.5s infinite ease-in-out;
}

@keyframes typing-fade {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* Rodapé e Input */
.footer-icon {
  color: #54656f;
  font-size: 1.5rem;
  margin: 0 8px;
  cursor: pointer;
  width: 24px;
  height: 24px;
}

.chat-input-wrapper {
  flex-grow: 1;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
}

.chat-input {
  border: none;
  width: 100%;
  font-size: 0.95rem;
  background-color: transparent;
  outline: none;
  resize: none;
  max-height: 120px;
  color: #41525d;
}

.chat-input:focus {
  outline: none;
}

/* Animações e Customizações */
.animate-slide-in {
  animation: slideIn 0.2s ease-out forwards;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.1);
  border-radius: 10px;
}
</style>
