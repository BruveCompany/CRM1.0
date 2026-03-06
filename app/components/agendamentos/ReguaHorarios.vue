<template>
  <!-- Régua de horários - exibe as horas do dia -->
  <div class="flex flex-col w-20 bg-white">
    <!-- Cada horário -->
    <div 
      v-for="hora in horarios" 
      :key="hora"
      class="text-sm font-medium text-neutral-600 h-16 flex items-start justify-center border-b border-dotted border-black/10 pt-1"
    >
      {{ hora }}
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ================= ReguaHorarios.vue =================
 * Componente para exibir a régua de horários laterais
 * 
 * Exibe os horários disponíveis no dia (8h às 22h)
 * Serve como referência visual para os agendamentos
 * 
 * Futuras melhorias:
 * - Personalizar intervalo de horários
 * - Destacar horários com agendamentos
 * - Permitir configuração de horário de início/fim
 * =====================================================
 */

import { computed } from 'vue'

/**
 * Computed: Gera array de horários de 8h até 22h
 * Formato: "08:00", "09:00", etc.
 */
const horarios = computed(() => {
  const horas: string[] = []
  for (let i = 8; i <= 22; i++) {
    const horaFormatada = i.toString().padStart(2, '0')
    horas.push(`${horaFormatada}:00`)
  }
  return horas
})
</script>
