import type { AgAgendamento, Database } from '../../shared/types/database'

/**
 * ================= useAgendamento.ts =================
 * Composable para gerenciamento de agendamentos
 * 
 * Responsabilidades:
 * - Buscar agendamentos do Supabase
 * - Filtrar por profissional, período e status
 * - Tratar erros e notificar usuário
 * 
 * Importante:
 * - Sempre busca apenas agendamentos NÃO cancelados
 * - Usa tipagem Database para autocomplete do Supabase
 * - Retorna null em caso de erro (não lança exceção)
 * ======================================================
 */
export function useAgendamento() {
  // Cliente Supabase com tipagem completa do banco de dados
  const supabase = useSupabaseClient<Database>()
  
  // Sistema de notificações toast (vue-toastification)
  const { notifyError } = useNotification()

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

  return {
    buscarAgendamentosPorProfissional
  }
}
