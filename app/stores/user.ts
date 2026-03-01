import { defineStore } from 'pinia'
import type { User } from '@supabase/supabase-js'
import type { AgProfile } from '../../shared/types/database'
import type { Database } from '../../shared/types/database'

export const useUserStore = defineStore('user', () => {
  const supabase = useSupabaseClient<Database>()
  const supabaseUser = useSupabaseUser()

  const { profile: authProfile, fetchProfile: authFetch } = useAuth()

  // State sincronizado com useAuth para evitar fetch duplo
  const profile = computed(() => authProfile.value)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const user = computed(() => supabaseUser.value)
  const isAuthenticated = computed(() => !!supabaseUser.value)
  const userName = computed(() => (authProfile.value as any)?.nome || 'Usuário')
  const userRole = computed(() => (authProfile.value as any)?.role || 'user')

  // Actions
  async function fetchProfile() {
    loading.value = true
    await authFetch()
    loading.value = false
  }

  async function updateProfile(updates: Partial<AgProfile>) {
    if (!supabaseUser.value || !profile.value) {
      throw new Error('Usuário não autenticado')
    }

    loading.value = true
    error.value = null

    // Supabase não aceita campos undefined ou campos não atualizáveis (id, created_at)
    const allowedFields: Array<keyof AgProfile> = ['nome', 'role']
    const filteredUpdates: Record<string, string | null> = {}
    for (const key of allowedFields) {
      const value = updates[key]
      if (value !== undefined && value !== null) {
        filteredUpdates[key] = value as string | null
      }
    }

    try {
      if (!supabaseUser.value.id) {
        throw new Error('ID do usuário não localizado para atualização')
      }

      const { data, error: updateError } = await supabase
        .from('ag_profiles')
        // @ts-expect-error - Supabase type inference issue
        .update(filteredUpdates)
        .eq('user_id', supabaseUser.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      if (data) {
        authProfile.value = data
      }
    } catch (err: any) {
      error.value = err.message || 'Erro ao atualizar perfil'
      console.error('Erro ao atualizar perfil:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearProfile() {
    authProfile.value = null
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
