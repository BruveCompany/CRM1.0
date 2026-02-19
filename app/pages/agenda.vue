<template>
  <NuxtLayout>
    <div class="flex flex-col h-full bg-white p-4">
      <div class="flex-1 min-h-0">
        <AgendamentoManager />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
/**
 * ================= Página: Agenda =================
 * Gerenciamento de agendamentos (Antiga Dashboard)
 * 
 * Funcionalidades:
 * - Visualização de agenda
 * - Criação de novos agendamentos
 * - Edição de agendamentos existentes
 * - Cancelamento de agendamentos
 * =================================================
 */

// Importa o componente gerenciador de agendamentos
import AgendamentoManager from '~/components/agendamentos/AgendamentoManager.vue'
import { useAgendamentoStore } from '~/stores/agendamento'

// Inicializa a store de agendamento 
// (Mantendo a lógica original, mesmo que a store possa não ser estritamente necessária aqui se o componente for autosuficiente)
const agendamentoStore = useAgendamentoStore()

// Lifecycle hooks
onMounted(() => {
  console.log('Página de Agenda carregada')
})

useHead({
  title: 'Agenda'
})
</script>
