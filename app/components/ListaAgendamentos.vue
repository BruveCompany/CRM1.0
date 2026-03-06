<template>
  <div id="lista-agendamentos" class="w-full">
    <!-- Lista de Agendamentos direto sem filtros -->
    <div class="bg-white rounded-lg shadow flex flex-col items-stretch">
      <!-- Topo: Título e Filtros -->
      <div class="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 class="text-base font-semibold text-gray-900 flex items-center gap-2">
          Listagem de Agendamentos
          <span v-if="!loading && totalItems > 0" class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
            {{ totalItems }} agendamentos
          </span>
        </h2>
        
        <!-- Filtros Avançados -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- Filtro Status -->
          <div class="relative">
            <select 
              v-model="filtroStatus" 
              class="appearance-none bg-white border border-neutral-200 text-neutral-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-3 pr-8 py-2 shadow-sm transition-colors"
              @change="onFilterChange"
            >
              <option :value="undefined">Todos os Status</option>
              <option :value="false">Ativos</option>
              <option :value="true">Cancelados</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
              <Icon name="lucide:chevron-down" class="w-4 h-4" />
            </div>
          </div>

          <!-- Filtro Período -->
          <div class="relative">
            <select 
              v-model="filtroPeriodo" 
              class="appearance-none bg-white border border-neutral-200 text-neutral-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-3 pr-8 py-2 shadow-sm transition-colors"
              @change="onPeriodChange"
            >
              <option value="all">Todo o Período</option>
              <option value="today">Hoje</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
              <Icon name="lucide:chevron-down" class="w-4 h-4" />
            </div>
          </div>
        </div>
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

      <!-- Lista de cards / Tabela -->
      <div v-else class="p-0 border-t border-gray-100">
        <AppointmentsTable 
          :appointments="agendamentosFiltrados"
          :sort-column="sortColumn"
          :sort-direction="sortDirection"
          @sort="handleSort"
          @view-clicked="handleViewAction"
          @edit-clicked="handleEditAction"
          @cancel-clicked="handleCancelAction"
          @complete-clicked="handleCompleteAction"
          class="border-0 shadow-none rounded-none !border-transparent"
        />
      </div>

      <!-- Paginação -->
      <div v-if="!loading && totalItems > 0" class="px-6 py-4 border-t border-gray-100 bg-neutral-50 flex items-center justify-between">
        <div class="text-sm text-neutral-600">
          Mostrando <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> até <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, totalItems) }}</span> de <span class="font-medium">{{ totalItems }}</span> resultados
        </div>
        <div class="flex items-center gap-2">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="px-3 py-1.5 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          <div class="text-sm font-medium text-neutral-700">
             Página {{ currentPage }} de {{ totalPages }}
          </div>
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>

    <!-- Modais de Ação -->
    <AppointmentDetailsModal
      v-model="modalDetalhesAberto"
      :agendamento="agendamentoSelecionado"
    />

    <ModalEditarAgendamento
      v-model="modalEditarAberto"
      :agendamento="agendamentoSelecionado"
      :profissional-nome="agendamentoSelecionado?.profissional_nome || undefined"
      :profissional-especialidade="agendamentoSelecionado?.especialidade || undefined"
      :clientes="clientes"
      @atualizado="carregarAgendamentos"
    />

    <ModalConfirmacao
      v-model="modalConfirmacaoAberto"
      :titulo="confirmacaoConfig.titulo"
      :mensagem="confirmacaoConfig.mensagem"
      :texto-confirmar="confirmacaoConfig.textoConfirmar"
      :variant="confirmacaoConfig.variant"
      :loading="processandoAcao"
      @confirmar="executarAcao"
    />

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
import AppointmentsTable from './agendamentos/AppointmentsTable.vue'
import AppointmentDetailsModal from './agendamentos/AppointmentDetailsModal.vue'
import ModalEditarAgendamento from './agendamentos/ModalEditarAgendamento.vue'
import ModalConfirmacao from './ModalConfirmacao.vue'

// Estado
const agendamentos = ref<AgViewAgendamentoCompleto[]>([])
const clientes = ref<AgCliente[]>([])
const profissionais = ref<AgProfissional[]>([])
const loading = ref(true)

// Configuração de Ordenação Servidor
const sortColumn = ref<string>('data')
const sortDirection = ref<'asc' | 'desc'>('asc')

const currentPage = ref(1)
const itemsPerPage = ref(20)
const totalItems = ref(0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)))

// Filtros Avançados
const filtroStatus = ref<boolean | undefined>(undefined)
const filtroPeriodo = ref<string>('all')
const customDataInicio = ref<string | undefined>(undefined)
const customDataFim = ref<string | undefined>(undefined)

const onFilterChange = () => {
  currentPage.value = 1
  carregarAgendamentos()
}

