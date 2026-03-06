import type { AgAgendamento, AgViewAgendamentoCompleto, Database } from '../../shared/types/database'

/**
 * ================= useAgendamento.ts =================
 * Composable para gerenciamento de agendamentos
 * 
 * Responsabilidades:
 * - Buscar agendamentos do Supabase
 * - Inserir novos agendamentos
 * - Filtrar por profissional, período e status
 * - Tratar erros e notificar usuário
 * 
 * Importante:
 * - Sempre busca apenas agendamentos NÃO cancelados
 * - Usa tipagem Database para autocomplete do Supabase
 * - Retorna null em caso de erro (não lança exceção)
 * ======================================================
 */

/**
 * Tipo para os dados de inserção de um agendamento.
 * Exclui campos auto-gerados (id, created_at, user_id) e campos de cancelamento.
 */
export interface InserirAgendamentoDTO {
  profissional_id: number
  cliente_id?: number | null
  lead_id?: string | null
  data: string
  hora_inicio: string
  hora_fim: string
  titulo: string
  descricao?: string | null
  cor?: string | null
  categoria: string
}

/**
 * Tipo para os dados de edição de um agendamento.
 * Apenas campos editáveis: título, descrição e cor.
 */
export interface EditarAgendamentoDTO {
  titulo: string
  descricao?: string | null
  cor?: string | null
}

