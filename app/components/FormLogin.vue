<template>
  <div class="space-y-4 md:space-y-6">
    <div class="text-left mb-4 md:mb-6">
      <!-- Logo Painel de Atendimento -->
      <div class="flex items-center gap-3 mb-4 md:mb-6">
        <div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <span class="text-xl font-bold text-neutral-900 tracking-tight">Painel de Atendimento</span>
      </div>

      <h2 class="text-2xl font-bold text-neutral-900 leading-tight">
        Bem-vindo de volta
      </h2>
      <p class="text-neutral-500 mt-2">
        Entre com suas credenciais para acessar o painel
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
        <label class="flex items-center cursor-pointer group">
          <input
            type="checkbox"
            v-model="form.remember"
            class="w-4 h-4 rounded border-neutral-300 text-primary-600 shadow-sm focus:ring-primary-500 transition-colors"
          />
          <span class="ml-2 text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">Lembrar de mim</span>
        </label>

        <a href="#" class="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
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

    <div class="text-center text-sm text-neutral-500 pt-2">
      Não tem uma conta?
      <a href="#" class="text-primary-600 hover:text-primary-700 font-bold ml-1 transition-colors">
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