<template>
  <div class="p-6 max-w-6xl mx-auto space-y-8 font-sans text-neutral-900 leading-normal">
    <!-- Header da Página -->
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900">Gerenciar Respostas Rápidas</h1>
        <p class="text-neutral-500 mt-1">Personalize sua experiência no CRM e gerencie seus templates.</p>
      </div>
    </header>

    <!-- Grid de Seções -->
    <div class="grid grid-cols-1 gap-8">
      <!-- Seção: Chat & Respostas Rápidas -->
      <section class="space-y-4">
        <div class="flex items-center gap-3 text-neutral-400">
          <Icon name="heroicons:chat-bubble-left-right" class="w-6 h-6" />
          <h2 class="text-sm font-bold uppercase tracking-widest">Atendimento & Chat</h2>
        </div>
        
        <GerenciarRespostasRapidas />
      </section>

      <!-- Outras seções podem ser adicionadas aqui no futuro -->
      <section class="p-12 border-2 border-dashed border-neutral-100 rounded-3xl flex flex-col items-center justify-center text-center opacity-50">
        <div class="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
          <Icon name="heroicons:cog-8-tooth" class="w-8 h-8 text-neutral-300" />
        </div>
        <h3 class="text-lg font-bold text-neutral-400">Mais configurações em breve</h3>
        <p class="text-sm text-neutral-300 max-w-xs px-4">Estamos preparando novas opções para personalizar seu painel.</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import GerenciarRespostasRapidas from '~/components/configuracoes/GerenciarRespostasRapidas.vue';

/**
 * Página de Configurações do CRM.
 * Atualmente centraliza o gerenciamento de Respostas Rápidas para o chat.
 */
definePageMeta({
  name: 'templates-quick-replies',
  layout: 'default'
});

// Configuração de Meta Tags da página
useHead({
  title: 'Configurações | CRM'
});
</script>

<style scoped>
/* Estilos específicos da página se necessário */
</style>
