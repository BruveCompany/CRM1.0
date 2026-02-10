<template>
  <BaseModal v-model="isOpen">
    <!-- Header -->
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900">Novo Agendamento</h3>
    </template>
    
    <!-- Body -->
    <div class="space-y-2.5">
      <!-- Profissional (readonly) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-0.5">Profissional</label>
        <div class="flex items-center gap-2.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
          <UserIcon class="w-5 h-5 text-indigo-700 flex-shrink-0" />
          <div class="min-w-0">
            <p class="text-sm font-medium text-gray-800 truncate">{{ profissionalNome || 'Selecione um profissional' }}</p>
            <p v-if="profissionalEspecialidade" class="text-xs text-gray-500 truncate leading-tight">{{ profissionalEspecialidade }}</p>
          </div>
        </div>
      </div>

      <!-- Cliente (componente extraído) -->
      <SeletorCliente
        ref="seletorClienteRef"
        v-model="formData.clienteId"
        :clientes="clientes"
        @cadastrar="irParaCadastroCliente"
      />

      <!-- Título -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-0.5">
          Título <span class="text-red-500">*</span>
        </label>
        <BaseInput 
          v-model="formData.titulo"
          placeholder="Ex: Consulta de avaliação"
        />
      </div>

      <!-- Descrição -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-0.5">Descrição</label>
        <textarea
          v-model="formData.descricao"
          rows="1"
          placeholder="Observações sobre o agendamento..."
          class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
        ></textarea>
      </div>

      <!-- Cor (componente extraído) -->
      <SeletorCor v-model="formData.cor" />

      <!-- Data + Horários em uma linha -->
      <div class="grid grid-cols-3 gap-2.5">
        <!-- Data -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-0.5">
            Data <span class="text-red-500">*</span>
          </label>
          <select 
            v-model="formData.data"
            class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">Selecione</option>
            <option 
              v-for="(dia, index) in diasSemana" 
              :key="index"
              :value="formatarDataISO(dia)"
            >
              {{ formatarDiaParaExibicao(dia) }}
            </option>
          </select>
        </div>

        <!-- Hora Início -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-0.5">
            Início <span class="text-red-500">*</span>
          </label>
          <select 
            v-model="formData.horaInicio"
            :disabled="!formData.data"
            class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">--:--</option>
            <option v-for="hora in horariosInicioDisponiveis" :key="hora" :value="hora">
              {{ hora }}
            </option>
          </select>
        </div>

        <!-- Hora Fim -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-0.5">
            Fim <span class="text-red-500">*</span>
          </label>
          <select 
            v-model="formData.horaFim"
            :disabled="!formData.horaInicio"
            class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">--:--</option>
            <option v-for="hora in horariosFimDisponiveis" :key="'fim-' + hora" :value="hora">
              {{ hora }}
            </option>
          </select>
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
import { UserIcon } from '@heroicons/vue/24/outline'
import { ref, computed, watch, toRef } from 'vue'
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
  diasSemana?: Date[]
  clientes?: AgCliente[]
  agendamentos?: AgAgendamento[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  profissionalId: null,
  profissionalNome: '',
  profissionalEspecialidade: '',
  diasSemana: () => [],
  clientes: () => [],
  agendamentos: () => []
})

const emit = defineEmits(['update:modelValue', 'salvar'])

const { inserirAgendamento } = useAgendamento()
const { notifyWarning } = useNotification()
const agendamentoStore = useAgendamentoStore()

// Controle de abertura do modal (two-way binding)
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Ref do componente SeletorCliente (para chamar resetar)
const seletorClienteRef = ref<InstanceType<typeof SeletorCliente> | null>(null)

// Dados do formulário
const formData = ref({
  clienteId: '',
  titulo: '',
  descricao: '',
  data: '',
  horaInicio: '',
  horaFim: '',
  cor: '#B4A7F5'
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
  if (!props.profissionalId) {
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
    profissional_id: props.profissionalId,
    cliente_id: Number(formData.value.clienteId),
    data: formData.value.data,
    hora_inicio: formData.value.horaInicio,
    hora_fim: formData.value.horaFim,
    titulo: formData.value.titulo.trim(),
    descricao: formData.value.descricao?.trim() || null,
    cor: formData.value.cor || null
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
 * Reseta o formulário (usado ao fechar o modal)
 */
function resetarFormulario() {
  formData.value = {
    clienteId: '',
    titulo: '',
    descricao: '',
    data: '',
    horaInicio: '',
    horaFim: '',
    cor: '#B4A7F5'
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

// Quando o modal fecha, limpa o formulário
watch(isOpen, (novoValor) => {
  if (!novoValor) {
    setTimeout(() => resetarFormulario(), 300)
  }
})
</script>
