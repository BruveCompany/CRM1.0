<template>
  <div class="flex flex-col h-full">
    <!-- Header: Área de controles e informações -->
    <div class="px-4 pt-4 flex flex-col gap-3">
      <!-- Linha principal: Grid 3 colunas (Esquerda, Centro, Direita) -->
      <div class="grid grid-cols-3 items-center gap-4">
        <!-- Coluna Esquerda: Controlador de navegação de semana -->
        <div class="flex justify-start">
          <ControladorSemana />
        </div>
        
        <!-- Coluna Central: Informações do profissional atual -->
        <div class="flex justify-center">
          <ProfissionalAtual />
        </div>
        
        <!-- Coluna Direita: Botão de criar novo agendamento -->
        <div class="flex justify-end">
          <BaseButton @click="handleNovoAgendamento">
            + Novo
          </BaseButton>
        </div>
      </div>
      
      <!-- Lista visual dos dias da semana (desenvolvimento) -->
      <ListaDias :dias="agendamentoStore.diasSemana" />
    </div>

    <!-- Corpo: Área principal para exibição da agenda -->
    <div class="flex-1 px-4 flex mt-0">
      <!-- Lado Esquerdo: Régua de horários -->
      <div class="flex-shrink-0">
        <ReguaHorarios />
      </div>
      
      <!-- Lado Direito: Grid de agendamentos - 7 dias da semana -->
      <div class="flex flex-1 gap-2">
        <ItemAgendamento
          v-for="(dia, index) in agendamentoStore.diasSemana"
          :key="index"
          :data="dia"
        />
      </div>
    </div>

    <!-- Modal de Novo Agendamento -->
    <ModalNovoAgendamento
      v-model="modalNovoAgendamentoAberto"
      :profissional-id="agendamentoStore.profissionalId"
      :profissional-nome="profissionalAtualNome"
      :profissional-especialidade="profissionalAtualEspecialidade"
      :dias-semana="agendamentoStore.diasSemana"
      :clientes="clientes"
      :agendamentos="agendamentos"
      @salvar="handleSalvarAgendamento"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * ================= AgendamentoManager.vue =================
 * Componente orquestrador principal do sistema de agendamentos.
 * 
 * RESPONSABILIDADES:
 * - Orquestrar carregamento de dados quando contexto muda (profissional ou semana)
 * - Gerenciar layout da tela de agendamentos (header + grid visual)
 * - Coordenar comunicação entre componentes filhos via store compartilhada
 * - Reagir a mudanças de estado e disparar ações apropriadas
 * 
 * ESTRUTURA VISUAL:
 * ┌─────────────────────────────────────────────────────┐
 * │ Header                                              │
 * │ ┌─────────────┬─────────────┬─────────────┐        │
 * │ │ [< Semana >]│ Profissional│ [+ Novo]    │        │
 * │ └─────────────┴─────────────┴─────────────┘        │
 * │ ListaDias (visual dos 7 dias)                      │
 * ├─────────────────────────────────────────────────────┤
 * │ Corpo                                               │
 * │ ┌───┬───┬───┬───┬───┬───┬───┬───┐                 │
 * │ │ H │ D │ S │ T │ Q │ Q │ S │ S │ (7 colunas)     │
 * │ │ O │ O │ E │ E │ U │ U │ E │ A │                 │
 * │ │ R │ M │ G │ R │ A │ I │ X │ B │                 │
 * │ │ Á │   │   │   │   │   │   │   │                 │
 * │ │ R │ [cards de agendamento por dia]               │
 * │ │ I │                                               │
 * │ │ O │                                               │
 * │ └───┴───────────────────────────────┘               │
 * └─────────────────────────────────────────────────────┘
 * 
 * ARQUITETURA DE DADOS:
 * ProfissionalAtual → seta profissionalId
 * AgendamentoManager → watch profissionalId → carrega dados
 * ControladorSemana → altera dataReferencia → recalcula diasSemana
 * AgendamentoManager → watch diasSemana → recarrega dados
 * Store → sistema cache → evita refetch desnecessário
 * ItemAgendamento (7x) → lê do store → renderiza cards
 * 
 * SISTEMA DE WATCHES:
 * 1. Watch em profissionalId (immediate: true)
 *    - Executa quando componente monta
 *    - Executa quando profissional é alterado em ProfissionalAtual
 *    - Dispara carregarAgendamentos() da store
 * 
 * 2. Watch em diasSemana (sem immediate)
 *    - Executa quando usuário navega entre semanas
 *    - Compara primeira data (domingo) para detectar mudança real
 *    - Dispara carregarAgendamentos() que verifica cache primeiro
 * 
 * SEPARAÇÃO DE RESPONSABILIDADES:
 * - ProfissionalAtual: apenas SETA profissionalId (não carrega)
 * - AgendamentoManager: GERENCIA quando carregar (watches)
 * - Store: IMPLEMENTA lógica de cache e busca
 * - Composable: EXECUTA query no Supabase
 * - ItemAgendamento: apenas RENDERIZA dados do store
 * 
 * FUNCIONALIDADES FUTURAS:
 * - Modal de criação de agendamentos (handleNovoAgendamento)
 * - Edição de agendamentos existentes (click em card)
 * - Cancelamento de agendamentos
 * - Filtros adicionais (status, tipo, etc.)
 * - Drag & drop para reagendar
 * ===========================================================
 */

