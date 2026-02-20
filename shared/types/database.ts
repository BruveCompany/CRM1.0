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
    Views: {
      ag_view_agendamentos_completo: {
        Row: AgViewAgendamentoCompleto
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
  created_at: string
  user_id: string
  nome: string
  role: string
  email: string
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
 * @property {string | null} cor - Cor hexadecimal do agendamento (default: #3730A3)
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
  cor: string | null
}

/**
 * Interface para a view ag_view_agendamentos_completo
 * View que combina dados de agendamentos com informações completas de cliente e profissional
 * 
 * Dados do agendamento:
 * @property {number} id - ID único do agendamento
 * @property {string} created_at - Data/hora de criação do registro
 * @property {string | null} user_id - ID do usuário
 * @property {string | null} data - Data do agendamento
 * @property {string | null} hora_inicio - Hora de início
 * @property {string | null} hora_fim - Hora de fim
 * @property {string | null} titulo - Título do agendamento
 * @property {string | null} descricao - Descrição do agendamento
 * @property {boolean} cancelado - Status de cancelamento
 * @property {string | null} cancelado_as - Data/hora do cancelamento
 * @property {string | null} cor - Cor hexadecimal do agendamento
 * 
 * Dados do cliente:
 * @property {number | null} cliente_id - ID do cliente
 * @property {string | null} cliente_nome - Nome do cliente
 * @property {string | null} cliente_cpf - CPF do cliente
 * @property {string | null} cliente_email - Email do cliente
 * @property {string | null} cliente_telefone - Telefone do cliente
 * 
 * Dados do profissional:
 * @property {number | null} profissional_id - ID do profissional
 * @property {number | null} profile_id - ID do perfil do profissional
 * @property {string | null} profissional_nome - Nome do profissional
 * @property {number | null} especialidade_id - ID da especialidade
 * @property {string | null} especialidade - Nome da especialidade
 */
export interface AgViewAgendamentoCompleto {
  // Dados do agendamento
  id: number
  created_at: string
  user_id: string | null
  data: string | null
  hora_inicio: string | null
  hora_fim: string | null
  titulo: string | null
  descricao: string | null
  cancelado: boolean
  cancelado_as: string | null
  cor: string | null
  // Dados do cliente
  cliente_id: number | null
  cliente_nome: string | null
  cliente_cpf: string | null
  cliente_email: string | null
  cliente_telefone: string | null
  // Dados do profissional
  profissional_id: number | null
  profile_id: number | null
  profissional_nome: string | null
  especialidade_id: number | null
  especialidade: string | null
}

// Estado do store de usuário
export interface UserState {
  profile: AgProfile | null
  loading: boolean
  error: string | null
}
