<template>
  <div id="profissional-atual" class="flex items-center">
    <!-- Estado: Carregando -->
    <div v-if="loading && (!profissionais || profissionais.length === 0)">
      <div class="h-8 w-40 bg-neutral-100 rounded-lg animate-pulse"></div>
    </div>

    <!-- Botão de Seleção Clean -->
    <div v-else>
      <button
        type="button"
        class="prof-selector-btn"
        @click="modalAberto = true"
      >
        <Icon name="lucide:users" class="prof-icon" />
        <span class="prof-name">{{ nomeExibicao }}</span>
        <Icon name="lucide:chevron-down" class="prof-chevron" />
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

<style scoped>
.prof-selector-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  height: 32px;
  border: none;
  background: #F3F2FB;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
  color: #111827;
  white-space: nowrap;
}

.prof-selector-btn:hover {
  background: #ECEAF7;
}

.prof-icon {
  width: 15px;
  height: 15px;
  color: #9691D4;
  flex-shrink: 0;
}

.prof-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  min-width: 0;
}

.prof-label {
  font-size: 10px;
  font-weight: 500;
  color: #9691D4;
  line-height: 1;
  letter-spacing: 0.02em;
}

.prof-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #4338CA;
  line-height: 1;
  white-space: nowrap;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prof-chevron {
  width: 12px;
  height: 12px;
  color: #9691D4;
  flex-shrink: 0;
  margin-left: 1px;
  transition: color 0.15s;
}

.prof-selector-btn:hover .prof-chevron {
  color: #6b7280;
}
</style>
