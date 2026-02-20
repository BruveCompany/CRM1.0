<template>
  <div class="h-screen flex items-center justify-center bg-neutral-50 px-4">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
      <div v-if="loadingSession" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Verificando link de segurança...</p>
      </div>

      <div v-else-if="user" class="text-center">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Recuperar Senha</h1>
          <p class="text-sm text-gray-600">
            Defina sua nova senha abaixo.
          </p>
        </div>

        <ChangePassword 
          :show-title="false" 
          :show-clear-button="false" 
          @success="handleSuccess"
        />

        <div class="mt-6 text-center border-t border-neutral-100 pt-4">
          <NuxtLink to="/login" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Voltar para o login
          </NuxtLink>
        </div>
      </div>

      <div v-else class="text-center py-8">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900">Link inválido ou expirado</h3>
        <p class="mt-2 text-sm text-gray-500">
          Não foi possível validar sua sessão.
        </p>
        <p v-if="isOtpExpired" class="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
          <strong>Dica:</strong> Se você solicitou a recuperação várias vezes, certifique-se de clicar no link do <strong>último e-mail</strong> recebido (os anteriores são invalidados automaticamente).
        </p>
        <div class="mt-6">
          <NuxtLink to="/esqueci-senha" class="text-base text-primary-600 hover:text-primary-700 font-medium">
            Solicitar nova senha
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChangePassword from '~/components/ChangePassword.vue'

definePageMeta({
  layout: false
})

useHead({
  title: 'Definir Nova Senha - Bruve Saas'
})
const user = useSupabaseUser()
const route = useRoute()
const loadingSession = ref(true)

const isOtpExpired = computed(() => {
  return route.query.error_code === 'otp_expired' || route.hash?.includes('error_code=otp_expired')
})

// Verificar sessão ao carregar
onMounted(() => {
  // Pequeno timeout para dar tempo ao Supabase de processar o hash da URL
  setTimeout(() => {
    loadingSession.value = false
  }, 2000)
})

// Se o usuário for detectado antes do timeout
watch(user, (newUser) => {
  if (newUser) {
    loadingSession.value = false
  }
}, { immediate: true })

const handleSuccess = async () => {
  await navigateTo('/')
}
</script>
