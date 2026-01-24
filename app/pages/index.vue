<script setup lang="ts">
import { useUserStore } from '~/stores/user'
const userStore = useUserStore()
</script>

<template>
  <NuxtLayout>
    <div class="min-h-screen bg-white p-8">
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      <h2>Bem-vindo, {{ userStore.userName }}</h2>
      <!-- Conteúdo da dashboard -->
    </div>
  </NuxtLayout>
</template>
