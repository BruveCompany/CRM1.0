<template>
  <div class="flex h-full overflow-hidden bg-transparent">
    <!-- Lista de Conversas (Esquerda) -->
    <div class="w-80 border-r border-neutral-100 flex flex-col bg-neutral-50/30">
      <div class="p-4 border-b border-neutral-100 bg-white">
        <h1 class="text-xl font-bold text-neutral-900">Chat</h1>
        <div class="mt-2 relative">
          <input 
            type="text" 
            placeholder="Buscar conversa..." 
            class="w-full pl-9 pr-4 py-2 bg-neutral-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
          <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-2.5 text-neutral-400 w-4 h-4" />
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto">
        <ConversationList 
          :active-id="selectedConversaId" 
          @select="selectConversa" 
        />
      </div>
    </div>

    <!-- Área do Chat (Direita) - Removendo bg-white para permitir que o MessageArea controle o fundo -->
    <div class="flex-1 flex flex-col relative">
      <MessageArea 
        v-if="selectedConversaId" 
        :conversa-id="selectedConversaId" 
        :contact-data="selectedContact"
      />
      
      <!-- Estado Vazio -->
      <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div class="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-4">
          <Icon name="heroicons:chat-bubble-left-right" class="w-10 h-10 text-primary-500" />
        </div>
        <h2 class="text-xl font-bold text-neutral-900">Selecione uma conversa</h2>
        <p class="text-neutral-500 mt-2 max-w-xs">Escolha um lead na lista ao lado para iniciar ou continuar o atendimento.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ConversationList from '~/components/chat/ConversationList.vue';
import MessageArea from '~/components/chat/MessageArea.vue';

definePageMeta({
  layout: 'default'
});

useHead({
  title: 'Chat | Sistema CRM'
});

const selectedConversaId = ref<number | null>(null);
const selectedContact = ref<any>(null);

const selectConversa = (conversa: any) => {
  selectedConversaId.value = conversa.id;
  selectedContact.value = conversa.lead || conversa.cliente;
};
</script>

<style scoped>
.shadow-soft {
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
}
</style>
