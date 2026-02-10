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
        <div class="flex items-center gap-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
          <!-- Ícone do profissional -->
          <div class="flex-shrink-0 w-9 h-9 flex items-center justify-center">
            <UserIcon class="w-5 h-5 text-indigo-700" />
          </div>
          <!-- Nome e especialidade -->
          <div class="min-w-0">
            <p class="text-sm font-medium text-gray-800 truncate">{{ profissionalNome || 'Selecione um profissional' }}</p>
            <p v-if="profissionalEspecialidade" class="text-xs text-gray-500 truncate">{{ profissionalEspecialidade }}</p>
          </div>
        </div>
      </div>

      <!-- Cliente (dropdown) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Cliente <span class="text-red-500">*</span>
        </label>
        <div class="relative" ref="dropdownClienteRef">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon class="h-4 w-4 text-gray-400" />
            </div>
            <input
              v-model="buscaCliente"
              type="text"
              placeholder="Digite para pesquisar ou selecione um cliente"
              class="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              @focus="dropdownClienteAberto = true"
              @input="dropdownClienteAberto = true"
            />
          </div>
          
          <!-- Cliente selecionado (tag) -->
          <div 
            v-if="clienteSelecionado && !dropdownClienteAberto"
            class="absolute inset-0 flex items-center px-3 bg-white border border-gray-300 rounded-lg cursor-pointer"
            @click="dropdownClienteAberto = true; buscaCliente = ''"
          >
            <span class="text-sm text-gray-700 truncate flex-1">
              {{ clienteSelecionado.nome }} - {{ clienteSelecionado.cpf || 'Sem CPF' }}
            </span>
            <button 
              type="button" 
              class="text-gray-400 hover:text-gray-600 ml-1"
              @click.stop="formData.clienteId = ''; buscaCliente = ''"
            >
              ✕
            </button>
          </div>
          
          <!-- Lista de opções filtradas -->
          <ul
            v-if="dropdownClienteAberto && clientesFiltrados.length > 0"
            class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-52 overflow-y-auto"
          >
            <li
              v-for="cliente in clientesFiltrados"
              :key="cliente.id"
              class="px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
              @mousedown.prevent="selecionarCliente(cliente)"
            >
              <p class="text-sm font-medium text-gray-800">{{ cliente.nome }}</p>
              <p v-if="cliente.cpf" class="text-xs text-gray-500">CPF: {{ cliente.cpf }}</p>
              <p v-if="cliente.email" class="text-xs text-blue-500">{{ cliente.email }}</p>
            </li>
          </ul>
          
          <!-- Nenhum resultado -->
          <ul
            v-if="dropdownClienteAberto && buscaCliente && clientesFiltrados.length === 0"
            class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
          >
            <li class="px-3 py-1.5 text-sm text-gray-500 italic">
              Nenhum cliente encontrado
            </li>
          </ul>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          Não encontrou o cliente? 
          <button type="button" class="text-indigo-600 hover:text-indigo-800 font-medium" @click="irParaCadastroCliente">Cadastrar novo cliente</button>
        </p>
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
            <option v-for="hora in horariosInicioDisponiveis" :key="hora" :value="hora">
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
import { UserIcon } from '@heroicons/vue/24/outline'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

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

import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import type { AgCliente, AgAgendamento } from '../../../shared/types/database'

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

// ===== Dropdown pesquisável de clientes =====
const buscaCliente = ref('')
const dropdownClienteAberto = ref(false)
const dropdownClienteRef = ref<HTMLElement | null>(null)

/**
 * Filtra a lista de clientes pelo texto digitado (nome ou CPF)
 */
const clientesFiltrados = computed(() => {
  const termo = buscaCliente.value.toLowerCase().trim()
  if (!termo) return props.clientes
  return props.clientes.filter((c) => {
    const nome = c.nome?.toLowerCase() || ''
    const cpf = c.cpf?.toLowerCase() || ''
    return nome.includes(termo) || cpf.includes(termo)
  })
})

/**
 * Retorna o objeto do cliente selecionado (para exibir a tag)
 */
const clienteSelecionado = computed(() => {
  if (!formData.value.clienteId) return null
  return props.clientes.find((c) => String(c.id) === String(formData.value.clienteId)) || null
})

/**
 * Seleciona um cliente da lista e fecha o dropdown
 */
function selecionarCliente(cliente: AgCliente) {
  formData.value.clienteId = String(cliente.id)
  buscaCliente.value = ''
  dropdownClienteAberto.value = false
}

/**
 * Redireciona para a página de clientes para cadastrar novo cliente
 */
function irParaCadastroCliente() {
  isOpen.value = false
  navigateTo('/clientes?novo=1')
}

