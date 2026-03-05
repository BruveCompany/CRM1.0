<template>
  <!--
    ChatMessage.vue
    ---------------
    Renderiza um balão único para exibir uma mensagem da lista de chat.
    Suporta alinhamento à esquerda/direita (direcao) além dos famosos
    ticks do Whatsapp de "sending", "sent", "delivered" e lido (read),
  -->
  <div class="flex w-full" :class="msg.direcao === 'out' ? 'justify-end' : 'justify-start'">
    <div 
      class="message-bubble animate-slide-in shadow-sm"
      :class="[msg.direcao === 'out' ? 'sent' : 'received']"
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
</template>

<script setup lang="ts">
/**
 * Propriedade única englobando todos os dados da linha de `ag_chat`.
 */
defineProps<{
  msg: any;
}>();

/**
 * Função utilitária para converter as datas ISO8601 do Supabase
 * para hora local (H:M). Ex: "14:30"
 */
function formatTime(dateStr: string) {
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
