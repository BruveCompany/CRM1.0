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
  cliente_id: number
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

  // Sistema de notificações toast (vue-toastification)
  const { notifyError, notifySuccess } = useNotification()

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
    dataFim: string
  ): Promise<AgAgendamento[] | null> {
    try {
      // Logs para debug e monitoramento
      console.log('🔍 Buscando agendamentos:')
      console.log('  📍 Profissional:', profissionalId || 'TODOS')
      console.log('  📅 Período:', dataInicio, 'até', dataFim)

      let query = supabase
        .from('ag_agendamentos')
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

      // Tratamento de erro do Supabase
      if (error) {
        console.error('❌ Erro ao buscar agendamentos:', error)
        console.error('Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        // Notifica usuário com toast de erro
        notifyError('Erro ao buscar agendamentos')
        return null // Retorna null para indicar falha
      }

      // Sucesso: retorna dados
      console.log('✅ Agendamentos encontrados:', data?.length || 0)
      console.log('📊 Dados:', data)

      return data as AgAgendamento[]
    } catch (err) {
      // Catch para erros inesperados (ex: network, timeout)
      console.error('❌ Erro inesperado ao buscar agendamentos:', err)
      notifyError('Erro inesperado ao buscar agendamentos')
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

      const { data: { user } } = await supabase.auth.getUser()

      const payload = {
        profissional_id: dados.profissional_id,
        cliente_id: dados.cliente_id,
        user_id: user?.id || null, // Fallback explícito
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
        notifyError('Erro ao criar agendamento')
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
    cancelado?: boolean
  }): Promise<AgViewAgendamentoCompleto[] | null> {
    try {
      console.log('📊 Buscando relatório de agendamentos:', filtros)

      // Busca via RPC function (bypass RLS da view)
      const { data, error } = await supabase.rpc('ag_get_agendamentos_completo')

      if (error) {
        console.error('❌ Erro ao buscar relatório de agendamentos:', error)
        console.error('Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        notifyError('Erro ao buscar relatório de agendamentos')
        return null
      }

      // Aplica filtros manualmente nos dados retornados
      let resultado = data as AgViewAgendamentoCompleto[]

      if (filtros?.dataInicio) {
        resultado = resultado.filter(a => a.data && a.data >= filtros.dataInicio!)
      }
      if (filtros?.dataFim) {
        resultado = resultado.filter(a => a.data && a.data <= filtros.dataFim!)
      }
      if (filtros?.profissionalId) {
        resultado = resultado.filter(a => a.profissional_id === filtros.profissionalId)
      }
      if (filtros?.clienteId) {
        resultado = resultado.filter(a => a.cliente_id === filtros.clienteId)
      }
      if (filtros?.cancelado !== undefined) {
        resultado = resultado.filter(a => a.cancelado === filtros.cancelado)
      }

      // Ordena por data e hora
      resultado.sort((a, b) => {
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
      })

      console.log('✅ Relatório de agendamentos encontrado:', resultado.length)
      console.log('📊 Dados:', resultado)

      return resultado
    } catch (err) {
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
