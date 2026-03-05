<template>
  <div class="flex h-screen w-full overflow-hidden bg-neutral-50">
    <!-- Sidebar fixa à esquerda -->
    <Sidebar />

    <!-- Conteúdo Principal -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Área de Conteúdo principal ajustada para permitir componentes de altura total -->
      <div class="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar" style="scrollbar-gutter: stable;">
        <slot />
      </div>
    </main>

    <!-- Modais Globais -->
    <LeadsLeadFormModal v-model="isCreateLeadModalOpen" />
  </div>
</template>

<script setup lang="ts">
import { useLeads } from '~/composables/useLeads';

const { isCreateLeadModalOpen } = useLeads();
/**
 * ================= Layout: Default =================
 * Layout principal que mantém a Sidebar persistente.
 * ===============================================
 */
</script>

<style scoped>
/* Firefox */
.hover-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  transition: scrollbar-color 0.3s;
}

.hover-scrollbar:hover {
  scrollbar-color: #cbd5e1 transparent;
}

/* Webkit (Chrome, Edge, Safari) */
.hover-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.hover-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.hover-scrollbar::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 20px;
}

.hover-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
}
</style>
