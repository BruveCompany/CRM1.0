import type { AgCliente } from '../../shared/types/database'

export const useClientes = () => {
    const supabase = useSupabaseClient()
    const clientes = useState<AgCliente[]>('global-clientes-cache', () => [])
    const lastFetch = useState<Record<string, number>>('global-clientes-fetch-timestamps', () => ({}))
    const { waitForProfile } = useAuth()

    const isCacheValid = (key: string, ttl = 300000) => {
        const last = lastFetch.value[key] || 0
        return (Date.now() - last) < ttl
    }

    const fetchClientes = async (force = false): Promise<AgCliente[]> => {
        if (!force && clientes.value.length > 0 && isCacheValid('clientes')) return clientes.value;

        await waitForProfile();

        const { data, error } = await supabase
            .from('ag_clientes')
            .select('*')
            .order('nome');

        if (error) {
            console.error('Erro ao buscar clientes:', error);
            throw error;
        }

        clientes.value = data as AgCliente[];
        lastFetch.value['clientes'] = Date.now();
        return clientes.value;
    }

    const addCliente = async (
        cpf: string,
        nome: string,
        endereco?: string,
        email?: string,
        telefone?: string
    ) => {
        const { error: insertError } = await supabase
            .from('ag_clientes')
            .insert({
                cpf,
                nome,
                endereco: endereco || null,
                email: email || null,
                telefone: telefone || null
            } as any)

        if (insertError) {
            console.error('Erro ao adicionar cliente:', insertError)

            if (insertError.code === '23505' || insertError.message.includes('duplicate')) {
                return { success: false, message: 'Já existe um cliente cadastrado com este CPF.' }
            } else if (insertError.message.includes('row-level security')) {
                return { success: false, message: 'Você não tem permissão para criar clientes. Verifique se está logado.' }
            }

            return { success: false, message: 'Erro ao criar cliente. Tente novamente.' }
        }

        return { success: true }
    }

    const updateCliente = async (
        clienteId: number,
        cpf: string,
        nome: string,
        endereco?: string,
        email?: string,
        telefone?: string
    ) => {
        const { error: updateError } = await (supabase as any)
            .from('ag_clientes')
            .update({
                cpf,
                nome,
                endereco: endereco || null,
                email: email || null,
                telefone: telefone || null
            })
            .eq('id', clienteId)

        if (updateError) {
            console.error(`Erro ao atualizar cliente ID ${clienteId}:`, updateError)

            if (updateError.code === '23505' || updateError.message.includes('duplicate')) {
                return { success: false, message: 'Já existe um cliente cadastrado com este CPF.' }
            } else if (updateError.message.includes('row-level security')) {
                return { success: false, message: 'Você não tem permissão para editar clientes. Verifique se está logado.' }
            }

            return { success: false, message: 'Erro ao atualizar cliente. Tente novamente.' }
        }

        return { success: true }
    }

    const deleteCliente = async (clienteId: number) => {
        const { error: deleteError } = await supabase
            .from('ag_clientes')
            .delete()
            .eq('id', clienteId)

        if (deleteError) {
            console.error(`Erro ao deletar cliente ID ${clienteId}:`, deleteError)

            if (deleteError.message.includes('row-level security')) {
                return { success: false, message: 'Você não tem permissão para deletar clientes.' }
            } else if (deleteError.message.includes('foreign key') || deleteError.code === '23503') {
                return { success: false, message: 'Não é possível deletar este cliente pois existem agendamentos vinculados.' }
            }

            return { success: false, message: 'Erro ao deletar cliente. Tente novamente.' }
        }

        return { success: true }
    }

    return {
        fetchClientes,
        addCliente,
        updateCliente,
        deleteCliente
    }
}
