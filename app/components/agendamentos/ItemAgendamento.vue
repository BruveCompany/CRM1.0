<template>
  <!-- Item de agendamento para um dia específico -->
  <div class="flex-1 relative bg-neutral-100">
    <!-- Container dos slots de agendamento com posição relativa -->
    <div class="flex flex-col relative">
      <!-- Slots de horário (8h às 22h = 15 slots) - apenas para estrutura visual -->
      <div 
        v-for="hora in 15" 
        :key="hora"
        class="h-16 border-t border-white first:border-t-0 hover:bg-gray-50 cursor-pointer transition-colors pt-1"
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
 * 
 * Props:
 * @param {Date} data - Data do dia para exibir agendamentos
 * @param {AgCliente[]} clientes - Lista de clientes para resolver nomes
 * 
 * Responsabilidades:
 * - Exibir grid de horários (8h às 22h)
 * - Filtrar agendamentos do dia específico vindos do store
 * - Renderizar componentes SlotAgendamento
 * ======================================================
 */

import SlotAgendamento from './SlotAgendamento.vue'
import type { AgAgendamento, AgCliente } from '../../../shared/types/database'
import { computed } from 'vue'
import { useAgendamentoStore } from '~/stores/agendamento'

// Interface de propriedades
interface Props {
  data: Date
  clientes?: AgCliente[]
  profissionalNome?: string
  profissionalEspecialidade?: string
}

const props = withDefaults(defineProps<Props>(), {
  clientes: () => [],
  profissionalNome: '',
  profissionalEspecialidade: ''
})

const emit = defineEmits(['editar-agendamento'])

// Acesso ao store de agendamentos
const agendamentoStore = useAgendamentoStore()

/**
 * Filtra agendamentos do dia específico a partir do store
 * Compara apenas dia/mês/ano, ignorando horários
 * 
 * ⚠️ Este componente NÃO busca dados - apenas lê do store
 * A busca é responsabilidade do AgendamentoManager
 */
const agendamentosDoDia = computed(() => {
  return agendamentoStore.getAgendamentosDoDia(props.data)
})

</script>
