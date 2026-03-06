<template>
  <BaseModal v-model="isOpen" size="2xl">
    <!-- Header -->
    <template #header>
      <h3 class="text-lg font-semibold text-neutral-900">Novo Agendamento</h3>
    </template>
    
    <!-- Body -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-1">
      <!-- LADO ESQUERDO: Dados de Identificação e Tempo -->
      <div class="space-y-3.5">
        <!-- Seleção de Profissional -->
        <div>
          <label class="block text-sm font-semibold text-neutral-700 mb-1">
            Profissional Responsável <span class="text-error-500">*</span>
          </label>
          <select 
            v-model="formData.profissionalId"
            class="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-sm hover:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700 focus:border-primary-700 transition-all bg-white"
          >
            <option value="">Selecione um profissional</option>
            <option 
              v-for="prof in profissionais" 
              :key="prof.profissional_id"
              :value="prof.profissional_id"
            >
              {{ prof.nome }}
            </option>
          </select>
          
          <!-- Info compacta de quem está agendando -->
          <div v-if="profile?.nome" class="mt-1.5 flex items-center gap-1.5 px-2 py-1 bg-primary-50/50 border border-primary-100 rounded text-[10px] text-primary-600 font-medium italic">
            <UserCircleIcon class="w-3.5 h-3.5" />
            Agendando por: {{ profile.nome }}
          </div>
        </div>

        <!-- Cliente (componente extraído) - OCULTO se for agendamento de Lead -->
        <SeletorCliente
          v-if="!leadId && !clienteNome"
          ref="seletorClienteRef"
          v-model="formData.clienteId"
          :clientes="clientes"
          @cadastrar="irParaCadastroCliente"
        />
        <div v-else class="pb-1">
          <label class="block text-sm font-semibold text-neutral-700 mb-1">
            {{ leadId || clienteNome ? 'Lead' : 'Cliente' }}
          </label>
          <div class="px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-200 text-sm text-neutral-600 font-medium">
            {{ clienteNome || 'Lead Selecionado' }}
          </div>
        </div>

        <!-- Blocos de Data e Hora -->
        <div class="grid grid-cols-1 gap-3 pt-1">
          <!-- Data -->
          <div>
            <label class="block text-sm font-semibold text-neutral-700 mb-1">
              Data do Atendimento <span class="text-error-500">*</span>
            </label>
            <select 
              v-model="formData.data"
              class="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-sm hover:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700 focus:border-primary-700 transition-all bg-white"
            >
              <option value="">Selecione a data</option>
              <option 
                v-for="(dia, index) in diasSemana" 
                :key="index"
                :value="formatarDataISO(dia)"
              >
                {{ formatarDiaParaExibicao(dia) }}
              </option>
            </select>
          </div>

          <!-- Horários Lado a Lado -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-sm font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                Início
                <Icon v-if="loadingAvailability" name="lucide:loader-2" class="w-3 h-3 animate-spin text-primary-500" />
              </label>
              <div class="relative">
                <select 
                  v-model="formData.horaInicio"
                  :disabled="!formData.data || loadingAvailability"
                  class="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-sm hover:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700 focus:border-primary-700 transition-all disabled:bg-neutral-50 disabled:text-neutral-400 bg-white"
                >
                  <option value="">{{ loadingAvailability ? 'Buscando...' : '--:--' }}</option>
                  <option v-for="hora in availableSlots" :key="hora" :value="hora">{{ hora }}</option>
                </select>
              </div>
            </div>
            <div>
              <label class="text-sm font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                Fim
                <Icon v-if="loadingAvailability" name="lucide:loader-2" class="w-3 h-3 animate-spin text-primary-500" />
              </label>
              <div class="relative">
                <select 
                  v-model="formData.horaFim"
                  :disabled="!formData.horaInicio || loadingAvailability"
                  class="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-sm hover:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700 focus:border-primary-700 transition-all disabled:bg-neutral-50 disabled:text-neutral-400 bg-white"
                >
                  <option value="">{{ loadingAvailability ? 'Buscando...' : '--:--' }}</option>
                  <option v-for="hora in horariosFimDisponiveis" :key="'fim-' + hora" :value="hora">{{ hora }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- LADO DIREITO: Detalhes do Atendimento -->
      <div class="space-y-3.5">
        <!-- Finalidade -->
        <div>
          <label class="block text-sm font-semibold text-neutral-700 mb-1">
            Finalidade do Atendimento <span class="text-error-500">*</span>
          </label>
          <select 
            v-model="formData.categoria"
            class="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-sm hover:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700 focus:border-primary-700 transition-all bg-white"
            @change="handleTrocarCategoria"
          >
            <option v-for="cat in CATEGORIAS" :key="cat.id" :value="cat.id">
              {{ cat.label }}
            </option>
          </select>
        </div>

        <!-- Título -->
        <div>
          <label class="block text-sm font-semibold text-neutral-700 mb-1">
            Título <span class="text-error-500">*</span>
          </label>
          <BaseInput 
            v-model="formData.titulo"
            placeholder="Ex: Consulta de avaliação"
            class="!py-1.5"
          />
        </div>

        <!-- Descrição -->
        <div>
          <label class="block text-sm font-semibold text-neutral-700 mb-1">Descrição</label>
          <textarea
            v-model="formData.descricao"
            rows="2"
            placeholder="Observações importantes..."
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm hover:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700 focus:border-primary-700 transition-all resize-none bg-white"
          ></textarea>
        </div>

        <!-- Cor -->
        <div class="pt-1">
          <SeletorCor v-model="formData.cor" />
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <template #footer>
      <BaseButton @click="handleCancelar" variant="secondary" :disabled="salvando">Cancelar</BaseButton>
      <BaseButton @click="handleSalvar" variant="primary" :disabled="salvando">
        {{ salvando ? 'Salvando...' : 'Salvar' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * ================= ModalNovoAgendamento.vue =================
 * Modal para criação de novos agendamentos.
 * 
 * Componentes extraídos:
 * - SeletorCliente: dropdown pesquisável de clientes
 * - SeletorCor: paleta de cores + color picker customizado
 * 
 * Composable extraído:
 * - useValidacaoHorario: lógica de bloqueio de horários sobrepostos
 * ===========================================================
 */

import BaseModal from '../BaseModal.vue'
import BaseInput from '../BaseInput.vue'
import BaseButton from '../BaseButton.vue'
import SeletorCliente from '../SeletorCliente.vue'
import SeletorCor from '../SeletorCor.vue'
import { 
  UserIcon,
  BuildingStorefrontIcon,
  WrenchScrewdriverIcon,
  PresentationChartBarIcon,
  CheckBadgeIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon
} from '@heroicons/vue/24/outline'
import { ref, computed, watch, toRef } from 'vue'
import { useAuth } from '~/composables/useAuth'
import type { AgCliente, AgAgendamento, AgProfissional } from '../../../shared/types/database'
import { useValidacaoHorario } from '~/composables/useValidacaoHorario'
import { useAgendamento } from '~/composables/useAgendamento'
import { useNotification } from '~/composables/useNotification'
import { useAgendamentoStore } from '~/stores/agendamento'

/**
 * UUID fixo do status "Pendente" na tabela ag_agendamento_statuses.
 * Todo novo agendamento inicia com este status por padrão.
 * Se o UUID mudar no banco, altere apenas aqui.
 */
const PENDENTE_STATUS_ID = 'bf6d3101-c18c-4cee-94db-23fe2df75674'

interface Props {
  modelValue: boolean
  profissionalId?: number | null
  profissionalNome?: string
  profissionalEspecialidade?: string
  profissionais?: AgProfissional[]
  diasSemana?: Date[]
  clientes?: AgCliente[]
  agendamentos?: AgAgendamento[]
  clienteId?: number | null
  clienteNome?: string
  leadId?: string | null
  initialDescription?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  profissionalId: null,
  profissionalNome: '',
  profissionalEspecialidade: '',
  profissionais: () => [],
  diasSemana: () => [],
  clientes: () => [],
  agendamentos: () => [],
  clienteId: null,
  clienteNome: '',
  leadId: null,
  initialDescription: ''
})

const emit = defineEmits(['update:modelValue', 'salvar'])

const { inserirAgendamento } = useAgendamento()
const { notifyWarning } = useNotification()
const agendamentoStore = useAgendamentoStore()
const { profile } = useAuth()

// Controle de abertura do modal (two-way binding)
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Ref do componente SeletorCliente (para chamar resetar)
const seletorClienteRef = ref<InstanceType<typeof SeletorCliente> | null>(null)

// Definição das finalidades (Fase 2: Sugerido)
const CATEGORIAS = [
  { id: 'Visita ao Showroom / Loja', label: 'Visita ao Showroom / Loja', color: '#10B981', icon: BuildingStorefrontIcon },
  { id: 'Visita Técnica / Medição', label: 'Visita Técnica / Medição', color: '#3B82F6', icon: WrenchScrewdriverIcon },
  { id: 'Apresentação de Projeto / Orçamento', label: 'Apresentação de Projeto / Orçamento', color: '#8B5CF6', icon: PresentationChartBarIcon },
  { id: 'Entrega Técnica / Finalização', label: 'Entrega Técnica / Finalização', color: '#F59E0B', icon: CheckBadgeIcon },
  { id: 'Pós-Venda / Retorno', label: 'Pós-Venda / Retorno', color: '#EC4899', icon: ChatBubbleLeftRightIcon }
]

// Dados do formulário
const formData = ref({
  profissionalId: null as number | null,
  clienteId: '',
  titulo: '',
  descricao: '',
  categoria: 'Visita ao Showroom / Loja',
  data: '',
  horaInicio: '',
  horaFim: '',
  cor: '#10B981' // Começa com o verde do Showroom
})

// Estado de salvamento (para desabilitar botão e mostrar loading)
const salvando = ref(false)

// --- Lógica de Disponibilidade em Tempo Real ---
const bookedSlots = ref<string[]>([])
const fetchedAgendamentos = ref<AgAgendamento[]>([])
const loadingAvailability = ref(false)

// Computed para todos os horários possíveis (08:00 às 22:00)
const allPossibleSlots = computed(() => {
  const slots: string[] = []
  for (let h = 8; h <= 21; h++) {
    const hh = String(h).padStart(2, '0')
    slots.push(`${hh}:00`)
    slots.push(`${hh}:30`)
  }
  slots.push('22:00')
  return slots
})

// Helper para converter hora para minutos (para comparação)
function horaParaMinutos(hora: string): number {
  if (!hora) return 0
  const partes = hora.split(':')
  return parseInt(partes[0] || '0', 10) * 60 + parseInt(partes[1] || '0', 10)
}

// Instância global do supabase para o componente
const supabase = useSupabaseClient()

// Busca horários ocupados do Supabase
async function fetchBookedSlots() {
  if (!formData.value.profissionalId || !formData.value.data) {
    bookedSlots.value = []
    fetchedAgendamentos.value = []
    return
  }

  loadingAvailability.value = true
  try {
    // Para conferência de disponibilidade, consultamos a tabela base (ag_agendamentos)
    // por ser muito mais rápida que a view complexa de relatórios.
    const { data, error } = await supabase
      .from('ag_agendamentos')
      .select('hora_inicio, hora_fim, data, profissional_id')
      .eq('profissional_id', formData.value.profissionalId)
      .eq('data', formData.value.data)
      .eq('cancelado', false)

    if (error) throw error

    if (data) {
      const rows = data as AgAgendamento[]
      fetchedAgendamentos.value = rows
      
      // Identifica todos os slots de 30min ocupados
      const ocupados: string[] = []
      rows.forEach(ag => {
        const inicio = horaParaMinutos(ag.hora_inicio!)
        const fim = horaParaMinutos(ag.hora_fim!)
        
        allPossibleSlots.value.forEach(slot => {
          const slotMin = horaParaMinutos(slot)
          if (slotMin >= inicio && slotMin < fim) {
            ocupados.push(slot)
          }
        })
      })
      bookedSlots.value = ocupados
    }
  } catch (err) {
    console.error('Erro ao buscar disponibilidade:', err)
    bookedSlots.value = []
    fetchedAgendamentos.value = []
  } finally {
    loadingAvailability.value = false
  }
}

// Watchers para disparar a busca
watch(
  [() => formData.value.profissionalId, () => formData.value.data],
  async () => {
    await fetchBookedSlots()
  }
)

// Computed para horários de início livres (levando em conta bookings e horário atual)
const availableSlots = computed(() => {
  const agora = new Date()
  const hojeStr = formatarDataISO(agora)
  const horaAtualMinutos = agora.getHours() * 60 + agora.getMinutes()

  return allPossibleSlots.value.filter((slot) => {
    // 1. Verifica se está ocupado
    if (bookedSlots.value.includes(slot)) return false

    // 2. Se for hoje, remove horários que já passaram
    if (formData.value.data === hojeStr) {
      if (horaParaMinutos(slot) < horaAtualMinutos) return false
    }

    return true
  })
})

// Composable de validação de horários (mantendo para o cálculo do horário de FIM)
const { horariosFimDisponiveis } = useValidacaoHorario(
  toRef(() => formData.value.data),
  toRef(() => formData.value.horaInicio),
  fetchedAgendamentos
)

// ===== Formatação de datas =====

function formatarDataISO(data: Date): string {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function formatarDiaParaExibicao(data: Date): string {
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${dias[data.getDay()]}, ${data.getDate()} ${meses[data.getMonth()]}`
}

// ===== Handlers =====

function irParaCadastroCliente() {
  isOpen.value = false
  navigateTo('/clientes?novo=1')
}

async function handleSalvar() {
  // Validação de campos obrigatórios
  if (!formData.value.profissionalId) {
    notifyWarning('Selecione um profissional')
    return
  }
  if (!formData.value.clienteId && !props.leadId && !props.clienteNome) {
    notifyWarning('Selecione um cliente ou lead')
    return
  }
  if (!formData.value.titulo.trim()) {
    notifyWarning('Informe o título do agendamento')
    return
  }
  if (!formData.value.data) {
    notifyWarning('Selecione uma data')
    return
  }
  if (!formData.value.horaInicio) {
    notifyWarning('Selecione o horário de início')
    return
  }
  if (!formData.value.horaFim) {
    notifyWarning('Selecione o horário de fim')
    return
  }

  salvando.value = true

  // Se não tem ID vinculado (nem via Props, nem selecionado no formulário), 
  // significa que estamos em um fluxo de 'Novo Lead' onde o salvamento real
  // ocorrerá após a criação do Lead pelo componente pai (modo template).
  if (!props.leadId && !props.clienteId && !formData.value.clienteId) {
    emit('salvar', {
      ...formData.value,
      isTemplate: true // Indica que é um agendamento temporário
    })
    salvando.value = false
    isOpen.value = false
    return
  }

  const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
  
  const leadIdValid = props.leadId && isUuid(props.leadId) ? props.leadId : null;
  const targetClienteId = formData.value.clienteId ? Number(formData.value.clienteId) : (props.clienteId ? Number(props.clienteId) : null);

  // IMPORTANTE: A tabela ag_agendamentos possui a constraint check_lead_or_client_not_both.
  // Devemos enviar apenas um dos vínculos.
  const finalClienteId = leadIdValid ? null : targetClienteId;

  const payloadToInsert = {
    profissional_id: formData.value.profissionalId,
    cliente_id: finalClienteId,
    lead_id: leadIdValid,
    data: formData.value.data,
    hora_inicio: formData.value.horaInicio,
    hora_fim: formData.value.horaFim,
    titulo: formData.value.titulo.trim(),
    descricao: formData.value.descricao?.trim() || null,
    cor: formData.value.cor || null,
    categoria: formData.value.categoria,
    status_id: PENDENTE_STATUS_ID  // Sempre inicia como "Pendente"
  };

  console.log('Dados finais enviados ao inserirAgendamento:', payloadToInsert);

  const resultado = await inserirAgendamento(payloadToInsert)

  salvando.value = false

  if (resultado) {
    emit('salvar', resultado)
    isOpen.value = false
  }
}

function handleCancelar() {
  isOpen.value = false
}

/**
 * Ao trocar a categoria, sugere a cor padrão dela
 */
function handleTrocarCategoria() {
  const cat = CATEGORIAS.find(c => c.id === formData.value.categoria)
  if (cat) {
    formData.value.cor = cat.color
  }
}

/**
 * Reseta o formulário (usado ao fechar o modal)
 */
function resetarFormulario() {
  formData.value = {
    profissionalId: null,
    clienteId: '',
    titulo: '',
    descricao: '',
    categoria: 'Visita ao Showroom / Loja',
    data: '',
    horaInicio: '',
    horaFim: '',
    cor: '#10B981'
  }
  seletorClienteRef.value?.resetar()
}

// ===== Watches =====

// Quando a data muda, limpa os horários
watch(() => formData.value.data, () => {
  formData.value.horaInicio = ''
  formData.value.horaFim = ''
})

// Quando hora início muda, limpa hora fim
watch(() => formData.value.horaInicio, () => {
  formData.value.horaFim = ''
})

// Quando o modal abre, limpa o formulário e seta cliente inicial
watch(isOpen, (novoValor) => {
  if (!novoValor) {
    setTimeout(() => resetarFormulario(), 300)
  } else {
    // Seta o profissional inicial (visto na agenda) como opção padrão
    if (props.profissionalId) {
      formData.value.profissionalId = props.profissionalId
    } else if (props.profissionalNome && props.profissionais?.length) {
      // Tenta encontrar por nome caso o ID não tenha vindo (fallback vindo do Kanban)
      const nomeProcurado = props.profissionalNome.toLowerCase()
      const profEncontrado = props.profissionais.find(p => {
        if (!p.nome) return false
        const pNome = p.nome.toLowerCase()
        return pNome === nomeProcurado || pNome.includes(nomeProcurado) || nomeProcurado.includes(pNome)
      })
      if (profEncontrado) {
        formData.value.profissionalId = profEncontrado.profissional_id
      }
    }

    // Se temos um clienteId, seta ele
    if (props.clienteId) {
      formData.value.clienteId = String(props.clienteId)
    }
    // Preenche o título automaticamente com o nome do Lead/Cliente
    if (props.clienteNome) {
      formData.value.titulo = `Agendamento: ${props.clienteNome}`
    }
    // Preenche a descrição inicial se houver (ex: notas do lead)
    if (props.initialDescription) {
      formData.value.descricao = props.initialDescription
    }
  }
})
</script>
