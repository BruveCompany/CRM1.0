<template>
  <div class="h-screen flex items-center justify-center bg-neutral-50 px-4">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Recuperar Senha</h1>
        <p class="text-sm text-gray-600">
          Defina sua nova senha abaixo.
        </p>
      </div>

      <ChangePassword :show-title="false" :show-clear-button="false" />

      <div class="mt-6 text-center border-t border-neutral-100 pt-4">
        <NuxtLink to="/login" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Voltar para o login
        </NuxtLink>
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
</script>
