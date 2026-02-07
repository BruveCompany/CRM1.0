import type { Especialidade } from '../../shared/types/Especialidade'
import type { AgProfissional } from '../../shared/types/database'

/**
 * Composable para gerenciamento de profissionais e especialidades
 * Centraliza todas as operações relacionadas a profissionais e especialidades
 * @returns {Object} Funções para buscar, adicionar, atualizar e deletar dados
 */
export const useProfissionais = () => {
  const supabase = useSupabaseClient()

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

  return {
    fetchProfissionais,
    fetchEspecialidades,
    fetchEspecialidadeById,
    addEspecialidade,
    updateEspecialidade,
    deleteEspecialidade
  }
}