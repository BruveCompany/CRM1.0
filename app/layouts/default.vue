<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto bg-neutral-50 hover-scrollbar">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
/**
 * ================= Layout: Default =================
 * Layout principal da aplicação.
 * 
 * Estrutura:
 * - Sidebar fixa à esquerda
 * - Conteúdo principal com scroll independente
 * - Estilização customizada de scrollbar (hover-only)
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
