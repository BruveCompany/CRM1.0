<template>
  <NuxtLayout name="default">
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Agendamentos</h1>
      <p class="text-gray-600 mb-6">Consulte e gerencie todos os agendamentos realizados no sistema.</p>
      <ListaAgendamentos />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
/**
 * ================= Página: Agendamentos =================
 * Página para visualização de todos os agendamentos do sistema
 * 
 * Funcionalidades:
 * - Listagem completa de agendamentos com dados de cliente e profissional
 * - Visualização em cards elegantes
 * - Filtros futuros (TODO)
 * 
 * Permissões:
 * - Visualização disponível para qualquer usuário logado
 * =========================================================
 */

import ListaAgendamentos from '../components/ListaAgendamentos.vue'

useHead({
  title: 'Agendamentos'
})
</script>
