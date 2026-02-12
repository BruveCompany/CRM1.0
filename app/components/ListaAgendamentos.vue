<template>
  <div id="lista-agendamentos" class="w-full space-y-2">
    <!-- Seção Filtros -->
    <div class="border border-neutral-200 rounded-lg">
      <div class="px-4 py-2">
        <h2 class="text-lg font-bold text-neutral-900 mb-0.5">Filtros</h2>

        <!-- Filtros -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-0.5 md:gap-x-24">
          <SeletorCliente
            v-model="filtroClienteId"
            :clientes="clientes"
          />
          <SeletorProfissional 
            v-model="filtroProfissionalId"
            :profissionais="profissionais"
          />
        </div>

        <!-- Botão limpar filtros -->
        <div class="flex justify-end mt-0.5">
          <BaseButton
            variant="primary"
            size="sm"
            @click="limparFiltros"
          >
            Limpar Filtros
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Seção Agendamentos -->
    <div class="border border-neutral-200 rounded-lg overflow-hidden">
      <div class="px-2 py-1.5 border-b border-neutral-200">
        <h2 class="text-lg font-bold text-neutral-900">
          Agendamentos
          <span v-if="!loading && agendamentosFiltrados.length > 0" class="text-sm font-normal text-neutral-500">
            ({{ agendamentosFiltrados.length }} agendamentos)
          </span>
        </h2>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-neutral-500 text-sm">Carregando agendamentos...</div>
      </div>

      <!-- Sem agendamentos -->
      <div v-else-if="!agendamentosFiltrados || agendamentosFiltrados.length === 0" class="flex flex-col items-center justify-center py-12">
        <div class="text-neutral-400 text-sm">Nenhum agendamento encontrado</div>
      </div>

      <!-- Lista de cards -->
      <div v-else class="flex flex-col">
        <CardAgendamento
          v-for="agendamento in agendamentosFiltrados"
          :key="agendamento.id"
          :agendamento="agendamento"
        />
      </div>
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
 * - Filtrar por cliente e profissional no frontend
 * - Exibir em lista de cards elegantes
 * - Mostrar estados de loading e vazio
 * 
 * Busca:
 * - Usa RPC ag_get_agendamentos_completo
 * - Traz dados completos de cliente e profissional
 * - Ordenados por data e hora
 * ==========================================================
 */

import { ref, computed, onMounted } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useAgendamento } from '../composables/useAgendamento'
import { useProfissionais } from '../composables/useProfissionais'
import { useNotification } from '../composables/useNotification'
import type { AgViewAgendamentoCompleto } from '../../shared/types/database'
import type { AgCliente, AgProfissional } from '../../shared/types/database'
import CardAgendamento from './CardAgendamento.vue'
import SeletorCliente from './SeletorCliente.vue'
import SeletorProfissional from './SeletorProfissional.vue'
import BaseButton from './BaseButton.vue'

// Estado
const agendamentos = ref<AgViewAgendamentoCompleto[]>([])
const clientes = ref<AgCliente[]>([])
const profissionais = ref<AgProfissional[]>([])
const loading = ref(true)

// Filtros
const filtroClienteId = ref('')
const filtroProfissionalId = ref('')

// Composables
const { buscarRelatorioAgendamentos } = useAgendamento()
const { fetchClientes, fetchProfissionais } = useProfissionais()
const { notifyError } = useNotification()

/**
 * Filtra os agendamentos no frontend por cliente e/ou profissional
 */
const agendamentosFiltrados = computed(() => {
  let resultado = agendamentos.value

  if (filtroClienteId.value) {
    resultado = resultado.filter(
      (a) => String(a.cliente_id) === filtroClienteId.value
    )
  }

  if (filtroProfissionalId.value) {
    resultado = resultado.filter(
      (a) => String(a.profissional_id) === filtroProfissionalId.value
    )
  }

  return resultado
})

/**
 * Limpa todos os filtros
 */
function limparFiltros() {
  filtroClienteId.value = ''
  filtroProfissionalId.value = ''
}

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

/**
 * Carrega clientes e profissionais em segundo plano (não bloqueia a UI)
 */
async function carregarDadosFiltros() {
  try {
    const [clientesData, profissionaisData] = await Promise.all([
      fetchClientes(),
      fetchProfissionais()
    ])
    clientes.value = clientesData
    profissionais.value = profissionaisData
  } catch (error) {
    console.error('Erro ao carregar dados dos filtros:', error)
  }
}

// Carrega agendamentos imediatamente e dados dos filtros em segundo plano
onMounted(() => {
  carregarAgendamentos()
  carregarDadosFiltros()
})
</script>
