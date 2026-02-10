import type { AgAgendamento, Database } from '../../shared/types/database'

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
    profissionalId: number,
    dataInicio: string,
    dataFim: string
  ): Promise<AgAgendamento[] | null> {
    try {
      // Logs para debug e monitoramento
      console.log('🔍 Buscando agendamentos:')
      console.log('  📍 Profissional:', profissionalId)
      console.log('  📅 Período:', dataInicio, 'até', dataFim)
      
      // Query Supabase:
      // SELECT * FROM ag_agendamentos
      // WHERE profissional_id = X
      //   AND cancelado = false
      //   AND data >= 'dataInicio'
      //   AND data <= 'dataFim'
      // ORDER BY data ASC, hora_inicio ASC
      const { data, error } = await supabase
        .from('ag_agendamentos')
        .select('*')
        .eq('profissional_id', profissionalId)  // Filtro: profissional específico
        .eq('cancelado', false)                  // Filtro: apenas ativos
        .gte('data', dataInicio)                 // Filtro: data >= início
        .lte('data', dataFim)                    // Filtro: data <= fim
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

      const payload = {
          profissional_id: dados.profissional_id,
          cliente_id: dados.cliente_id,
          data: dados.data,
          hora_inicio: `${dados.hora_inicio}:00-03`,
          hora_fim: `${dados.hora_fim}:00-03`,
          titulo: dados.titulo,
          descricao: dados.descricao || null,
          cor: dados.cor || null
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

  return {
    buscarAgendamentosPorProfissional,
    inserirAgendamento,
    editarAgendamento,
    cancelarAgendamento
  }
}
