import type { AgProfissional, AgPerfil } from '../../shared/types/database'
import { useEspecialidades } from './useEspecialidades'
import { useClientes } from './useClientes'

/**
 * Composable para gerenciamento de profissionais, perfis e agrega funcionalidades de clientes e especialidades.
 */
export const useProfissionais = () => {
  const supabase = useSupabaseClient()

  // Estados Locais (Profissionais e Perfis)
  const perfis = useState<AgPerfil[]>('global-perfis-cache', () => [])
  const profissionais = useState<AgProfissional[]>('global-profissionais-cache', () => [])
  const lastFetch = useState<Record<string, number>>('global-profissionais-fetch-timestamps', () => ({}))

  const { waitForProfile } = useAuth()

  // Instância dos outros composables
  const especialidadesModule = useEspecialidades()
  const clientesModule = useClientes()

  const isCacheValid = (key: string, ttl = 300000) => {
    const last = lastFetch.value[key] || 0
    return (Date.now() - last) < ttl
  }

  const fetchPerfis = async (force = false): Promise<AgPerfil[]> => {
    if (!force && perfis.value.length > 0 && isCacheValid('perfis')) return perfis.value;

    await waitForProfile();

    const { data, error } = await supabase.rpc('ag_get_all_profiles_if_admin')
    if (error) {
      console.error('Erro ao buscar perfis:', error)
      throw error
    }

    perfis.value = data as AgPerfil[]
    lastFetch.value['perfis'] = Date.now()
    return perfis.value
  }

  const fetchProfissionais = async (force = false): Promise<AgProfissional[]> => {
    if (!force && profissionais.value.length > 0 && isCacheValid('profissionais')) return profissionais.value;

    await waitForProfile();

    const { data, error } = await supabase.rpc('ag_get_profissionais')
    if (error) {
      console.error('Erro ao buscar profissionais:', error)
      throw error
    }

    profissionais.value = data as AgProfissional[]
    lastFetch.value['profissionais'] = Date.now()
    return profissionais.value
  }

  const addProfissional = async (profileId: number, especialidadeId: number) => {
    const { error: insertError } = await supabase
      .from('ag_profissionais')
      .insert({
        profile_id: profileId,
        especialidade_id: especialidadeId
      } as any)

    if (insertError) {
      console.error('Erro ao adicionar profissional:', insertError)

      if (insertError.message.includes('row-level security')) {
        return { success: false, message: 'Você não tem permissão para criar profissionais. Verifique se está logado como administrador.' }
      } else if (insertError.message.includes('duplicate') || insertError.code === '23505') {
        return { success: false, message: 'Este usuário já está cadastrado como profissional.' }
      } else if (insertError.message.includes('foreign key')) {
        return { success: false, message: 'Usuário ou especialidade inválidos.' }
      }

      return { success: false, message: 'Erro ao criar profissional. Tente novamente.' }
    }

    return { success: true }
  }

  const updateProfissional = async (profissionalId: number, especialidadeId: number) => {
    const { error: updateError } = await (supabase as any)
      .from('ag_profissionais')
      .update({ especialidade_id: especialidadeId })
      .eq('id', profissionalId)

    if (updateError) {
      console.error(`Erro ao atualizar profissional ID ${profissionalId}:`, updateError)

      if (updateError.message.includes('row-level security')) {
        return { success: false, message: 'Você não tem permissão para editar profissionais. Verifique se está logado como administrador.' }
      } else if (updateError.message.includes('foreign key')) {
        return { success: false, message: 'Especialidade inválida.' }
      }

      return { success: false, message: 'Erro ao atualizar profissional. Tente novamente.' }
    }

    return { success: true }
  }

  const deleteProfissional = async (profissionalId: number) => {
    const { error: deleteError } = await supabase
      .from('ag_profissionais')
      .delete()
      .eq('id', profissionalId)

    if (deleteError) {
      console.error(`Erro ao deletar profissional ID ${profissionalId}:`, deleteError)

      if (deleteError.message.includes('row-level security')) {
        return { success: false, message: 'Você não tem permissão para deletar profissionais. Verifique se está logado como administrador.' }
      } else if (deleteError.message.includes('foreign key') || deleteError.code === '23503') {
        return { success: false, message: 'Não é possível deletar este profissional pois existem agendamentos vinculados.' }
      }

      return { success: false, message: 'Erro ao deletar profissional. Tente novamente.' }
    }

    return { success: true }
  }

  return {
    fetchProfissionais,
    fetchPerfis,
    addProfissional,
    updateProfissional,
    deleteProfissional,

    // Repassa os métodos de Especialidades
    fetchEspecialidades: especialidadesModule.fetchEspecialidades,
    fetchEspecialidadeById: especialidadesModule.fetchEspecialidadeById,
    addEspecialidade: especialidadesModule.addEspecialidade,
    updateEspecialidade: especialidadesModule.updateEspecialidade,
    deleteEspecialidade: especialidadesModule.deleteEspecialidade,

    // Repassa os métodos de Clientes
    fetchClientes: clientesModule.fetchClientes,
    addCliente: clientesModule.addCliente,
    updateCliente: clientesModule.updateCliente,
    deleteCliente: clientesModule.deleteCliente
  }
}