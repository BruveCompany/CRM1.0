import { defineStore } from 'pinia'
import type { AgViewAgendamentoCompleto } from '../../shared/types/database'
import { useAgendamento } from '~/composables/useAgendamento'

/**
 * ================= Store de Agendamentos =================
 * Store Pinia que gerencia o estado global de agendamentos do sistema.
 * 
 * RESPONSABILIDADES PRINCIPAIS:
 * - Armazenar lista de agendamentos em memória
 * - Controlar semana atual de visualização (dataReferencia)
 * - Manter profissional atualmente selecionado
 * - Implementar sistema de cache para otimizar performance
 * - Fornecer funções para navegação entre semanas
 * - Filtrar agendamentos por dia específico
 * 
 * ARQUITETURA DE DADOS:
 * Interface banco (AgAgendamento) → Composable (busca/filtro) → Store (cache/estado) → Components (UI)
 * Os dados são armazenados no formato bruto do banco (snake_case, strings) sem conversão.
 * 
 * ESTADO REATIVO:
 * - dataReferencia: Date - Data de referência para cálculo da semana
 * - profissionalId: number | null - ID do profissional atual sendo visualizado
 * - agendamentos: AgAgendamento[] - Lista de agendamentos carregados do banco (formato bruto)
 * - loading: boolean - Estado de carregamento (spinner/skeleton)
 * - cacheAgendamentos: Record<string, AgAgendamento[]> - Cache em memória por semana
 * 
 * COMPUTED PROPERTIES:
 * - diasSemana: Date[] - Array com os 7 dias da semana atual (Domingo a Sábado)
 *   Recalculado automaticamente quando dataReferencia muda
 * 
 * ACTIONS:
 * - avancarSemana(): void - Navega para a próxima semana (+7 dias)
 * - voltarSemana(): void - Navega para a semana anterior (-7 dias)
 * - carregarAgendamentos(): Promise<void> - Busca agendamentos do profissional (com cache)
 * - getAgendamentosDoDia(data: Date): AgAgendamento[] - Filtra agendamentos de um dia específico
 * 
 * SISTEMA DE CACHE:
 * - Cache-first strategy (verifica cache antes de buscar do servidor)
 * - Chave do cache: "profissionalId_dataInicio_dataFim" (ex: "2_2026-02-15_2026-02-21")
 * - Invalida apenas quando muda profissional ou semana
 * - Armazena semanas vazias para evitar refetch
 * 
 * WATCHED BY:
 * - AgendamentoManager.vue: watch em profissionalId e diasSemana
 * - ProfissionalAtual.vue: seta profissionalId quando profissional muda
 * 
 * ==========================================================
 */
