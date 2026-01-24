import type { Especialidade } from '../../shared/types/Especialidade'

export const useProfissionais = () => {
  const supabase = useSupabaseClient()

  // Buscar especialidades
  const fetchEspecialidades = async () => {
    const { data, error } = await supabase
      .from('ag_especialidades')
      .select('id, especialidade')
      .order('especialidade')

    if (error) {
      throw error
    }

    return data as Especialidade[]
  }

  // Inserir especialidade
  const inserirEspecialidade = async (especialidade: string) => {
    const { data, error } = await (supabase.rpc as any)('ag_add_especialidade', {
      p_especialidade: especialidade
    })
    if (error) {
      console.error(error)
      return { success: false, message: error.message }
    }
    return data as { success: boolean; message: string }
  }

  return {
    fetchEspecialidades,
    inserirEspecialidade
  }
}