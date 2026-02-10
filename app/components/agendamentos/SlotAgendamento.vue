<template>
  <!-- Slot de agendamento individual -->
  <div 
    :style="{ 
      top: `${posicaoTop}px`, 
      height: `${altura}px` 
    }"
    class="absolute left-0 right-0 mx-1 bg-[#4338CA] text-white rounded px-2 py-1 cursor-pointer hover:bg-[#3730A3] transition-colors overflow-hidden"
  >
    <!-- Título do agendamento -->
    <div class="text-xs font-semibold truncate">
      {{ agendamento.titulo }}
    </div>
    
    <!-- Horário -->
    <div class="text-xs opacity-90 truncate">
      {{ horarioFormatado }}
    </div>
    
    <!-- Descrição (se houver espaço) -->
    <div v-if="altura > 50" class="text-xs opacity-75 truncate mt-0.5">
      {{ agendamento.descricao }}
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ================= SlotAgendamento.vue =================
 * Componente para exibir um slot de agendamento
 * 
 * Props:
 * @param {Agendamento} agendamento - Dados do agendamento
 * 
 * Calcula posição e altura baseado no horário de início e fim
 * Cada hora tem 64px de altura (h-16 = 4rem = 64px)
 * ======================================================
 */

import type { Agendamento } from '../../../shared/types/Agendamento'
import { computed } from 'vue'

interface Props {
  agendamento: Agendamento
}

const props = defineProps<Props>()

// Altura de cada slot de hora em pixels (h-16 = 64px)
const ALTURA_HORA = 64
const INICIO_DIA = 8 // 8h

/**
 * Calcula a posição top do slot baseado no horário de início
 */
const posicaoTop = computed(() => {
  const inicio = props.agendamento.inicio
  const horas = inicio.getHours()
  const minutos = inicio.getMinutes()
  
  // Calcula offset desde as 8h
  const horasDesdeInicio = horas - INICIO_DIA
  const minutosEmHoras = minutos / 60
  
  return (horasDesdeInicio + minutosEmHoras) * ALTURA_HORA
})

/**
 * Calcula a altura do slot baseado na duração
 */
const altura = computed(() => {
  const inicio = props.agendamento.inicio
  const fim = props.agendamento.fim
  
  const duracaoMs = fim.getTime() - inicio.getTime()
  const duracaoHoras = duracaoMs / (1000 * 60 * 60)
  
  return duracaoHoras * ALTURA_HORA
})

/**
 * Formata o horário para exibição
 */
const horarioFormatado = computed(() => {
  const inicio = props.agendamento.inicio
  const fim = props.agendamento.fim
  
  const horaInicio = inicio.getHours().toString().padStart(2, '0')
  const minutoInicio = inicio.getMinutes().toString().padStart(2, '0')
  
  const horaFim = fim.getHours().toString().padStart(2, '0')
  const minutoFim = fim.getMinutes().toString().padStart(2, '0')
  
  return `${horaInicio}:${minutoInicio} - ${horaFim}:${minutoFim}`
})
</script>
