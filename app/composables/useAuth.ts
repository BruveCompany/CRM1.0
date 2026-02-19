import { useToast } from 'vue-toastification'

export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const toast = useToast()
  const router = useRouter()

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        toast.error(error.message || 'Erro ao fazer login')
        return { success: false, error }
      }

      if (data.user) {
        toast.success('Login realizado com sucesso!')
        await navigateTo('/')
        return { success: true, user: data.user }
      }

      return { success: false }
    } catch (err) {
      toast.error('Erro inesperado ao fazer login')
      console.error('Login error:', err)
      return { success: false, error: err }
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        toast.error(error.message || 'Erro ao fazer logout')
        return { success: false, error }
      }

      toast.info('Logout realizado com sucesso')
      await navigateTo('/login')
      return { success: true }
    } catch (err) {
      toast.error('Erro inesperado ao fazer logout')
      console.error('Logout error:', err)
      return { success: false, error: err }
    }
  }

  const isAuthenticated = computed(() => !!user.value)

  /**
   * Atualiza a senha do usuário autenticado.
   * Utiliza a API do Supabase para redefinir a senha.
   * 
   * @param {string} password - A nova senha
   * @returns {Promise<{success: boolean, error?: any, data?: any}>} Resultado da operação
   */
  const changePassword = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password
      })

      if (error) {
        toast.error(error.message || 'Erro ao atualizar senha')
        return { success: false, error }
      }

      toast.success('Senha atualizada com sucesso!')
      return { success: true, data }
    } catch (err) {
      toast.error('Erro inesperado ao atualizar senha')
      console.error('Update password error:', err)
      return { success: false, error: err }
    }
  }

  /**
   * Atualiza o nome do usuário.
   * Utiliza a função RPC 'ag_update_infos_user' no banco de dados.
   * 
   * @param {string} novo_nome - O novo nome do usuário
   * @returns {Promise<{success: boolean, message?: string, error?: any}>} Resultado da operação
   */
  const updateUserName = async (novo_nome: string) => {
    try {
      // @ts-ignore - Tipagem da função RPC pode estar desatualizada no projeto
      const { data, error } = await supabase.rpc('ag_update_infos_user', {
        novo_nome
      })

      if (error) {
        console.error('Erro ao atualizar nome:', error)
        toast.error('Erro ao atualizar nome do usuário')
        return { success: false, error: error.message }
      }

      console.log('Update user response:', data)
      toast.success('Nome atualizado com sucesso!')
      return { success: true, message: 'Nome atualizado com sucesso!', data }
    } catch (err) {
      console.error('Erro inesperado ao atualizar nome:', err)
      toast.error('Erro inesperado ao atualizar nome')
      return { success: false, error: err }
    }
  }

  return {
    // Estado
    user,
    isAuthenticated,

    // Métodos
    login,
    logout,
    changePassword,
    updateUserName
  }
}
