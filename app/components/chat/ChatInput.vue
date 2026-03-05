<template>
  <!--
    ChatInput.vue
    -------------
    Módulo do rodapé de digitações (texto, input, emojis) da tela de mensagem.
    Gerencia o envio de caracteres, aciona o Broadcast de 'digitando..',
    e permite selecionar respostas rápidas (QuickReplies).
  -->
  <div class="chat-footer">
    <div class="chat-input-wrapper w-full relative">
      
      <!-- ============================================== -->
      <!-- Ovelays / Popups (Anexos & Emojis) -->
      <!-- ============================================== -->

      <!-- Popup: + (Menu de Anexos - Estilo WhatsApp) -->
      <Transition name="fade-up">
        <div v-if="showAttachMenu" class="absolute bottom-[60px] left-0 bg-white rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.1)] py-2 flex flex-col w-[220px] border border-neutral-100 z-50 overflow-hidden">
          
          <button @click="triggerFileSelect('document')" class="flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 transition-colors text-left w-full group">
            <Icon name="heroicons:document-text-solid" class="w-[22px] h-[22px] text-[#7F66FF] shrink-0" />
            <span class="text-[15px] font-normal text-[#111b21] mt-0.5">Documento</span>
          </button>
          
          <button @click="triggerFileSelect('image')" class="flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 transition-colors text-left w-full group">
            <Icon name="heroicons:photo-solid" class="w-[22px] h-[22px] text-[#007DFC] shrink-0" />
            <span class="text-[15px] font-normal text-[#111b21] mt-0.5">Fotos e vídeos</span>
          </button>
          
          <button @click="triggerFileSelect('camera')" class="flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 transition-colors text-left w-full group">
            <Icon name="heroicons:camera-solid" class="w-[22px] h-[22px] text-[#FF2E74] shrink-0" />
            <span class="text-[15px] font-normal text-[#111b21] mt-0.5">Câmera</span>
          </button>

          <button @click="triggerFileSelect('audio')" class="flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 transition-colors text-left w-full group">
            <Icon name="lucide:headphones" class="w-[22px] h-[22px] text-[#FF7A00] shrink-0" />
            <span class="text-[15px] font-normal text-[#111b21] mt-0.5">Áudio</span>
          </button>
          
          <button @click="triggerFileSelect('contact')" class="flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 transition-colors text-left w-full group">
            <Icon name="heroicons:user-solid" class="w-[22px] h-[22px] text-[#009DE2] shrink-0" />
            <span class="text-[15px] font-normal text-[#111b21] mt-0.5">Contato</span>
          </button>

          <button @click="triggerFileSelect('poll')" class="flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 transition-colors text-left w-full group">
            <Icon name="lucide:bar-chart-2" class="w-[22px] h-[22px] text-[#FFB02E] shrink-0" />
            <span class="text-[15px] font-normal text-[#111b21] mt-0.5">Enquete</span>
          </button>

          <button @click="triggerFileSelect('event')" class="flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 transition-colors text-left w-full group">
            <Icon name="heroicons:calendar-solid" class="w-[22px] h-[22px] text-[#FF2E74] shrink-0" />
            <span class="text-[15px] font-normal text-[#111b21] mt-0.5">Evento</span>
          </button>

          <button @click="triggerFileSelect('sticker')" class="flex items-center gap-3 px-4 py-2 hover:bg-neutral-50 transition-colors text-left w-full group">
            <Icon name="lucide:sticker" class="w-[22px] h-[22px] text-[#00E676] shrink-0" />
            <span class="text-[15px] font-normal text-[#111b21] mt-0.5">Nova figurinha</span>
          </button>

          <!-- Hidden File Input para os Anexos -->
          <input 
            type="file" 
            ref="fileInputRef" 
            class="hidden" 
            :accept="fileAcceptMode" 
            @change="handleFileSelected" 
          />
        </div>
      </Transition>

      <!-- Popup: Emoji Picker Completo (Estilo WhatsApp) -->
      <Transition name="fade-up">
        <div v-if="showEmojiMenu" class="absolute bottom-[60px] left-12 bg-[#F0F2F5] rounded-t-2xl shadow-[0_4px_24px_rgba(0,0,0,0.15)] flex flex-col w-[350px] h-[400px] border border-neutral-100 z-50 overflow-hidden">
          
          <template v-if="activePickerTab === 'emoji'">
            <!-- Header: Abas de categorias -->
            <div class="flex items-center justify-between px-3 bg-[#F0F2F5] shrink-0 pt-1 border-b border-white relative z-20">
              <button class="px-2 py-[10px] relative flex flex-col items-center group text-primary-500">
                <Icon name="lucide:clock" class="w-[20px] h-[20px] mb-0" />
                <div class="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-primary-500 rounded-t-sm"></div>
              </button>
              <button class="px-2 py-[10px] text-[#54656F] hover:text-[#111B21] transition-colors relative flex flex-col items-center group">
                <Icon name="lucide:smile" class="w-[20px] h-[20px] mb-0" />
                <div class="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-transparent group-hover:bg-[#E9EDEF] rounded-t-sm transition-colors"></div>
              </button>
              <button class="px-2 py-[10px] text-[#54656F] hover:text-[#111B21] transition-colors relative flex flex-col items-center group">
                <Icon name="lucide:flower-2" class="w-[20px] h-[20px] mb-0" />
                <div class="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-transparent group-hover:bg-[#E9EDEF] rounded-t-sm transition-colors"></div>
              </button>
              <button class="px-2 py-[10px] text-[#54656F] hover:text-[#111B21] transition-colors relative flex flex-col items-center group">
                <Icon name="lucide:coffee" class="w-[20px] h-[20px] mb-0" />
                <div class="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-transparent group-hover:bg-[#E9EDEF] rounded-t-sm transition-colors"></div>
              </button>
              <button class="px-2 py-[10px] text-[#54656F] hover:text-[#111B21] transition-colors relative flex flex-col items-center group">
                <Icon name="lucide:car" class="w-[20px] h-[20px] mb-0" />
                <div class="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-transparent group-hover:bg-[#E9EDEF] rounded-t-sm transition-colors"></div>
              </button>
              <button class="px-2 py-[10px] text-[#54656F] hover:text-[#111B21] transition-colors relative flex flex-col items-center group">
                <Icon name="lucide:lightbulb" class="w-[20px] h-[20px] mb-0" />
                <div class="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-transparent group-hover:bg-[#E9EDEF] rounded-t-sm transition-colors"></div>
              </button>
              <button class="px-2 py-[10px] text-[#54656F] hover:text-[#111B21] transition-colors relative flex flex-col items-center group">
                <Icon name="lucide:flag" class="w-[20px] h-[20px] mb-0" />
                <div class="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-transparent group-hover:bg-[#E9EDEF] rounded-t-sm transition-colors"></div>
              </button>
            </div>

            <!-- Barra de Pesquisa Fixa -->
            <div class="px-3 py-[6px] bg-[#F0F2F5] shrink-0 border-b border-white z-20">
              <div class="bg-white rounded-[8px] px-3 py-1.5 flex items-center gap-3">
                <Icon name="lucide:search" class="w-[14px] h-[14px] text-[#54656F] shrink-0" />
                <input type="text" placeholder="Pesquisar emoji" class="bg-transparent border-none outline-none text-[#111B21] text-[13px] w-full placeholder:text-[#54656F] font-normal font-sans" />
              </div>
            </div>

            <!-- Corpo Scrollável com as Categorias -->
            <div class="flex-1 overflow-y-auto px-4 pb-3 bg-white custom-scrollbar">
              <!-- Recentes -->
              <div class="mb-5 mt-2">
                <div class="text-[13px] font-semibold tracking-wide text-[#54656F] mb-3 sticky top-0 bg-white/95 py-1 z-10">Recentes</div>
                <div class="grid grid-cols-8 gap-y-1 gap-x-0">
                  <button 
                    v-for="emoji in popularEmojis.slice(0, 8)" 
                    :key="`recent-${emoji}`"
                    @click="insertEmoji(emoji)"
                    class="w-[36px] h-[36px] flex items-center justify-center hover:bg-neutral-100 rounded-md text-[24px] cursor-pointer"
                  >
                    {{ emoji }}
                  </button>
                </div>
              </div>

              <!-- Smileys e pessoas -->
              <div>
                <div class="text-[13px] font-semibold tracking-wide text-[#54656F] mb-3 sticky top-0 bg-white/95 py-1 z-10">Smileys e pessoas</div>
                <div class="grid grid-cols-8 gap-y-1 gap-x-0">
                  <button 
                    v-for="emoji in popularEmojis" 
                    :key="`smiley-${emoji}`"
                    @click="insertEmoji(emoji)"
                    class="w-[36px] h-[36px] flex items-center justify-center hover:bg-neutral-100 rounded-md text-[24px] cursor-pointer"
                  >
                    {{ emoji }}
                  </button>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="activePickerTab === 'gif'">
            <div class="flex-1 bg-white flex flex-col items-center justify-center text-center p-6 pb-0">
               <Icon name="lucide:image" class="w-16 h-16 text-[#54656F] mb-4 opacity-50" />
               <p class="text-[#54656F] text-sm font-medium">Os GIFs estarão disponíveis em breve.</p>
            </div>
          </template>

          <template v-else-if="activePickerTab === 'sticker'">
            <div class="flex-1 bg-white flex flex-col items-center justify-center text-center p-6 pb-0">
               <Icon name="lucide:sticker" class="w-16 h-16 text-[#54656F] mb-4 opacity-50" />
               <p class="text-[#54656F] text-sm font-medium">Suas figurinhas aparecerão aqui.</p>
            </div>
          </template>
          
          <!-- Bottom nav toggles (Emoji / GIF / Sticker) -->
          <div class="h-[50px] bg-[#F0F2F5] flex items-center justify-center shrink-0 w-full relative">
             <div class="flex bg-neutral-200/50 rounded-[20px] p-[2px]">
               <button 
                 @click="activePickerTab = 'emoji'"
                 class="px-5 py-[5px] rounded-[18px] text-sm font-medium flex items-center justify-center transition-colors"
                 :class="activePickerTab === 'emoji' ? 'bg-white text-[#111B21] shadow-[0_1px_2px_rgba(0,0,0,0.1)]' : 'text-[#8696A0] hover:text-[#54656F]'"
               >
                 <Icon name="lucide:smile" class="w-[18px] h-[18px]" />
               </button>
               <button 
                 @click="activePickerTab = 'gif'"
                 class="px-5 py-[5px] rounded-[18px] text-sm font-semibold flex items-center justify-center transition-colors"
                 :class="activePickerTab === 'gif' ? 'bg-white text-[#111B21] shadow-[0_1px_2px_rgba(0,0,0,0.1)]' : 'text-[#8696A0] hover:text-[#54656F]'"
               >
                 GIF
               </button>
               <button 
                 @click="activePickerTab = 'sticker'"
                 class="px-5 py-[5px] rounded-[18px] text-sm flex items-center justify-center transition-colors"
                 :class="activePickerTab === 'sticker' ? 'bg-white text-[#111B21] shadow-[0_1px_2px_rgba(0,0,0,0.1)]' : 'text-[#8696A0] hover:text-[#54656F]'"
               >
                 <Icon name="lucide:sticky-note" class="w-[18px] h-[18px]" />
               </button>
             </div>
          </div>
        </div>
      </Transition>

      <!-- ============================================== -->
      <!-- Input UI Principal -->
      <!-- ============================================== -->

      <!-- Ícones da Esquerda -->
      <div class="flex items-center gap-1.5 pl-1 shrink-0">
        <!-- O "+" no WhatsApp muitas vezes fica em um círculo cinza ligeiramente destacado -->
        <button 
          @click="toggleMenu('attach')" 
          :class="['w-9 h-9 rounded-full flex items-center justify-center transition-colors', showAttachMenu ? 'bg-neutral-200' : 'bg-neutral-100 hover:bg-neutral-200']"
        >
          <Icon :name="showAttachMenu ? 'heroicons:x-mark' : 'heroicons:plus'" class="w-6 h-6 text-[#54656f]" />
        </button>

        <button 
          @click="toggleMenu('emoji')" 
          :class="['footer-btn', showEmojiMenu ? 'bg-neutral-100' : '']"
        >
          <Icon name="heroicons:face-smile" class="w-6 h-6 text-[#54656f]" />
        </button>
        
        <QuickReplies @select="insertQuickReply" />
      </div>

      <!-- Área de Texto / Gravação -->
      <div v-if="isRecording" class="chat-input ml-2 flex items-center gap-3 text-[#54656f]">
        <Icon name="lucide:mic" class="w-5 h-5 text-red-500 animate-pulse shrink-0" />
        <span class="text-[14px] font-medium min-w-[40px]">{{ formattedRecordingTime }}</span>
        <span class="text-[13px] opacity-70 ml-2">Gravando áudio...</span>
      </div>
      <textarea 
        v-else
        v-model="internalMessage"
        @keydown.enter.prevent="handleSend"
        @keydown="$emit('typing')"
        rows="1"
        placeholder="Digite uma mensagem"
        class="chat-input ml-1"
      ></textarea>

      <!-- Ícones da Direita -->
      <div class="flex items-center gap-1 pr-1 shrink-0">
        <template v-if="isRecording">
          <button @click="cancelRecording" class="w-10 h-10 rounded-full flex items-center justify-center text-[#ff3b30] hover:bg-neutral-100 transition-colors">
            <Icon name="lucide:trash-2" class="w-5 h-5" />
          </button>
          <button @click="stopRecordingAndSend" class="w-10 h-10 rounded-full flex items-center justify-center bg-primary-500 hover:bg-primary-600 text-white shadow-sm transition-colors ml-1">
            <Icon name="heroicons:paper-airplane" class="w-5 h-5" />
          </button>
        </template>
        
        <template v-else>
          <button 
            @keyup.enter="handleSend"
            @click="internalMessage.trim() ? handleSend() : startRecording()"
            :disabled="sending"
            class="w-[38px] h-[38px] rounded-full flex items-center justify-center transition-colors"
            :class="internalMessage.trim() ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-sm' : 'text-[#54656f] hover:bg-neutral-100 bg-transparent'"
          >
            <Icon v-if="sending" name="svg-spinners:18-dots-indicator" class="w-5 h-5" />
            <Icon v-else :name="internalMessage.trim() ? 'heroicons:paper-airplane' : 'heroicons:microphone'" class="w-[20px] h-[20px]" />
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Lógica do Footer
 * Esse componente emite `send` para o contêiner principal enviar ao Supabase.
 * Controla os estados de disable/loading (`sending`) enquanto o servidor acusa pendência.
 */
