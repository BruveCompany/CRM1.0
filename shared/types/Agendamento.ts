/**
 * Interface para representar um agendamento
 */
export interface Agendamento {
  id: number
  titulo: string
  descricao?: string
  inicio: Date
  fim: Date
  clienteNome?: string
  profissionalId?: number
}
