<template>
  <div class="flex flex-col h-full bg-white">
    <!-- Cabeçalho dos Dias (Fixado no topo da grade) -->
    <div class="px-4 pt-2 border-b border-neutral-100 pb-2 bg-white sticky top-0 z-10">
      <ListaDias :dias="agendamentoStore.diasSemana" />
    </div>

    <!-- Grade da Agenda -->
    <div class="flex-1 px-4 flex min-h-0 overflow-hidden">
      <div class="flex-shrink-0">
        <ReguaHorarios />
      </div>
      
      <div class="flex flex-1 gap-2 overflow-x-auto pb-4">
        <ItemAgendamento
          v-for="(dia, index) in agendamentoStore.diasSemana"
          :key="'dia-' + index"
          :data="dia"
          :clientes="clientes"
          :profissionais="profissionais"
          :vendedores="vendedoresLista"
          :profissional-nome="profissionalAtualNome"
          :profissional-especialidade="profissionalAtualEspecialidade"
          @editar-agendamento="handleAbrirEdicao"
        />
      </div>
    </div>

    <!-- Modais -->
    <ModalNovoAgendamento
      v-model="modalNovoAgendamentoAberto"
      :profissional-id="agendamentoStore.profissionalId"
      :profissional-nome="profissionalAtualNome"
      :profissional-especialidade="profissionalAtualEspecialidade"
      :profissionais="profissionais"
      :dias-semana="agendamentoStore.diasSemana"
      :clientes="clientes"
      :agendamentos="agendamentos"
      @salvar="handleSalvarAgendamento"
    />

    <ModalEditarAgendamento
      v-model="modalEditarAgendamentoAberto"
      :agendamento="agendamentoSelecionado"
      :profissional-nome="profissionalAtualNome"
      :profissional-especialidade="profissionalAtualEspecialidade"
      :clientes="clientes"
      @atualizado="handleAgendamentoAtualizado"
    />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  hideInternalHeader?: boolean
}>(), {
  hideInternalHeader: false
})
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import ControladorSemana from './ControladorSemana.vue'
import ProfissionalAtual from './ProfissionalAtual.vue'
import ListaDias from './ListaDias.vue'
import ReguaHorarios from './ReguaHorarios.vue'
import ItemAgendamento from './ItemAgendamento.vue'
import ModalNovoAgendamento from './ModalNovoAgendamento.vue'
import ModalEditarAgendamento from './ModalEditarAgendamento.vue'
import BaseButton from '~/components/BaseButton.vue'

import { useAgendamentoStore } from '~/stores/agendamento'
import { useProfissionais } from '~/composables/useProfissionais'
import { useLeads } from '~/composables/useLeads'
import type { AgCliente, AgProfissional, AgViewAgendamentoCompleto } from '../../../shared/types/database'

const agendamentoStore = useAgendamentoStore()
const { fetchClientes, fetchProfissionais } = useProfissionais()
const { fetchVendedores } = useLeads()
const supabase = useSupabaseClient()

const clientes = ref<AgCliente[]>([])
const profissionais = ref<AgProfissional[]>([])
const loadingProfissionais = ref(true)
const modalNovoAgendamentoAberto = ref(false)
const modalEditarAgendamentoAberto = ref(false)
const agendamentoSelecionado = ref<AgViewAgendamentoCompleto | null>(null)

// --- Lógica Realtime Prime ---
let agendaChannel: any = null

function setupRealtime() {
  console.log('🔌 Agenda: Configurando Realtime...')
  
  let agendaDebounceTimer: any = null
  agendaChannel = supabase
    .channel('agenda-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ag_agendamentos' },
      (payload: any) => {
        if (agendaDebounceTimer) clearTimeout(agendaDebounceTimer)
        agendaDebounceTimer = setTimeout(() => {
          console.log('✨ Agenda: Mudança detectada no banco!', payload.eventType)
          // Limpa todo o cache de agendamentos para garantir que nada antigo seja exibido
          agendamentoStore.cacheAgendamentos = {}
          // Recarrega os agendamentos da visão atual (silencioso)
          agendamentoStore.carregarAgendamentos(true)
        }, 800)
      }
    )
    .subscribe((status) => {
      console.log('📡 Agenda: Status da conexão Realtime:', status)
    })
}

