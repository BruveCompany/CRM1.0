<template>
  <div id="profissional-atual" class="w-full flex">
    <!-- Estado: Carregando dados -->
    <div v-if="loading && (!profissionais || profissionais.length === 0)" class="p-2">
      <div class="h-10 w-48 bg-neutral-200 rounded-full animate-pulse"></div>
    </div>

    <!-- Botão de Seleção (Sincronizado com Padrão do Modal) -->
    <div v-else class="py-1">
      <button
        type="button"
        class="flex items-center gap-2.5 pl-1 pr-4 py-1 rounded-full border border-primary-100 bg-primary-50 hover:bg-primary-100/50 transition-all group min-h-[40px] cursor-pointer"
        @click="modalAberto = true"
      >
        <!-- Ícone Sem Fundo -->
        <div 
          class="w-9 h-9 flex items-center justify-center text-primary-600 flex-shrink-0 ml-0.5"
        >
          <UsersIcon class="w-5 h-5" />
        </div>

        <!-- Labels e Nome -->
        <div class="text-left flex flex-col justify-center min-w-0">
          <p class="text-[9px] text-primary-600 font-semibold uppercase tracking-widest leading-none mb-1">PROFISSIONAL</p>
          <div class="flex items-center gap-1.5">
            <span class="text-[13px] font-semibold text-primary-900 leading-none truncate max-w-[140px]">
              {{ nomeExibicao }}
            </span>
            <ChevronDownIcon class="w-3 h-3 text-primary-400 group-hover:text-primary-600 transition-colors shrink-0" />
          </div>
        </div>
      </button>

      <!-- Modal de Seleção -->
      <ModalSelecionarProfissional
        v-model="modalAberto"
        :profissionais="profissionais"
        :profissional-atual-id="agendamentoStore.profissionalId"
        @selecionar="handleSelecionar"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '~/stores/user'
import { useAgendamentoStore } from '~/stores/agendamento'
import { UsersIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import type { AgProfissional } from '../../../shared/types/database'
import ModalSelecionarProfissional from './ModalSelecionarProfissional.vue'

interface Props {
  profissionais: AgProfissional[]
  loading: boolean
}

const props = withDefaults(defineProps<Props>(), {
  profissionais: () => [],
  loading: false
})

const userStore = useUserStore()
const agendamentoStore = useAgendamentoStore()
const modalAberto = ref(false)

/**
 * Profissional atualmente selecionado na store
 */
const profissionalAtual = computed(() => {
  const currentId = agendamentoStore.profissionalId
  if (!currentId) return null
  return props.profissionais.find(p => String(p.profissional_id) === String(currentId))
})

/**
 * Nome para exibir no botão
 */
const nomeExibicao = computed(() => {
  if (props.loading && (!props.profissionais || props.profissionais.length === 0)) return 'Carregando...'
  return profissionalAtual.value?.nome || 'Todos os Profissionais'
})

/**
 * Iniciais para o avatar circular
 */
const iniciais = computed(() => {
  if (!profissionalAtual.value) return '?'
  return (profissionalAtual.value.nome || '').charAt(0).toUpperCase()
})

/**
 * Handler para seleção no modal
 */
function handleSelecionar(prof: AgProfissional | null) {
  console.log('👤 ProfissionalAtual: Selecionado ->', prof ? prof.nome : 'TODOS')
  agendamentoStore.profissionalId = prof?.profissional_id || null
}

/**
 * Lógica de inicialização automática: Seleciona o profissional logado se disponível
 * Para ADMINS, prioriza a visão "Todos" (null)
 */
const inicializado = ref(false)

watch(
  [() => props.profissionais, () => userStore.profile, () => userStore.loading],
  ([novaLista, profile, userLoading]) => {
    // Só inicializa se tivermos a lista de profissionais e o perfil não estiver mais carregando
    if (novaLista && novaLista.length > 0 && !userLoading && !inicializado.value) {
      console.log('⚙️ ProfissionalAtual: Iniciando escolha padrão...')
      console.log('👤 Cargo detectado:', userStore.userRole)
      
      // REGRA PARA ADMIN: Se for admin, sempre começa com "Todos os Profissionais" (null)
      if (userStore.userRole === 'admin') {
        console.log('👑 ProfissionalAtual: Usuário é ADMIN. Definindo visão "Todos".')
        agendamentoStore.profissionalId = null
        inicializado.value = true
        return
      }

      // REGRA PARA PROFISSIONAL: Se encontrar o perfil dele na lista de profissionais, seleciona ele
      const profileId = profile?.id
      if (profileId) {
        const logado = novaLista.find(p => String(p.profile_id) === String(profileId))
        if (logado) {
          console.log('✅ ProfissionalAtual: Selecionado profissional logado (' + logado.nome + ')')
          agendamentoStore.profissionalId = logado.profissional_id
          inicializado.value = true
          return
        }
      }
      
      // FALLBACK: Seleciona o primeiro da lista
      if (novaLista[0]) {
        console.log('✅ ProfissionalAtual: Selecionado primeiro da lista como fallback')
        agendamentoStore.profissionalId = novaLista[0].profissional_id
        inicializado.value = true
      }
    }
  },
  { immediate: true }
)

onMounted(() => {
  console.log('📍 ProfissionalAtual montado. Profissionais recebidos:', props.profissionais?.length || 0)
})
</script>
