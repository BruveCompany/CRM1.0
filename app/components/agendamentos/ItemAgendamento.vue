<template>
  <!-- Item de agendamento para um dia específico -->
  <div 
    class="flex-1 relative bg-white border-r border-dotted border-black/10 transition-colors duration-300 min-h-[960px] h-full"
  >
    <!-- Container dos slots de agendamento com posição relative -->
    <div class="relative h-full">
      <!-- Slots de horário (8h às 22h = 15 slots) - apenas para estrutura visual -->
      <div 
        v-for="hora in 15" 
        :key="hora"
        class="group relative h-16 border-b border-dotted border-black/10 hover:bg-neutral-50/80 cursor-pointer transition-all duration-200 pt-1"
        :class="{ 'bg-indigo-50/50 ring-2 ring-inset ring-indigo-200': dragOverSlot === hora }"
        @click="handleSlotClick(hora + 7)"
        @dragover.prevent="dragOverSlot = hora"
        @dragleave="dragOverSlot = null"
        @drop="handleDrop($event, hora + 7)"
      >
        <!-- Indicador de "+" no hover -->
        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-400">
            <Icon name="heroicons:plus-20-solid" class="w-5 h-5" />
          </div>
        </div>
        <!-- Slot vazio - estrutura de fundo -->
      </div>
      
      <!-- 
        ⚠️ AGENDAMENTOS DE TESTE - DADOS MOCKADOS
        Cards de agendamento usando componente SlotAgendamento
      -->
      <SlotAgendamento
        v-for="ag in agendamentosDoDia"
        :key="ag.id"
        :agendamento="ag"
        :clientes="clientes"
        :profissionais="profissionais"
        :vendedores="vendedores"
        :profissional-nome="profissionalNome"
        :profissional-especialidade="profissionalEspecialidade"
        @click="emit('editar-agendamento', $event)"
        @reagendar="emit('reagendar', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ================= ItemAgendamento.vue =================
 * Componente para exibir slots de agendamento de um dia
 */

import SlotAgendamento from './SlotAgendamento.vue'
import type { AgAgendamento, AgCliente, AgProfissional } from '../../../shared/types/database'
import { computed } from 'vue'
import { useAgendamentoStore } from '~/stores/agendamento'

// Interface de propriedades
interface Props {
  data: Date
  clientes?: AgCliente[]
  profissionais?: AgProfissional[]
  vendedores?: any[]
  profissionalNome?: string
  profissionalEspecialidade?: string
}

const props = withDefaults(defineProps<Props>(), {
  clientes: () => [],
  profissionais: () => [],
  vendedores: () => [],
  profissionalNome: '',
  profissionalEspecialidade: ''
})

const emit = defineEmits(['editar-agendamento', 'novo-agendamento', 'reagendar'])

const dragOverSlot = ref<number | null>(null)

/**
 * Lida com o clique em um slot vazio para criar novo agendamento
 * @param hora Inteiro representando a hora selecionada (Ex: 8, 9...)
 */
function handleSlotClick(hora: number) {
  const dataSelecionada = new Date(props.data)
  dataSelecionada.setHours(hora, 0, 0, 0)
  emit('novo-agendamento', dataSelecionada)
}

/**
 * Lida com o drop de um agendamento existente em uma nova célula
 */
function handleDrop(event: DragEvent, hora: number) {
  dragOverSlot.value = null
  
  if (!event.dataTransfer) return
  
  try {
    const dataStr = event.dataTransfer.getData('application/json')
    if (!dataStr) return
    
    const dragData = JSON.parse(dataStr)
    const { id, duracaoMinutos } = dragData
    
    // Calcula novos horários
    const novaDataStr = props.data.toISOString().split('T')[0]
    
    const inicioDate = new Date()
    inicioDate.setHours(hora, 0, 0, 0)
    const horaInicio = `${String(hora).padStart(2, '0')}:00:00`
    
    const fimDate = new Date(inicioDate.getTime() + duracaoMinutos * 60000)
    const horaFim = `${String(fimDate.getHours()).padStart(2, '0')}:${String(fimDate.getMinutes()).padStart(2, '0')}:00`
    
    emit('reagendar', {
      id,
      novaData: novaDataStr,
      novaHoraInicio: horaInicio,
      novaHoraFim: horaFim
    })
  } catch (err) {
    console.error('Erro ao processar drop:', err)
  }
}

// Acesso ao store de agendamentos
const agendamentoStore = useAgendamentoStore()

/**
 * Lógica para verificar se a data deste ItemAgendamento é hoje
 */
const isToday = computed(() => {
  const hoje = new Date()
  return props.data.getDate() === hoje.getDate() &&
         props.data.getMonth() === hoje.getMonth() &&
         props.data.getFullYear() === hoje.getFullYear()
})

/**
 * Filtra agendamentos do dia específico a partir do store
 */
const agendamentosDoDia = computed(() => {
  return agendamentoStore.getAgendamentosDoDia(props.data)
})
</script>
