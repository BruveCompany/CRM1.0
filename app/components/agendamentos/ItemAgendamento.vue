<template>
  <!-- Item de agendamento para um dia específico -->
  <div 
    class="flex-1 relative bg-white border-l border-dotted border-black/10 transition-colors duration-300 min-h-[960px] h-full"
  >
    <!-- Container dos slots de agendamento com posição relative -->
    <div class="relative h-full">
      <!-- Slots de horário (8h às 22h = 15 slots) - apenas para estrutura visual -->
      <div 
        v-for="hora in 15" 
        :key="hora"
        class="h-16 border-b border-dotted border-black/10 hover:bg-neutral-100/50 cursor-pointer transition-colors pt-1"
      >
        <!-- Slot vazio - estrutura de fundo -->
      </div>
      
      <!-- 
        ⚠️ AGENDAMENTOS DE TESTE - DADOS MOCKADOS
        Cards de agendamento usando componente SlotAgendamento
      -->
      <SlotAgendamento
        v-for="agendamento in agendamentosDoDia"
        :key="agendamento.id"
        :agendamento="agendamento"
        :clientes="clientes"
        :profissionais="profissionais"
        :vendedores="vendedores"
        :profissional-nome="profissionalNome"
        :profissional-especialidade="profissionalEspecialidade"
        @click="(ag: AgAgendamento) => emit('editar-agendamento', ag)"
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

const emit = defineEmits(['editar-agendamento'])

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
