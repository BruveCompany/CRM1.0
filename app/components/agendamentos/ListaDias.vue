<template>
  <!-- Container de visualização dos dias da semana -->
  <div class="w-full border-b border-gray-200">
    <!-- Exibe cada dia da semana usando DiaItem - distribuídos uniformemente -->
    <div class="flex w-full">
      <!-- Espaçador para alinhar com a régua de horários -->
      <div class="w-20 flex-shrink-0"></div>
      
      <!-- Dias da semana -->
      <DiaItem 
        v-for="(dia, index) in dias" 
        :key="index"
        :dia="dia"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ================= ListaDias.vue =================
 * Componente para exibir e manipular a lista de dias da semana
 * 
 * Props:
 * @param {Date[]} dias - Array com os 7 dias da semana (Domingo a Sábado)
 * 
 * Funcionalidades futuras:
 * - Exibir cada dia com formatação individualizada
 * - Permitir seleção de dias específicos
 * - Destacar o dia atual
 * =================================================
 */

import DiaItem from './DiaItem.vue'

// Interface de propriedades
interface Props {
  dias: Date[] // Lista de dias da semana vindos do store
}

// Define as props do componente
defineProps<Props>()
</script>