import { ref, computed } from 'vue';
import QuickReplies from '~/components/chat/QuickReplies.vue';

const props = defineProps<{
  sending: boolean;
}>();

const emit = defineEmits(['send', 'typing', 'attach', 'action']);

const internalMessage = ref('');
const showAttachMenu = ref(false);
const showEmojiMenu = ref(false);
const activePickerTab = ref('emoji');

// Mídia: Áudio
const isRecording = ref(false);
const recordingTime = ref(0);
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let recordingInterval: any = null;

const formattedRecordingTime = computed(() => {
  const m = Math.floor(recordingTime.value / 60).toString().padStart(2, '0');
  const s = (recordingTime.value % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
});

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    
    mediaRecorder.ondataavailable = (e) => {
      audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      stream.getTracks().forEach(track => track.stop());
      if (isRecording.value) { // means it wasn't cancelled
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, { type: 'audio/webm' });
        emit('attach', audioFile);
      }
      isRecording.value = false;
      recordingTime.value = 0;
      clearInterval(recordingInterval);
    };

    isRecording.value = true;
    mediaRecorder.start();
    recordingInterval = setInterval(() => {
      recordingTime.value++;
    }, 1000);
  } catch (err) {
    console.error('Mic access error', err);
    alert('Não foi possível acessar seu microfone. Verifique as permissões do navegador.');
  }
}

