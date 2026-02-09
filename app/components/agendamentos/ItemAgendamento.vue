<template>
  <!-- Item de agendamento para um dia específico -->
  <div class="flex-1 border-r border-gray-200 last:border-r-0">
    <!-- Container dos slots de agendamento -->
    <div class="flex flex-col">
      <!-- Slots de horário (8h às 22h = 15 slots) -->
      <div 
        v-for="hora in 15" 
        :key="hora"
        class="h-16 border-t border-gray-50 first:border-t-0 hover:bg-gray-50 cursor-pointer transition-colors"
      >
        <!-- Slot vazio por enquanto - futuro: exibir agendamentos -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ================= ItemAgendamento.vue =================
 * Componente para exibir slots de agendamento de um dia
 * 
 * Props:
 * @param {Date} data - Data do dia para exibir agendamentos
 * 
 * Futuras funcionalidades:
 * - Listar slots de horários disponíveis
 * - Exibir agendamentos existentes
 * - Permitir criação de novo agendamento ao clicar
 * - Indicar horários ocupados/disponíveis
 * - Drag and drop para reagendar
 * ======================================================
 */

// Interface de propriedades
interface Props {
  data: Date // Data do dia para exibir agendamentos
}

const props = defineProps<Props>()

/**
 * Formata a data para exibição (desenvolvimento)
 */
function formatarData(data: Date): string {
  const dia = data.getDate().toString().padStart(2, '0')
  const mes = (data.getMonth() + 1).toString().padStart(2, '0')
  return `${dia}/${mes}`
}
</script>
