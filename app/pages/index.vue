<template>
  <div>
    <!-- Página de redirecionamento para o Dashboard -->
    <div class="flex items-center justify-center h-screen bg-neutral-50">
      <div class="animate-pulse text-neutral-400 font-medium">
        Carregando Dashboard...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Rota raiz (/)
 * Redireciona para /dashboard para manter a estrutura solicitada.
 */
definePageMeta({
  layout: false // Sem layout para o redirecionamento
})

// Redirecionamento tanto no servidor quanto no cliente
onBeforeMount(() => {
  navigateTo('/dashboard')
})

// Redirecionamento no servidor
if (process.server) {
  navigateTo('/dashboard')
}
</script>
