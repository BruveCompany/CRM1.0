<template>
  <div class="date-nav-wrapper">
    <!-- Botão: Semana anterior -->
    <button
      @click="voltarSemana"
      class="nav-btn"
      title="Semana anterior"
    >
      <Icon name="lucide:chevron-left" class="w-4 h-4" />
    </button>

    <!-- Período da semana atual -->
    <div v-if="primeiroDia && ultimoDia" class="date-label">
      {{ formatarData(primeiroDia) }} · {{ formatarData(ultimoDia) }}
    </div>

    <!-- Botão: Próxima semana -->
    <button
      @click="avancarSemana"
      class="nav-btn"
      title="Próxima semana"
    >
      <Icon name="lucide:chevron-right" class="w-4 h-4" />
    </button>
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

<style scoped>
/* Wrapper: container com borda sutil unindo os três elementos */
.date-nav-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0;
  border: 1px solid #E4E2F6;
  border-radius: 8px;
  background: white;
  overflow: hidden;
}

/* Botões ghost — sem fundo, só ícone */
.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 30px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
  flex-shrink: 0;
}

.nav-btn:hover {
  background: #F3F2FB;
  color: #4338CA;
}

/* Data: tipografia refinada */
.date-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  padding: 0 12px;
  border-left: 1px solid #E4E2F6;
  border-right: 1px solid #E4E2F6;
  line-height: 30px;
  letter-spacing: -0.01em;
}
</style>
