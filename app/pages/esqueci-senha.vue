<template>
  <div class="h-screen flex items-center justify-center bg-neutral-50 px-4">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Esqueceu sua senha?</h1>
        <p class="text-sm text-gray-600">
          Digite seu email abaixo para receber as instruções de recuperação.
        </p>
      </div>

      <form @submit.prevent="handleSendEmail" class="space-y-6">
        <BaseInput
          v-model="email"
          label="Email"
          type="email"
          placeholder="seu@email.com"
          required
        />

        <BaseButton 
          variant="primary" 
          class="w-full"
          type="submit"
          :loading="loading"
        >
          Enviar email
        </BaseButton>

        <div class="text-center">
          <NuxtLink to="/login" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Voltar para o login
          </NuxtLink>
        </div>
      </form>

      <!-- Modal de Confirmação -->
      <ModalConfirmacao
        v-model="modalAberto"
        titulo="Verifique seu email"
        mensagem="Caso o email informado esteja cadastrado, você receberá um link com as instruções para redefinir sua senha."
        texto-confirmar="Voltar para Login"
        texto-cancelar="Fechar"
        variant="info"
        @confirmar="handleConfirmarModal"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseInput from '~/components/BaseInput.vue'
import BaseButton from '~/components/BaseButton.vue'

definePageMeta({
  layout: false
})

useHead({
  title: 'Recuperar Senha - Bruve Saas'
})

const email = ref('')
const loading = ref(false)
const modalAberto = ref(false)

// Composables
const { recoverPassword } = useAuth()
const { notifyError } = useNotification()

const handleSendEmail = async () => {
  if (!email.value) return notifyError('Digite seu email')
  
  loading.value = true
  try {
    const result = await recoverPassword(email.value)
    
    if (result.success) {
      modalAberto.value = true
    } else {
      const msg = (result.error as any)?.message || 'Erro ao enviar email. Tente novamente.'
      // Traduzindo mensagens comuns do Supabase
      if (msg.includes('Too many requests')) {
        notifyError('Muitas tentativas. Aguarde 60 segundos.')
      } else {
        notifyError(msg)
      }
    }
  } finally {
    loading.value = false
  }
}

const handleConfirmarModal = () => {
  modalAberto.value = false
  navigateTo('/login')
}
</script>
