<template>
  <div class="flex flex-col h-full bg-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.03)] rounded-xl overflow-hidden border border-black/5">
    <!-- Cabeçalho dos Dias (Fixado no topo da grade) -->
    <div class="px-4 pt-2 border-b border-black/10 pb-2 bg-white sticky top-0 z-10 overflow-y-scroll invisible-scrollbar" style="scrollbar-gutter: stable;">
      <ListaDias :dias="agendamentoStore.diasSemana" />
    </div>

    <!-- Grade da Agenda -->
    <div class="flex-1 px-4 flex min-h-0 overflow-y-auto custom-scrollbar relative" style="scrollbar-gutter: stable;">
      <!-- Indicador de Tempo Real (Linha do Tempo) -->
      <div 
        v-if="isTodayInView" 
        class="absolute left-0 right-4 pointer-events-none z-20 flex items-center"
        :style="{ top: (currentTimePosition + 9) + 'px' }"
      >
        <!-- Ponto do Indicador (Posicionado sobre a régua) -->
        <div class="w-2.5 h-2.5 bg-indigo-600 rounded-full ml-[26px] shadow-sm border border-white"></div>
        <!-- Linha do Indicador -->
        <div class="h-[1px] flex-1 bg-indigo-600 shadow-sm opacity-50"></div>
      </div>

      <!-- Régua Lateral -->
      <div class="flex-shrink-0">
        <ReguaHorarios />
      </div>
      
      <!-- Container das Colunas -->
      <div class="flex flex-1 gap-0 min-h-[960px]">
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
          @novo-agendamento="handleNovoAgendamentoNoSlot"
          @reagendar="handleReagendar"
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
      :data-pre-selecionada="dataAgendamentoSelecionada"
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

    <!-- Modal de Notificação Proativa -->
    <ConfirmNotificationModal />
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
import ConfirmNotificationModal from './ConfirmNotificationModal.vue'
import BaseButton from '~/components/BaseButton.vue'

import { useAgendamentoStore } from '~/stores/agendamento'
import { useProfissionais } from '~/composables/useProfissionais'
import { useLeads } from '~/composables/useLeads'
import type { AgCliente, AgProfissional, AgViewAgendamentoCompleto } from '../../../shared/types/database'

const agendamentoStore = useAgendamentoStore()
const { fetchClientes, fetchProfissionais } = useProfissionais()
const { fetchVendedores } = useLeads()
const { reagendarAgendamento } = useAgendamento()
const supabase = useSupabaseClient()

const clientes = ref<AgCliente[]>([])
const profissionais = ref<AgProfissional[]>([])
const loadingProfissionais = ref(true)
const modalNovoAgendamentoAberto = ref(false)
const modalEditarAgendamentoAberto = ref(false)
const agendamentoSelecionado = ref<AgViewAgendamentoCompleto | null>(null)
const dataAgendamentoSelecionada = ref<Date | null>(null)
const reagendando = ref(false)

// --- Lógica de Linha do Tempo (Tempo Real) ---
const currentTimePosition = ref(0)
const HOUR_HEIGHT_IN_PX = 64 // altura de h-16 (4rem)
let timeInterval: any = null

function updateCurrentTimePosition() {
  const agora = new Date()
  const horas = agora.getHours()
  const minutos = agora.getMinutes()
  
  // O grid começa às 08:00, então subtraímos 8 para ter o offset correto
  // Se for antes das 08h, a posição será negativa (fora da grade visível)
  const totalHoras = (horas - 8) + (minutos / 60)
  currentTimePosition.value = totalHoras * HOUR_HEIGHT_IN_PX
}

const isTodayInView = computed(() => {
  const hoje = new Date()
  const hojeString = hoje.toISOString().split('T')[0]
  return agendamentoStore.diasSemana.some(dia => dia.toISOString().split('T')[0] === hojeString)
})

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
  
  // Inicializa a linha do tempo
  updateCurrentTimePosition()
  timeInterval = setInterval(() => {
    updateCurrentTimePosition()
  }, 60000)

  // Invalida o cache na montagem para garantir que status_nome e status_cor
  // venham frescos da view atualizada (ag_view_agendamentos_completo).
  // Isso resolve o bug onde dados cacheados antes da migração não tinham status_nome.
  agendamentoStore.cacheAgendamentos = {}
  
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
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

function handleNovoAgendamento() {
  dataAgendamentoSelecionada.value = null
  modalNovoAgendamentoAberto.value = true
}

function handleNovoAgendamentoNoSlot(data: Date) {
  dataAgendamentoSelecionada.value = data
  modalNovoAgendamentoAberto.value = true
}

function handleSalvarAgendamento() {
  modalNovoAgendamentoAberto.value = false
  dataAgendamentoSelecionada.value = null
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

async function handleReagendar(payload: { id: number; novaData: string; novaHoraInicio: string; novaHoraFim: string }) {
  if (reagendando.value) return
  
  try {
    reagendando.value = true
    const ok = await reagendarAgendamento(payload.id, {
      data: payload.novaData,
      hora_inicio: payload.novaHoraInicio,
      hora_fim: payload.novaHoraFim
    })
    
    // Se falhar (retorna null), o Realtime não vai disparar, então não precisamos fazer nada aqui
    // Se tiver sucesso, o Realtime vai recarregar a grade automaticamente
  } finally {
    reagendando.value = false
  }
}

// Expõe funções para componentes pais
defineExpose({
  handleNovoAgendamento
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* Esconde a 'track' e o 'thumb' no cabeçalho para não ficar feio, mas mantém o espaço */
.invisible-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.invisible-scrollbar::-webkit-scrollbar-thumb {
  background: transparent;
}
</style>
