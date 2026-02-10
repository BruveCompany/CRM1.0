// Tipo Database para Supabase
export type Database = {
  public: {
    Tables: {
      ag_profiles: {
        Row: AgProfile
        Insert: Omit<AgProfile, 'id' | 'created_at'> & { id?: number; created_at?: string }
        Update: Partial<Omit<AgProfile, 'id' | 'created_at'>>
      }
      ag_especialidades: {
        Row: AgEspecialidade
        Insert: Omit<AgEspecialidade, 'id'> & { id?: number }
        Update: Partial<Omit<AgEspecialidade, 'id'>>
      }
      ag_profissionais: {
        Row: AgProfissionalRow
        Insert: Omit<AgProfissionalRow, 'id'> & { id?: number }
        Update: Partial<Omit<AgProfissionalRow, 'id'>>
      }
      ag_clientes: {
        Row: AgCliente
        Insert: Omit<AgCliente, 'id' | 'created_at'> & { id?: number; created_at?: string }
        Update: Partial<Omit<AgCliente, 'id' | 'created_at'>>
      }
      ag_agendamentos: {
        Row: AgAgendamento
        Insert: Omit<AgAgendamento, 'id' | 'created_at'> & { id?: number; created_at?: string }
        Update: Partial<Omit<AgAgendamento, 'id' | 'created_at'>>
      }
    }
  }
}

// Tipos da base de dados Supabase
export interface AgProfile {
  id: number
  created_at: string
  user_id: string | null
  nome: string | null
  role: string | null
}

// Especialidades
export interface AgEspecialidade {
  id: number
  especialidade: string | null
}

/**
 * Interface para dados de clientes
 * Tabela: ag_clientes
 * 
 * @property {number} id - ID único do cliente (gerado automaticamente)
 * @property {string} created_at - Data/hora de criação do registro
 * @property {string | null} cpf - CPF do cliente (único, pode ser nulo)
 * @property {string | null} nome - Nome completo do cliente
 * @property {string | null} endereco - Endereço do cliente
 * @property {string | null} email - Email do cliente
 * @property {string | null} telefone - Telefone do cliente
 */
export interface AgCliente {
  id: number
  created_at: string
  cpf: string | null
  nome: string | null
  endereco: string | null
  email: string | null
  telefone: string | null
}

// Profissionais - tabela no banco de dados
export interface AgProfissionalRow {
  id: number
  profile_id: number
  especialidade_id: number
}

// Profissionais - retorno da RPC function com join de especialidades
export interface AgProfissional {
  profissional_id: number
  profile_id: number
  nome: string
  especialidade_id: number
  especialidade: string
}

// Perfis - retorno da RPC function ag_get_all_profiles_if_admin
export interface AgPerfil {
  id: number
  nome: string
}

/**
 * Interface para dados de agendamentos
 * Tabela: ag_agendamentos
 * 
 * @property {number} id - ID único do agendamento (gerado automaticamente)
 * @property {string} created_at - Data/hora de criação do registro
 * @property {string | null} user_id - ID do usuário (FK para auth.users)
 * @property {number | null} profissional_id - ID do profissional (FK para ag_profissionais)
 * @property {number | null} cliente_id - ID do cliente (FK para ag_clientes)
 * @property {string | null} data - Data do agendamento
 * @property {string | null} hora_inicio - Hora de início do agendamento
 * @property {string | null} hora_fim - Hora de fim do agendamento
 * @property {string | null} titulo - Título do agendamento
 * @property {string | null} descricao - Descrição do agendamento
 * @property {boolean} cancelado - Status de cancelamento (default: false)
 * @property {string | null} cancelado_as - Data/hora do cancelamento
 */
export interface AgAgendamento {
  id: number
  created_at: string
  user_id: string | null
  profissional_id: number | null
  cliente_id: number | null
  data: string | null
  hora_inicio: string | null
  hora_fim: string | null
  titulo: string | null
  descricao: string | null
  cancelado: boolean
  cancelado_as: string | null
}

// Estado do store de usuário
export interface UserState {
  profile: AgProfile | null
  loading: boolean
  error: string | null
}
