<template>
  <!-- Item individual para exibir um dia -->
  <div class="flex flex-1 flex-col items-center gap-1 px-4 pt-1 pb-3 cursor-pointer transition-all duration-200 hover:bg-[#4338CA]/20 border-r border-gray-200 last:border-r-0">
    <!-- Dia da semana abreviado (ex: SEG, TER, QUA) -->
    <div class="text-xs font-semibold text-gray-700">
      {{ diaSemana }}
    </div>
    
    <!-- Número do dia (ex: 07, 12, 25) -->
    <div class="text-lg font-bold text-gray-900">
      {{ numeroDia }}
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ================= DiaItem.vue =================
 * Componente para exibir informações de um dia específico
 * 
 * Props:
 * @param {Date} dia - Data a ser exibida
 * 
 * Exibe:
 * - Dia da semana abreviado (DOM, SEG, TER, etc.)
 * - Número do dia (1-31)
 * 
 * Futuras melhorias:
 * - Destacar dia atual
 * - Permitir seleção/clique
 * - Exibir indicadores de agendamentos
 * =================================================
 */

// Interface de propriedades
interface Props {
  dia: Date // Data do dia a ser exibido
}

const props = defineProps<Props>()

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
