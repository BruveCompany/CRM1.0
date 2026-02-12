<template>
  <NuxtLayout>
    <div class="min-h-screen bg-white p-8 overflow-hidden">
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
