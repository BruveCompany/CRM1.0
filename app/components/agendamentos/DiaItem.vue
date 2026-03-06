<template>
  <!-- Item individual para exibir um dia -->
  <div 
    class="flex flex-1 flex-col items-center gap-1 px-4 py-3 cursor-pointer transition-all duration-200 border-l border-dotted border-black/10"
    :class="isToday ? 'bg-neutral-100' : 'bg-white'"
  >
    <!-- Dia da semana abreviado (ex: SEG, TER, QUA) -->
    <div 
      class="text-[10px] tracking-[0.1em] uppercase transition-colors duration-200"
      :class="isToday ? 'text-indigo-600 font-black' : 'text-slate-400 font-bold'"
    >
      {{ diaSemana }}
    </div>
    
    <!-- Número do dia (ex: 07, 12, 25) -->
    <div 
      class="text-xl tracking-tighter transition-colors duration-200"
      :class="isToday ? 'text-indigo-600 font-black scale-110 transform' : 'text-slate-900 font-bold'"
    >
      {{ numeroDia }}
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ================= DiaItem.vue =================
 * Componente para exibir informações de um dia específico
 */

import { computed } from 'vue'

// Interface de propriedades
interface Props {
  dia: Date // Data do dia a ser exibido
}

const props = defineProps<Props>()

/**
 * Lógica para verificar se a data passada é hoje
 */
const isToday = computed(() => {
  const hoje = new Date()
  return props.dia.getDate() === hoje.getDate() &&
         props.dia.getMonth() === hoje.getMonth() &&
         props.dia.getFullYear() === hoje.getFullYear()
})

/**
 * Array com os dias da semana abreviados
 * Índice 0 = Domingo, 6 = Sábado
 */
const diasSemanaAbrev = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

/**
 * Computed: Retorna o dia da semana abreviado (ex: "SEG")
 */
const diaSemana = computed(() => {
  return diasSemanaAbrev[props.dia.getDay()]
})

/**
 * Computed: Retorna o número do dia formatado (ex: "07", "12")
 */
const numeroDia = computed(() => {
  return String(props.dia.getDate()).padStart(2, '0')
})
</script>