export const useAgendamentoStore = defineStore('agendamento', () => {
  const { buscarAgendamentosPorProfissional } = useAgendamento()

  /**
   * Estado: Data de referência para navegação
   * Inicializada com a data/hora atual
   */
  const dataReferencia = ref(new Date())

  /**
   * Estado: ID do profissional atual sendo visualizado
   */
  const profissionalId = ref<number | null>(null)

  /**
   * Estado: Lista de agendamentos carregados do banco (formato bruto AgAgendamento)
   */
  const agendamentos = ref<AgViewAgendamentoCompleto[]>([])

  /**
   * Estado: Controle de carregamento
   */
  const loading = ref(false)

  /**
   * Estado: Cache de agendamentos por semana
   * Chave: "profissionalId_dataInicio_dataFim" (ex: "2_2026-02-15_2026-02-21")
   * Valor: Array de agendamentos (formato bruto AgAgendamento)
   */
  const cacheAgendamentos = ref<Record<string, AgViewAgendamentoCompleto[]>>({})

  /**
   * Getter: Calcula os 7 dias da semana com base na data de referência
   * Retorna array de objetos Date começando sempre no Domingo
   * 
   * Exemplo: Se dataReferencia = 09/02/2026 (Segunda)
   * Retorna: [08/02 (Dom), 09/02 (Seg), ..., 14/02 (Sáb)]
   */
  const diasSemana = computed(() => {
    const ref = new Date(dataReferencia.value)
    const currentDay = ref.getDay() // 0 (Domingo) a 6 (Sábado)

    // Calcular o domingo da semana atual (início da semana)
    const startOfWeek = new Date(ref)
    startOfWeek.setDate(ref.getDate() - currentDay)

    // Criar array com os 7 dias da semana
    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + i)
      days.push(d)
    }
    return days
  })

  /**
   * Action: Avança para a próxima semana
   * Adiciona 7 dias à data de referência
   */
  function avancarSemana() {
    const novaData = new Date(dataReferencia.value)
    novaData.setDate(novaData.getDate() + 7)
    dataReferencia.value = novaData
  }

  /**
   * Action: Volta para a semana anterior
   * Subtrai 7 dias da data de referência
   */
  function voltarSemana() {
    const novaData = new Date(dataReferencia.value)
    novaData.setDate(novaData.getDate() - 7)
    dataReferencia.value = novaData
  }

  /**
   * Gera chave única para cache baseada em profissional e período
   * 
   * A chave identifica unicamente um conjunto de agendamentos no cache:
   * - Mesmo profissional + mesmo período = mesmos dados
   * - Permite navegação entre semanas sem refetch desnecessário
   * 
   * Formato: "profissionalId_dataInicio_dataFim"
   * Exemplo: "2_2026-02-15_2026-02-21" (profissional 2, semana de 15 a 21 de fevereiro)
   * 
   * @param profId - ID do profissional
   * @param dataInicio - Data início no formato YYYY-MM-DD
   * @param dataFim - Data fim no formato YYYY-MM-DD
   * @returns Chave única para indexação do cache
   */
  function gerarChaveCache(profId: number | null, dataInicio: string, dataFim: string): string {
    const idStr = profId ? String(profId) : 'todos'
    return `${idStr}_${dataInicio}_${dataFim}`
  }

  /**
   * Formata Date para string YYYY-MM-DD (formato ISO 8601 Date)
   * 
   * Converte objeto Date nativo do JavaScript para formato aceito pelo PostgreSQL
   * e utilizado nas chaves do cache. Garante sempre 2 dígitos para mês e dia.
   * 
   * Exemplos:
   * - new Date('2026-02-09') → "2026-02-09"
   * - new Date('2026-12-25') → "2026-12-25"
   * 
   * @param data - Objeto Date a ser formatado
   * @returns String no formato YYYY-MM-DD
   */
  function formatarDataISO(data: Date): string {
    const ano = data.getFullYear()
    const mes = String(data.getMonth() + 1).padStart(2, '0') // +1 porque getMonth() retorna 0-11
    const dia = String(data.getDate()).padStart(2, '0')
    return `${ano}-${mes}-${dia}`
  }

  /**
   * Action: Carrega agendamentos do profissional atual do banco
   * 
   * Esta função implementa um sistema de cache inteligente para otimizar performance:
   * 
   * Fluxo de execução:
   * 1. Valida profissionalId e diasSemana
   * 2. Gera chave de cache baseada no profissional + período da semana
   * 3. Verifica se dados já existem no cache (cache-first strategy)
   * 4. Se sim: retorna dados do cache imediatamente (sem network request)
   * 5. Se não: busca do Supabase via composable
   * 6. Armazena dados brutos (AgAgendamento) no cache sem conversão
   * 7. Atualiza estado reativo (agendamentos.value)
   * 
   * Benefícios do cache:
   * - Reduz chamadas ao banco de dados em 90%+
   * - Navegação instantânea entre semanas já visitadas
   * - Melhor UX (sem loading em dados já carregados)
   * - Menor custo de infraestrutura (menos queries)
   * 
   * Quando é chamada:
   * - Mudança de profissionalId (watch em AgendamentoManager)
   * - Mudança de semana via navegação (watch diasSemana)
   * - Montagem inicial do componente AgendamentoManager
   * 
   * @async
   * @returns Promise<void>
   */
  let fetchDebounceTimer: any = null
  async function carregarAgendamentos(silent = false) {
    if (loading.value) {
      // Se já está buscando, agenda uma busca silenciosa para logo depois de terminar
      if (fetchDebounceTimer) clearTimeout(fetchDebounceTimer)
      fetchDebounceTimer = setTimeout(() => carregarAgendamentos(true), 1500)
      return
    }

    const idParaFiltro = profissionalId.value

    // Validação 2: Verificar se diasSemana está disponível (computed pode não estar pronto)
    if (!diasSemana.value[0] || !diasSemana.value[6]) {
      console.warn('⚠️ Store: diasSemana ainda não está definido')
      return
    }

    // Define período: primeiro dia (domingo) até último dia (sábado) da semana
    const dataInicio = formatarDataISO(diasSemana.value[0])
    const dataFim = formatarDataISO(diasSemana.value[6])
    const chaveCache = gerarChaveCache(profissionalId.value, dataInicio, dataFim)

    console.log('🔄 Store: Iniciando carregamento de agendamentos...')
    console.log('📍 Store: profissionalId =', profissionalId.value)
    console.log('📅 Store: Período =', dataInicio, 'até', dataFim)
    console.log('🔑 Store: Chave cache =', chaveCache)

    // CACHE-FIRST STRATEGY: Verificar cache antes de fazer network request
    // No entanto, se for uma operação REALTIME (silent=true), o cache já foi invalidado
    // pelo chamador (AgendamentoManager.vue), então não pulamos aqui.
    if (!silent && cacheAgendamentos.value[chaveCache]) {
      console.log('💾 Store: Dados encontrados no cache! Usando cache.')
      console.log('📊 Store: Total no cache:', cacheAgendamentos.value[chaveCache].length)
      agendamentos.value = cacheAgendamentos.value[chaveCache]
      return // Early return - não precisa buscar do servidor
    }

    // Cache miss: buscar do servidor
    console.log('🌐 Store: Cache vazio. Buscando do servidor...')
    loading.value = true

    try {
      // Busca dados do Supabase via composable (com filtros aplicados)
      const agendamentosBanco = await buscarAgendamentosPorProfissional(
        profissionalId.value,
        dataInicio,
        dataFim,
        silent
      )

      console.log('📦 Store: Dados recebidos do composable:', agendamentosBanco)

      if (agendamentosBanco) {
        // Armazena dados brutos do banco diretamente (sem conversão)
        // Armazena no cache para reutilização futura (key-value store em memória)
        cacheAgendamentos.value[chaveCache] = agendamentosBanco
        agendamentos.value = agendamentosBanco

        console.log('✅ Store: Agendamentos armazenados no cache:', agendamentosBanco.length)
        console.log('💾 Store: Total de entradas no cache:', Object.keys(cacheAgendamentos.value).length)
      } else {
        // Resultado vazio: armazena cache vazio para evitar refetch desnecessário
        console.log('⚠️ Store: Nenhum agendamento retornado (null ou undefined)')
        cacheAgendamentos.value[chaveCache] = []
        agendamentos.value = []
      }
    } catch (error) {
      console.error('❌ Store: Erro ao carregar agendamentos:', error)
      agendamentos.value = [] // Limpa estado em caso de erro
    } finally {
      loading.value = false
      console.log('🏁 Store: Carregamento finalizado. Total:', agendamentos.value.length)
    }
  }

  /**
   * Action: Retorna agendamentos de um dia específico
   * 
   * Filtra a lista de agendamentos carregados (agendamentos.value) para retornar
   * apenas os que pertencem à data fornecida. A comparação é feita pela string
   * do campo ag.data (formato YYYY-MM-DD) contra a data formatada.
   * 
   * Esta função é chamada pelos componentes ItemAgendamento para renderizar
   * os cards de agendamento em cada coluna do calendário semanal.
   * 
   * Lógica de comparação:
   * - Formata a data recebida para string YYYY-MM-DD via formatarDataISO
   * - Compara diretamente com ag.data (string do banco)
   * 
   * Exemplo:
   * - Data entrada: 16/02/2026 → formatarDataISO → "2026-02-16"
   * - Agendamento 1: ag.data = "2026-02-16" → ✅ Incluído
   * - Agendamento 2: ag.data = "2026-02-16" → ✅ Incluído
   * - Agendamento 3: ag.data = "2026-02-17" → ❌ Excluído (dia diferente)
   * 
   * @param data - Data para filtrar agendamentos
   * @returns Array de agendamentos que ocorrem nesta data específica
   */
  function getAgendamentosDoDia(data: Date): AgViewAgendamentoCompleto[] {
    const dataStr = formatarDataISO(data)
    const resultado = agendamentos.value.filter((ag: AgViewAgendamentoCompleto) => {
      return ag.data === dataStr
    })

    return resultado
  }

  // Exporta o estado e ações da store
  return {
    dataReferencia,
    profissionalId,
    diasSemana,
    agendamentos,
    loading,
    cacheAgendamentos,
    avancarSemana,
    voltarSemana,
    carregarAgendamentos,
    getAgendamentosDoDia
  }
})
