import type { AgEspecialidade } from '../../shared/types/database'

export const useEspecialidades = () => {
    const supabase = useSupabaseClient()
    const especialidades = useState<AgEspecialidade[]>('global-especialidades-cache', () => [])
    const lastFetch = useState<Record<string, number>>('global-especialidades-fetch-timestamps', () => ({}))
    const { waitForProfile } = useAuth()

    const isCacheValid = (key: string, ttl = 300000) => {
        const last = lastFetch.value[key] || 0
        return (Date.now() - last) < ttl
    }

    const fetchEspecialidades = async (force = false): Promise<AgEspecialidade[]> => {
        if (!force && especialidades.value.length > 0 && isCacheValid('especialidades')) return especialidades.value;

        await waitForProfile();

        const { data, error } = await supabase
            .from('ag_especialidades')
            .select('id, especialidade')
            .order('especialidade')

        if (error) {
            console.error('Erro ao buscar especialidades:', error)
            throw error
        }

        especialidades.value = data as AgEspecialidade[];
        lastFetch.value['especialidades'] = Date.now();
        return especialidades.value;
    }

    const fetchEspecialidadeById = async (especialidadeId: number): Promise<AgEspecialidade> => {
        const { data: especialidadeData, error: fetchError } = await supabase
            .from('ag_especialidades')
            .select('id, especialidade')
            .eq('id', especialidadeId)
            .single()

        if (fetchError) {
            console.error(`Erro ao buscar especialidade ID ${especialidadeId}:`, fetchError)
            throw fetchError
        }

        return especialidadeData as AgEspecialidade
    }

    const addEspecialidade = async (nomeEspecialidade: string) => {
        const { data: resultadoOperacao, error: insertError } = await (supabase.rpc as any)('ag_add_especialidade', {
            p_especialidade: nomeEspecialidade
        })

        if (insertError) {
            console.error('Erro ao adicionar especialidade:', insertError)
            return { success: false, message: insertError.message }
        }

        return resultadoOperacao as { success: boolean; message: string }
    }

    const updateEspecialidade = async (especialidadeId: number, novoNomeEspecialidade: string) => {
        const { data: resultadoOperacao, error: updateError } = await (supabase.rpc as any)('ag_update_especialidade', {
            p_id: especialidadeId,
            p_nova_especialidade: novoNomeEspecialidade
        })

        if (updateError) {
            console.error(`Erro ao atualizar especialidade ID ${especialidadeId}:`, updateError)
            return { success: false, message: updateError.message }
        }

        return { success: true, data: resultadoOperacao }
    }

    const deleteEspecialidade = async (especialidadeId: number) => {
        const { error: deleteError } = await supabase
            .from('ag_especialidades')
            .delete()
            .eq('id', especialidadeId)

        if (deleteError) {
            console.error(`Erro ao deletar especialidade ID ${especialidadeId}:`, deleteError)
            return { success: false, message: deleteError.message }
        }

        return { success: true }
    }

    return {
        fetchEspecialidades,
        fetchEspecialidadeById,
        addEspecialidade,
        updateEspecialidade,
        deleteEspecialidade
    }
}
