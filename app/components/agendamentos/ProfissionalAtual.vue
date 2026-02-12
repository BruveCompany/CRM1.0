<template>
  <div id="profissional-atual" class="flex flex-col items-center justify-center gap-1">
    <!-- Estado: Carregando dados -->
    <div v-if="loading" class="text-gray-500 text-sm">
      Carregando...
    </div>

    <!-- Estado: Profissional encontrado -->
    <template v-else-if="profissionalAtual">
      <!-- Nome do profissional (clicável para abrir modal) -->
      <button
        type="button"
        class="flex items-center gap-1.5 text-lg font-bold text-gray-900 hover:text-[#4338CA] transition-colors cursor-pointer"
        @click="modalAberto = true"
      >
        {{ profissionalAtual.nome }}
        <ChevronDownIcon class="w-4 h-4" />
      </button>
      <!-- Especialidade -->
      <div class="text-sm text-gray-600">
        {{ profissionalAtual.especialidade }}
      </div>
    </template>

    <!-- Estado: Nenhum profissional disponível -->
    <div v-else class="text-gray-500 text-sm">
      Nenhum profissional encontrado
    </div>

    <!-- Modal de seleção de profissional -->
    <ModalSelecionarProfissional
      v-model="modalAberto"
      :profissionais="profissionais"
      :profissional-atual-id="profissionalAtual?.profissional_id ?? null"
      @selecionar="handleSelecionar"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * ================= ProfissionalAtual.vue =================
 * Componente que exibe o profissional atual e permite trocar
 * via modal de seleção.
 * 
 * Lógica:
 * 1. Busca todos os profissionais cadastrados
 * 2. Inicializa com o profissional logado (ou primeiro da lista)
 * 3. Ao clicar, abre modal com lista de profissionais
 * 4. Ao selecionar, define o profissional no store de agendamentos
 * ========================================================
 */

import { useProfissionais } from '~/composables/useProfissionais'
import { useUserStore } from '~/stores/user'
import { useAgendamentoStore } from '~/stores/agendamento'
import { ChevronDownIcon } from '@heroicons/vue/24/solid'
import ModalSelecionarProfissional from './ModalSelecionarProfissional.vue'
import type { AgProfissional } from '../../../shared/types/database'

// Composables
const { fetchProfissionais } = useProfissionais()
const userStore = useUserStore()
const agendamentoStore = useAgendamentoStore()

// Estado local do componente
const profissionais = ref<AgProfissional[]>([])
const loading = ref(true)
const modalAberto = ref(false)
const profissionalSelecionadoId = ref<number | null>(null)

/**
 * Computed que retorna o profissional a ser exibido
 * Prioridade: 1) Selecionado pelo usuário, 2) Profissional logado, 3) Primeiro da lista
 */
const profissionalAtual = computed(() => {
  if (profissionais.value.length === 0) return null

  // Se o usuário já selecionou um profissional via modal
  if (profissionalSelecionadoId.value) {
    const selecionado = profissionais.value.find(
      (p: AgProfissional) => p.profissional_id === profissionalSelecionadoId.value
    )
    if (selecionado) return selecionado
  }

  // Tentar encontrar o profissional logado pelo profile_id
  if (userStore.profile?.id) {
    const profissionalLogado = profissionais.value.find(
      (p: AgProfissional) => p.profile_id === userStore.profile?.id
    )
    if (profissionalLogado) return profissionalLogado
  }

  // Fallback: primeiro da lista
  return profissionais.value[0]
})

/**
 * Handler ao selecionar profissional no modal
 */
function handleSelecionar(prof: AgProfissional) {
  profissionalSelecionadoId.value = prof.profissional_id
}

/**
 * Watch: Quando o profissional atual mudar, define o ID no store
 */
watch(profissionalAtual, (novoProfissional) => {
  if (novoProfissional) {
    console.log('ProfissionalAtual: Definindo profissional', novoProfissional.profissional_id)
    agendamentoStore.profissionalId = novoProfissional.profissional_id
  }
}, { immediate: true })

/**
 * Buscar profissionais ao montar o componente
 */
onMounted(async () => {
  try {
    profissionais.value = await fetchProfissionais()
  } catch (error) {
    console.error('Erro ao carregar profissionais:', error)
  } finally {
    loading.value = false
  }
})
</script>