export function useAgendamento() {
  // Cliente Supabase com tipagem completa do banco de dados
  const supabase = useSupabaseClient<Database>()
  const currentUser = useSupabaseUser()

  // Sistema de notificações toast (vue-toastification)
  const { notifyError, notifySuccess } = useNotification()
  const { waitForProfile } = useAuth()

  /**
   * Busca agendamentos de um profissional em um período específico
   * 
   * Filtros aplicados:
   * - profissional_id = profissionalId
   * - cancelado = false (apenas ativos)
   * - data >= dataInicio (maior ou igual)
   * - data <= dataFim (menor ou igual)
   * 
   * Ordenação:
   * - Primeiro por data (crescente)
   * - Depois por hora_inicio (crescente)
   * 
   * @param profissionalId - ID do profissional (ag_profissionais.id)
   * @param dataInicio - Data de início do período (formato YYYY-MM-DD, ex: '2026-02-15')
   * @param dataFim - Data de fim do período (formato YYYY-MM-DD, ex: '2026-02-21')
   * @returns Promise<AgAgendamento[] | null> - Array de agendamentos ou null se erro
   * 
   * Exemplo de uso:
   * ```ts
   * const agendamentos = await buscarAgendamentosPorProfissional(2, '2026-02-15', '2026-02-21')
   * if (agendamentos) {
   *   console.log('Encontrados:', agendamentos.length)
   * }
   * ```
   */
  async function buscarAgendamentosPorProfissional(
    profissionalId: number | null,
    dataInicio: string,
    dataFim: string,
    silent = false
  ): Promise<AgViewAgendamentoCompleto[] | null> {
    try {
      // 1. ESPERA PELO PERFIL (GARANTIA RLS)
      await waitForProfile();

      // Logs para debug e monitoramento
      console.log('🔍 Buscando agendamentos:')
      console.log('  📍 Profissional:', profissionalId || 'TODOS')
      console.log('  📅 Período:', dataInicio, 'até', dataFim)

      const performFetch = async (retryCount = 0): Promise<any> => {
        let query = supabase
          .from('ag_view_agendamentos_completo')
          .select('*')
          .eq('cancelado', false)                  // Filtro: apenas ativos
          .gte('data', dataInicio)                 // Filtro: data >= início
          .lte('data', dataFim)                    // Filtro: data <= fim

        // Filtro opcional: profissional específico
        if (profissionalId) {
          query = query.eq('profissional_id', profissionalId)
        }

        const { data, error } = await query
          .order('data', { ascending: true })      // Ordena por data (crescente)
          .order('hora_inicio', { ascending: true }) // Depois por horário (crescente)

        // Adiciona lógica de retry para lidar com falhas de fetch intermitentes durante a navegação cliente
        if (error && retryCount < 2) {
          const errMsg = error.message?.toLowerCase() || '';
          if (errMsg.includes('fetch') || errMsg.includes('network') || errMsg.includes('timeout') || errMsg.includes('abort')) {
            console.warn(`⚠️ Falha na rede ao buscar agendamentos. Retentando (${retryCount + 1}/2)...`);
            await new Promise(resolve => setTimeout(resolve, 600));
            return performFetch(retryCount + 1);
          }
        }

        return { data, error };
      }

      const { data, error } = await performFetch();

      // Tratamento de erro do Supabase
      if (error) {
        console.error('❌ Erro ao buscar agendamentos:', error)
        // Notifica usuário com toast de erro apenas se não for silencioso
        if (!silent) {
          notifyError(`Erro ao buscar: ${error.message || 'Falha de conexão'}`)
        }
        return null // Retorna null para indicar falha
      }

      // Sucesso: retorna dados
      console.log('✅ Agendamentos encontrados:', data?.length || 0)
      return data as AgViewAgendamentoCompleto[]
    } catch (err) {
      // Catch para erros inesperados (ex: network, timeout)
      console.error('❌ Erro inesperado ao buscar agendamentos:', err)
      if (!silent) {
        notifyError('Erro inesperado ao buscar agendamentos')
      }
      return null
    }
  }

  /**
   * Insere um novo agendamento no Supabase
   * 
   * Campos auto-gerados pelo banco (não precisam ser enviados):
   * - id: serial gerado automaticamente
   * - created_at: timestamp gerado pelo default now()
   * - user_id: preenchido via RLS/policy do Supabase (auth.uid())
   * - cancelado: default false
   * - cancelado_as: default null
   * 
   * @param dados - Dados do agendamento a ser inserido
   * @returns Promise<AgAgendamento | null> - Agendamento inserido ou null se erro
   */
  async function inserirAgendamento(dados: InserirAgendamentoDTO): Promise<AgAgendamento | null> {
    try {
      console.log('📝 Inserindo agendamento:', dados)

      // Garantir carregamento do profile real
      const profile = await waitForProfile()

      const payload = {
        profissional_id: dados.profissional_id,
        cliente_id: dados.cliente_id || null,
        lead_id: dados.lead_id || null,
        user_id: currentUser.value?.id || profile?.user_id || null, // Garante id válido
        data: dados.data,
        hora_inicio: `${dados.hora_inicio}:00-03`,
        hora_fim: `${dados.hora_fim}:00-03`,
        titulo: dados.titulo,
        descricao: dados.descricao || null,
        cor: dados.cor || null,
        categoria: dados.categoria
      }

      const { data, error } = await supabase
        .from('ag_agendamentos')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(payload as any)
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao inserir agendamento:', error)
        notifyError(`Erro ao criar agendamento: ${error.message || JSON.stringify(error)}`)
        return null
      }

      console.log('✅ Agendamento criado com sucesso:', data)
      notifySuccess('Agendamento criado com sucesso!')
      return data as AgAgendamento
    } catch (err) {
      console.error('❌ Erro inesperado ao inserir agendamento:', err)
      notifyError('Erro inesperado ao criar agendamento')
      return null
    }
  }

  /**
   * Edita um agendamento existente (apenas título, descrição e cor)
   * 
   * @param id - ID do agendamento a ser editado
   * @param dados - Campos editáveis (titulo, descricao, cor)
   * @returns Promise<AgAgendamento | null> - Agendamento atualizado ou null se erro
   */
  async function editarAgendamento(id: number, dados: EditarAgendamentoDTO): Promise<AgAgendamento | null> {
    try {
      console.log('✏️ Editando agendamento:', id, dados)

      const payload = {
        titulo: dados.titulo,
        descricao: dados.descricao || null,
        cor: dados.cor || null
      }

      const { data, error } = await supabase
        .from('ag_agendamentos')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(payload as unknown as never)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao editar agendamento:', error)
        notifyError('Erro ao editar agendamento')
        return null
      }

      console.log('✅ Agendamento editado com sucesso:', data)
      notifySuccess('Agendamento atualizado!')
      return data as AgAgendamento
    } catch (err) {
      console.error('❌ Erro inesperado ao editar agendamento:', err)
      notifyError('Erro inesperado ao editar agendamento')
      return null
    }
  }

  /**
   * Cancela um agendamento (soft delete: marca cancelado=true e registra data)
   * 
   * @param id - ID do agendamento a ser cancelado
   * @returns Promise<boolean> - true se cancelado com sucesso, false se erro
   */
  async function cancelarAgendamento(id: number): Promise<boolean> {
    try {
      console.log('🚫 Cancelando agendamento:', id)

      const payload = {
        cancelado: true,
        cancelado_as: new Date().toISOString()
      }

      const { error } = await supabase
        .from('ag_agendamentos')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(payload as unknown as never)
        .eq('id', id)

      if (error) {
        console.error('❌ Erro ao cancelar agendamento:', error)
        notifyError('Erro ao cancelar agendamento')
        return false
      }

      console.log('✅ Agendamento cancelado com sucesso')
      notifySuccess('Agendamento cancelado')
      return true
    } catch (err) {
      console.error('❌ Erro inesperado ao cancelar agendamento:', err)
      notifyError('Erro inesperado ao cancelar agendamento')
      return false
    }
  }

  /**
   * Busca relatório completo de agendamentos com informações de cliente e profissional
   * Usa a RPC function ag_get_agendamentos_completo que retorna dados da view
   * 
   * Filtros opcionais (aplicados após busca):
   * - dataInicio/dataFim: Período do agendamento
   * - profissionalId: Filtrar por profissional específico
   * - clienteId: Filtrar por cliente específico
   * - cancelado: true (apenas cancelados), false (apenas ativos), undefined (todos)
   * 
   * @param filtros - Objeto com filtros opcionais
   * @returns Promise<AgViewAgendamentoCompleto[] | null> - Array de agendamentos completos ou null se erro
   * 
   * Exemplo de uso:
   * ```ts
   * // Buscar todos os agendamentos ativos de um profissional em um período
   * const relatorio = await buscarRelatorioAgendamentos({
   *   profissionalId: 2,
   *   dataInicio: '2026-02-01',
   *   dataFim: '2026-02-28',
   *   cancelado: false
   * })
   * 
   * // Buscar todos os agendamentos de um cliente (ativos e cancelados)
   * const historico = await buscarRelatorioAgendamentos({
   *   clienteId: 5
   * })
   * ```
   */
  async function buscarRelatorioAgendamentos(filtros?: {
    dataInicio?: string
    dataFim?: string
    profissionalId?: number
    clienteId?: number
    leadId?: string
    cancelado?: boolean
    silent?: boolean
    orderBy?: string
    orderAsc?: boolean
    page?: number
    limit?: number
  }): Promise<{ data: AgViewAgendamentoCompleto[]; count: number } | null> {
    try {
      const isSilent = filtros?.silent || false

      if (!isSilent) {
        console.log('📊 Buscando relatório de agendamentos:', filtros)
      }

      const performRelatorioFetch = async (retryCount = 0): Promise<any> => {
        try {
          // Helper method for rapid indexing query
          const runSingleQuery = async (field?: 'cliente_id' | 'lead_id', val?: any) => {
            let query = supabase.from('ag_view_agendamentos_completo').select('*')

            if (filtros?.dataInicio) query = query.gte('data', filtros.dataInicio)
            if (filtros?.dataFim) query = query.lte('data', filtros.dataFim)
            if (filtros?.profissionalId !== undefined && filtros?.profissionalId !== null) {
              query = query.eq('profissional_id', filtros.profissionalId)
            }
            if (filtros?.cancelado !== undefined && filtros?.cancelado !== null) {
              query = query.eq('cancelado', filtros.cancelado)
            }

            // Bind single index parameter instead of multiple slow ORs
            if (field && val) {
              query = query.eq(field, val)
            }

            if (filtros?.orderBy) {
              query = query.order(filtros.orderBy as any, { ascending: filtros.orderAsc !== false })
            }

            if (filtros?.page && filtros?.limit) {
              const from = (filtros.page - 1) * filtros.limit
              const to = from + filtros.limit - 1
              query = query.range(from, to)
            }

            const { data, error } = await query
            if (error) throw error
            return data || []
          }

          let results: any[] = []

          // Se tivermos AMBOS, fazemos duas queries paralelas rápidas por índice (MUITO mais rápido que OR em Views)
          if (filtros?.clienteId && filtros?.leadId) {
            const [data1, data2] = await Promise.all([
              runSingleQuery('cliente_id', filtros.clienteId),
              runSingleQuery('lead_id', filtros.leadId)
            ])
            // Desduplica os resultados pelo ID
            const map = new Map()
            data1.forEach((i: any) => map.set(i.id, i))
            data2.forEach((i: any) => map.set(i.id, i))
            results = Array.from(map.values())
          }
          else if (filtros?.clienteId) {
            results = await runSingleQuery('cliente_id', filtros.clienteId)
          }
          else if (filtros?.leadId) {
            results = await runSingleQuery('lead_id', filtros.leadId)
          }
          else {
            results = await runSingleQuery()
          }

          return { data: results, error: null };
        } catch (error: any) {
          if (retryCount < 2) {
            const errMsg = error.message?.toLowerCase() || '';
            if (errMsg.includes('fetch') || errMsg.includes('network') || errMsg.includes('timeout') || errMsg.includes('abort')) {
              console.warn(`⚠️ Falha na rede ao buscar relatório. Retentando (${retryCount + 1}/2)...`);
              await new Promise(resolve => setTimeout(resolve, 600));
              return await performRelatorioFetch(retryCount + 1);
            }
          }
          return { data: null, error };
        }
      }

      const { data, error } = await performRelatorioFetch();

      if (error) {
        console.error('❌ Erro ao buscar relatório de agendamentos:', error)
        if (!isSilent) {
          notifyError(`Erro ao buscar relatório: ${error.message || 'Falha de conexão'}`)
        }
        return null
      }

      // Aplica filtros manualmente nos dados retornados (não é mais necessário, mas os dados já estão filtrados)
      const resultado = (data || []) as AgViewAgendamentoCompleto[]

      // Obtém o count real apenas quando existe paginação e não estamos fundindo resultados de 2 consultas
      let totalCount = resultado.length;
      if (filtros?.page && filtros?.limit && !(filtros?.clienteId && filtros?.leadId)) {
        let countQuery = supabase.from('ag_view_agendamentos_completo').select('*', { count: 'exact', head: true })
        if (filtros?.dataInicio) countQuery = countQuery.gte('data', filtros.dataInicio)
        if (filtros?.dataFim) countQuery = countQuery.lte('data', filtros.dataFim)
        if (filtros?.profissionalId !== undefined && filtros?.profissionalId !== null) countQuery = countQuery.eq('profissional_id', filtros.profissionalId)
        if (filtros?.cancelado !== undefined && filtros?.cancelado !== null) countQuery = countQuery.eq('cancelado', filtros.cancelado)
        if (filtros?.clienteId) countQuery = countQuery.eq('cliente_id', filtros.clienteId)
        if (filtros?.leadId) countQuery = countQuery.eq('lead_id', filtros.leadId)

        const { count, error: countError } = await countQuery
        if (!countError && count !== null) {
          totalCount = count
        }
      } else if (filtros?.clienteId && filtros?.leadId && filtros?.page && filtros?.limit) {
        // Tratamento burro/simplificado para manter compatibilidade: funde memórias na página e retorna count total das combinações
        totalCount = resultado.length;
        const from = (filtros.page - 1) * filtros.limit;
        resultado.splice(0, resultado.length, ...resultado.slice(from, from + filtros.limit));
      }

      // Local sort only if DB-level sorting was lost during deduplication (i.e. we did multiple queries)
      // Or if no specific orderBy was requested, we do the default data/hora sort.
      if (!filtros?.orderBy || (filtros?.clienteId && filtros?.leadId)) {
        resultado.sort((a, b) => {
          // Default sorting logic
          if (filtros?.orderBy) {
            // we lost order due to deduplication of multiple client/lead search, sort locally
            const col = filtros.orderBy as keyof AgViewAgendamentoCompleto
            let valA = a[col] || ''
            let valB = b[col] || ''
            if (typeof valA === 'string' && typeof valB === 'string') {
              const comp = valA.localeCompare(valB)
              return filtros.orderAsc === false ? -comp : comp
            }
            if (valA < valB) return filtros.orderAsc === false ? 1 : -1
            if (valA > valB) return filtros.orderAsc === false ? -1 : 1
            return 0
          } else {
            // Primeiro por data
            if (a.data && b.data) {
              if (a.data !== b.data) {
                return a.data.localeCompare(b.data)
              }
            }
            // Depois por hora_inicio
            if (a.hora_inicio && b.hora_inicio) {
              return a.hora_inicio.localeCompare(b.hora_inicio)
            }
            return 0
          }
        })
      }

      if (!isSilent) {
        console.log('✅ Relatório de agendamentos encontrado:', resultado.length)
      }

      return { data: resultado, count: totalCount }
    } catch (err: any) {
      console.error('❌ Erro inesperado ao buscar relatório:', err)
      notifyError('Erro inesperado ao buscar relatório')
      return null
    }
  }

  return {
    buscarAgendamentosPorProfissional,
    inserirAgendamento,
    editarAgendamento,
    cancelarAgendamento,
    buscarRelatorioAgendamentos
  }
}