function stopRecordingAndSend() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
}

function cancelRecording() {
  isRecording.value = false; // set false early so onstop ignores file creation
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  recordingTime.value = 0;
  clearInterval(recordingInterval);
}

const fileInputRef = ref<HTMLInputElement | null>(null);
const fileAcceptMode = ref('*/*');

const popularEmojis = [
  '😀','😂','🤣','😊','😍','🥰','😘','😜','😎','🤩',
  '😢','😭','😡','👍','👎','👏','🙌','🤝','🔥','❤️',
  '🎉','✨','✅','❌','⚠️','🤔','👀','🙏','💪','🏆',
  '👇','👆','👉','👈','📌','📦','💰','💳','⏰','🚀'
];

/**
 * Controla os Overlays (se abrir um, fecha o outro)
 */
function toggleMenu(menu: 'attach' | 'emoji') {
  if (menu === 'attach') {
    showAttachMenu.value = !showAttachMenu.value;
    if (showAttachMenu.value) showEmojiMenu.value = false;
  } else {
    showEmojiMenu.value = !showEmojiMenu.value;
    if (showEmojiMenu.value) showAttachMenu.value = false;
  }
}

/**
 * Dispara o input:file real com base no botão clicado.
 */
function triggerFileSelect(type: 'document' | 'image' | 'camera' | 'contact' | 'audio' | 'poll' | 'event' | 'sticker') {
  if (!fileInputRef.value) return;
  
  if (type === 'image') {
    fileAcceptMode.value = 'image/*,video/*';
  } else if (type === 'document') {
    fileAcceptMode.value = '.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt';
  } else if (type === 'audio') {
    fileAcceptMode.value = 'audio/*';
  } else {
    fileAcceptMode.value = '*/*';
  }

  // Se 'camera' for pedido no mobile, o proprio 'image/*' já traz opção de camera.
  // Contact e outros precisariam de lógica customizada
  if (type === 'contact' || type === 'camera' || type === 'poll' || type === 'event' || type === 'sticker') {
    const actionMap: Record<string, {text: string, emoji: string}> = {
      'contact': { text: 'Compartilhar Contato...', emoji: '👤' },
      'camera': { text: 'Abrindo a Câmera nativa...', emoji: '📷' },
      'poll': { text: 'Nova Enquete gerada...', emoji: '📊' },
      'event': { text: 'Convite para Evento gerado!', emoji: '📅' },
      'sticker': { text: 'Pesquisando pacote de figurinhas...', emoji: '🧩' }
    };
    
    showAttachMenu.value = false;
    const actionData = actionMap[type] || {text: 'Ação executada', emoji: '⚙️'};
    emit('action', actionData.text, actionData.emoji);
    return;
  }

  // Faz o clique "fantasma"
  fileInputRef.value.click();
  showAttachMenu.value = false;
}