// Importações de componentes
import ControladorSemana from './ControladorSemana.vue'
import ProfissionalAtual from './ProfissionalAtual.vue'
import ListaDias from './ListaDias.vue'
import ReguaHorarios from './ReguaHorarios.vue'
import ItemAgendamento from './ItemAgendamento.vue'
import ModalNovoAgendamento from './ModalNovoAgendamento.vue'
import BaseButton from '~/components/BaseButton.vue'

// Importações de stores e composables
import { useAgendamentoStore } from '~/stores/agendamento'
import { useAgendamento } from '~/composables/useAgendamento'
import { useProfissionais } from '~/composables/useProfissionais'
import type { AgCliente, AgProfissional } from '../../../shared/types/database'

// Emits (para comunicação com componente pai se necessário)
const emit = defineEmits(['update:loading', 'error'])

// Instância do store de agendamento
const agendamentoStore = useAgendamentoStore()

// Instância do composable de agendamento (expõe fetchAgendamentosByProfissional)
const { buscarAgendamentosPorProfissional: fetchAgendamentosByProfissional } = useAgendamento()
const { fetchClientes, fetchProfissionais } = useProfissionais()

// Refs para controle de estado
const error = ref<string | null>(null)
const profissionalAtualRef = ref<any>(null)
const modalNovoAgendamentoAberto = ref(false)
const clientes = ref<AgCliente[]>([])
const profissionais = ref<AgProfissional[]>([])

/**
 * Computed: Espelho dos agendamentos do store para visibilidade no DevTools
 */
const agendamentos = computed(() => agendamentoStore.agendamentos)

/**
 * Computed: Nome do profissional atual para exibir no modal
 * TODO: Buscar dados completos do profissional (nome, especialidade)
 */
/**
 * Computed: Objeto do profissional atual (nome e especialidade)
 */
const profissionalAtualObj = computed(() => {
  const id = agendamentoStore.profissionalId
  if (!id) return null
  return profissionais.value.find((p) => p.profissional_id === id) || null
})

const profissionalAtualNome = computed(() => {
  return profissionalAtualObj.value?.nome || 'Nenhum profissional selecionado'
})

const profissionalAtualEspecialidade = computed(() => {
  return profissionalAtualObj.value?.especialidade || ''
})

