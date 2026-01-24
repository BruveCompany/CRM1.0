<template>
  <div class="space-y-6">
    <div class="text-center mb-8">
      <h2 class="text-2xl md:text-4xl font-bold text-gray-900">
        Bem-vindo de volta
      </h2>
      <p class="text-gray-600 md:text-xl mt-2">
        Entre com suas credenciais para acessar o sistema
      </p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <InputEmail
        v-model="form.email"
        label="Email"
        placeholder="seuemail@exemplo.com"
        required
        autocomplete="email"
        :error="errors.email"
      />

      <InputPassword
        v-model="form.password"
        label="Senha"
        placeholder="Digite sua senha"
        required
        autocomplete="current-password"
        :error="errors.password"
      />

      <div class="flex items-center justify-between">
        <label class="flex items-center">
          <input
            type="checkbox"
            v-model="form.remember"
            class="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
          />
          <span class="ml-2 text-sm md:text-lg text-gray-600">Lembrar de mim</span>
        </label>

        <a href="#" class="text-sm md:text-lg text-blue-600 hover:text-blue-700">
          Esqueceu a senha?
        </a>
      </div>

      <BaseButton
        type="submit"
        variant="primary"
        size="lg"
        class="w-full"
        :loading="isLoading"
      >
        {{ isLoading ? 'Entrando...' : 'Entrar' }}
      </BaseButton>
    </form>

    <div class="text-center text-sm md:text-lg text-gray-600">
      Não tem uma conta?
      <a href="#" class="text-blue-600 hover:text-blue-700 font-medium">
        Cadastre-se
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
const { login } = useAuth()

const form = ref({
  email: '',
  password: '',
  remember: false
})

const errors = ref({
  email: '',
  password: ''
})

const isLoading = ref(false)

const validateForm = () => {
  errors.value = {
    email: '',
    password: ''
  }

  if (!form.value.email) {
    errors.value.email = 'Email é obrigatório'
    return false
  }

  if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    errors.value.email = 'Email inválido'
    return false
  }

  if (!form.value.password) {
    errors.value.password = 'Senha é obrigatória'
    return false
  }

  if (form.value.password.length < 6) {
    errors.value.password = 'Senha deve ter no mínimo 6 caracteres'
    return false
  }

  return true
}

const handleLogin = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    await login(form.value.email, form.value.password)
  } finally {
    isLoading.value = false
  }
}
</script>