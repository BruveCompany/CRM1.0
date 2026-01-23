<template>
  <div class="space-y-6">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-gray-900">
        Bem-vindo de volta
      </h2>
      <p class="text-gray-600 mt-2">
        Entre com suas credenciais para acessar o sistema
      </p>
    </div>

    <form @submit.prevent class="space-y-4">
      <InputEmail
        v-model="form.email"
        label="Email"
        placeholder="seuemail@exemplo.com"
        required
      />

      <InputPassword
        v-model="form.password"
        label="Senha"
        placeholder="Digite sua senha"
        required
      />

      <div class="flex items-center justify-between">
        <label class="flex items-center">
          <input
            type="checkbox"
            v-model="form.remember"
            class="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
          />
          <span class="ml-2 text-sm text-gray-600">Lembrar de mim</span>
        </label>

        <a href="#" class="text-sm text-blue-600 hover:text-blue-700">
          Esqueceu a senha?
        </a>
      </div>

      <BaseButton
        type="submit"
        variant="primary"
        size="lg"
        class="w-full"
      >
        Entrar
      </BaseButton>
    </form>

    <div class="text-center text-sm text-gray-600">
      Não tem uma conta?
      <a href="#" class="text-blue-600 hover:text-blue-700 font-medium">
        Cadastre-se
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
const form = ref({
  email: '',
  password: '',
  remember: false
})
</script>