const onPeriodChange = () => {
  const hoje = new Date()
  
  if (filtroPeriodo.value === 'all') {
    customDataInicio.value = undefined
    customDataFim.value = undefined
  } else if (filtroPeriodo.value === 'today') {
    const d = hoje.toISOString().split('T')[0]
    customDataInicio.value = d
    customDataFim.value = d
  } else if (filtroPeriodo.value === 'week') {
    const p = new Date(hoje)
    p.setDate(p.getDate() - p.getDay()) // Domingo
    const u = new Date(p)
    u.setDate(u.getDate() + 6) // Sabado
    customDataInicio.value = p.toISOString().split('T')[0]
    customDataFim.value = u.toISOString().split('T')[0]
  } else if (filtroPeriodo.value === 'month') {
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
    customDataInicio.value = inicio.toISOString().split('T')[0]
    customDataFim.value = fim.toISOString().split('T')[0]
  }
  
  currentPage.value = 1
  carregarAgendamentos()
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    carregarAgendamentos()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    carregarAgendamentos()
  }
}

const handleSort = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc' // Padrão ao trocar coluna
  }
  carregarAgendamentos()
}

// Composables
const { buscarRelatorioAgendamentos, cancelarAgendamento, editarAgendamento } = useAgendamento()
const { fetchClientes, fetchProfissionais } = useProfissionais()
const { fetchVendedores, fetchLeads, allLeads } = useLeads()
const { notifyError } = useNotification()

// Estados dos Modais
const modalDetalhesAberto = ref(false)
const modalEditarAberto = ref(false)
const agendamentoSelecionado = ref<AgViewAgendamentoCompleto | null>(null)

const modalConfirmacaoAberto = ref(false)
const processandoAcao = ref(false)
const confirmacaoConfig = ref({
  titulo: '',
  mensagem: '',
  textoConfirmar: 'Confirmar',
  variant: 'danger' as 'danger' | 'info',
  acao: '' as 'cancelar' | 'concluir'
})

// Ações disparadas pela Tabela
const handleViewAction = (agendamento: AgViewAgendamentoCompleto) => {
  agendamentoSelecionado.value = agendamento
  modalDetalhesAberto.value = true
}

const handleEditAction = (agendamento: AgViewAgendamentoCompleto) => {
  agendamentoSelecionado.value = agendamento
  modalEditarAberto.value = true
}

const handleCancelAction = (agendamento: AgViewAgendamentoCompleto) => {
  agendamentoSelecionado.value = agendamento
  confirmacaoConfig.value = {
    titulo: 'Cancelar Agendamento',
    mensagem: `Tem certeza que deseja cancelar o agendamento de <b>${agendamento.cliente_nome || 'Cliente Desconhecido'}</b>?<br>Esta ação não pode ser desfeita.`,
    textoConfirmar: 'Sim, Cancelar',
    variant: 'danger',
    acao: 'cancelar'
  }
  modalConfirmacaoAberto.value = true
}

const handleCompleteAction = (agendamento: AgViewAgendamentoCompleto) => {
  agendamentoSelecionado.value = agendamento
  confirmacaoConfig.value = {
    titulo: 'Concluir Agendamento',
    mensagem: `Tem certeza que deseja marcar o agendamento de <b>${agendamento.cliente_nome || 'Cliente Desconhecido'}</b> como concluído?<br>Ele será destacado na cor verde (${agendamento.titulo}).`,
    textoConfirmar: 'Sim, Concluir',
    variant: 'info',
    acao: 'concluir'
  }
  modalConfirmacaoAberto.value = true
}

const executarAcao = async () => {
  if (!agendamentoSelecionado.value) return
  processandoAcao.value = true

  try {
    if (confirmacaoConfig.value.acao === 'cancelar') {
      const success = await cancelarAgendamento(agendamentoSelecionado.value.id)
      if (success) {
        modalConfirmacaoAberto.value = false
        carregarAgendamentos()
      }
    } else if (confirmacaoConfig.value.acao === 'concluir') {
      const tituloAtual = agendamentoSelecionado.value.titulo || 'Agendamento'
      const tituloNovo = tituloAtual.startsWith('[CONCLUÍDO]') ? tituloAtual : `[CONCLUÍDO] ${tituloAtual}`
      
      const success = await editarAgendamento(agendamentoSelecionado.value.id, {
        titulo: tituloNovo,
        descricao: agendamentoSelecionado.value.descricao || null,
        cor: '#10B981' // Verde para concluído
      })
      if (success) {
        modalConfirmacaoAberto.value = false
        carregarAgendamentos()
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    processandoAcao.value = false
  }
}

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
 * Carrega todos os agendamentos do sistema usando os parâmetros de ordenação, paginação e filtros
 */
async function carregarAgendamentos() {
  loading.value = true
  try {
    const resultado = await buscarRelatorioAgendamentos({
      orderBy: sortColumn.value,
      orderAsc: sortDirection.value === 'asc',
      page: currentPage.value,
      limit: itemsPerPage.value,
      cancelado: filtroStatus.value,
      dataInicio: customDataInicio.value,
      dataFim: customDataFim.value
    })
    
    if (resultado && resultado.data) {
      agendamentos.value = resultado.data
      totalItems.value = resultado.count
    } else {
      agendamentos.value = []
      totalItems.value = 0
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
  // Carrega leads silenciosamente para habilitar lookup reverso (cliente_id -> lead_id)
  if (!allLeads.value || allLeads.value.length === 0) {
    fetchLeads(true)
  }
})
</script>