/**
 * Wrapper para carregar agendamentos de um profissional específico
 * 
 * IMPORTANTE: Esta função SETA o profissionalId e dispara o carregamento.
 * Use apenas quando precisar trocar de profissional programaticamente.
 * 
 * Para recarregar dados do profissional atual, use: recarregarAgendamentos()
 * 
 * @param profissionalId - ID do profissional para carregar agendamentos
 */
async function loadAgendamentos(profissionalId: number) {
  try {
    error.value = null
    console.log('📥 AgendamentoManager: loadAgendamentos chamado para profissional:', profissionalId)
    
    // Seta o profissionalId (dispara o watch que carrega automaticamente)
    agendamentoStore.profissionalId = profissionalId
    // Não precisa chamar carregarAgendamentos() - o watch já faz isso!
  } catch (err: any) {
    error.value = err.message || 'Erro ao carregar agendamentos'
    emit('error', error.value)
    console.error('❌ AgendamentoManager: Erro em loadAgendamentos:', err)
  }
}

/**
 * WATCH 1: Reage a mudanças no profissional selecionado
 * 
 * Gatilhos de execução:
 * - Montagem do componente (immediate: true)
 * - Quando ProfissionalAtual.vue seta um novo profissionalId na store
 * 
 * Fluxo de execução:
 * 1. Usuário seleciona profissional no dropdown (ProfissionalAtual)
 * 2. ProfissionalAtual seta agendamentoStore.profissionalId
 * 3. Este watch detecta a mudança
 * 4. Atualiza profissionalAtualRef (para referência local)
 * 5. Chama store.carregarAgendamentos()
 * 6. Store verifica cache primeiro
 * 7. Se cache miss, busca do Supabase via composable
 * 8. Componentes ItemAgendamento (7x) renderizam os novos dados
 * 
 * Por que immediate: true?
 * - Garante que ao montar o componente, se já houver profissionalId na store,
 *   os agendamentos sejam carregados automaticamente (sem interação do usuário)
 * - Útil para quando usuário volta à página e profissional já estava selecionado
 * 
 * Validação: Só executa se profissionalId existe (truthy)
 */
watch(
  () => agendamentoStore.profissionalId,
  async (novoProfissionalId) => {
    // Atualiza ref local do profissional
    if (novoProfissionalId) {
      profissionalAtualRef.value = { id: novoProfissionalId }
      
      console.log('🔔 AgendamentoManager: Profissional mudou, carregando agendamentos...', novoProfissionalId)
      await agendamentoStore.carregarAgendamentos()
      console.log('✅ AgendamentoManager: Agendamentos carregados:', agendamentoStore.agendamentos.length)
    } else {
      profissionalAtualRef.value = null
    }
  },
  { immediate: true }
)

/**
 * WATCH 2: Reage a mudanças na semana visualizada
 * 
 * Gatilhos de execução:
 * - Quando usuário clica em "< Semana" ou "Semana >" (ControladorSemana)
 * - Quando dataReferencia muda, diasSemana é recalculado (computed)
 * - Mudança no computed diasSemana dispara este watch
 * 
 * Fluxo de execução:
 * 1. Usuário clica em navegação de semana
 * 2. ControladorSemana chama store.avancarSemana() ou store.voltarSemana()
 * 3. Store altera dataReferencia (+7 ou -7 dias)
 * 4. Computed store.diasSemana recalcula os 7 dias
 * 5. Este watch detecta mudança em diasSemana
 * 6. Valida se semana realmente mudou (compara domingo)
 * 7. Se mudou, chama store.carregarAgendamentos()
 * 8. Store verifica cache (muito provável hit se usuário voltar)
 * 9. Componentes reagem aos novos dados
 * 
 * Por que sem immediate?
 * - Watch em profissionalId já carrega dados na montagem
 * - Evita carregamento duplicado inicial
 * - Só precisa reagir a mudanças subsequentes
 * 
 * Validações implementadas:
 * - profissionalId existe (não carregar sem contexto)
 * - diasAntigos existe (evitar execução no primeiro cálculo)
 * - Domingo da semana antiga ≠ Domingo da semana nova (mudança real)
 *   (sem isso, qualquer recálculo do computed dispararia desnecessariamente)
 * 
 * Otimização: Sistema de cache evita network request se semana já foi visitada
 */
