<template>
  <div
    id="card-agendamento"
    class="relative bg-white border-b border-neutral-200 hover:bg-neutral-50 transition-colors duration-150 w-full"
  >
    <!-- Conteúdo do card - Layout horizontal -->
    <div class="flex items-center gap-3 py-4 px-4 min-h-[64px] w-full">
      <!-- ID do agendamento -->
      <div class="flex-shrink-0 w-10 text-sm font-medium text-neutral-700">
        #{{ agendamento.id }}
      </div>

      <!-- Barra colorida vertical -->
      <div
        class="flex-shrink-0 w-1 h-12 rounded-full"
        :style="{ backgroundColor: agendamento.cor || '#4338CA' }"
      ></div>

      <!-- Status Ativo/Cancelado -->
      <div v-if="agendamento.cancelado" class="flex-shrink-0 flex items-center justify-center gap-1 bg-error-50 px-2 py-1 rounded w-[85px]">
        <XCircleIcon class="w-4 h-4 text-error-600" />
        <span class="text-xs font-medium text-error-700">Cancelado</span>
      </div>
      <div v-else class="flex-shrink-0 flex items-center justify-center gap-1 bg-success-50 px-2 py-1 rounded w-[85px]">
        <CheckCircleIcon class="w-4 h-4 text-success-600" />
        <span class="text-xs font-medium text-success-700">Ativo</span>
      </div>

      <!-- Data e horário -->
      <div class="flex-1 basis-0 flex items-center gap-2 h-12 min-w-0" :title="`${formatarDataComDiaSemana(agendamento.data)} | ${formatarHorario(agendamento.hora_inicio)} - ${formatarHorario(agendamento.hora_fim)}`">
        <CalendarIcon class="w-4 h-4 text-neutral-400 flex-shrink-0" />
        <div class="flex flex-col justify-center h-full min-w-0">
          <span class="text-sm font-medium text-neutral-900 leading-tight truncate">
            {{ formatarDataComDiaSemana(agendamento.data) }}
          </span>
          <span class="text-xs text-neutral-500 leading-tight truncate">
            {{ formatarHorario(agendamento.hora_inicio) }} - {{ formatarHorario(agendamento.hora_fim) }}
          </span>
        </div>
      </div>

      <!-- Título e descrição -->
      <div class="flex-1 basis-0 flex items-center gap-2 h-12 min-w-0" :title="`${agendamento.titulo || 'Sem título'}${agendamento.descricao ? ' | ' + agendamento.descricao : ''}`">
        <ClipboardDocumentListIcon class="w-4 h-4 text-neutral-400 flex-shrink-0" />
        <div class="flex flex-col justify-center h-full min-w-0">
          <h3 class="text-sm font-semibold text-neutral-900 truncate leading-tight">
            {{ agendamento.titulo || 'Sem título' }}
          </h3>
          <p 
            v-if="agendamento.descricao" 
            class="text-xs text-neutral-500 truncate leading-tight"
          >
            {{ agendamento.descricao }}
          </p>
        </div>
      </div>

      <!-- Cliente -->
      <div class="flex-1 basis-0 flex items-center gap-2 h-12 min-w-0" :title="`${agendamento.cliente_nome || 'Não informado'}${agendamento.cliente_telefone ? ' | ' + agendamento.cliente_telefone : ''}${agendamento.cliente_cpf ? ' | CPF: ' + agendamento.cliente_cpf : ''}${agendamento.cliente_email ? ' | ' + agendamento.cliente_email : ''}`">
        <UserIcon class="w-4 h-4 text-neutral-400 flex-shrink-0" />
        <div class="flex flex-col justify-center min-w-0 h-full">
          <span class="text-sm font-medium text-neutral-900 truncate leading-tight">
            {{ agendamento.cliente_nome || 'Não informado' }}
          </span>
          <span v-if="agendamento.cliente_telefone" class="text-xs text-neutral-500 truncate leading-tight">
            {{ agendamento.cliente_telefone }}
          </span>
        </div>
      </div>

      <!-- Profissional -->
      <div class="flex-1 basis-0 flex items-center gap-2 h-12 min-w-0" :title="`Profissional: ${agendamento.profissional_nome || 'Não informado'}${agendamento.especialidade ? ' | ' + agendamento.especialidade : ''}`">
        <div
          class="flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-semibold flex-shrink-0"
          :style="{ backgroundColor: agendamento.cor || '#4338CA' }"
        >
          {{ agendamento.profissional_nome?.charAt(0).toUpperCase() || 'P' }}
        </div>
        <div class="flex flex-col justify-center min-w-0 h-full">
          <span class="text-xs text-neutral-400 leading-tight">Profissional</span>
          <span class="text-sm font-medium text-neutral-900 truncate leading-tight">
            {{ agendamento.profissional_nome || 'Não informado' }}
          </span>
        </div>
      </div>

      <!-- Vendedor (Quem criou) -->
      <div class="flex-1 basis-0 flex items-center gap-2 h-12 min-w-0" :title="`Agendado por: ${vendedorNome || 'Sistema'}`">
        <UserCircleIcon class="w-5 h-5 text-neutral-400 flex-shrink-0" />
        <div class="flex flex-col justify-center min-w-0 h-full">
          <span class="text-xs text-neutral-400 leading-tight">Vendedor</span>
          <span class="text-sm font-medium text-neutral-700 truncate leading-tight">
            {{ vendedorNome || 'Sistema' }}
          </span>
        </div>
      </div>

      <!-- Data de criação -->
      <div class="flex-shrink-0 flex flex-col justify-center text-right w-20 h-12" :title="`Criado em ${formatarDataCriacao(agendamento.created_at)}`">
        <span class="text-xs text-neutral-400 leading-tight">Criado em</span>
        <div class="text-xs text-neutral-500 leading-tight">
          {{ formatarDataCriacao(agendamento.created_at) }}
        </div>
      </div>

      <!-- Menu de ações -->
      <button
        type="button"
        class="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
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
 * - Vendedor (quem criou o agendamento)
 * - Descrição (se houver)
 * - Barra lateral com cor do agendamento
 * ========================================================
 */

import { computed, onMounted } from 'vue'
import { CalendarIcon, UserIcon, UserCircleIcon, EllipsisVerticalIcon, CheckCircleIcon, XCircleIcon, ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'
import type { AgViewAgendamentoCompleto } from '../../shared/types/database'
import { useLeads } from '../composables/useLeads'

interface Props {
  agendamento: AgViewAgendamentoCompleto
}

const props = defineProps<Props>()

// Busca lista de vendedores da store global (definida no useLeads.ts)
const { vendedores: vendedoresGlobal, fetchVendedores } = useLeads()
const vendedores = computed(() => vendedoresGlobal.value)

// Computa o nome do vendedor que criou o agendamento
const vendedorNome = computed(() => {
  // 1. Preferência total pelo campo vindo da VIEW (mais performático e confiável entre páginas)
  if (props.agendamento.criador_nome) return props.agendamento.criador_nome

  // 2. Fallback: Procura no estado global de vendedores pelo user_id
  if (!props.agendamento.user_id) return null
  const v = vendedores.value.find(v => String(v.user_id) === String(props.agendamento.user_id))
  return v?.nome || null
})

// Melhora: Garante que os vendedores estejam carregados (necessário para a página Agenda)
onMounted(async () => {
  if (vendedores.value.length === 0) {
    await fetchVendedores()
  }
})

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
