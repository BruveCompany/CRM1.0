<template>
  <BaseModal v-model="isOpen">
    <!-- Header -->
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900">Editar Agendamento</h3>
    </template>

    <!-- Body -->
    <div class="space-y-2">
      <!-- Info readonly: Profissional + Cliente + Data + Horário -->
      <div class="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 space-y-1">
        <div class="flex items-center gap-2">
          <UserIcon class="w-4 h-4 text-indigo-700 flex-shrink-0" />
          <div>
            <span class="text-sm text-gray-700">{{ profissionalNome }}</span>
            <span v-if="profissionalEspecialidade" class="block text-xs text-gray-400">{{ profissionalEspecialidade }}</span>
          </div>
        </div>
        <div v-if="nomeCliente" class="flex items-center gap-2 border-t border-gray-200 pt-1">
          <UserIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span class="text-sm text-gray-600">Cliente: {{ nomeCliente }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <CalendarIcon class="w-4 h-4 flex-shrink-0" />
          <span>{{ dataFormatada }} &bull; {{ horarioFormatado }}</span>
        </div>
      </div>

      <!-- Título (editável) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-0.5">
          Título <span class="text-red-500">*</span>
        </label>
        <BaseInput v-model="formData.titulo" placeholder="Título do agendamento" />
      </div>

      <!-- Descrição (editável) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-0.5">Descrição</label>
        <textarea
          v-model="formData.descricao"
          rows="1"
          placeholder="Observações sobre o agendamento..."
          class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
        ></textarea>
      </div>

      <!-- Cor (editável) -->
      <SeletorCor v-model="formData.cor" />

    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex items-center justify-between w-full">
        <button
          type="button"
          class="inline-flex items-center justify-center font-medium rounded-md transition-colors px-4 py-2 text-base bg-red-600 hover:bg-red-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="processando"
          @click="confirmarCancelamento = true"
        >
          Cancelar Agendamento
        </button>
        <BaseButton @click="handleSalvar" variant="primary" :disabled="processando">
          {{ processando ? 'Salvando...' : 'Salvar Alterações' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>

  <!-- Modal de confirmação de cancelamento -->
  <ModalConfirmacao
    v-model="confirmarCancelamento"
    titulo="Cancelar Agendamento"
    :mensagem="`Tem certeza que deseja cancelar o agendamento${nomeCliente ? ' de <b>' + nomeCliente + '</b>' : ''} - '${formData.titulo}'?<br>Esta ação não pode ser desfeita. O agendamento será marcado como cancelado.`"
    :loading="processando"
    texto-cancelar="Não, Manter"
    texto-confirmar="Sim, Cancelar"
    @confirmar="handleCancelarAgendamento"
  />
</template>

<script setup lang="ts">
/**
 * ================= ModalEditarAgendamento.vue =================
 * Modal para edição de agendamentos existentes.
 *
 * Campos editáveis: título, descrição e cor.
 * Campos readonly: profissional, cliente, data, horários.
 * Permite cancelar o agendamento (soft delete).
 * =============================================================
 */

import BaseModal from '../BaseModal.vue'
import BaseInput from '../BaseInput.vue'
import BaseButton from '../BaseButton.vue'
import SeletorCor from '../SeletorCor.vue'
import ModalConfirmacao from '../ModalConfirmacao.vue'
import { UserIcon, CalendarIcon } from '@heroicons/vue/24/outline'
import { ref, computed, watch } from 'vue'
import type { AgAgendamento, AgCliente } from '../../../shared/types/database'
import { useAgendamento } from '~/composables/useAgendamento'
import { useNotification } from '~/composables/useNotification'
import { useAgendamentoStore } from '~/stores/agendamento'

interface Props {
  modelValue: boolean
  agendamento: AgAgendamento | null
  profissionalNome?: string
  profissionalEspecialidade?: string
  clientes?: AgCliente[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  agendamento: null,
  profissionalNome: '',
  profissionalEspecialidade: '',
  clientes: () => []
})

const emit = defineEmits(['update:modelValue', 'atualizado'])

const { editarAgendamento, cancelarAgendamento } = useAgendamento()
const { notifyWarning } = useNotification()
const agendamentoStore = useAgendamentoStore()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formData = ref({
  titulo: '',
  descricao: '',
  cor: '#B4A7F5'
})

const processando = ref(false)
const confirmarCancelamento = ref(false)

// Resolve nome do cliente
const nomeCliente = computed(() => {
  if (!props.agendamento?.cliente_id) return ''
  const cliente = props.clientes.find((c) => c.id === props.agendamento!.cliente_id)
  return cliente?.nome || ''
})

// Formata data para exibição "Seg, 10 Fev"
const dataFormatada = computed(() => {
  if (!props.agendamento?.data) return ''
  const partes = props.agendamento.data.split('-').map(Number)
  const ano = partes[0] || 0
  const mes = partes[1] || 1
  const dia = partes[2] || 1
  const data = new Date(ano, mes - 1, dia)
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${dias[data.getDay()]}, ${dia} ${meses[data.getMonth()]}`
})

// Formata horário "08:00 - 09:00"
const horarioFormatado = computed(() => {
  if (!props.agendamento) return ''
  const parseHora = (h: string | null) => {
    if (!h) return '00:00'
    const partes = h.split(':')
    return `${partes[0]}:${partes[1]}`
  }
  return `${parseHora(props.agendamento.hora_inicio)} - ${parseHora(props.agendamento.hora_fim)}`
})

// Preenche formulário quando o agendamento muda
watch(() => props.agendamento, (ag) => {
  if (ag) {
    formData.value = {
      titulo: ag.titulo || '',
      descricao: ag.descricao || '',
      cor: ag.cor || '#B4A7F5'
    }
    confirmarCancelamento.value = false
  }
}, { immediate: true })

// Limpa confirmação ao fechar
watch(isOpen, (aberto) => {
  if (!aberto) {
    confirmarCancelamento.value = false
  }
})

async function handleSalvar() {
  if (!props.agendamento) return

  if (!formData.value.titulo.trim()) {
    notifyWarning('Informe o título do agendamento')
    return
  }

  processando.value = true

  const resultado = await editarAgendamento(props.agendamento.id, {
    titulo: formData.value.titulo.trim(),
    descricao: formData.value.descricao?.trim() || null,
    cor: formData.value.cor || null
  })

  processando.value = false

  if (resultado) {
    agendamentoStore.cacheAgendamentos = {}
    await agendamentoStore.carregarAgendamentos()
    emit('atualizado', resultado)
    isOpen.value = false
  }
}

async function handleCancelarAgendamento() {
  if (!props.agendamento) return

  processando.value = true

  const sucesso = await cancelarAgendamento(props.agendamento.id)

  processando.value = false

  if (sucesso) {
    agendamentoStore.cacheAgendamentos = {}
    await agendamentoStore.carregarAgendamentos()
    emit('atualizado', null)
    isOpen.value = false
  }
}

function handleFechar() {
  isOpen.value = false
}
</script>