// --- Fim da Lógica Realtime ---

// Lista de vendedores (quem cria agendamentos) vindo do estado global
const { vendedores: vendedoresGlobal } = useLeads()
const vendedoresLista = computed(() => vendedoresGlobal.value)

const agendamentos = computed(() => agendamentoStore.agendamentos)

const profissionalAtualObj = computed(() => {
  if (!agendamentoStore.profissionalId) return null
  return profissionais.value.find((p: AgProfissional) => String(p.profissional_id) === String(agendamentoStore.profissionalId)) || null
})

const profissionalAtualNome = computed(() => {
  if (!agendamentoStore.profissionalId) return 'Todos os Profissionais'
  return profissionalAtualObj.value?.nome || 'Profissional não carregado'
})

const profissionalAtualEspecialidade = computed(() => {
  if (!agendamentoStore.profissionalId) return 'Visão Geral'
  return profissionalAtualObj.value?.especialidade || ''
})

watch(() => agendamentoStore.profissionalId, async (val) => {
  console.log('🔄 Agenda: Carregando para profissional:', val || 'TODOS')
  await agendamentoStore.carregarAgendamentos()
}, { immediate: true })

watch(() => agendamentoStore.diasSemana, async (novos, antigos) => {
  if (antigos && antigos[0] && novos && novos[0] && novos[0].getTime() !== antigos[0].getTime()) {
    console.log('📅 Agenda: Mudança de semana detectada')
    await agendamentoStore.carregarAgendamentos()
  }
})

onMounted(async () => {
  console.log('🚀 Agenda: Iniciando montagem...')
  setupRealtime() // Ativa o Realtime na montagem
  
  try {
    loadingProfissionais.value = true
    
    // Busca profissionais primeiro para garantir a lista
    console.log('📥 Agenda: Buscando profissionais...')
    const pData = await fetchProfissionais()
    console.log('👥 Agenda: Profissionais carregados:', pData.length)
    profissionais.value = pData

    // Busca o restante em paralelo
    console.log('📥 Agenda: Buscando clientes e vendedores...')
    const [cData] = await Promise.all([
      fetchClientes(),
      fetchVendedores()
    ])
    clientes.value = cData
    console.log('✅ Agenda: Carga inicial concluída')
  } catch (err) {
    console.error('❌ Agenda: Erro fatal na carga inicial:', err)
  } finally {
    loadingProfissionais.value = false
  }
})

onUnmounted(() => {
  if (agendaChannel) {
    console.log('🔌 Agenda: Desconectando Realtime...')
    supabase.removeChannel(agendaChannel)
  }
})

function handleNovoAgendamento() {
  modalNovoAgendamentoAberto.value = true
}

function handleSalvarAgendamento() {
  modalNovoAgendamentoAberto.value = false
  // Não precisamos mais chamar carregarAgendamentos manualmente aqui
  // pois o Realtime já vai detectar o INSERT e recarregar
}

function handleAbrirEdicao(ag: AgViewAgendamentoCompleto) {
  agendamentoSelecionado.value = ag
  modalEditarAgendamentoAberto.value = true
}

function handleAgendamentoAtualizado() {
  modalEditarAgendamentoAberto.value = false
  agendamentoSelecionado.value = null
  // Não precisamos mais chamar carregarAgendamentos manualmente aqui
  // pois o Realtime já vai detectar o UPDATE/DELETE e recarregar
}

// Expõe funções para componentes pais
defineExpose({
  handleNovoAgendamento
})
</script>
