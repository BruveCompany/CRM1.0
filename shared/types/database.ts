// Tipo Database para Supabase
export type Database = {
  public: {
    Tables: {
      ag_profiles: {
        Row: AgProfile
        Insert: Omit<AgProfile, 'id' | 'created_at'> & { id?: number; created_at?: string }
        Update: Partial<Omit<AgProfile, 'id' | 'created_at'>>
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

// Estado do store de usuário
export interface UserState {
  profile: AgProfile | null
  loading: boolean
  error: string | null
}
