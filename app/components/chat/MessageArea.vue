<template>
  <div class="flex h-full w-full overflow-hidden bg-white">
    <!-- Coluna Central: Área de Conversa (Design WhatsApp Official) -->
    <div class="flex-1 flex flex-col min-w-0 min-h-0 relative chat-area-root">
      <!-- 1. Header do Chat (Slim) -->
      <ChatHeader
        :contact="contactData"
        :is-typing="isTyping"
        :is-lead-panel-visible="isLeadPanelVisible"
        @toggle-panel="toggleLeadPanel"
      />

      <div 
        ref="messageContainer" 
        class="flex-1 min-h-0 overflow-y-auto p-4 space-y-2 bg-transparent flex flex-col custom-scrollbar scroll-smooth"
      >
        <div v-if="loadingMessages" class="flex flex-col gap-4 py-8 animate-pulse text-center text-neutral-300">
          Carregando histórico...
        </div>
        
        <ChatMessage v-for="msg in messages" :key="msg.id" :msg="msg" />
      </div>

      <!-- 3. Rodapé do Chat -->
      <ChatInput :sending="sending" @send="sendMessage" @typing="handleTyping" @attach="handleFileAttach" @action="handleActionMessage" />
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
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import ChatHeader from '~/components/chat/ChatHeader.vue';
import ChatInput from '~/components/chat/ChatInput.vue';
import ChatMessage from '~/components/chat/ChatMessage.vue';
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

// Estados do Chat
const messages = ref<any[]>([]);
const loadingMessages = ref(true);
const sending = ref(false);
const messageContainer = ref<HTMLElement | null>(null);
const isLeadPanelVisible = ref(true);
const isTyping = ref(false);
let typingTimer: any = null;

const currentProfileId = computed(() => userStore.profile?.id);

function toggleLeadPanel() {
  isLeadPanelVisible.value = !isLeadPanelVisible.value;
}

const messagesChannel = ref<any>(null);

function scrollToBottom() {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
  });
}

const addMessageToList = (msg: any) => {
  if (!msg.id) return;
  const exists = messages.value.some(m => String(m.id) === String(msg.id));
  if (!exists) {
    messages.value.push(msg);
    scrollToBottom();
  }
}

const updateMessageInList = (msg: any) => {
  const index = messages.value.findIndex(m => String(m.id) === String(msg.id));
  if (index !== -1) {
    messages.value[index] = { ...messages.value[index], ...msg };
  }
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
    scrollToBottom();
  } catch (err) {
    console.error('Erro ao buscar mensagens:', err);
  } finally {
    loadingMessages.value = false;
  }
}