watch(
  () => agendamentoStore.diasSemana,
  async (novosDias, diasAntigos) => {
    // Validações para evitar execução desnecessária
    if (
      agendamentoStore.profissionalId &&  // Tem profissional selecionado?
      diasAntigos &&                       // Não é primeira execução?
      diasAntigos[0] &&                    // Domingo antigo existe?
      diasAntigos[6] &&                    // Sábado antigo existe?
      novosDias[0] &&                      // Domingo novo existe?
      novosDias[6] &&                      // Sábado novo existe?
      novosDias[0].getTime() !== diasAntigos[0].getTime()  // Semana realmente mudou?
    ) {
      console.log('📅 AgendamentoManager: Semana mudou, recarregando agendamentos...')
      console.log('   Semana anterior:', diasAntigos[0].toLocaleDateString(), '-', diasAntigos[6].toLocaleDateString())
      console.log('   Semana nova:', novosDias[0].toLocaleDateString(), '-', novosDias[6].toLocaleDateString())
      
      await agendamentoStore.carregarAgendamentos()
      
      console.log('✅ AgendamentoManager: Agendamentos da nova semana:', agendamentoStore.agendamentos.length)
    }
  }
)

// Lifecycle hooks
onMounted(async () => {
  console.log('AgendamentoManager montado')
  
  // Busca clientes e profissionais em segundo plano (não bloqueia a UI)
  try {
    const [clientesData, profissionaisData] = await Promise.all([
      fetchClientes(),
      fetchProfissionais()
    ])
    clientes.value = clientesData
    profissionais.value = profissionaisData
    console.log('👥 Clientes carregados:', clientes.value.length)
    console.log('👤 Profissionais carregados:', profissionais.value.length)
  } catch (err) {
    console.error('❌ Erro ao buscar clientes/profissionais:', err)
  }
})

/**
 * Handler para criação de novo agendamento
 * Abre o modal de novo agendamento com dados do profissional atual
 */
function handleNovoAgendamento() {
  console.log('➕ Abrindo modal de novo agendamento')
  console.log('👤 Profissional atual:', agendamentoStore.profissionalId)
  console.log('📅 Dias da semana:', agendamentoStore.diasSemana)
  
  modalNovoAgendamentoAberto.value = true
}

/**
 * Handler para salvar novo agendamento
 * TODO: Implementar integração com Supabase
 * 
 * @param dadosAgendamento - Dados do formulário do modal
 */
function handleSalvarAgendamento(dadosAgendamento: any) {
  console.log('💾 Salvando novo agendamento:', dadosAgendamento)
  
  // TODO: Validar dados
  // TODO: Salvar no Supabase via composable
  // TODO: Limpar cache da store (recarregarAgendamentos)
  // TODO: Mostrar toast de sucesso
  // TODO: Fechar modal
  
  // Por enquanto, apenas fecha o modal
  modalNovoAgendamentoAberto.value = false
}

/**
 * Limpa o cache de agendamentos da store
 * Força nova busca do servidor na próxima vez que carregar
 */
function limparCache() {
  console.log('🗑️ AgendamentoManager: Limpando cache...')
  agendamentoStore.cacheAgendamentos = {}
  console.log('✅ AgendamentoManager: Cache limpo!')
}

/**
 * Recarrega agendamentos do servidor (ignora cache)
 * Útil após criar/editar/cancelar agendamentos
 */
async function recarregarAgendamentos() {
  console.log('🔄 AgendamentoManager: Recarregando agendamentos...')
  limparCache()
  await agendamentoStore.carregarAgendamentos()
  console.log('✅ AgendamentoManager: Agendamentos recarregados!')
}
</script>
