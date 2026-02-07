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

// Estado do store de usuário
export interface UserState {
  profile: AgProfile | null
  loading: boolean
  error: string | null
}