/**
 * Fecha o dropdown ao clicar fora dele
 */
function handleClickFora(event: MouseEvent) {
  if (dropdownClienteRef.value && !dropdownClienteRef.value.contains(event.target as Node)) {
    dropdownClienteAberto.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickFora)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickFora)
})

// ===== Lógica de bloqueio de horários sobrepostos =====

/**
 * Gera todos os horários possíveis (08:00 às 22:00 em intervalos de 30min)
 */
const todosHorarios = computed(() => {
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
 * Converte string de hora ("08:30" ou "08:30:00-03") para minutos totais
 * Ex: "08:30" → 510, "14:00" → 840
 */
function horaParaMinutos(hora: string): number {
  const partes = hora.split(':')
  return parseInt(partes[0] || '0', 10) * 60 + parseInt(partes[1] || '0', 10)
}

/**
 * Filtra agendamentos existentes para o dia selecionado no formulário.
 * Retorna array ordenado por hora_inicio para facilitar cálculos.
 */
const agendamentosDoDia = computed(() => {
  if (!formData.value.data) return []
  return props.agendamentos
    .filter((ag) => ag.data === formData.value.data)
    .sort((a, b) => horaParaMinutos(a.hora_inicio || '0') - horaParaMinutos(b.hora_inicio || '0'))
})

/**
 * Horários de INÍCIO disponíveis.
 * Bloqueia qualquer horário que cai dentro de um agendamento existente.
 * 
 * Regra: um horário H está bloqueado se existe agendamento onde
 * H >= hora_inicio E H < hora_fim (está dentro do período ocupado)
 * 
 * Ex: Agendamento 08:00-10:00 → bloqueia 08:00, 08:30, 09:00, 09:30
 *     10:00 fica livre (é o fim, não sobrepõe)
 */
const horariosInicioDisponiveis = computed(() => {
  if (!formData.value.data) return todosHorarios.value
  
  const ocupados = agendamentosDoDia.value
  
  return todosHorarios.value.filter((horario) => {
    const minutos = horaParaMinutos(horario)
    // Verifica se este horário cai dentro de algum agendamento existente
    return !ocupados.some((ag) => {
      const inicioAg = horaParaMinutos(ag.hora_inicio || '0')
      const fimAg = horaParaMinutos(ag.hora_fim || '0')
      return minutos >= inicioAg && minutos < fimAg
    })
  })
})

/**
 * Horários de FIM disponíveis.
 * Após selecionar hora de início, limita o fim para:
 * - Ser maior que a hora de início
 * - Não ultrapassar o início do próximo agendamento (evita sobreposição)
 * 
 * Ex: Início selecionado = 10:00, próximo agendamento começa às 14:00
 *     → Fim disponível: 10:30, 11:00, ..., 14:00
 *     (14:00 é válido pois encosta mas não sobrepõe)
 * 
 * Ex: Início selecionado = 15:30, sem agendamento depois
 *     → Fim disponível: 16:00, ..., 22:00
 */
const horariosFimDisponiveis = computed(() => {
  if (!formData.value.horaInicio) return []
  
  const inicioSelecionado = horaParaMinutos(formData.value.horaInicio)
  const ocupados = agendamentosDoDia.value
  
  // Encontra o início do próximo agendamento APÓS o horário selecionado
  // (teto máximo para o fim do novo agendamento)
  let tetoMaximo = horaParaMinutos('22:00') // fim do expediente
  for (const ag of ocupados) {
    const inicioAg = horaParaMinutos(ag.hora_inicio || '0')
    if (inicioAg > inicioSelecionado) {
      tetoMaximo = inicioAg
      break // já está ordenado, primeiro encontrado é o mais próximo
    }
  }
  
  return todosHorarios.value.filter((horario) => {
    const minutos = horaParaMinutos(horario)
    return minutos > inicioSelecionado && minutos <= tetoMaximo
  })
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
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const diaSemana = diasSemana[data.getDay()]
  const dia = data.getDate()
  const mes = meses[data.getMonth()]
  
  return `${diaSemana}, ${dia} ${mes}`
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
    buscaCliente.value = ''
    dropdownClienteAberto.value = false
  }, 300) // Aguarda animação do modal fechar
}

/**
 * Watch: Quando a data muda, limpa os horários (podem ter disponibilidade diferente)
 */
watch(() => formData.value.data, () => {
  formData.value.horaInicio = ''
  formData.value.horaFim = ''
})

/**
 * Watch: Quando hora início muda, limpa hora fim (novo cálculo de disponíveis)
 */
watch(() => formData.value.horaInicio, () => {
  formData.value.horaFim = ''
})

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
      buscaCliente.value = ''
      dropdownClienteAberto.value = false
    }, 300)
  }
})
</script>
