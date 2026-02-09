<template>
  <div class="flex flex-col gap-2">
    <!-- Primeira linha: Período da semana atual -->
    <div v-if="primeiroDia && ultimoDia" class="text-base font-semibold text-gray-800">
      De {{ formatarData(primeiroDia) }} até {{ formatarData(ultimoDia) }}
    </div>

    <!-- Segunda linha: Botões de navegação entre semanas -->
    <div class="flex gap-3">
      <!-- Botão: Semana anterior -->
      <button
        @click="voltarSemana"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        class="px-2 py-1 text-white rounded-md transition-colors flex items-center gap-1.5"
        style="background-color: #4338CA;"
        title="Semana anterior"
      >
        <span class="text-xs">←</span>
        <span class="text-xs">Anterior</span>
      </button>

      <!-- Botão: Próxima semana -->
      <button
        @click="avancarSemana"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        class="px-2 py-1 text-white rounded-md transition-colors flex items-center gap-1.5"
        style="background-color: #4338CA;"
        title="Próxima semana"
      >
        <span class="text-xs">Próxima</span>
        <span class="text-xs">→</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ================= ControladorSemana.vue =================
 * Componente de navegação entre semanas
 * 
 * Funcionalidades:
 * - Exibe período da semana (data inicial e final)
 * - Permite navegar para semana anterior ou próxima
 * - Atualiza automaticamente os dados do store
 * 
 * Integração:
 * - Conectado ao store de agendamento (Pinia)
 * - Atualiza reativamente quando a data de referência muda
 * ========================================================
 */

import { useAgendamentoStore } from '~/stores/agendamento'

// Instância do store de agendamento
const store = useAgendamentoStore()

/**
 * Computed Properties para primeiro e último dia da semana
 * Busca do array diasSemana no store (índice 0 = Domingo, 6 = Sábado)
 */
const primeiroDia = computed(() => store.diasSemana[0])
const ultimoDia = computed(() => store.diasSemana[6])

/**
 * Navega para a semana anterior
 * Subtrai 7 dias da data de referência no store
 */
function voltarSemana() {
  store.voltarSemana()
}

/**
 * Navega para a próxima semana
 * Adiciona 7 dias à data de referência no store
 */
function avancarSemana() {
  store.avancarSemana()
}

/**
 * Formata objeto Date para string no formato DD/MM
 * @param {Date} data - Data a ser formatada
 * @returns {string} Data formatada (ex: "08/02")
 */
function formatarData(data: Date): string {
  const dia = String(data.getDate()).padStart(2, '0')
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  return `${dia}/${mes}`
}

/**
 * Handler para evento mouseenter nos botões
 * Escurece o fundo do botão ao passar o mouse
 */
function handleMouseEnter(event: MouseEvent) {
  const target = event.currentTarget as HTMLButtonElement
  if (target) {
    target.style.backgroundColor = '#3730A3' // Versão mais escura
  }
}

/**
 * Handler para evento mouseleave nos botões
 * Restaura a cor original do botão
 */
function handleMouseLeave(event: MouseEvent) {
  const target = event.currentTarget as HTMLButtonElement
  if (target) {
    target.style.backgroundColor = '#4338CA' // Cor padrão
  }
}
</script>
