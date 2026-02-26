<template>
  <div id="lista-agendamentos" class="w-full">
    <!-- Lista de Agendamentos direto sem filtros -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h2 class="text-base font-semibold text-gray-900">
          Listagem de Agendamentos
        </h2>
        <span v-if="!loading && agendamentosFiltrados.length > 0" class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
          {{ agendamentosFiltrados.length }} agendamentos
        </span>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-16">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
        <div class="text-neutral-500 text-sm">Carregando agendamentos...</div>
      </div>

      <!-- Sem agendamentos -->
      <div v-else-if="!agendamentosFiltrados || agendamentosFiltrados.length === 0" class="flex flex-col items-center justify-center py-16">
        <div class="text-neutral-400 text-sm italic">Nenhum agendamento encontrado para os filtros selecionados.</div>
      </div>

      <!-- Lista de cards -->
      <div v-else class="divide-y divide-gray-100">
        <CardAgendamento
          v-for="agendamento in agendamentosFiltrados"
          :key="agendamento.id"
          :agendamento="agendamento"
          class="hover:bg-neutral-50 transition-colors"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ListaAgendamentos.vue
 * Lista todos os agendamentos em formato de cards.
 * Filtra por cliente, profissional e busca textual (via props).
 */

import { ref, computed, onMounted } from 'vue'
import { useAgendamento } from '../composables/useAgendamento'
import { useProfissionais } from '../composables/useProfissionais'
import { useLeads } from '../composables/useLeads'
import { useNotification } from '../composables/useNotification'
import type { AgViewAgendamentoCompleto } from '../../shared/types/database'
import type { AgCliente, AgProfissional } from '../../shared/types/database'
import CardAgendamento from './CardAgendamento.vue'

// Estado
const agendamentos = ref<AgViewAgendamentoCompleto[]>([])
const clientes = ref<AgCliente[]>([])
const profissionais = ref<AgProfissional[]>([])
const loading = ref(true)

// Composables
const { buscarRelatorioAgendamentos } = useAgendamento()
const { fetchClientes, fetchProfissionais } = useProfissionais()
const { fetchVendedores } = useLeads()
const { notifyError } = useNotification()

const props = defineProps<{
  searchQuery?: string
  filtroClienteId?: string
  filtroProfissionalId?: string
}>()

/**
 * Filtra os agendamentos no frontend por cliente, profissional e busca textual
 */
const agendamentosFiltrados = computed(() => {
  let resultado = agendamentos.value

  // Filtro de Busca Textual
  if (props.searchQuery) {
    const q = props.searchQuery.toLowerCase().trim()
    resultado = resultado.filter(a => 
      (a.cliente_nome && a.cliente_nome.toLowerCase().includes(q)) ||
      (a.profissional_nome && a.profissional_nome.toLowerCase().includes(q)) ||
      (a.titulo && a.titulo.toLowerCase().includes(q))
    )
  }

  if (props.filtroClienteId) {
    resultado = resultado.filter(
      (a) => String(a.cliente_id) === props.filtroClienteId
    )
  }

  if (props.filtroProfissionalId) {
    resultado = resultado.filter(
      (a) => String(a.profissional_id) === props.filtroProfissionalId
    )
  }

  return resultado
})



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
      fetchProfissionais(),
      fetchVendedores()
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
