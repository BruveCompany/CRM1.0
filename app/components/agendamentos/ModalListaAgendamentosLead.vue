<template>
  <BaseModal v-model="isOpen" size="lg">
    <template #header>
      <div class="flex flex-col gap-0.5">
        <h3 class="text-lg font-semibold text-neutral-900">Agendamentos do Lead</h3>
        <p class="text-xs text-neutral-500 font-normal">Histórico e próximos compromissos para {{ leadName }}</p>
      </div>
    </template>

    <div class="flex flex-col gap-4 py-2">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-3"></div>
        <p class="text-sm text-neutral-500">Buscando agendamentos...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="agendamentos.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
        <div class="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
          <CalendarIcon class="w-8 h-8 text-neutral-300" />
        </div>
        <h4 class="text-base font-semibold text-neutral-900">
          {{ !props.clienteId ? 'Lead não vinculado' : 'Nenhum agendamento' }}
        </h4>
        <p class="text-sm text-neutral-500 mt-1 mb-6 max-w-[280px]">
          {{ 
            !props.clienteId 
              ? 'Este lead ainda não possui um cadastro de cliente vinculado. Crie um agendamento para vinculá-lo automaticamente.' 
              : 'Este lead ainda não possui nenhum compromisso agendado no histórico.' 
          }}
        </p>
        <BaseButton variant="primary" size="sm" @click="emit('novo')">
          <PlusIcon class="w-4 h-4 mr-2" />
          Agendar Primeiro Contato
        </BaseButton>
      </div>

      <!-- List State -->
      <div v-else class="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        <div 
          v-for="ag in agendamentos" 
          :key="ag.id"
          class="group bg-white border border-neutral-200 rounded-xl p-4 transition-all hover:border-primary-200 hover:shadow-md hover:shadow-black/5"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <span 
                  class="w-3 h-3 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: ag.cor || '#B4A7F5' }"
                ></span>
                <span class="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                  {{ ag.categoria || 'Agendamento' }}
                </span>
                <span v-if="ag.cancelado" class="px-2 py-0.5 bg-error-50 text-error-600 text-[10px] font-semibold rounded-full uppercase tracking-tighter">
                  Cancelado
                </span>
              </div>
              
              <h4 class="text-sm font-semibold text-neutral-900 truncate mb-1">
                {{ ag.titulo }}
              </h4>
              
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 font-medium">
                <div class="flex items-center gap-1.5 text-neutral-700">
                  <CalendarIcon class="w-3.5 h-3.5" />
                  {{ formatarDataExtenso(ag.data) }}
                </div>
                <div class="flex items-center gap-1.5 text-neutral-700">
                  <ClockIcon class="w-3.5 h-3.5" />
                  {{ formatarHorario(ag.hora_inicio, ag.hora_fim) }}
                </div>
                <div v-if="ag.vendedor_nome" class="flex items-center gap-1.5 italic">
                  <UserCircleIcon class="w-3.5 h-3.5 text-primary-500" />
                  Por: {{ ag.vendedor_nome }}
                </div>
              </div>

              <p v-if="ag.descricao" class="mt-3 text-xs text-neutral-500 line-clamp-2 leading-relaxed bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                {{ ag.descricao }}
              </p>
            </div>

            <BaseButton 
              variant="secondary" 
              size="sm" 
              class="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              @click="emit('editar', ag)"
            >
              Editar
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between items-center w-full">
        <p class="text-[10px] text-neutral-400 font-normal uppercase tracking-wide">
          Total: {{ agendamentos.length }} registro(s)
        </p>
        <div class="flex gap-2">
          <BaseButton variant="secondary" @click="isOpen = false">Fechar</BaseButton>
          <BaseButton variant="primary" @click="emit('novo')">Novo Agendamento</BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from '../BaseModal.vue'
import BaseButton from '../BaseButton.vue'
import { CalendarIcon, ClockIcon, UserCircleIcon, PlusIcon } from '@heroicons/vue/24/outline'

interface Props {
  modelValue: boolean
  clienteId: number | null
  leadName: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'editar', 'novo'])
const { buscarRelatorioAgendamentos } = useAgendamento()

const supabase = useSupabaseClient()
const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const agendamentos = ref<any[]>([])
const loading = ref(false)

async function carregarAgendamentos() {
  console.log(`📡 [ModalLista...] Iniciando busca para Cliente ID: ${props.clienteId}`);
  if (!props.clienteId) {
    console.log('  ⚠️ Abortando: clienteId nulo.');
    agendamentos.value = []
    return
  }
  
  loading.value = true
  try {
    const data = await buscarRelatorioAgendamentos({
      clienteId: Number(props.clienteId),
      cancelado: undefined 
    })

    console.log(`  ✅ Resultado da busca: ${data?.length || 0} registros encontrados.`);
    if (data) {
      agendamentos.value = data
    } else {
      agendamentos.value = []
    }
  } catch (err) {
    console.error('  ❌ Erro ao carregar lista:', err)
  } finally {
    loading.value = false
  }
}

function formatarDataExtenso(dateStr: string) {
  if (!dateStr) return ''
  const partes = dateStr.split('-').map(Number)
  if (partes.length < 3) return dateStr
  const data = new Date(partes[0]!, partes[1]! - 1, partes[2]!)
  const dias = ['Dom', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${dias[data.getDay()]}, ${data.getDate()} de ${meses[data.getMonth()]}`
}

function formatarHorario(inicio: string, fim: string) {
  const f = (h: string) => h ? h.substring(0, 5) : '--:--'
  return `${f(inicio)} às ${f(fim)}`
}

watch(() => isOpen.value, (aberto) => {
  if (aberto) {
    console.log('🔓 Modal aberto. Forçando carregamento...');
    carregarAgendamentos();
  }
});

watch(() => props.clienteId, (newId) => {
  if (isOpen.value && newId) {
    console.log(`🆔 Cliente ID mudou para ${newId}. Recarregando...`);
    carregarAgendamentos();
  }
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
