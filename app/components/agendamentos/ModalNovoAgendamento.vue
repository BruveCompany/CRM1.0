<template>
  <BaseModal v-model="isOpen">
    <!-- Header -->
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900">Novo Agendamento</h3>
    </template>
    
    <!-- Body -->
    <div class="space-y-3">
      <!-- Profissional (readonly) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Profissional</label>
        <div class="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">
          {{ profissionalNome || 'Selecione um profissional' }}
        </div>
      </div>

      <!-- Cliente (dropdown) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Cliente <span class="text-red-500">*</span>
        </label>
        <select 
          v-model="formData.clienteId"
          class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">Selecione um cliente</option>
          <!-- TODO: Popular com lista de clientes -->
          <option value="1">Cliente Exemplo 1</option>
          <option value="2">Cliente Exemplo 2</option>
        </select>
      </div>

      <!-- Título -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Título <span class="text-red-500">*</span>
        </label>
        <BaseInput 
          v-model="formData.titulo"
          placeholder="Ex: Consulta de avaliação"
        />
      </div>

      <!-- Descrição -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <textarea
          v-model="formData.descricao"
          rows="2"
          placeholder="Observações sobre o agendamento..."
          class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
        ></textarea>
      </div>

      <!-- Data + Horários em uma linha -->
      <div class="grid grid-cols-3 gap-3">
        <!-- Data -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
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
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Início <span class="text-red-500">*</span>
          </label>
          <select 
            v-model="formData.horaInicio"
            :disabled="!formData.data"
            class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">--:--</option>
            <option v-for="hora in horariosDisponiveis" :key="hora" :value="hora">
              {{ hora }}
            </option>
          </select>
        </div>

        <!-- Hora Fim -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Fim <span class="text-red-500">*</span>
          </label>
          <select 
            v-model="formData.horaFim"
            :disabled="!formData.data"
            class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">--:--</option>
            <option v-for="hora in horariosDisponiveis" :key="'fim-' + hora" :value="hora">
              {{ hora }}
            </option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <template #footer>
      <BaseButton 
        @click="handleCancelar"
        variant="secondary"
      >
        Cancelar
      </BaseButton>
      <BaseButton 
        @click="handleSalvar"
        variant="primary"
      >
        Salvar
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '../BaseModal.vue'
import BaseInput from '../BaseInput.vue'
import BaseButton from '../BaseButton.vue'

/**
 * ================= ModalNovoAgendamento.vue =================
 * Modal para criação de novos agendamentos
 * 
 * Props recebidas:
 * - modelValue: Controle de abertura/fechamento do modal
 * - profissionalId: ID do profissional selecionado
 * - profissionalNome: Nome do profissional (exibição)
 * - diasSemana: Array com os 7 dias da semana atual
 * 
 * TODO - Próximas implementações:
 * - Buscar lista de clientes do banco
 * - Validação de campos obrigatórios
 * - Validação de hora início < hora fim
 * - Salvar agendamento no Supabase
 * - Atualizar cache da store após salvar
 * - Feedback de sucesso/erro (toast)
 * ===========================================================
 */

interface Props {
  modelValue: boolean
  profissionalId?: number | null
  profissionalNome?: string
  diasSemana?: Date[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  profissionalId: null,
  profissionalNome: '',
  diasSemana: () => []
})

const emit = defineEmits(['update:modelValue', 'salvar'])

// Controle de abertura do modal (two-way binding)
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Dados do formulário
const formData = ref({
  clienteId: '',
  titulo: '',
  descricao: '',
  data: '',
  horaInicio: '',
  horaFim: ''
})

/**
 * Horários disponíveis (08:00 às 22:00 em intervalos de 30min)
 */
const horariosDisponiveis = computed(() => {
  const horarios: string[] = []
  for (let hora = 8; hora <= 22; hora++) {
    horarios.push(`${String(hora).padStart(2, '0')}:00`)
    if (hora < 22) {
      horarios.push(`${String(hora).padStart(2, '0')}:30`)
    }
  }
  return horarios
})

/**
 * Formata Date para string YYYY-MM-DD
 */
function formatarDataISO(data: Date): string {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

/**
 * Formata Date para exibição amigável
 * Ex: "Segunda, 16/02/2026"
 */
function formatarDiaParaExibicao(data: Date): string {
  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  const diaSemana = diasSemana[data.getDay()]
  const dia = String(data.getDate()).padStart(2, '0')
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const ano = data.getFullYear()
  
  return `${diaSemana}, ${dia}/${mes}/${ano}`
}

/**
 * Handler do botão Salvar
 * TODO: Implementar validação e envio para API
 */
function handleSalvar() {
  console.log('📝 Dados do formulário:', formData.value)
  console.log('👤 Profissional ID:', props.profissionalId)
  
  // TODO: Validar campos obrigatórios
  // TODO: Validar hora início < hora fim
  // TODO: Salvar no Supabase
  // TODO: Emitir evento de sucesso
  // TODO: Limpar cache da store
  // TODO: Fechar modal
  
  emit('salvar', {
    ...formData.value,
    profissionalId: props.profissionalId
  })
}

/**
 * Handler do botão Cancelar
 * Fecha o modal e limpa o formulário
 */
function handleCancelar() {
  isOpen.value = false
  // Limpa o formulário ao fechar
  setTimeout(() => {
    formData.value = {
      clienteId: '',
      titulo: '',
      descricao: '',
      data: '',
      horaInicio: '',
      horaFim: ''
    }
  }, 300) // Aguarda animação do modal fechar
}

/**
 * Watch: Quando o modal fecha, limpa o formulário
 */
watch(isOpen, (novoValor) => {
  if (!novoValor) {
    setTimeout(() => {
      formData.value = {
        clienteId: '',
        titulo: '',
        descricao: '',
        data: '',
        horaInicio: '',
        horaFim: ''
      }
    }, 300)
  }
})
</script>
