<template>
  <!-- Slot de agendamento individual -->
  <div 
    :style="{ 
      top: `${posicaoTop}px`, 
      height: `${altura}px`,
      backgroundColor: agendamento.cor || '#B4A7F5'
    }"
    :title="`${agendamento.titulo}${profissionalNome ? '\nProfissional: ' + profissionalNome : ''}${profissionalEspecialidade ? ' (' + profissionalEspecialidade + ')' : ''}\n${horarioFormatado}${nomeCliente ? '\nCliente: ' + nomeCliente : ''}${agendamento.descricao ? '\n' + agendamento.descricao : ''}`"
    class="absolute left-0 right-0 text-gray-900 rounded px-2 py-1 cursor-pointer transition-colors overflow-hidden hover:opacity-85"
    @click="emit('click', agendamento)"
  >
    <!-- Título do agendamento -->
    <div class="text-xs font-bold truncate">
      {{ agendamento.titulo }}
    </div>

    <!-- Nome do cliente -->
    <div v-if="nomeCliente" class="text-xs font-medium opacity-80 truncate">
      {{ nomeCliente }}
    </div>
    
    <!-- Horário -->
    <div class="text-xs font-medium truncate">
      {{ horarioFormatado }}
    </div>
    
    <!-- Descrição (se houver espaço) -->
    <div v-if="altura > 70" class="text-xs font-medium opacity-80 truncate mt-0.5">
      {{ agendamento.descricao }}
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ================= SlotAgendamento.vue =================
 * Componente para exibir um slot de agendamento
 * 
 * Props:
 * @param {AgAgendamento} agendamento - Dados brutos do agendamento (formato banco)
 * 
 * Calcula posição e altura baseado no horário de início e fim
 * Cada hora tem 64px de altura (h-16 = 4rem = 64px)
 * 
 * Os campos hora_inicio e hora_fim vêm como strings do banco
 * no formato "HH:MM:SS-TZ" (ex: "08:00:00-03"). São parseados
 * para extrair horas e minutos.
 * ======================================================
 */

import type { AgAgendamento, AgCliente } from '../../../shared/types/database'
import { computed } from 'vue'

interface Props {
  agendamento: AgAgendamento
  clientes?: AgCliente[]
  profissionalNome?: string
  profissionalEspecialidade?: string
}

const props = withDefaults(defineProps<Props>(), {
  clientes: () => [],
  profissionalNome: '',
  profissionalEspecialidade: ''
})

const emit = defineEmits(['click'])

/**
 * Resolve o nome do cliente a partir do cliente_id do agendamento
 */
const nomeCliente = computed(() => {
  if (!props.agendamento.cliente_id) return ''
  const cliente = props.clientes.find((c) => c.id === props.agendamento.cliente_id)
  return cliente?.nome || ''
})

// Altura de cada slot de hora em pixels (h-16 = 64px)
const ALTURA_HORA = 64
const INICIO_DIA = 8 // 8h

/**
 * Faz parse de uma string de hora do banco (ex: "08:30:00-03")
 * para extrair horas e minutos como números.
 * 
 * @param horaStr - String no formato "HH:MM:SS" ou "HH:MM:SS-TZ"
 * @returns Objeto com { horas, minutos }
 */
function parseHora(horaStr: string | null): { horas: number; minutos: number } {
  if (!horaStr) return { horas: 0, minutos: 0 }
  const partes = horaStr.split(':')
  return {
    horas: parseInt(partes[0] || '0', 10),
    minutos: parseInt(partes[1] || '0', 10)
  }
}

/**
 * Calcula a posição top do slot baseado no horário de início
 */
const posicaoTop = computed(() => {
  const { horas, minutos } = parseHora(props.agendamento.hora_inicio)
  
  // Calcula offset desde as 8h
  const horasDesdeInicio = horas - INICIO_DIA
  const minutosEmHoras = minutos / 60
  
  // Adiciona 4px (pt-1) para alinhar com o padding da régua
  return (horasDesdeInicio + minutosEmHoras) * ALTURA_HORA + 4
})

/**
 * Calcula a altura do slot baseado na duração
 */
const altura = computed(() => {
  const inicio = parseHora(props.agendamento.hora_inicio)
  const fim = parseHora(props.agendamento.hora_fim)
  
  const totalMinutosInicio = inicio.horas * 60 + inicio.minutos
  const totalMinutosFim = fim.horas * 60 + fim.minutos
  const duracaoMinutos = totalMinutosFim - totalMinutosInicio
  const duracaoHoras = duracaoMinutos / 60
  
  return duracaoHoras * ALTURA_HORA
})

/**
 * Formata o horário para exibição
 */
const horarioFormatado = computed(() => {
  const inicio = parseHora(props.agendamento.hora_inicio)
  const fim = parseHora(props.agendamento.hora_fim)
  
  const horaInicio = inicio.horas.toString().padStart(2, '0')
  const minutoInicio = inicio.minutos.toString().padStart(2, '0')
  
  const horaFim = fim.horas.toString().padStart(2, '0')
  const minutoFim = fim.minutos.toString().padStart(2, '0')
  
  return `${horaInicio}:${minutoInicio} - ${horaFim}:${minutoFim}`
})
</script>
