<template>
  <div class="flex h-full w-full overflow-hidden bg-white">
    <!-- Coluna Central: Área de Conversa (Design WhatsApp Official) -->
    <div class="flex-1 flex flex-col relative chat-area-root">
      <!-- 1. Header do Chat (Slim) -->
      <header class="py-2.5 px-4 border-b border-neutral-100 flex items-center justify-between bg-[#f0f2f5] z-10 shadow-sm chat-header">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600 text-sm">
            {{ getAvatarLetters(contactData?.nome) }}
          </div>
          <div class="flex flex-col">
            <h2 class="font-bold text-neutral-900 leading-none">{{ contactData?.nome || 'Conversa Ativa' }}</h2>
            <div class="flex items-center gap-1.5 contact-status mt-1">
              <template v-if="isTyping">
                <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span class="typing-indicator font-medium">digitando...</span>
              </template>
              <template v-else>
                <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span class="text-[10px] text-neutral-400 font-medium">Visto por último hoje</span>
              </template>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button class="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 transition-colors">
            <Icon name="heroicons:magnifying-glass" class="w-5 h-5" />
          </button>
          <button @click="toggleLeadPanel" class="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 transition-colors" :class="{ 'text-primary-600 bg-primary-50': isLeadPanelVisible }">
            <Icon name="lucide:sidebar" class="w-5 h-5" />
          </button>
          <button class="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 transition-colors">
            <Icon name="heroicons:ellipsis-vertical" class="w-5 h-5" />
          </button>
        </div>
      </header>

      <div 
        ref="messageContainer" 
        class="flex-1 overflow-y-auto p-4 space-y-2 bg-transparent flex flex-col justify-end custom-scrollbar scroll-smooth"
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
            class="message-bubble animate-slide-in shadow-sm"
            :class="[
              msg.direcao === 'out' ? 'sent' : 'received'
            ]"
          >
            {{ msg.conteudo }}
            <div class="message-meta">
              {{ formatTime(msg.created_at) }}
              <span v-if="msg.direcao === 'out'" class="status-icon">
                <Icon v-if="msg.status === 'sending'" name="lucide:clock" class="w-3 h-3" />
                <Icon v-else-if="msg.status === 'sent'" name="lucide:check" class="w-3 h-3" />
                <Icon v-else-if="msg.status === 'delivered'" name="lucide:check-check" class="w-3 h-3" />
                <Icon v-else-if="msg.status === 'read'" name="lucide:check-check" class="w-3 h-3 status-read" />
                <Icon v-else name="lucide:check" class="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Rodapé do Chat -->
      <div class="chat-footer">
        <div class="chat-input-wrapper w-full">
          <!-- Ícones da Esquerda -->
          <div class="flex items-center gap-1 pl-1">
            <button class="footer-btn">
              <Icon name="heroicons:plus" class="w-6 h-6 text-[#54656f]" />
            </button>
            <button class="footer-btn">
              <Icon name="heroicons:face-smile" class="w-6 h-6 text-[#54656f]" />
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
              <Icon name="heroicons:paper-clip" class="w-5 h-5 text-[#54656f]" />
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

    <!-- Coluna 3: Painel do Lead (Consolidado e Modular) -->
    <LeadDetailPanel 
      v-if="isLeadPanelVisible" 
      :lead="contactData" 
      @close="toggleLeadPanel"
      @updated="$emit('updated')"
    />
  </div>
</template>

<script setup lang="ts">
import QuickReplies from '~/components/chat/QuickReplies.vue';
import BaseModal from '~/components/BaseModal.vue';
import ModalNovoAgendamento from '~/components/agendamentos/ModalNovoAgendamento.vue';
import NovaTarefaModal from '~/components/lead/NovaTarefaModal.vue';
import LeadActivityTimeline from '~/components/leads/LeadActivityTimeline.vue';
import LeadDetailPanel from '~/components/leads/LeadDetailPanel.vue';
import { useUserStore } from '~/stores/user';
import { useProfissionais } from '~/composables/useProfissionais';

const props = defineProps<{ 
  conversaId: any; 
  contactData: any;
}>();

const emit = defineEmits(['updated', 'refresh']);

const supabase = useSupabaseClient();
const userStore = useUserStore();
const messages = ref<any[]>([]);
const newMessage = ref('');
const loadingMessages = ref(true);
const sending = ref(false);
const messageContainer = ref<HTMLElement | null>(null);

const isLeadPanelVisible = ref(true);

const currentProfileId = userStore.profile?.id;
const isTyping = ref(false);
let typingTimer: any = null;

function toggleLeadPanel() {
  isLeadPanelVisible.value = !isLeadPanelVisible.value;
}

async function fetchMessages() {
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
}

