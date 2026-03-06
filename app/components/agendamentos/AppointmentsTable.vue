<template>
  <div class="w-full overflow-x-auto min-h-[350px] rounded-lg border border-neutral-200 bg-white shadow-sm custom-scrollbar">
    <table class="w-full text-left text-sm text-neutral-600 border-collapse relative">
      <!-- THEAD estático/fixo -->
      <thead class="sticky top-0 z-10 bg-neutral-50 text-[13px] uppercase text-neutral-700 border-b border-neutral-200">
        <tr>
          <th scope="col" class="px-2 py-3.5 font-semibold text-center whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors group user-select-none" @click="$emit('sort', 'id')">
            <div class="flex flex-row items-center justify-center gap-1">
              ID (#)
              <span v-if="sortColumn === 'id'" class="text-[10px] text-primary-600 font-bold ml-1" v-html="sortDirection === 'asc' ? '&#9650;' : '&#9660;'"></span>
              <span v-else class="text-[10px] text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity ml-1">&#9650;</span>
            </div>
          </th>
          <th scope="col" class="px-2 py-3.5 font-semibold text-center whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors group user-select-none" @click="$emit('sort', 'cancelado')">
            <div class="flex flex-row items-center justify-center gap-1">
              Status
              <span v-if="sortColumn === 'cancelado'" class="text-[10px] text-primary-600 font-bold ml-1" v-html="sortDirection === 'asc' ? '&#9650;' : '&#9660;'"></span>
              <span v-else class="text-[10px] text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity ml-1">&#9650;</span>
            </div>
          </th>
          <th scope="col" class="px-2 py-3.5 font-semibold text-left whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors group user-select-none" @click="$emit('sort', 'data')">
            <div class="flex flex-row items-center justify-start gap-1">
              Data / Hora
              <span v-if="sortColumn === 'data'" class="text-[10px] text-primary-600 font-bold ml-1" v-html="sortDirection === 'asc' ? '&#9650;' : '&#9660;'"></span>
              <span v-else class="text-[10px] text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity ml-1">&#9650;</span>
            </div>
          </th>
          <th scope="col" class="px-2 py-3.5 font-semibold text-left cursor-pointer hover:bg-neutral-100 transition-colors group user-select-none" @click="$emit('sort', 'titulo')">
            <div class="flex flex-row items-center justify-start gap-1">
              Assunto
              <span v-if="sortColumn === 'titulo'" class="text-[10px] text-primary-600 font-bold ml-1" v-html="sortDirection === 'asc' ? '&#9650;' : '&#9660;'"></span>
              <span v-else class="text-[10px] text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity ml-1">&#9650;</span>
            </div>
          </th>
          <th scope="col" class="px-2 py-3.5 font-semibold text-left whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors group user-select-none" @click="$emit('sort', 'cliente_nome')">
            <div class="flex flex-row items-center justify-start gap-1">
              Cliente
              <span v-if="sortColumn === 'cliente_nome'" class="text-[10px] text-primary-600 font-bold ml-1" v-html="sortDirection === 'asc' ? '&#9650;' : '&#9660;'"></span>
              <span v-else class="text-[10px] text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity ml-1">&#9650;</span>
            </div>
          </th>
          <th scope="col" class="px-2 py-3.5 font-semibold text-left whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors group user-select-none" @click="$emit('sort', 'profissional_nome')">
            <div class="flex flex-row items-center justify-start gap-1">
              Profissional
              <span v-if="sortColumn === 'profissional_nome'" class="text-[10px] text-primary-600 font-bold ml-1" v-html="sortDirection === 'asc' ? '&#9650;' : '&#9660;'"></span>
              <span v-else class="text-[10px] text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity ml-1">&#9650;</span>
            </div>
          </th>
          <th scope="col" class="px-2 py-3.5 font-semibold text-left whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors group user-select-none" @click="$emit('sort', 'criador_nome')">
            <div class="flex flex-row items-center justify-start gap-1">
              Criador
              <span v-if="sortColumn === 'criador_nome'" class="text-[10px] text-primary-600 font-bold ml-1" v-html="sortDirection === 'asc' ? '&#9650;' : '&#9660;'"></span>
              <span v-else class="text-[10px] text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity ml-1">&#9650;</span>
            </div>
          </th>
          <th scope="col" class="px-2 py-3.5 font-semibold text-left whitespace-nowrap cursor-pointer hover:bg-neutral-100 transition-colors group user-select-none" @click="$emit('sort', 'created_at')">
            <div class="flex flex-row items-center justify-start gap-1">
              Criado em
              <span v-if="sortColumn === 'created_at'" class="text-[10px] text-primary-600 font-bold ml-1" v-html="sortDirection === 'asc' ? '&#9650;' : '&#9660;'"></span>
              <span v-else class="text-[10px] text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity ml-1">&#9650;</span>
            </div>
          </th>
          <th scope="col" class="px-2 py-3.5 font-semibold text-center whitespace-nowrap cursor-default">
            Ações
          </th>
        </tr>
      </thead>
      
      <!-- TBODY dinâmico com Hovers -->
      <tbody class="divide-y divide-neutral-200 bg-white">
        <tr 
          v-for="appointment in appointments" 
          :key="appointment.id"
          class="hover:bg-neutral-50 transition-colors duration-150 group"
        >
          <!-- ID -->
          <td class="px-2 py-3 font-mono text-[13px] text-center text-neutral-500 align-middle whitespace-nowrap">
            #{{ appointment.id }}
          </td>
          
          <!-- Status -->
          <td class="px-2 py-3 align-middle text-center whitespace-nowrap">
            <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase', getStatusBadgeClass(appointment.cancelado)]">
              {{ appointment.cancelado ? 'Cancelado' : 'Ativo' }}
            </span>
          </td>
          
          <!-- Data / Hora -->
          <td class="px-2 py-3 whitespace-nowrap align-middle">
            <div class="font-semibold text-neutral-800 capitalize">{{ formatarDataCurta(appointment.data) }}</div>
            <div class="text-[12px] text-neutral-500 mt-1 flex items-center gap-1 font-medium">
              <Icon name="lucide:clock" class="w-3.5 h-3.5" />
              {{ formataHora(appointment.hora_inicio) }} - {{ formataHora(appointment.hora_fim) }}
            </div>
          </td>
          
          <!-- Assunto -->
          <td class="px-2 py-3 align-middle max-w-[150px]">
            <div class="font-semibold text-neutral-800 line-clamp-1" :title="appointment.titulo || 'Sem Título'">{{ appointment.titulo || 'Agendamento' }}</div>
            <div class="text-[12px] text-neutral-500 line-clamp-1 mt-0.5" :title="appointment.descricao || ''">
              {{ appointment.descricao || '-' }}
            </div>
          </td>
          
          <!-- Cliente -->
          <td class="px-2 py-3 align-middle max-w-[140px]">
             <NuxtLink
              v-if="getLeadId(appointment)"
              :to="`/leads/${getLeadId(appointment)}`"
              class="font-semibold text-primary-600 hover:text-primary-800 hover:underline transition-colors flex items-center gap-1 min-w-0"
              :title="appointment.cliente_nome || ''"
            >
              <span class="truncate">{{ appointment.cliente_nome || 'Cliente Desconhecido' }}</span>
              <Icon name="lucide:external-link" class="w-3 h-3 flex-shrink-0" />
            </NuxtLink>
            <div v-else class="font-semibold text-neutral-800 truncate" :title="appointment.cliente_nome || ''">{{ appointment.cliente_nome || 'Cliente Desconhecido' }}</div>
            <div class="text-[12px] text-neutral-500 mt-0.5 flex items-center gap-1.5 font-medium truncate">
                <Icon name="lucide:phone" class="w-3 h-3 shrink-0" />
                {{ formatPhone(appointment.cliente_telefone) }}
            </div>
          </td>
          
          <!-- Profissional avatar -->
          <td class="px-2 py-3 align-middle whitespace-nowrap max-w-[140px]">
            <div class="flex items-center gap-2">
              <div class="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 border border-primary-100 text-[12px] font-bold text-primary-700 shadow-sm shrink-0">
                {{ getInitial(appointment.profissional_nome) }}
              </div>
              <span class="font-semibold text-neutral-800 text-[13px] truncate" :title="appointment.profissional_nome || 'Sistema'">{{ appointment.profissional_nome || 'Sistema' }}</span>
            </div>
          </td>
          
          <!-- Vendedor/Criador -->
          <td class="px-2 py-3 text-neutral-600 align-middle whitespace-nowrap text-[12.5px] font-medium max-w-[120px] truncate" :title="appointment.responsavel_agendamento || appointment.criador_nome || 'Sistema'">
            {{ appointment.responsavel_agendamento || appointment.criador_nome || 'Sistema' }}
          </td>
          
          <!-- Criado Em -->
          <td class="px-2 py-3 text-neutral-500 whitespace-nowrap align-middle text-[12.5px] font-medium">
            {{ formatDateOnly(appointment.created_at) }}
          </td>
          
          <!-- Ações (Kebab menu) -->
          <td class="px-2 py-3 text-center align-middle">
            <ActionDropdown 
              :actions="tableActions" 
              @action-clicked="(actionId) => handleAction(actionId, appointment)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { AgViewAgendamentoCompleto } from '../../../shared/types/database'
import { useState } from '#imports'

// Lookup reverso: find lead_id via allLeads when appointment only has cliente_id
const allLeads = useState<any[]>('leads-all-data', () => [])

const getLeadId = (appointment: AgViewAgendamentoCompleto): string | null => {
  // 1. Prioridade: lead_id diretamente no agendamento
  if ((appointment as any).lead_id) return (appointment as any).lead_id
  // 2. Fallback: busca nos leads carregados globalmente pelo cliente_id
  if (appointment.cliente_id && allLeads.value.length > 0) {
    const lead = allLeads.value.find(l => l.cliente_id === appointment.cliente_id)
    if (lead?.id) return String(lead.id)
  }
  return null
}

// Prop principal (a tabela recebe uma lista direta da View do Banco)
const props = defineProps<{
  appointments: AgViewAgendamentoCompleto[]
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
}>()

// Eventos (emite a ordenação e os cliques de ação se tivermos)
const emit = defineEmits<{
  (e: 'sort', column: string): void
  (e: 'view-clicked', appointment: AgViewAgendamentoCompleto): void
  (e: 'edit-clicked', appointment: AgViewAgendamentoCompleto): void
  (e: 'complete-clicked', appointment: AgViewAgendamentoCompleto): void
  (e: 'cancel-clicked', appointment: AgViewAgendamentoCompleto): void
}>()

import ActionDropdown, { type DropdownAction } from '../ui/ActionDropdown.vue'

const tableActions: DropdownAction[] = [
  { id: 'view', label: 'Ver Detalhes', icon: 'lucide:eye' },
  { id: 'edit', label: 'Editar', icon: 'lucide:edit-2' },
  { id: 'complete', label: 'Marcar como Concluído', icon: 'lucide:check-circle' },
  { id: 'cancel', label: 'Cancelar Agendamento', icon: 'lucide:x-circle', isDestructive: true }
]

const handleAction = (actionId: string, appointment: AgViewAgendamentoCompleto) => {
  if (actionId === 'view') emit('view-clicked', appointment)
  if (actionId === 'edit') emit('edit-clicked', appointment)
  if (actionId === 'complete') emit('complete-clicked', appointment)
  if (actionId === 'cancel') emit('cancel-clicked', appointment)
}

// Regras de cores para os Status Badges baseados no booleano Cancelado
const getStatusBadgeClass = (cancelado: boolean) => {
  if (cancelado) {
    return 'bg-red-100 text-[#ff3333] border border-red-200'
  }
  return 'bg-green-100 text-green-700 border border-green-200'
}

const formataHora = (timeString: string | null) => {
  if (!timeString) return '--:--'
  return timeString.substring(0, 5)
}

const formatarDataCurta = (dateString: string | null) => {
  if (!dateString) return '-'
  try {
    const parted = dateString.split('-')
    const dateObj = new Date(Number(parted[0]), Number(parted[1]) - 1, Number(parted[2]))
    const optionsDate: Intl.DateTimeFormatOptions = { weekday: 'short', day: '2-digit', month: '2-digit' }
    return dateObj.toLocaleDateString('pt-BR', optionsDate).replace('.', '')
  } catch(e) {
    return dateString
  }
}

const formatDateOnly = (isoString: string | null) => {
  if (!isoString) return '-'
  const dateObj = new Date(isoString)
  return isNaN(dateObj.getTime()) ? isoString : dateObj.toLocaleDateString('pt-BR')
}

const getInitial = (name?: string | null) => {
  if (!name || name.trim() === '') return '?'
  return name.trim().charAt(0).toUpperCase()
}

const formatPhone = (phone?: string | null) => {
  if (!phone) return 'Não informado'
  const cleaned = phone.replace(/\D/g, '')
  if(cleaned.length === 11) {
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/)
    if(match) return `(${match[1]}) ${match[2]}-${match[3]}`
  } else if(cleaned.length === 10) {
    const match = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/)
    if(match) return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}
</script>

<style scoped>
/* Melhora os layouts de scroll horizontal */
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: white;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #E5E7EB;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #D1D5DB;
}
</style>
