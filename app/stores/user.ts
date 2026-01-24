import { defineStore } from 'pinia'
import type { User } from '@supabase/supabase-js'
import type { AgProfile } from '../../shared/types/database'

export const useUserStore = defineStore('user', () => {
  const supabase = useSupabaseClient<Database>()
  const supabaseUser = useSupabaseUser()
  
  // State
  const profile = ref<AgProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const user = computed(() => supabaseUser.value)
  const isAuthenticated = computed(() => !!supabaseUser.value)
  const userName = computed(() => profile.value?.nome || 'Usuário')
  const userRole = computed(() => profile.value?.role || 'user')

  // Actions
  async function fetchProfile() {
    console.log('fetchProfile chamado')
    console.log('supabaseUser.value:', supabaseUser.value)
    console.log('supabaseUser.value.sub:', supabaseUser.value?.sub)
    if (!supabaseUser.value || !supabaseUser.value.sub) {
      profile.value = null
      return
    }

    loading.value = true
    error.value = null

    try {
      console.log('user_id buscado:', supabaseUser.value.id)
      const { data, error: fetchError } = await supabase
        .from('ag_profiles')
        .select('*')
        .eq('user_id', supabaseUser.value.sub)
        .single()
      console.log('Resultado da busca:', { data, fetchError })
      if (fetchError) throw fetchError
      profile.value = data as AgProfile
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar perfil'
      console.error('Erro ao buscar perfil:', err)
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(updates: Database['public']['Tables']['ag_profiles']['Update']) {
    if (!supabaseUser.value || !profile.value) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('ag_profiles')
        .update(updates)
        .eq('user_id', supabaseUser.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      profile.value = data as AgProfile
    } catch (err: any) {
      error.value = err.message || 'Erro ao atualizar perfil'
      console.error('Erro ao atualizar perfil:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearProfile() {
    profile.value = null
    error.value = null
  }

  return {
    // State
    profile,
    loading,
    error,
    
    // Getters
    user,
    isAuthenticated,
    userName,
    userRole,
    
    // Actions
    fetchProfile,
    updateProfile,
    clearProfile
  }
})
