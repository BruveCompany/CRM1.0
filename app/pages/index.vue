<script setup lang="ts">
// Redireciona imediatamente da rota raiz '/' para '/dashboard'.
// Isso é executado no lado do servidor, sendo a forma mais eficiente.
definePageMeta({
  middleware: [() => navigateTo('/dashboard', { replace: true, redirectCode: 301 })]
})
</script>

<template>
  <!-- O template pode ficar vazio, pois o usuário nunca verá esta página -->
  <div></div>
</template>
