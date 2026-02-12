<template>
  <div
    id="card-agendamento"
    class="relative bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 w-full"
  >
    <!-- Conteúdo do card - Layout horizontal -->
    <div class="flex items-center gap-3 py-4 px-4 min-h-[64px] w-full">
      <!-- ID do agendamento -->
      <div class="flex-shrink-0 w-10 text-sm font-medium text-gray-700">
        #{{ agendamento.id }}
      </div>

      <!-- Barra colorida vertical -->
      <div
        class="flex-shrink-0 w-1 h-12 rounded-full"
        :style="{ backgroundColor: agendamento.cor || '#4338CA' }"
      ></div>

      <!-- Status Ativo/Cancelado -->
      <div v-if="agendamento.cancelado" class="flex-shrink-0 flex items-center justify-center gap-1 bg-red-50 px-2 py-1 rounded w-[85px]">
        <XCircleIcon class="w-4 h-4 text-red-600" />
        <span class="text-xs font-medium text-red-700">Cancelado</span>
      </div>
      <div v-else class="flex-shrink-0 flex items-center justify-center gap-1 bg-green-50 px-2 py-1 rounded w-[85px]">
        <CheckCircleIcon class="w-4 h-4 text-green-600" />
        <span class="text-xs font-medium text-green-700">Ativo</span>
      </div>

      <!-- Data e horário -->
      <div class="flex-1 basis-0 flex items-center gap-2 h-12 min-w-0" :title="`${formatarDataComDiaSemana(agendamento.data)} | ${formatarHorario(agendamento.hora_inicio)} - ${formatarHorario(agendamento.hora_fim)}`">
        <CalendarIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
        <div class="flex flex-col justify-center h-full min-w-0">
          <span class="text-sm font-medium text-gray-900 leading-tight truncate">
            {{ formatarDataComDiaSemana(agendamento.data) }}
          </span>
          <span class="text-xs text-gray-500 leading-tight truncate">
            {{ formatarHorario(agendamento.hora_inicio) }} - {{ formatarHorario(agendamento.hora_fim) }}
          </span>
        </div>
      </div>

      <!-- Título e descrição -->
      <div class="flex-1 basis-0 flex items-center gap-2 h-12 min-w-0" :title="`${agendamento.titulo || 'Sem título'}${agendamento.descricao ? ' | ' + agendamento.descricao : ''}`">
        <ClipboardDocumentListIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
        <div class="flex flex-col justify-center h-full min-w-0">
          <h3 class="text-sm font-semibold text-gray-900 truncate leading-tight">
            {{ agendamento.titulo || 'Sem título' }}
          </h3>
          <p 
            v-if="agendamento.descricao" 
            class="text-xs text-gray-500 truncate leading-tight"
          >
            {{ agendamento.descricao }}
          </p>
        </div>
      </div>

      <!-- Cliente -->
      <div class="flex-1 basis-0 flex items-center gap-2 h-12 min-w-0" :title="`${agendamento.cliente_nome || 'Não informado'}${agendamento.cliente_telefone ? ' | ' + agendamento.cliente_telefone : ''}${agendamento.cliente_cpf ? ' | CPF: ' + agendamento.cliente_cpf : ''}${agendamento.cliente_email ? ' | ' + agendamento.cliente_email : ''}`">
        <UserIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
        <div class="flex flex-col justify-center min-w-0 h-full">
          <span class="text-sm font-medium text-gray-900 truncate leading-tight">
            {{ agendamento.cliente_nome || 'Não informado' }}
          </span>
          <span v-if="agendamento.cliente_telefone" class="text-xs text-gray-500 truncate leading-tight">
            {{ agendamento.cliente_telefone }}
          </span>
        </div>
      </div>

      <!-- Profissional -->
      <div class="flex-1 basis-0 flex items-center gap-2 h-12 min-w-0" :title="`${agendamento.profissional_nome || 'Não informado'}${agendamento.especialidade ? ' | ' + agendamento.especialidade : ''}`">
        <div
          class="flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-semibold flex-shrink-0"
          :style="{ backgroundColor: agendamento.cor || '#4338CA' }"
        >
          {{ agendamento.profissional_nome?.charAt(0).toUpperCase() || 'P' }}
        </div>
        <div class="flex flex-col justify-center min-w-0 h-full">
          <span class="text-sm font-medium text-gray-900 truncate leading-tight">
            {{ agendamento.profissional_nome || 'Não informado' }}
          </span>
          <span v-if="agendamento.especialidade" class="text-xs text-gray-500 truncate leading-tight">
            {{ agendamento.especialidade }}
          </span>
        </div>
      </div>

      <!-- Data de criação -->
      <div class="flex-shrink-0 flex flex-col justify-center text-right w-20 h-12" :title="`Criado em ${formatarDataCriacao(agendamento.created_at)}`">
        <span class="text-xs text-gray-400 leading-tight">Criado em</span>
        <div class="text-xs text-gray-500 leading-tight">
          {{ formatarDataCriacao(agendamento.created_at) }}
        </div>
      </div>

      <!-- Menu de ações -->
      <button
        type="button"
        class="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <EllipsisVerticalIcon class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ================= CardAgendamento.vue =================
 * Card elegante para exibir informações de um agendamento
 * 
 * Exibe:
 * - Data e horário
 * - Título do agendamento
 * - Cliente (nome e telefone)
 * - Profissional (nome e especialidade)
 * - Descrição (se houver)
 * - Barra lateral com cor do agendamento
 * 
 * Design:
 * - Layout horizontal (linhas)
 * - Hover com elevação
 * - Barra colorida lateral
 * - Ícones para identificação visual
 * ========================================================
 */

import { CalendarIcon, UserIcon, EllipsisVerticalIcon, CheckCircleIcon, XCircleIcon, ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'
import type { AgViewAgendamentoCompleto } from '../../shared/types/database'

interface Props {
  agendamento: AgViewAgendamentoCompleto
}

defineProps<Props>()

/**
 * Formata data com dia da semana abreviado
 * Exemplo: "2025-09-22" -> "seg., 22/09/2025"
 */
function formatarDataComDiaSemana(data: string | null): string {
  if (!data) return 'Data não informada'
  
  const diasSemana = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.']
  const [ano, mes, dia] = data.split('-')
  const dataObj = new Date(Number(ano), Number(mes) - 1, Number(dia))
  const diaSemana = diasSemana[dataObj.getDay()]
  
  return `${diaSemana}, ${dia}/${mes}/${ano}`
}

/**
 * Formata horário removendo timezone e segundos
 * Exemplo: "14:30:00-03" -> "14:30"
 */
function formatarHorario(hora: string | null): string {
  if (!hora) return '--:--'
  
  // Remove timezone e segundos
  return hora.substring(0, 5)
}

/**
 * Formata data de criação para exibição
 * Exemplo: "2025-09-14T12:00:00" -> "14/09/25"
 */
function formatarDataCriacao(data: string | null): string {
  if (!data) return '--/--/--'
  
  const dataObj = new Date(data)
  const dia = String(dataObj.getDate()).padStart(2, '0')
  const mes = String(dataObj.getMonth() + 1).padStart(2, '0')
  const ano = String(dataObj.getFullYear()).slice(-2)
  
  return `${dia}/${mes}/${ano}`
}
</script>
