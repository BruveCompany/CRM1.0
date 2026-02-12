<template>
  <div id="lista-agendamentos" class="border border-gray-200 rounded-lg overflow-hidden w-full">
    <!-- Cabeçalho -->
    <div class="px-6 py-4 border-b border-gray-200">
      <h2 class="text-lg font-bold text-gray-900">
        Agendamentos
        <span v-if="!loading && agendamentos.length > 0" class="text-sm font-normal text-gray-500">
          ({{ agendamentos.length }} agendamentos)
        </span>
      </h2>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-gray-500 text-sm">Carregando agendamentos...</div>
    </div>

    <!-- Sem agendamentos -->
    <div v-else-if="!agendamentos || agendamentos.length === 0" class="flex flex-col items-center justify-center py-12">
      <div class="text-gray-400 text-sm">Nenhum agendamento encontrado</div>
    </div>

    <!-- Lista de cards -->
    <div v-else class="flex flex-col">
      <CardAgendamento
        v-for="agendamento in agendamentos"
        :key="agendamento.id"
        :agendamento="agendamento"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ================= ListaAgendamentos.vue =================
 * Componente para listar todos os agendamentos em formato de cards
 * 
 * Responsabilidades:
 * - Buscar agendamentos completos (com dados de cliente e profissional)
 * - Exibir em grid responsivo de cards elegantes
 * - Mostrar estados de loading e vazio
 * 
 * Busca:
 * - Usa a view ag_view_agendamentos_completo
 * - Traz dados completos de cliente e profissional
 * - Ordenados por data e hora
 * ==========================================================
 */

import { ref, onMounted } from 'vue'
import { useAgendamento } from '../composables/useAgendamento'
import { useNotification } from '../composables/useNotification'
import type { AgViewAgendamentoCompleto } from '../../shared/types/database'
import CardAgendamento from './CardAgendamento.vue'

// Estado
const agendamentos = ref<AgViewAgendamentoCompleto[]>([])
const loading = ref(true)

// Composables
const { buscarRelatorioAgendamentos } = useAgendamento()
const { notifyError } = useNotification()

/**
 * Carrega todos os agendamentos do sistema
 */
async function carregarAgendamentos() {
  loading.value = true
  try {
    const resultado = await buscarRelatorioAgendamentos()
    
    if (resultado) {
      agendamentos.value = resultado
    } else {
      notifyError('Erro ao carregar agendamentos')
    }
  } catch (error) {
    console.error('Erro ao carregar agendamentos:', error)
    notifyError('Erro ao carregar agendamentos')
  } finally {
    loading.value = false
  }
}

// Carrega dados ao montar
onMounted(() => {
  carregarAgendamentos()
})
</script>
