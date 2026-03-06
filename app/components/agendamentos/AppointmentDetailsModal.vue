<template>
  <BaseModal :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-neutral-900">Detalhes do Agendamento</h3>
      </div>
    </template>
    
    <div v-if="agendamento" class="space-y-6">
      <div class="flex items-center gap-2">
        <span :class="['inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase', agendamento.cancelado ? 'bg-error-50 text-error-700' : (agendamento.titulo?.startsWith('[CONCLUÍDO]') ? 'bg-emerald-50 text-emerald-700' : 'bg-success-50 text-success-700')]">
          {{ agendamento.cancelado ? 'Cancelado' : (agendamento.titulo?.startsWith('[CONCLUÍDO]') ? 'Concluído' : 'Ativo') }}
        </span>
        <span class="text-sm text-neutral-500 font-mono">#{{ agendamento.id }}</span>
      </div>

      <!-- Sobre o Agendamento -->
      <div>
        <h4 class="text-xl font-semibold text-neutral-800">{{ agendamento.titulo }}</h4>
        <p v-if="agendamento.descricao" class="mt-2 text-sm text-neutral-600 whitespace-pre-wrap bg-neutral-50 p-3 rounded-lg border border-neutral-100">{{ agendamento.descricao }}</p>
        <p v-else class="mt-2 text-sm text-neutral-400 italic">Nenhuma descrição preenchida para este agendamento.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Quando e Quem -->
        <div class="space-y-3 p-4 bg-white border border-neutral-200 rounded-xl shadow-sm">
          <h5 class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Quando & Quem</h5>
          
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Icon name="lucide:calendar" class="w-4 h-4" />
            </div>
            <div>
              <p class="text-sm font-medium text-neutral-900 capitalize">{{ formatarDataCurta(agendamento.data) }}</p>
              <p class="text-xs text-neutral-500">{{ formataHora(agendamento.hora_inicio) }} às {{ formataHora(agendamento.hora_fim) }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
             <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <Icon name="lucide:user" class="w-4 h-4" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-neutral-900 truncate" :title="agendamento.profissional_nome || 'Sistema'">{{ agendamento.profissional_nome || 'Sistema' }}</p>
              <p class="text-xs text-neutral-500">Profissional Responsável</p>
            </div>
          </div>
        </div>

        <!-- Cliente -->
        <div class="space-y-3 p-4 bg-white border border-neutral-200 rounded-xl shadow-sm">
          <h5 class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Cliente</h5>
          
          <div class="flex items-center gap-3 min-w-0">
            <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Icon name="lucide:users" class="w-4 h-4" />
            </div>
            <div class="min-w-0 flex-1">
              <NuxtLink 
                v-if="getLeadId(agendamento)" 
                :to="`/leads/${getLeadId(agendamento)}`" 
                class="text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline transition-colors flex items-center gap-1 min-w-0 truncate" 
                :title="agendamento.cliente_nome || 'Cliente Desconhecido'"
                @click="$emit('update:modelValue', false)"
              >
                <span class="truncate">{{ agendamento.cliente_nome || 'Cliente Desconhecido' }}</span>
                <Icon name="lucide:external-link" class="w-3 h-3 flex-shrink-0" />
              </NuxtLink>
              <p v-else class="text-sm font-medium text-neutral-900 truncate" :title="agendamento.cliente_nome || 'Cliente Desconhecido'">{{ agendamento.cliente_nome || 'Cliente Desconhecido' }}</p>
              
              <div class="flex items-center gap-1.5 mt-0.5" v-if="agendamento.cliente_telefone">
                <Icon name="lucide:phone" class="w-3 h-3 text-neutral-400 flex-shrink-0" />
                <p class="text-xs text-neutral-600 truncate">{{ formatPhone(agendamento.cliente_telefone) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Histórico -->
      <div class="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-100">
        <Icon name="lucide:info" class="w-4 h-4 text-neutral-400 flex-shrink-0" />
        <p>Criado por <span class="font-medium text-neutral-700">{{ agendamento.responsavel_agendamento || agendamento.criador_nome || 'Sistema' }}</span> em <span class="font-medium text-neutral-700">{{ formatDateOnly(agendamento.created_at) }}</span>.</p>
      </div>

    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end w-full">
        <BaseButton variant="secondary" @click="$emit('update:modelValue', false)">
          Fechar Detalhes
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { useState } from '#imports'
import type { AgViewAgendamentoCompleto } from '../../../shared/types/database'
import BaseModal from '../BaseModal.vue'
import BaseButton from '../BaseButton.vue'

// Lookup reverso: find lead_id via allLeads when appointment only has cliente_id
const allLeads = useState<any[]>('leads-all-data', () => [])

const getLeadId = (ag: AgViewAgendamentoCompleto | null): string | null => {
  if (!ag) return null
  if ((ag as any).lead_id) return (ag as any).lead_id
  if (ag.cliente_id && allLeads.value.length > 0) {
    const lead = allLeads.value.find(l => l.cliente_id === ag.cliente_id)
    if (lead?.id) return String(lead.id)
  }
  return null
}

const props = defineProps<{
  modelValue: boolean
  agendamento: AgViewAgendamentoCompleto | null
}>()

const emit = defineEmits(['update:modelValue'])

const formatarDataCurta = (dataString: string | null) => {
  if (!dataString) return '-'
  const [ano, mes, dia] = dataString.split('-')
  const val = new Date(Number(ano), Number(mes) - 1, Number(dia))
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'long' }).format(val)
}

const formataHora = (horaString: string | null) => {
  if (!horaString) return '--:--'
  return horaString.substring(0, 5)
}

const formatPhone = (phone: string | null) => {
  if (!phone) return ''
  const p = phone.replace(/\D/g, '')
  if (p.length === 11) return `(${p.substring(0, 2)}) ${p.substring(2, 7)}-${p.substring(7, 11)}`
  if (p.length === 10) return `(${p.substring(0, 2)}) ${p.substring(2, 6)}-${p.substring(6, 10)}`
  return phone
}

const formatDateOnly = (dateStr: string | null) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(d)
}
</script>
