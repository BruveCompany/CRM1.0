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
 * ================= Página: Agendamentos (Dashboard) =================
 * Página principal do sistema - gerenciamento de agendamentos
 * 
 * Funcionalidades:
 * - Visualização de agenda
 * - Criação de novos agendamentos
 * - Edição de agendamentos existentes
 * - Cancelamento de agendamentos
 * 
 * Permissões:
 * - Disponível para usuários logados
 * =====================================================================
 */

import AgendamentoManager from '~/components/agendamentos/AgendamentoManager.vue'
import { useAgendamentoStore } from '~/stores/agendamento'

// Inicializa a store de agendamento
const agendamentoStore = useAgendamentoStore()

useHead({
  title: 'Agendamentos'
})
</script>
