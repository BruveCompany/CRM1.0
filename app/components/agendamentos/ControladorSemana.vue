<template>
  <div class="flex flex-col gap-2">
    <!-- Primeira linha: Período da semana atual -->
    <div v-if="primeiroDia && ultimoDia" class="text-base font-semibold text-neutral-800">
      De {{ formatarData(primeiroDia) }} até {{ formatarData(ultimoDia) }}
    </div>

    <!-- Segunda linha: Botões de navegação entre semanas -->
    <div class="flex gap-2">
      <!-- Botão: Semana anterior -->
      <button
        @click="voltarSemana"
        class="flex items-center gap-1.5 px-3 h-[34px] rounded-md font-semibold text-[0.82rem] transition-all bg-[#eef2ff] text-[#4f46e5] hover:bg-[#e0e7ff] border-none cursor-pointer"
        title="Semana anterior"
      >
        <span>←</span>
        <span>Anterior</span>
      </button>

      <!-- Botão: Próxima semana -->
      <button
        @click="avancarSemana"
        class="flex items-center gap-1.5 px-3 h-[34px] rounded-md font-semibold text-[0.82rem] transition-all bg-[#eef2ff] text-[#4f46e5] hover:bg-[#e0e7ff] border-none cursor-pointer"
        title="Próxima semana"
      >
        <span>Próxima</span>
        <span>→</span>
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

</script>
