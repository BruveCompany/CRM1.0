<template>
  <div class="flex flex-col h-full relative chat-area-root">
    <!-- Header do Chat -->
    <header class="p-4 border-b border-neutral-100 flex items-center gap-3 bg-[#f0f2f5] z-10 shadow-sm chat-header">
      <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600 text-sm">
        {{ getAvatarLetters(contactData?.nome) }}
      </div>
        <div class="flex items-center gap-2">
          <h2 class="font-bold text-neutral-900 leading-none">{{ contactData?.nome || 'Conversa Ativa' }}</h2>
          <!-- Seletor de Etapa (Apenas se for um Lead) -->
          <div v-if="contactData?.status" class="stage-selector-container">
            <div 
              class="stage-badge"
              :style="{ backgroundColor: currentStage?.color_bg || '#e2e8f0', color: currentStage?.color_text || '#64748b' }"
              @click="showStageSelector = !showStageSelector"
            >
              <Icon v-if="updatingStage" name="svg-spinners:18-dots-indicator" class="w-3 h-3 mr-1" />
              <span class="truncate max-w-[100px]">{{ currentStage?.display_name || 'Sem Etapa' }}</span>
              <Icon name="heroicons:chevron-down" class="w-3 h-3 ml-1" />
            </div>

            <!-- Dropdown das Etapas -->
            <div v-if="showStageSelector" class="stage-dropdown custom-scrollbar shadow-xl border border-neutral-100 animate-fade-in">
              <div class="p-2 border-b border-neutral-50 bg-neutral-50/10 mb-1">
                <p class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-1">Mover para...</p>
              </div>
              <ul>
                <li 
                  v-for="stage in availableStages" 
                  :key="stage.id"
                  @click="updateLeadStage(stage)"
                  class="flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 transition-colors"
                  :class="{ 'bg-primary-50/50': contactData?.status === stage.id }"
                >
                  <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: stage.color_bg }"></span>
                  <span class="text-sm font-medium flex-1" :style="{ color: stage.color_text }">{{ stage.display_name }}</span>
                  <Icon v-if="contactData?.status === stage.id" name="heroicons:check" class="w-4 h-4 text-primary-600" />
                </li>
              </ul>
            </div>
            <!-- Overlay para fechar ao clicar fora -->
            <div v-if="showStageSelector" class="fixed inset-0 z-10" @click="showStageSelector = false"></div>
          </div>
        </div>
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
      <div class="flex items-center gap-2">
        <button class="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 transition-colors">
          <Icon name="heroicons:phone" class="w-5 h-5" />
        </button>
        <button class="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 transition-colors">
          <Icon name="heroicons:ellipsis-vertical" class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- 2. Área de Mensagens (Transparente para mostrar o papel de parede do fundo) -->
    <div 
      ref="messageContainer" 
      class="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent flex flex-col custom-scrollbar scroll-smooth"
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

    <!-- Barra de Input (Pílula Única Estilo WhatsApp) -->
    <div class="chat-footer">
      <div class="chat-input-wrapper w-full">
        <!-- Ícones da Esquerda -->
        <div class="flex items-center gap-1 pl-1">
          <button class="footer-btn">
            <Icon name="heroicons:plus" class="w-6 h-6" />
          </button>
          <button class="footer-btn">
            <Icon name="heroicons:face-smile" class="w-6 h-6" />
          </button>
          <QuickReplies @select="insertQuickReply" />
        </div>

        <!-- Área de Texto -->
        <textarea 
          v-model="newMessage"
          @keydown.enter.prevent="sendMessage"
          @keydown="handleTyping"
          rows="1"
          placeholder="Digite uma mensagem"
          class="chat-input"
        ></textarea>

        <!-- Ícones da Direita -->
        <div class="flex items-center gap-1 pr-1">
          <button class="footer-btn">
            <Icon name="heroicons:paper-clip" class="w-5 h-5" />
          </button>
          <button 
            @click="sendMessage"
            :disabled="sending"
            class="footer-btn"
            :class="newMessage.trim() ? 'text-primary-600' : 'text-[#54656f]'"
          >
            <Icon v-if="sending" name="svg-spinners:18-dots-indicator" class="w-6 h-6" />
            <Icon v-else :name="newMessage.trim() ? 'heroicons:paper-airplane' : 'heroicons:microphone'" class="w-6 h-6" />
          </button>
        </div>
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

