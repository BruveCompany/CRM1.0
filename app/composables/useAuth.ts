import { useToast } from 'vue-toastification'

export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const toast = useToast()
  const router = useRouter()
  const profile = useState<any>('auth-user-profile', () => null)

  const fetchProfile = async () => {
    if (!user.value) {
      profile.value = null
      return
    }

    try {
      const userId = user.value.id
      const userSub = (user.value as any).sub

      if (!userId && !userSub) {
        console.warn('⚠️ userId e userSub são indefinidos, abortando busca de perfil.')
        return
      }

      console.log('🔄 Iniciando busca de perfil:', { id: userId, sub: userSub })

      // Tenta pelo ID primeiro
      let data: any = null
      let error: any = null

      if (userId) {
        const { data: idData, error: idError } = await (supabase
          .from('ag_profiles') as any)
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()
        data = idData
        error = idError
      }

      // Se não achar pelo ID e o SUB for diferente, tenta pelo SUB
      if (!data && userSub && userSub !== userId) {
        console.log('🔍 Tentando busca alternativa pelo SUB...')
        const { data: subData, error: subError } = await (supabase
          .from('ag_profiles') as any)
          .select('*')
          .eq('user_id', userSub)
          .maybeSingle()

        if (subData) data = subData
      }

      // NOVO: Se ainda não achar, tenta buscar pelo EMAIL como último recurso
      if (!data && user.value.email) {
        console.log('🔍 Tentando busca alternativa pelo EMAIL...')
        const { data: emailData } = await (supabase
          .from('ag_profiles') as any)
          .select('*')
          .eq('email', user.value.email)
          .maybeSingle()

        if (emailData) {
          console.log('✅ Perfil localizado via email!')
          data = emailData

          // OPORTUNIDADE: Se achou por email mas o user_id estava errado/vazio, corrige no banco
          if (!data.user_id || data.user_id !== userId) {
            await (supabase.from('ag_profiles') as any)
              .update({ user_id: userId })
              .eq('id', data.id)
          }
        }
      }

      if (data) {
        console.log('✅ Perfil localizado:', data.nome)
        profile.value = data
      } else {
        console.warn('❌ Perfil não encontrado após todas as tentativas.')
      }
    } catch (err) {
      console.error('❌ Falha crítica ao buscar perfil:', err)
    }
  }

  const isOnlineCalculated = computed(() => {
    if (!profile.value) return false;
    const isOnline = profile.value.is_online === true;
    const lastActivity = profile.value.last_activity ? new Date(profile.value.last_activity).getTime() : 0;
    const now = new Date().getTime();
    return isOnline && (now - lastActivity < 300000); // 5 minutos
  });

  // Monitora mudanças no usuário para atualizar o perfil
  watch(user, () => {
    if (user.value) {
      fetchProfile()
    } else {
      profile.value = null
    }
  }, { immediate: true })

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
        if (!data.user.id) return { success: true, user: data.user }

        // Atualiza status para Online
        const { data: pData } = await (supabase
          .from('ag_profiles') as any)
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (pData) {
          await (supabase
            .from('ag_profiles') as any)
            .update({
              is_online: true,
              last_login: new Date().toISOString(),
              last_activity: new Date().toISOString()
            })
            .eq('id', (pData as any).id);
        }

        await fetchProfile() // Carrega o perfil completo
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
      if (user.value && user.value.id) {
        const { data: pData } = await (supabase
          .from('ag_profiles') as any)
          .select('id')
          .eq('user_id', user.value.id)
          .maybeSingle();

        if (pData) {
          await (supabase
            .from('ag_profiles') as any)
            .update({
              is_online: false,
              last_logout: new Date().toISOString()
            })
            .eq('id', (pData as any).id);
        }
      }

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

  /**
   * Atualiza o carimbo de última atividade (Heartbeat).
   * 
   * @returns {Promise<void>}
   */
  const updateHeartbeat = async () => {
    if (!user.value) return
    try {
      // console.log('📡 Enviando Heartbeat...')

      // Busca o perfil para garantir que temos o ID correto para atualizar
      let currentProfile = profile.value

      if (!currentProfile && user.value?.id) {
        const { data: pData } = await (supabase
          .from('ag_profiles') as any)
          .select('id, user_id, is_online')
          .eq('user_id', user.value.id)
          .maybeSingle()

        if (pData) {
          currentProfile = pData
        } else if (user.value.email) {
          // Fallback por email se profile.value não estiver carregado
          const { data: eData } = await (supabase
            .from('ag_profiles') as any)
            .select('id, user_id, is_online')
            .eq('email', user.value.email)
            .maybeSingle()

          if (eData) currentProfile = eData
        }
      }

      if (currentProfile) {
        const updates: any = {
          last_activity: new Date().toISOString(),
          is_online: true
        }

        // Se o user_id no banco estiver vazio ou diferente, aproveita para sincronizar
        if (!currentProfile.user_id || currentProfile.user_id !== user.value.id) {
          updates.user_id = user.value.id
        }

        const { error } = await (supabase
          .from('ag_profiles') as any)
          .update(updates)
          .eq('id', currentProfile.id)

        if (error) {
          console.error('❌ Erro ao atualizar Heartbeat no banco:', error)
        } else {
          // console.log('✅ Heartbeat atualizado com sucesso.')
          // Atualiza o estado local para refletir na UI imediatamente
          if (profile.value && profile.value.id === currentProfile.id) {
            profile.value = {
              ...profile.value,
              is_online: true,
              last_activity: updates.last_activity
            }
          }
        }
      } else {
        console.warn('⚠️ Perfil não localizado durante Heartbeat.')
      }
    } catch (err) {
      console.error('❌ Falha crítica no Heartbeat:', err)
    }
  }

  return {
    // Estado
    user,
    profile,
    isAuthenticated,
    isOnlineCalculated,

    // Métodos
    login,
    logout,
    fetchProfile,
    changePassword,
    updateUserName,
    recoverPassword,
    checkIsAdmin,
    updateHeartbeat
  }
}

