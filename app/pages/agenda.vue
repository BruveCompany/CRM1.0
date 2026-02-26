<template>
  <NuxtLayout>
    <div class="agenda-page-container flex flex-col h-full bg-slate-50">
      <!-- Sistema de Navegação/Ações Estilo Leads -->
      <AgendaHeader 
        v-model:activeView="activeView"
        :profissionais="profissionais"
        :loading="loadingProfissionais"
        @novo-agendamento="handleManualNovoAgendamento"
        @search="searchQuery = $event"
      />

      <!-- Conteúdo Dinâmico -->
      <main class="flex-1 min-h-0 overflow-hidden">
        <ClientOnly>
          <div v-if="activeView === 'agenda'" class="h-full bg-white border-t border-neutral-200">
            <AgendamentoManager ref="managerRef" hide-internal-header />
          </div>
          <div v-else class="h-full overflow-auto">
            <ListaAgendamentos 
              :search-query="searchQuery"
              :filtro-cliente-id="filtroClienteId"
              :filtro-profissional-id="filtroProfissionalId"
            />
          </div>
          
          <template #fallback>
            <div class="flex flex-col items-center justify-center py-32 opacity-20">
              <Icon name="svg-spinners:18-dots-indicator" class="w-12 h-12 mb-4" />
              <p class="text-sm font-bold uppercase tracking-widest">Sincronizando Agenda...</p>
            </div>
          </template>
        </ClientOnly>
      </main>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
/**
 * ================= Página: Agenda Unificada =================
 * Unifica a visualização de calendário e lista de agendamentos.
 * Estilo visual sincronizado com a página de Leads.
 * ============================================================
 */

import AgendaHeader from '~/components/agendamentos/AgendaHeader.vue'
import AgendamentoManager from '~/components/agendamentos/AgendamentoManager.vue'
import ListaAgendamentos from '~/components/ListaAgendamentos.vue'
import { useProfissionais } from '~/composables/useProfissionais'
import { useAgendamentoStore } from '~/stores/agendamento'

// Controle de visualização ativa e dados
const activeView = ref<'agenda' | 'lista'>('agenda')
const searchQuery = ref('')
const filtroClienteId = ref('')
const filtroProfissionalId = ref('')
const managerRef = ref<any>(null)

// Sincroniza o filtro com o store apenas no cliente (evita mismatch SSR/CSR)
onMounted(() => {
  const agendamentoStore = useAgendamentoStore()
  
  // Atualiza imediatamente com o valor atual
  filtroProfissionalId.value = agendamentoStore.profissionalId
    ? String(agendamentoStore.profissionalId)
    : ''

  // Continua sincronizando quando o profissional mudar
  watch(
    () => agendamentoStore.profissionalId,
    (id) => { filtroProfissionalId.value = id ? String(id) : '' }
  )
})

const { fetchProfissionais } = useProfissionais()
const profissionais = ref<any[]>([])
const loadingProfissionais = ref(true)

// Aciona a função de novo agendamento que está dentro do componente AgendamentoManager
function handleManualNovoAgendamento() {
  if (managerRef.value && managerRef.value.handleNovoAgendamento) {
    managerRef.value.handleNovoAgendamento()
  }
}

onMounted(async () => {
  try {
    loadingProfissionais.value = true
    const data = await fetchProfissionais()
    profissionais.value = data || []
  } catch (err) {
    console.error('Erro ao carregar profissionais na Agenda:', err)
  } finally {
    loadingProfissionais.value = false
  }
})

useHead({
  title: 'Agenda'
})
</script>

<style scoped>
.agenda-page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
