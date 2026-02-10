import type { AgAgendamento } from './database'

/**
 * Interface para representar um agendamento (view model)
 * Usado nos componentes Vue para facilitar manipulação de datas
 */
export interface Agendamento {
  id: number
  titulo: string
  descricao: string | null
  inicio: Date
  fim: Date
  clienteNome?: string
  profissionalId: number | null
  clienteId: number | null
  userId: string | null
  cancelado: boolean
}

/**
 * Converte AgAgendamento (banco) para Agendamento (view model)
 * 
 * Esta função é essencial para transformar os dados vindos do PostgreSQL/Supabase
 * em objetos Date nativos do JavaScript, facilitando manipulação e exibição.
 * 
 * Responsabilidades principais:
 * - Combinar campos separados (data + hora_inicio/fim) em objetos Date completos
 * - Corrigir formato de timezone do PostgreSQL para formato compatível com JavaScript
 * - Fornecer valores padrão para campos opcionais
 * - Mapear snake_case (banco) para camelCase (view model)
 * 
 * @param ag - Registro do banco (AgAgendamento) com campos separados
 * @returns Agendamento com Date objects para inicio e fim
 */
export function agendamentoBancoParaViewModel(ag: AgAgendamento): Agendamento {
  // Garantir data válida (fallback para hoje se null/undefined)
  const dataStr = ag.data || new Date().toISOString().split('T')[0]
  let horaInicioStr = ag.hora_inicio || '08:00:00'
  let horaFimStr = ag.hora_fim || '09:00:00'
  
  /**
   * FIX CRÍTICO: Conversão de timezone PostgreSQL → JavaScript
   * 
   * PostgreSQL retorna TIME WITH TIME ZONE no formato: "08:00:00-03"
   * JavaScript espera ISO 8601 completo com formato: "08:00:00-03:00"
   * 
   * Regex explicado: /([+-]\d{2})$/
   * - ([+-]\d{2}) = Captura sinal + dois dígitos (ex: "-03")
   * - $ = Final da string
   * - Substituição: '$1:00' adiciona ":00" ao grupo capturado
   * 
   * Exemplos:
   * - "08:00:00-03" → "08:00:00-03:00" ✅
   * - "14:30:00+02" → "14:30:00+02:00" ✅
   * - "10:00:00" → "10:00:00" (sem timezone, não afetado)
   */
  horaInicioStr = horaInicioStr.replace(/([+-]\d{2})$/, '$1:00')
  horaFimStr = horaFimStr.replace(/([+-]\d{2})$/, '$1:00')
  
  // Combinar data (YYYY-MM-DD) + hora (HH:MM:SS±HH:MM) em Date object
  // Formato final: "2024-02-16T08:00:00-03:00" (ISO 8601 completo)
  const inicio = new Date(`${dataStr}T${horaInicioStr}`)
  const fim = new Date(`${dataStr}T${horaFimStr}`)
  
  // Mapear snake_case do banco para camelCase do view model
  return {
    id: ag.id,
    titulo: ag.titulo || 'Sem título', // Fallback para títulos vazios
    descricao: ag.descricao,
    inicio,
    fim,
    profissionalId: ag.profissional_id,
    clienteId: ag.cliente_id,
    userId: ag.user_id,
    cancelado: ag.cancelado
  }
}

/**
 * Converte Agendamento (view model) para formato de insert/update no banco
 */
export function agendamentoViewModelParaBanco(ag: Partial<Agendamento> & { titulo: string, inicio: Date, fim: Date }) {
  // Extrai data no formato YYYY-MM-DD
  const ano = ag.inicio.getFullYear()
  const mes = String(ag.inicio.getMonth() + 1).padStart(2, '0')
  const dia = String(ag.inicio.getDate()).padStart(2, '0')
  const data = `${ano}-${mes}-${dia}`
  
  // Extrai horas no formato HH:MM:SS
  const horaInicio = ag.inicio.toTimeString().split(' ')[0]
  const horaFim = ag.fim.toTimeString().split(' ')[0]
  
  return {
    titulo: ag.titulo,
    descricao: ag.descricao || null,
    data,
    hora_inicio: horaInicio,
    hora_fim: horaFim,
    profissional_id: ag.profissionalId || null,
    cliente_id: ag.clienteId || null,
    user_id: ag.userId || null,
    cancelado: ag.cancelado || false
  }
}