/**
 * Recebe o Arquivo Selecionado do File System do Usuário
 */
function handleFileSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  
  const file = target.files[0];
  // Repassa para a página lidando com upload Supabase/Storage
  emit('attach', file);

  // Limpa input
  target.value = '';
}

/**
 * Ao clicar num emoji do painel
 */
function insertEmoji(emoji: string) {
  internalMessage.value += emoji;
}

/**
 * Ao clicar numa Resposta Rápida (Macro), jogamos o texto dentro do textarea.
 */
function insertQuickReply(content: string) {
  internalMessage.value = content;
}

/**
 * Controla a validação do Input quando apertar "Enter" e emite
 * a string recém-escrita. Limpa a form após emissão.
 */
function handleSend() {
  const text = internalMessage.value.trim();
  if (!text || props.sending) return;
  emit('send', text);
  internalMessage.value = '';
  // Fechar menus se estiverem abertos após enviar
  showAttachMenu.value = false;
  showEmojiMenu.value = false;
}
</script>

<style scoped>
.chat-footer {
  background-color: transparent !important;
  padding: 4px 12px 6px 12px; 
  display: flex;
  align-items: center;
  flex-shrink: 0;
  z-index: 10;
  margin-top: auto; 
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
  color: #111b21;
  line-height: 1.2;
}
.chat-input::placeholder {
  color: #8696a0;
}

.footer-btn {
  padding: 8px;
  color: #54656f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.footer-btn:hover {
  background-color: #f0f2f5;
}

/* Animações de Fade para Menus Popups */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
