<template>
  <BaseModal
    id="confirm-notification-modal"
    v-model="isOpen"
    size="md"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
          <Icon name="lucide:bell-ring" class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-base font-bold text-neutral-900 leading-none">Notificação Proativa</h3>
          <p class="text-xs text-neutral-400 mt-1">Deseja avisar o cliente sobre a mudança?</p>
        </div>
      </div>
    </template>

    <div v-if="agendamento" class="space-y-4 py-2">
      <!-- Card de Resumo -->
      <div class="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center font-bold text-xs text-indigo-600">
            {{ (agendamento.cliente_nome || '?').charAt(0).toUpperCase() }}
          </div>
          <div class="flex flex-col">
            <span class="text-[13px] font-bold text-neutral-800 leading-tight">{{ agendamento.cliente_nome }}</span>
            <span class="text-[10px] text-neutral-400 font-medium uppercase tracking-wider mt-0.5">
              {{ formatarData(agendamento.data) }} às {{ formatarHora(agendamento.hora_inicio) }}
            </span>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center gap-2 text-[11px] text-neutral-500">
            <Icon name="lucide:user" class="w-3.5 h-3.5 opacity-50" />
            <span>Profissional: <strong class="text-neutral-700">{{ agendamento.profissional_nome }}</strong></span>
          </div>
          <div class="flex items-center gap-2 text-[11px] text-neutral-500">
            <Icon name="lucide:check-circle" class="w-3.5 h-3.5 text-emerald-500" />
            <span>Novo Status: <strong class="text-emerald-700 uppercase tracking-tighter">{{ statusName }}</strong></span>
          </div>
        </div>
      </div>

      <!-- Preview da Mensagem -->
      <div class="space-y-2">
        <label class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">Prévia da Mensagem</label>
        <div class="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 relative overflow-hidden">
          <div class="absolute top-0 right-0 p-1 opacity-20">
            <Icon name="lucide:quote-right" class="w-8 h-8 text-indigo-300" />
          </div>
          <p class="text-xs text-indigo-900 leading-relaxed font-medium">
            "Olá <strong>{{ agendamento.cliente_nome?.split(' ')[0] }}</strong>! 👋 Seu agendamento para o dia <strong>{{ formatarData(agendamento.data) }}</strong> às <strong>{{ formatarHora(agendamento.hora_inicio) }}</strong> com <strong>{{ agendamento.profissional_nome }}</strong> foi <strong>{{ statusName }}</strong> com sucesso!"
          </p>
        </div>
      </div>

      <!-- Escolha do Canal -->
      <div class="grid grid-cols-2 gap-3">
        <button 
          @click="canal = 'whatsapp'"
          class="flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all"
          :class="canal === 'whatsapp' ? 'border-emerald-500 bg-emerald-50' : 'border-neutral-100 bg-white hover:border-neutral-200'"
        >
          <Icon name="logos:whatsapp-icon" class="w-6 h-6 mb-2" />
          <span class="text-[11px] font-bold" :class="canal === 'whatsapp' ? 'text-emerald-700' : 'text-neutral-600'">WhatsApp</span>
        </button>

        <button 
          @click="canal = 'email'"
          class="flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all"
          :class="canal === 'email' ? 'border-indigo-500 bg-indigo-50' : 'border-neutral-100 bg-white hover:border-neutral-200'"
        >
          <Icon name="lucide:mail" class="w-6 h-6 mb-2" :class="canal === 'email' ? 'text-indigo-600' : 'text-neutral-400'" />
          <span class="text-[11px] font-bold" :class="canal === 'email' ? 'text-indigo-700' : 'text-neutral-600'">E-mail</span>
        </button>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-2 w-full">
        <BaseButton variant="secondary" class="flex-1" @click="isOpen = false">
          Agora não
        </BaseButton>
        <BaseButton 
          variant="primary" 
          class="flex-1 shadow-indigo-100 shadow-lg"
          @click="confirmarEnvio"
        >
          <div class="flex items-center gap-2">
            <Icon v-if="canal === 'whatsapp'" name="lucide:send" class="w-4 h-4" />
            <Icon v-else name="lucide:mail" class="w-4 h-4" />
            <span>Enviar Agora</span>
          </div>
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { AgViewAgendamentoCompleto } from '../../../shared/types/database'
import BaseModal from '../BaseModal.vue'
import BaseButton from '../BaseButton.vue'

const isOpen = useState<boolean>('notification-modal-open', () => false)
const agendamento = useState<AgViewAgendamentoCompleto | null>('notification-agendamento', () => null)
const statusName = useState<string>('notification-status-name', () => '')

const canal = ref<'whatsapp' | 'email'>('whatsapp')

function formatarData(data: string | null | undefined) {
  if (!data) return ''
  const d = new Date(data)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function formatarHora(hora: string | null | undefined) {
  if (!hora) return ''
  return hora.substring(0, 5)
}

function confirmarEnvio() {
  console.log('🚀 [SIMULAÇÃO] Enviando notificação...')
  console.log('📱 Canal:', canal.value.toUpperCase())
  console.log('👤 Cliente:', agendamento.value?.cliente_nome)
  console.log('💌 Contato:', canal.value === 'whatsapp' ? agendamento.value?.cliente_telefone : agendamento.value?.cliente_email)
  console.log('📝 Mensagem:', `Olá ${agendamento.value?.cliente_nome?.split(' ')[0]}! Seu agendamento para o dia ${formatarData(agendamento.value?.data)} às ${formatarHora(agendamento.value?.hora_inicio)} com ${agendamento.value?.profissional_nome} foi ${statusName.value} com sucesso!`)
  
  const { notifySuccess } = useNotification()
  notifySuccess(`Notificação via ${canal.value === 'whatsapp' ? 'WhatsApp' : 'E-mail'} enviada!`)
  
  isOpen.value = false
}
</script>