// Estados para Funil de Vendas (Kanban no Chat)
const availableStages = ref<any[]>([]);
const showStageSelector = ref(false);
const updatingStage = ref(false);

// Estados para Digitando...
const isTyping = ref(false);
let typingTimer: any = null;
const currentProfileId = userStore.profile?.id;

// Busca Etapas do Funil
const fetchStages = async () => {
  try {
    const { data, error } = await (supabase
      .from('ag_lead_statuses') as any)
      .select('id, display_name, color_bg, color_text')
      .order('order_index', { ascending: true });

    if (!error && data) {
      availableStages.value = data;
    }
  } catch (err) {
    console.error('Erro ao buscar etapas do funil:', err);
  }
};

// Atualiza a Etapa do Lead
const updateLeadStage = async (stage: any) => {
  if (!props.contactData?.id || updatingStage.value) return;
  if (props.contactData.status === stage.id) {
    showStageSelector.value = false;
    return;
  }

  updatingStage.value = true;
  try {
    const { error } = await (supabase
      .from('ag_leads') as any)
      .update({ status: stage.id })
      .eq('id', props.contactData.id);

    if (error) throw error;

    // Atualiza localmente para feedback instantâneo
    props.contactData.status = stage.id;
    
    // Opcional: Notificar sucesso?
  } catch (err) {
    console.error('Erro ao atualizar etapa do lead:', err);
  } finally {
    updatingStage.value = false;
    showStageSelector.value = false;
  }
};

// Computado para a etapa atual
const currentStage = computed(() => {
  if (!props.contactData?.status) return null;
  return availableStages.value.find(s => s.id === props.contactData.status);
});

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
  fetchStages(); // Carrega as etapas logo ao abrir o chat
  chatSubscription.value = subscribeToChat();
  subscribeToStatusUpdates();
});

onUnmounted(() => {
  if (chatSubscription.value) chatSubscription.value.unsubscribe();
  if (messagesChannel.value) supabase.removeChannel(messagesChannel.value);
});
</script>

<style scoped>
/* --- ESTILO WHATSAPP WEB UNIFICADO --- */

.chat-area-root {
  background-color: #e5ddd5 !important;
  background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d05f5395bb.png') !important;
  background-repeat: repeat !important;
  background-attachment: local !important;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.chat-footer {
  background-color: transparent !important;
  background-image: none !important;
  border: none !important;
  padding: 8px 16px 12px 16px; /* Ajuste para encostar mais na base */
  display: flex;
  align-items: center;
  flex-shrink: 0;
  z-index: 10;
  margin-top: auto; /* Garante que fique no final do container flex */
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

/* Seletor de Etapa (Funil) */
.stage-selector-container {
  position: relative;
  z-index: 20;
}

.stage-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  max-width: 140px;
}

.stage-badge:hover {
  filter: brightness(0.95);
  transform: translateY(-1px);
}

.stage-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: white;
  min-width: 180px;
  border-radius: 12px;
  padding: 4px;
  z-index: 50;
  max-height: 300px;
  overflow-y: auto;
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
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
  background-color: #ffffff;
  border-radius: 24px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  min-height: 48px;
}

.chat-input {
  border: none;
  flex: 1;
  font-size: 0.95rem;
  background-color: transparent;
  outline: none;
  resize: none;
  max-height: 120px;
  padding: 10px 4px;
  color: #41525d;
  line-height: 1.2;
}

.footer-btn {
  padding: 8px;
  color: #54656f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.footer-btn:hover {
  background-color: #f0f2f5;
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
