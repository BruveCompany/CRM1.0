<template>
  <div class="h-screen flex items-center justify-center bg-neutral-50 px-4">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Esqueceu sua senha?</h1>
        <p class="text-sm text-gray-600">
          Digite seu email abaixo para receber as instruções de recuperação.
        </p>
      </div>

      <div class="space-y-6">
        <BaseInput
          v-model="email"
          label="Email"
          type="email"
          placeholder="seu@email.com"
        />

        <BaseButton 
          variant="primary" 
          class="w-full"
          @click="handleSendEmail"
        >
          Enviar email
        </BaseButton>

        <div class="text-center">
          <NuxtLink to="/login" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Voltar para o login
          </NuxtLink>
        </div>
      </div>
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

const handleSendEmail = () => {
  // Lógica será implementada posteriormente
}
</script>
