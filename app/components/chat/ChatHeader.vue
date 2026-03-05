<template>
  <!-- 
    ChatHeader.vue
    --------------
    Responsável por exibir o topo da janela de bate-papo: 
    - O avatar do Lead/Contato gerado por iniciais;
    - Indicador de status ("digitando..." ou "Visto por último");
    - Botão para alternar a exibição da barra lateral do Lead (Right Panel).
  -->
  <header class="py-2.5 px-4 border-b border-neutral-100 flex items-center justify-between bg-[#f0f2f5] z-10 shadow-sm chat-header">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600 text-sm">
        {{ getAvatarLetters(contact?.nome) }}
      </div>
      <div class="flex flex-col">
        <h2 class="font-bold text-neutral-900 leading-none">{{ contact?.nome || 'Conversa Ativa' }}</h2>
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
      <button @click="$emit('toggle-panel')" class="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 transition-colors" :class="{ 'text-primary-600 bg-primary-50': isLeadPanelVisible }">
        <Icon name="lucide:sidebar" class="w-5 h-5" />
      </button>
      <button class="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 transition-colors">
        <Icon name="heroicons:ellipsis-vertical" class="w-5 h-5" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
/**
 * Propriedades recebidas do componente pai (MessageArea.vue):
 * - contact: Objeto contendo os dados do contato como "nome".
 * - isTyping: Boolean para revelar a animação de "digitando".
 * - isLeadPanelVisible: Controla a cor indicadora se a barra lateral extra está aberta.
 */
const props = defineProps<{
  contact: any;
  isTyping: boolean;
  isLeadPanelVisible: boolean;
}>();

defineEmits(['toggle-panel']);

/**
 * Utilitário local para extrair as iniciais de um contato a partir do Nome.
 * Exemplo: "José Carlos" -> "JC".
 */
function getAvatarLetters(nome?: string) {
  if (!nome || !nome.trim()) return '??';
  const parts = nome.trim().split(/\s+/);
  const first = parts[0] ? parts[0].charAt(0) : '';
  const second = parts[1] ? parts[1].charAt(0) : '';
  return (first + (second || first.charAt(1) || '')).toUpperCase();
}
</script>

<style scoped>
.typing-indicator {
  color: #00a884;
  font-size: 11px;
  animation: typing-fade 1.5s infinite ease-in-out;
}

@keyframes typing-fade {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
</style>
