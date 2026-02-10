<template>
  <!-- Item de agendamento para um dia específico -->
  <div class="flex-1 border-r border-gray-200 last:border-r-0 relative">
    <!-- Container dos slots de agendamento com posição relativa -->
    <div class="flex flex-col relative">
      <!-- Slots de horário (8h às 22h = 15 slots) - apenas para estrutura visual -->
      <div 
        v-for="hora in 15" 
        :key="hora"
        class="h-16 border-t border-gray-50 first:border-t-0 hover:bg-gray-50 cursor-pointer transition-colors"
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
 * 
 * Responsabilidades:
 * - Exibir grid de horários (8h às 22h)
 * - Filtrar agendamentos do dia específico
 * - Renderizar componentes SlotAgendamento
 * 
 * ⚠️ DADOS MOCKADOS - PARA APRENDIZADO
 * Lista de agendamentos está hardcoded aqui
 * Depois virá do banco de dados
 * ======================================================
 */

import SlotAgendamento from './SlotAgendamento.vue'
import type { Agendamento } from '../../../shared/types/Agendamento'
import { ref, computed } from 'vue'

// Interface de propriedades
interface Props {
  data: Date // Data do dia para exibir agendamentos
}

const props = defineProps<Props>()

/**
 * ⚠️ DADOS MOCKADOS PARA TESTE - APRENDIZADO
 * 
 * Lista fixa de agendamentos entre 08/02 e 14/02/2026
 * Depois isso virá do banco de dados Supabase
 */
const todosAgendamentos = ref<Agendamento[]>([
  { id: 1, titulo: 'Consulta João Silva', descricao: 'Retorno', inicio: new Date(2026, 1, 9, 9, 0), fim: new Date(2026, 1, 9, 10, 0) },
  { id: 2, titulo: 'Ana Oliveira', descricao: 'Procedimento avaliação', inicio: new Date(2026, 1, 9, 10, 30), fim: new Date(2026, 1, 9, 12, 0) },
  { id: 3, titulo: 'Carlos Santos', inicio: new Date(2026, 1, 9, 14, 0), fim: new Date(2026, 1, 9, 15, 0) },
  { id: 4, titulo: 'Maria Costa', descricao: 'Primeira consulta', inicio: new Date(2026, 1, 10, 8, 0), fim: new Date(2026, 1, 10, 9, 0) },
  { id: 5, titulo: 'Pedro Lima', inicio: new Date(2026, 1, 10, 11, 0), fim: new Date(2026, 1, 10, 12, 0) },
  { id: 6, titulo: 'Juliana Alves', descricao: 'Avaliação', inicio: new Date(2026, 1, 11, 9, 30), fim: new Date(2026, 1, 11, 10, 30) },
  { id: 7, titulo: 'Roberto Dias', inicio: new Date(2026, 1, 11, 15, 0), fim: new Date(2026, 1, 11, 16, 0) },
  { id: 8, titulo: 'Fernanda Rocha', inicio: new Date(2026, 1, 12, 10, 0), fim: new Date(2026, 1, 12, 11, 30) },
])

/**
 * Filtra agendamentos do dia específico
 * Compara apenas dia/mês/ano, ignorando horários
 */
const agendamentosDoDia = computed(() => {
  return todosAgendamentos.value.filter((ag) => {
    const dataInicio = ag.inicio
    return (
      dataInicio.getDate() === props.data.getDate() &&
      dataInicio.getMonth() === props.data.getMonth() &&
      dataInicio.getFullYear() === props.data.getFullYear()
    )
  })
})

</script>
