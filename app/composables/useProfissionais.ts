import type { AgEspecialidade } from '../../shared/types/database'
import type { AgProfissional, AgPerfil, AgCliente } from '../../shared/types/database'

/**
 * Composable para gerenciamento de profissionais e especialidades
 * Centraliza todas as operações relacionadas a profissionais e especialidades
 * @returns {Object} Funções para buscar, adicionar, atualizar e deletar dados
 */
export const useProfissionais = () => {
  const supabase = useSupabaseClient()

  /**
   * Busca todos os perfis cadastrados (apenas para admin)
   * Utiliza a RPC function ag_get_all_profiles_if_admin do Supabase
   * @returns {Promise<AgPerfil[]>} Lista de perfis com id e nome
   * @throws {Error} Erro ao buscar dados do banco ou se não for admin
   */
  const fetchPerfis = async (): Promise<AgPerfil[]> => {
    const { data: perfisData, error: fetchError } = await supabase.rpc('ag_get_all_profiles_if_admin')
    
    if (fetchError) {
      console.error('Erro ao buscar perfis:', fetchError)
      throw fetchError
    }

    return perfisData as AgPerfil[]
  }

  /**
   * Busca todos os profissionais cadastrados no sistema
   * Utiliza a RPC function ag_get_profissionais do Supabase
   * @returns {Promise<AgProfissional[]>} Lista de profissionais com id, nome e especialidade
   * @throws {Error} Erro ao buscar dados do banco
   */
  const fetchProfissionais = async (): Promise<AgProfissional[]> => {
    const { data: profissionaisData, error: fetchError } = await supabase.rpc('ag_get_profissionais')
    
    if (fetchError) {
      console.error('Erro ao buscar profissionais:', fetchError)
      throw fetchError
    }

    return profissionaisData as AgProfissional[]
  }

  /**
   * Busca todas as especialidades cadastradas
   * Retorna apenas id e especialidade, ordenado alfabeticamente
   * @returns {Promise<Especialidade[]>} Lista de especialidades
   * @throws {Error} Erro ao buscar especialidades
   */
  const fetchEspecialidades = async (): Promise<Especialidade[]> => {
    const { data: especialidadesData, error: fetchError } = await supabase
      .from('ag_especialidades')
      .select('id, especialidade')
      .order('especialidade')

    if (fetchError) {
      console.error('Erro ao buscar especialidades:', fetchError)
      throw fetchError
    }

    return especialidadesData as Especialidade[]
  }

  /**
   * Busca todos os clientes cadastrados no sistema
   * Retorna todos os dados do cliente ordenados por nome
   * @returns {Promise<AgCliente[]>} Lista de clientes
   * @throws {Error} Erro ao buscar clientes
   */
  const fetchClientes = async (): Promise<AgCliente[]> => {
    const { data: clientesData, error: fetchError } = await supabase
      .from('ag_clientes')
      .select('*')
      .order('nome')

    if (fetchError) {
      console.error('Erro ao buscar clientes:', fetchError)
      throw fetchError
    }

    return clientesData as AgCliente[]
  }

  /**
   * Adiciona um novo cliente ao sistema
   * Insere registro na tabela ag_clientes
   * @param {string} cpf - CPF do cliente (obrigatório)
   * @param {string} nome - Nome completo do cliente (obrigatório)
   * @param {string} [endereco] - Endereço do cliente (opcional)
   * @param {string} [email] - Email do cliente (opcional)
   * @param {string} [telefone] - Telefone do cliente (opcional)
   * @returns {Promise<{success: boolean, message?: string}>} Resultado da operação
   */
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
      
      // Mensagens de erro mais amigáveis
      if (insertError.code === '23505' || insertError.message.includes('duplicate')) {
        return { success: false, message: 'Já existe um cliente cadastrado com este CPF.' }
      } else if (insertError.message.includes('row-level security')) {
        return { success: false, message: 'Você não tem permissão para criar clientes. Verifique se está logado.' }
      }
      
      return { success: false, message: 'Erro ao criar cliente. Tente novamente.' }
    }
    
    return { success: true }
  }

  /**
   * Atualiza os dados de um cliente existente
   * @param {number} clienteId - ID do cliente a ser atualizado
   * @param {string} cpf - CPF do cliente
   * @param {string} nome - Nome completo do cliente
   * @param {string} [endereco] - Endereço do cliente (opcional)
   * @param {string} [email] - Email do cliente (opcional)
   * @param {string} [telefone] - Telefone do cliente (opcional)
   * @returns {Promise<{success: boolean, message?: string}>} Resultado da operação
   */
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
      
      // Mensagens de erro mais amigáveis
      if (updateError.code === '23505' || updateError.message.includes('duplicate')) {
        return { success: false, message: 'Já existe um cliente cadastrado com este CPF.' }
      } else if (updateError.message.includes('row-level security')) {
        return { success: false, message: 'Você não tem permissão para editar clientes. Verifique se está logado.' }
      }
      
      return { success: false, message: 'Erro ao atualizar cliente. Tente novamente.' }
    }
    
    return { success: true }
  }

  /**
   * Busca uma especialidade específica por ID
   * @param {number} especialidadeId - ID da especialidade a ser buscada
   * @returns {Promise<Especialidade>} Dados da especialidade encontrada
   * @throws {Error} Erro se especialidade não for encontrada ou erro no banco
   */
  const fetchEspecialidadeById = async (especialidadeId: number): Promise<Especialidade> => {
    const { data: especialidadeData, error: fetchError } = await supabase
      .from('ag_especialidades')
      .select('id, especialidade')
      .eq('id', especialidadeId)
      .single()

    if (fetchError) {
      console.error(`Erro ao buscar especialidade ID ${especialidadeId}:`, fetchError)
      throw fetchError
    }

    return especialidadeData as Especialidade
  }

  /**
   * Adiciona uma nova especialidade ao sistema
   * Utiliza a RPC function ag_add_especialidade do Supabase
   * @param {string} nomeEspecialidade - Nome da nova especialidade a ser cadastrada
   * @returns {Promise<{success: boolean, message: string}>} Resultado da operação
   */
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

  /**
   * Atualiza o nome de uma especialidade existente
   * Utiliza a RPC function ag_update_especialidade do Supabase
   * @param {number} especialidadeId - ID da especialidade a ser atualizada
   * @param {string} novoNomeEspecialidade - Novo nome para a especialidade
   * @returns {Promise<{success: boolean, data?: any, message?: string}>} Resultado da operação
   */
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

  /**
   * Remove uma especialidade do sistema
   * ATENÇÃO: Verifica se há profissionais vinculados antes de deletar
   * @param {number} especialidadeId - ID da especialidade a ser removida
   * @returns {Promise<{success: boolean, message?: string}>} Resultado da operação
   */
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

  /**
   * Adiciona um novo profissional ao sistema
   * Insere registro na tabela ag_profissionais com profile_id e especialidade_id
   * @param {number} profileId - ID do perfil/usuário a ser vinculado como profissional
   * @param {number} especialidadeId - ID da especialidade do profissional
   * @returns {Promise<{success: boolean, message?: string}>} Resultado da operação
   */
  const addProfissional = async (profileId: number, especialidadeId: number) => {
    const { error: insertError } = await supabase
      .from('ag_profissionais')
      .insert({
        profile_id: profileId,
        especialidade_id: especialidadeId
      } as any)
    
    if (insertError) {
      console.error('Erro ao adicionar profissional:', insertError)
      
      // Mensagens de erro mais amigáveis
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

  /**
   * Atualiza a especialidade de um profissional existente
   * ATENÇÃO: Atualiza apenas a especialidade_id, o profile_id não pode ser alterado
   * @param {number} profissionalId - ID do profissional (ag_profissionais.id)
   * @param {number} especialidadeId - Novo ID da especialidade
   * @returns {Promise<{success: boolean, message?: string}>} Resultado da operação
   */
  const updateProfissional = async (profissionalId: number, especialidadeId: number) => {
    const { error: updateError } = await (supabase as any)
      .from('ag_profissionais')
      .update({ especialidade_id: especialidadeId })
      .eq('id', profissionalId)
    
    if (updateError) {
      console.error(`Erro ao atualizar profissional ID ${profissionalId}:`, updateError)
      
      // Mensagens de erro mais amigáveis
      if (updateError.message.includes('row-level security')) {
        return { success: false, message: 'Você não tem permissão para editar profissionais. Verifique se está logado como administrador.' }
      } else if (updateError.message.includes('foreign key')) {
        return { success: false, message: 'Especialidade inválida.' }
      }
      
      return { success: false, message: 'Erro ao atualizar profissional. Tente novamente.' }
    }
    
    return { success: true }
  }

  /**
   * Remove um profissional do sistema
   * ATENÇÃO: Remove apenas da tabela ag_profissionais, não deleta o perfil do usuário
   * @param {number} profissionalId - ID do profissional a ser removido (ag_profissionais.id)
   * @returns {Promise<{success: boolean, message?: string}>} Resultado da operação
   */
  const deleteProfissional = async (profissionalId: number) => {
    const { error: deleteError } = await supabase
      .from('ag_profissionais')
      .delete()
      .eq('id', profissionalId)
    
    if (deleteError) {
      console.error(`Erro ao deletar profissional ID ${profissionalId}:`, deleteError)
      
      // Mensagens de erro mais amigáveis
      if (deleteError.message.includes('row-level security')) {
        return { success: false, message: 'Você não tem permissão para deletar profissionais. Verifique se está logado como administrador.' }
      } else if (deleteError.message.includes('foreign key') || deleteError.code === '23503') {
        return { success: false, message: 'Não é possível deletar este profissional pois existem agendamentos vinculados.' }
      }
      
      return { success: false, message: 'Erro ao deletar profissional. Tente novamente.' }
    }
    
    return { success: true }
  }

  /**
   * Deleta um cliente do sistema
   * @param {number} clienteId - ID do cliente a ser removido (ag_clientes.id)
   * @returns {Promise<{success: boolean, message?: string}>} Resultado da operação
   */
  const deleteCliente = async (clienteId: number) => {
    const { error: deleteError } = await supabase
      .from('ag_clientes')
      .delete()
      .eq('id', clienteId)
    
    if (deleteError) {
      console.error(`Erro ao deletar cliente ID ${clienteId}:`, deleteError)
      
      // Mensagens de erro mais amigáveis
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
    fetchProfissionais,
    fetchPerfis,
    addProfissional,
    updateProfissional,
    deleteProfissional,
    fetchEspecialidades,
    fetchEspecialidadeById,
    addEspecialidade,
    updateEspecialidade,
    deleteEspecialidade,
    fetchClientes,
    addCliente,
    updateCliente,
    deleteCliente
  }
}