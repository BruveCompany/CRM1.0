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

        <!-- Cliente (componente extraído) -->
        <SeletorCliente
          ref="seletorClienteRef"
          v-model="formData.clienteId"
          :clientes="clientes"
          @cadastrar="irParaCadastroCliente"
        />

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
              <label class="block text-sm font-semibold text-neutral-700 mb-1">Início</label>
              <div class="relative">
                <select 
                  v-model="formData.horaInicio"
                  :disabled="!formData.data"
                  class="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-sm hover:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700 focus:border-primary-700 transition-all disabled:bg-neutral-50 disabled:text-neutral-400 bg-white"
                >
                  <option value="">--:--</option>
                  <option v-for="hora in horariosInicioDisponiveis" :key="hora" :value="hora">{{ hora }}</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-1">Fim</label>
              <div class="relative">
                <select 
                  v-model="formData.horaFim"
                  :disabled="!formData.horaInicio"
                  class="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-sm hover:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700 focus:border-primary-700 transition-all disabled:bg-neutral-50 disabled:text-neutral-400 bg-white"
                >
                  <option value="">--:--</option>
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
import type { AgCliente, AgAgendamento } from '../../../shared/types/database'
import { useValidacaoHorario } from '~/composables/useValidacaoHorario'
import { useAgendamento } from '~/composables/useAgendamento'
import { useNotification } from '~/composables/useNotification'
import { useAgendamentoStore } from '~/stores/agendamento'

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

// Composable de validação de horários (lógica de sobreposição extraída)
const { horariosInicioDisponiveis, horariosFimDisponiveis } = useValidacaoHorario(
  toRef(() => formData.value.data),
  toRef(() => formData.value.horaInicio),
  toRef(() => props.agendamentos)
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
  if (!formData.value.clienteId) {
    notifyWarning('Selecione um cliente')
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

  const resultado = await inserirAgendamento({
    profissional_id: formData.value.profissionalId,
    cliente_id: Number(formData.value.clienteId),
    data: formData.value.data,
    hora_inicio: formData.value.horaInicio,
    hora_fim: formData.value.horaFim,
    titulo: formData.value.titulo.trim(),
    descricao: formData.value.descricao?.trim() || null,
    cor: formData.value.cor || null,
    categoria: formData.value.categoria
  })

  salvando.value = false

  if (resultado) {
    // Invalida cache da semana atual para forçar refetch
    agendamentoStore.cacheAgendamentos = {}
    await agendamentoStore.carregarAgendamentos()

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
