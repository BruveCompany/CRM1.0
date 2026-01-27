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

  // Editar especialidade
  const editarEspecialidade = async (id: number, novaEspecialidade: string) => {
    const { data, error } = await (supabase.rpc as any)('ag_update_especialidade', {
      p_id: id,
      p_nova_especialidade: novaEspecialidade
    })
    if (error) {
      console.error(error)
      return { success: false, message: error.message }
    }
    return { success: true, data }
  }

  // Deletar especialidade
  const deletarEspecialidade = async (id: number) => {
    const { error } = await supabase
      .from('ag_especialidades')
      .delete()
      .eq('id', id)
    if (error) {
      console.error(error)
      return { success: false, message: error.message }
    }
    return { success: true }
  }

  return {
    fetchEspecialidades,
    inserirEspecialidade,
    editarEspecialidade,
    deletarEspecialidade
  }
}