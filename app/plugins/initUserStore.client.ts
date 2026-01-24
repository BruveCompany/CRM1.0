import { defineNuxtPlugin } from '#app'
import { useUserStore } from '../stores/user'

export default defineNuxtPlugin(() => {
  console.log('Plugin initUserStore.client.ts executado')
  const userStore = useUserStore()
  const user = useSupabaseUser()
  if (user.value && !userStore.profile) {
    userStore.fetchProfile()
  }
})
