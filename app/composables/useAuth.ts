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

  /**
   * Envia um email de recuperação de senha para o usuário.
   * 
   * @param {string} email - O email do usuário
   * @returns {Promise<{success: boolean, error?: any}>} Resultado da operação
   */
  const recoverPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/recuperar-senha`
      })

      if (error) {
        // Por segurança, não devemos informar se o email existe ou não, 
        // mas para debug/desenvolvimento pode ser útil logar.
        console.error('Erro ao enviar email de recuperação:', error)
        return { success: false, error }
      }

      return { success: true }
    } catch (err) {
      console.error('Erro inesperado na recuperação de senha:', err)
      return { success: false, error: err }
    }
  }

  /**
   * Verifica se o usuário atual é admin.
   * Utiliza a função RPC 'ag_isadmin' no banco de dados.
   * 
   * @returns {Promise<boolean>} True se for admin, false caso contrário
   */
  const checkIsAdmin = async () => {
    try {
      // @ts-ignore - Tipagem da função RPC pode estar desatualizada
      const { data, error } = await supabase.rpc('ag_isadmin')

      if (error) {
        console.error('Erro ao verificar status de admin:', error)
        return false
      }

      // Verifica diferentes formatos possíveis de retorno
      if (typeof data === 'boolean') return data
      if (data && typeof data === 'object' && 'isadmin' in data) {
        return (data as any).isadmin === true
      }
      if (Array.isArray(data) && (data as any[]).length > 0) {
        // Caso retorne um array de objetos
        if ('isadmin' in data[0]) {
          return (data[0] as any).isadmin === true
        }
        // Caso retorne array de booleans (menos provável, mas possível)
        if (typeof data[0] === 'boolean') {
          return data[0]
        }
      }

      console.log('Retorno desconhecido da função ag_isadmin:', data)
      return false
    } catch (err) {
      console.error('Erro inesperado ao verificar admin:', err)
      return false
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
    updateUserName,
    recoverPassword,
    checkIsAdmin
  }
}
