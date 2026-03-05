<template>
  <div class="flex h-full overflow-hidden bg-transparent">
<!-- Coluna 1: Lista de Conversas (Esquerda) -->
    <div class="w-80 border-r border-neutral-100 flex flex-col bg-neutral-50/30">
      <div class="p-4 border-b border-neutral-100 bg-white">
        <h1 class="text-xl font-bold text-neutral-900">Chat</h1>
        <div class="mt-2 relative">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Buscar conversa..." 
            class="w-full pl-9 pr-4 py-2 bg-neutral-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 transition-all font-medium text-neutral-700 placeholder-neutral-400"
          />
          <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-2.5 text-neutral-400 w-4 h-4" />
        </div>
        
        <!-- Filtros Rapidos (Tudo / Nao Lidas / Favoritas) -->
        <div class="mt-3 flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          <button 
            @click="activeFilter = 'tudo'" 
            :class="['px-3 py-1 rounded-full text-[11px] font-medium border whitespace-nowrap transition-colors', activeFilter === 'tudo' ? 'bg-neutral-100 border-neutral-200 text-neutral-800' : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50']">
            Tudo
          </button>
          <button 
            @click="activeFilter = 'nao_lidas'" 
            :class="['px-3 py-1 rounded-full text-[11px] font-medium border whitespace-nowrap transition-colors', activeFilter === 'nao_lidas' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50']">
            Não lidas
          </button>
          <button 
            @click="activeFilter = 'favoritas'" 
            :class="['px-3 py-1 rounded-full text-[11px] font-medium border whitespace-nowrap transition-colors', activeFilter === 'favoritas' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50']">
            Favoritas
          </button>
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto bg-white">
        <ConversationList 
          ref="conversationListRef"
          :active-id="selectedConversaId" 
          :search-query="searchQuery"
          :active-filter="activeFilter"
          @select="selectConversa" 
        />
      </div>
    </div>

    <!-- Area Principal (Coluna 2 e 3 integradas via MessageArea) -->
    <div class="flex-1 flex flex-col min-w-0 bg-[#efeae2] relative overflow-hidden">
      <MessageArea 
        v-if="selectedConversaId"
        :conversa-id="selectedConversaId"
        :contact-data="selectedContact"
        @updated="handleLeadUpdate"
      />
      
      <!-- Estado Vazio -->
      <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white">
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

const searchQuery = ref('');
const activeFilter = ref('tudo'); // 'tudo' | 'nao_lidas' | 'favoritas'
const selectedConversaId = ref<number | null>(null);
const selectedContact = ref<any>(null);
const conversationListRef = ref<any>(null);

const selectConversa = (conversa: any) => {
  selectedConversaId.value = conversa.id;
  selectedContact.value = conversa.lead || conversa.cliente;
};

const handleLeadUpdate = async () => {
  if (conversationListRef.value) {
    await conversationListRef.value.fetchConversations();
    // Re-seleciona o contato para atualizar o objeto local reativo (incluindo o score atualizado)
    const updatedConversa = conversationListRef.value.sortedConversations.find((c: any) => c.id === selectedConversaId.value);
    if (updatedConversa) {
      selectedContact.value = updatedConversa.lead || updatedConversa.cliente;
    }
  }
};
</script>

<style scoped>
.shadow-soft {
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
}
</style>
