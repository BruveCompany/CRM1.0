<template>
  <!--
    ChatInput.vue
    -------------
    Módulo do rodapé de digitações (texto, input, emojis) da tela de mensagem.
    Gerencia o envio de caracteres, aciona o Broadcast de 'digitando..',
    e permite selecionar respostas rápidas (QuickReplies).
  -->
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
        v-model="internalMessage"
        @keydown.enter.prevent="handleSend"
        @keydown="$emit('typing')"
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
          @click="handleSend"
          :disabled="sending"
          class="footer-btn"
          :class="internalMessage.trim() ? 'text-primary-600' : 'text-[#54656f]'"
        >
          <Icon v-if="sending" name="svg-spinners:18-dots-indicator" class="w-6 h-6" />
          <Icon v-else :name="internalMessage.trim() ? 'heroicons:paper-airplane' : 'heroicons:microphone'" class="w-6 h-6" />
        </button>
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
import { ref } from 'vue';
import QuickReplies from '~/components/chat/QuickReplies.vue';

const props = defineProps<{
  sending: boolean;
}>();

const emit = defineEmits(['send', 'typing']);

const internalMessage = ref('');

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
</style>
