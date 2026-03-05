<template>
  <!--
    ChatMessage.vue
    ---------------
    Renderiza um balão único para exibir uma mensagem da lista de chat.
    Suporta alinhamento à esquerda/direita (direcao) além dos famosos
    ticks do Whatsapp de "sending", "sent", "delivered" e lido (read).
  -->
  <div class="flex w-full" :class="msg.direcao === 'out' ? 'justify-end' : 'justify-start'">
    <div 
      class="message-bubble animate-slide-in shadow-sm relative group"
      :class="[msg.direcao === 'out' ? 'sent' : 'received', mediaType?.type === 'IMAGE' ? 'p-1' : 'py-2 px-3']"
    >
      <!-- ======================================= -->
      <!-- Renderização do Recurso de Anexo (Mídia)-->
      <!-- ======================================= -->
      <div v-if="mediaType" class="w-full flex flex-col mb-1 relative">
        <div v-if="mediaType.type === 'IMAGE'">
          <a :href="mediaType.url" target="_blank" class="block w-full">
            <img 
              :src="mediaType.url" 
              alt="Anexo enviado" 
              class="rounded-lg object-cover max-h-[300px] w-auto max-w-full drop-shadow-sm cursor-zoom-in min-w-[150px]" 
            />
          </a>
          <span class="text-[0.65rem] truncate text-center block mt-1 px-1 opacity-70">
            {{ mediaType.filename }}
          </span>
        </div>

        <div v-else-if="mediaType.type === 'AUDIO'" class="pb-1 min-w-[200px]">
          <audio controls preload="metadata" controlsList="nodownload" class="w-full h-10 mt-1 outline-none">
            <source :src="mediaType.url" type="audio/webm">
            Seu navegador não suporta o elemento de áudio.
          </audio>
        </div>

        <div v-else-if="mediaType.type === 'FILE'" class="pb-1">
          <a :href="mediaType.url" target="_blank" download class="flex items-center gap-3 p-3 bg-neutral-900/5 hover:bg-neutral-900/10 transition-colors rounded-xl min-w-[220px]">
            <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
              <Icon name="heroicons:document-text" class="w-5 h-5 text-primary-600" />
            </div>
            <div class="flex-1 min-w-0 pr-2">
              <span class="text-[13px] font-semibold truncate block text-neutral-800">{{ mediaType.filename || 'Documento Anexado' }}</span>
              <span class="text-[10px] text-neutral-500 uppercase">{{ getFileExtension(mediaType.filename) }}</span>
            </div>
            <div class="shrink-0 w-8 h-8 rounded-full border border-neutral-200 bg-white flex items-center justify-center shadow-sm">
              <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 text-neutral-600" />
            </div>
          </a>
        </div>
      </div>

      <!-- Texto Tradicional (puro texto) -->
      <div v-else class="text-content whitespace-pre-wrap break-words">
        {{ msg.conteudo }}
      </div>

      <div 
        class="message-meta float-right ml-3 flex items-center gap-1"
        :class="mediaType?.type === 'IMAGE' ? 'absolute bottom-1 right-2 bg-black/40 px-1.5 py-[2px] rounded-full text-white/90 drop-shadow' : 'mt-1 text-black/45'"
      >
        <span>{{ formatTime(msg.created_at) }}</span>
        <span v-if="msg.direcao === 'out'" class="status-icon flex items-center">
          <Icon v-if="msg.status === 'sending'" name="lucide:clock" class="w-3 h-3 opacity-80" />
          <Icon v-else-if="msg.status === 'sent'" name="lucide:check" class="w-3 h-3 opacity-90" />
          <Icon v-else-if="msg.status === 'delivered'" name="lucide:check-check" class="w-3 h-3 opacity-90" />
          <Icon v-else-if="msg.status === 'read'" name="lucide:check-check" class="w-3 h-3 status-read drop-shadow-sm" />
          <Icon v-else name="lucide:check" class="w-3 h-3 opacity-90" />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

/**
 * Propriedade única englobando todos os dados da linha de `ag_chat`.
 */
const props = defineProps<{
  msg: any;
}>();

/**
 * Lógica do Parser de Sintaxe de Anexos
 * O Backend insere no banco o File/Image formatado: "[IMAGE|https://....jpg] nome-do-arquivo.jpg"
 */
const mediaType = computed(() => {
  const content = props.msg.conteudo;
  if (!content) return null;
  const match = content.match(/^\[(IMAGE|FILE|AUDIO)\|(.*?)\](.*)/);
  if (match) {
    return {
      type: match[1], // "IMAGE", "FILE" ou "AUDIO"
      url: match[2],
      filename: match[3]?.trim() || 'Desconhecido'
    };
  }
  return null;
});

function getFileExtension(filename: string) {
  if (!filename) return 'ARQUIVO';
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts.pop()?.toUpperCase() || 'ARQUIVO';
  }
  return 'ARQUIVO';
}

/**
 * Função utilitária para converter as datas ISO8601 do Supabase
 * para hora local (H:M). Ex: "14:30"
 */
function formatTime(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
</script>

<style scoped>
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

.animate-slide-in {
  animation: slideIn 0.3s ease-out forwards;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
