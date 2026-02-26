<template>
  <div class="flex h-screen w-full overflow-hidden bg-neutral-50">
    <!-- Sidebar fixa à esquerda -->
    <Sidebar />

    <!-- Conteúdo Principal -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Scroll independente para o conteúdo da página -->
      <div class="flex-1 overflow-y-auto hover-scrollbar">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
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