async function sendMessage() {
  if (!newMessage.value.trim() || sending.value) return;

  const contentText = newMessage.value.trim();
  newMessage.value = '';
  sending.value = true;

  try {
    const { data: insertData, error: insertError } = await (supabase
      .from('ag_chat') as any)
      .insert({
        conversa_id: props.conversaId,
        conteudo: contentText,
        direcao: 'out',
        status: 'sent'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    if (insertData) {
      messages.value.push(insertData);
      scrollToBottom();
    }

    await (supabase
      .from('ag_conversas') as any)
      .update({ ultima_mensagem_em: new Date().toISOString() })
      .eq('id', props.conversaId);
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err);
    newMessage.value = contentText;
  } finally {
    sending.value = false;
  }
}

function insertQuickReply(content: string) {
  newMessage.value = content;
}

function handleTyping() {
  if (!messagesChannel.value || !currentProfileId) return;
  if (typingTimer) clearTimeout(typingTimer);
  
  messagesChannel.value.send({
    type: 'broadcast',
    event: 'TYPING_START',
    payload: { userId: currentProfileId }
  });

  typingTimer = setTimeout(() => {
    messagesChannel.value.send({
      type: 'broadcast',
      event: 'TYPING_STOP',
      payload: { userId: currentProfileId }
    });
  }, 2000);
}

async function scrollToBottom() {
  await nextTick();
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
}

function subscribeToChat() {
  return (supabase as any)
    .channel(`chat-${props.conversaId}`)
    .on(
      'postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'ag_chat', filter: `conversa_id=eq.${props.conversaId}` }, 
      (payload: any) => {
        messages.value.push(payload.new);
        isTyping.value = false;
        scrollToBottom();
      }
    )
    .subscribe();
}

function getAvatarLetters(nome?: string) {
  if (!nome || !nome.trim()) return '??';
  const parts = nome.trim().split(/\s+/);
  const first = parts[0] ? parts[0].charAt(0) : '';
  const second = parts[1] ? parts[1].charAt(0) : '';
  return (first + (second || first.charAt(1) || '')).toUpperCase();
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

watch(() => props.conversaId, () => {
  fetchMessages();
});

const chatSubscription = ref<any>(null);
const messagesChannel = ref<any>(null);

function subscribeToStatusUpdates() {
  messagesChannel.value = (supabase as any)
    .channel('message-status-updates')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'ag_chat' },
      (payload: any) => {
        const index = messages.value.findIndex(m => m.id === payload.new.id);
        if (index !== -1) {
          messages.value[index].status = payload.new.status;
        }
      }
    )
    .on('broadcast', { event: 'TYPING_START' }, (payload: any) => {
      if (payload.payload.userId !== currentProfileId) isTyping.value = true;
    })
    .on('broadcast', { event: 'TYPING_STOP' }, (payload: any) => {
      if (payload.payload.userId !== currentProfileId) isTyping.value = false;
    })
    .subscribe();
}

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
/* --- ESTILO WHATSAPP WEB UNIFICADO --- */

.chat-area-root {
  background-color: #e5ddd5 !important;
  background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d05f5395bb.png') !important;
  background-repeat: repeat !important;
  background-attachment: local !important;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.chat-footer {
  background-color: transparent !important;
  padding: 4px 12px 6px 12px; 
  display: flex;
  align-items: center;
  flex-shrink: 0;
  z-index: 10;
  margin-top: auto; 
}

/* Painel Lateral Direito (Lead Panel) */
.lead-info-panel {
  width: 340px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-left: 1px solid #e9edef;
  z-index: 20;
}

.panel-header {
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9edef;
  background-color: #f0f2f5;
}

.panel-content {
  padding: 8px 12px;
  overflow-y: auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.panel-section {
  margin-top: 10px;
  flex-shrink: 0;
}

.notes-section {
  flex-grow: 1;
  flex-shrink: 1;
  min-height: 0;
}

/* Estilo do Seletor no Sidebar */
.sidebar-stage-badge {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  width: 100%;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: all 0.2s;
  border: 1px solid rgba(0,0,0,0.05);
}

.sidebar-stage-badge:hover {
  filter: brightness(0.98);
  transform: translateY(-1px);
}

.stage-dropdown-sidebar {
  position: absolute;
  margin-top: 8px;
  width: calc(100% - 32px);
  background: white;
  border-radius: 12px;
  z-index: 50;
  max-height: 250px;
  overflow-y: auto;
}

/* Notas no Sidebar */
.sidebar-note-item {
  background: #fff;
  border-radius: 14px;
  padding: 12px;
  box-shadow: 0 2px 8px -2px rgba(0,0,0,0.08);
  border: 1px solid #f0f2f5;
  transition: transform 0.2s;
}

.sidebar-note-item:hover {
  transform: scale(1.01);
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

.status-read {
  color: #34b7f1;
}

/* Digitando */
.typing-indicator {
  color: #00a884;
  font-size: 11px;
  animation: typing-fade 1.5s infinite ease-in-out;
}

@keyframes typing-fade {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* Input Wrapper */
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

/* Animations */
.animate-slide-right {
  animation: slideRight 0.3s ease-out;
}

@keyframes slideRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out forwards;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.1);
  border-radius: 10px;
}
</style>
