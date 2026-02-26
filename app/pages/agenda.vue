<template>
  <NuxtLayout>
    <div class="flex flex-col h-full bg-white p-4">
      <div class="flex-1 min-h-0">
        <ClientOnly>
          <AgendamentoManager />
          <template #fallback>
            <div class="flex items-center justify-center h-full">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          </template>
        </ClientOnly>
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
