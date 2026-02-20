<template>
  <NuxtLayout name="default">
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Painel Administrativo</h1>
      <p class="mb-6">Bem-vindo à área administrativa.</p>
      
      <TabelaAdmin />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin'
})
</script>