async function sendMessage(contentText: string) {
  if (sending.value) return;
  sending.value = true;

  try {
    const { data: insertData, error: insertError } = await (supabase
      .from('ag_chat') as any)
      .insert({
        conversa_id: props.conversaId,
        conteudo: contentText,
        direcao: 'out',
        status: 'sending'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    if (insertData) {
      // Marcamos como 'sent' localmente após o sucesso do insert
      const sentMsg = { ...insertData, status: 'sent' };
      addMessageToList(sentMsg);
    }

    await (supabase
      .from('ag_conversas') as any)
      .update({ ultima_mensagem_em: new Date().toISOString() })
      .eq('id', props.conversaId);
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err);
  } finally {
    sending.value = false;
  }
}

function handleTyping() {
  if (!messagesChannel.value || !currentProfileId.value) return;
  if (typingTimer) clearTimeout(typingTimer);
  
  messagesChannel.value.send({
    type: 'broadcast',
    event: 'TYPING_START',
    payload: { userId: currentProfileId.value }
  });

  typingTimer = setTimeout(() => {
    messagesChannel.value.send({
      type: 'broadcast',
      event: 'TYPING_STOP',
      payload: { userId: currentProfileId.value }
    });
  }, 2000);
}

async function handleFileAttach(file: File) {
  if (sending.value || !file) return;
  sending.value = true;

  try {
    const isImage = file.type.startsWith('image/');
    const isAudio = file.type.startsWith('audio/');
    const fileExt = file.name.split('.').pop() || 'tmp';
    // Path: /conversa_ID/timestamp-random.ext
    const fileName = `${Date.now()}-${Math.floor(Math.random() * 10000)}.${fileExt}`;
    const filePath = `conversa_${props.conversaId}/${fileName}`;

    // 1. Upload pro Storage via Backend Nuxt Server (Bypassa bloqueios RLS de client publico)
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', filePath);

    const { data: uploadResult, error: apiError } = await useFetch('/api/chat/upload', {
      method: 'POST',
      body: formData
    });

    if (apiError.value) {
      console.error('Erro ao enviar arquivo via API Nuxt:', apiError.value);
      alert('Houve um erro no carregamento da mídia.');
      sending.value = false;
      return;
    }

    const publicUrl = uploadResult.value?.publicUrl;

    if (!publicUrl) throw new Error('Falha ao pegar link publico da imagem.');
    
    // 3. Monta Syntax amigável pro Front Parsear
    const typeLabel = isImage ? 'IMAGE' : (isAudio ? 'AUDIO' : 'FILE');
    const finalContent = `[${typeLabel}|${publicUrl}] ${file.name}`;

    // Insere no banco o File/Image formatado
    const { data: insertData, error: insertError } = await (supabase
      .from('ag_chat') as any)
      .insert({
        conversa_id: props.conversaId,
        conteudo: finalContent,
        direcao: 'out',
        status: 'sending'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    if (insertData) addMessageToList({ ...insertData, status: 'sent' });

    // Atualiza timestamp ag_conversas mas sinaliza que foi Anexo e nao texto solto
    await (supabase.from('ag_conversas') as any)
      .update({ 
        ultima_mensagem_em: new Date().toISOString(), 
        ultima_mensagem: `📎 Arquivo Anexado` 
      })
      .eq('id', props.conversaId);

  } catch (err) {
    console.error('Erro crítico no attach:', err);
  } finally {
    sending.value = false;
  }
}

async function handleActionMessage(actionText: string, emoji: string) {
  if (sending.value) return;
  sending.value = true;
  try {
     const { data: insertData, error: insertError } = await (supabase
        .from('ag_chat') as any)
        .insert({
          conversa_id: props.conversaId,
          conteudo: `${emoji} ${actionText}`,
          direcao: 'out',
          status: 'sending'
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      if (insertData) addMessageToList({ ...insertData, status: 'sent' });

      await (supabase.from('ag_conversas') as any).update({ 
          ultima_mensagem_em: new Date().toISOString(), 
          ultima_mensagem: `${emoji} Novo painel de chat` 
      }).eq('id', props.conversaId);
  } catch (err) {
    console.error('Action err', err);
  } finally {
    sending.value = false;
  }
}

function setupSubscription() {
  if (messagesChannel.value) {
    supabase.removeChannel(messagesChannel.value);
  }

  messagesChannel.value = supabase.channel(`chat-room-${props.conversaId}`);

  messagesChannel.value
    .on(
      'postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'ag_chat', 
        filter: `conversa_id=eq.${props.conversaId}` 
      }, 
      (payload: any) => {
        addMessageToList(payload.new);
        isTyping.value = false;
      }
    )
    .on(
      'postgres_changes',
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'ag_chat',
        filter: `conversa_id=eq.${props.conversaId}` 
      },
      (payload: any) => {
        updateMessageInList(payload.new);
      }
    )
    .on('broadcast', { event: 'TYPING_START' }, (payload: any) => {
      if (payload.payload.userId !== currentProfileId.value) isTyping.value = true;
    })
    .on('broadcast', { event: 'TYPING_STOP' }, (payload: any) => {
      if (payload.payload.userId !== currentProfileId.value) isTyping.value = false;
    })
    .subscribe();
}

watch(() => props.conversaId, (newId) => {
  if (newId) {
    fetchMessages();
    setupSubscription();
  }
}, { immediate: true });

onMounted(() => {
  // O watch imediato já cuida da carga inicial
});

onUnmounted(() => {
  if (messagesChannel.value) {
    supabase.removeChannel(messagesChannel.value);
  }
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
