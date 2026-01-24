<template>
  <NuxtLayout>
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="container mx-auto px-4 max-w-4xl">
        <div class="text-center mb-12">
          <h1 class="text-3xl font-bold text-gray-900 mb-4">
            Teste de Componentes
          </h1>
          <p class="text-lg text-gray-600">
            Avaliação dos componentes BaseButton e BaseInput
          </p>
        </div>

      <!-- BaseButton Tests -->
      <section class="mb-16">
        <h2 class="text-2xl font-semibold text-gray-800 mb-8 text-center">
          BaseButton
        </h2>
        
        <!-- Variants -->
        <div class="bg-white p-8 rounded-lg shadow-md mb-8">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Variantes</h3>
          <div class="flex flex-wrap gap-4">
            <BaseButton variant="primary" @click="showAlert('Primary clicked')">
              Primary
            </BaseButton>
            <BaseButton variant="secondary" @click="showAlert('Secondary clicked')">
              Secondary
            </BaseButton>
            <BaseButton variant="outline" @click="showAlert('Outline clicked')">
              Outline
            </BaseButton>
            <BaseButton variant="ghost" @click="showAlert('Ghost clicked')">
              Ghost
            </BaseButton>
          </div>
        </div>

        <!-- Sizes -->
        <div class="bg-white p-8 rounded-lg shadow-md mb-8">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Tamanhos</h3>
          <div class="flex flex-wrap items-center gap-4">
            <BaseButton size="sm" @click="showAlert('Small button')">
              Small
            </BaseButton>
            <BaseButton size="md" @click="showAlert('Medium button')">
              Medium
            </BaseButton>
            <BaseButton size="lg" @click="showAlert('Large button')">
              Large
            </BaseButton>
          </div>
        </div>

        <!-- States -->
        <div class="bg-white p-8 rounded-lg shadow-md">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Estados</h3>
          <div class="flex flex-wrap gap-4">
            <BaseButton @click="showAlert('Normal button')">
              Normal
            </BaseButton>
            <BaseButton disabled>
              Disabled
            </BaseButton>
            <BaseButton :loading="isLoading" @click="testLoading">
              {{ isLoading ? 'Loading...' : 'Test Loading' }}
            </BaseButton>
            <BaseButton variant="outline" @click="showToast">
              Test Toast
            </BaseButton>
          </div>
        </div>
      </section>

      <!-- BaseInput Tests -->
      <section class="mb-16">
        <h2 class="text-2xl font-semibold text-gray-800 mb-8 text-center">
          BaseInput
        </h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Basic Inputs -->
          <div class="bg-white p-8 rounded-lg shadow-md">
            <h3 class="text-lg font-medium text-gray-700 mb-6">Inputs Básicos</h3>
            <div class="space-y-6">
              <BaseInput 
                v-model="form.name"
                label="Nome"
                placeholder="Digite seu nome"
                required
              />
              
              <InputEmail 
                v-model="form.email"
                label="Email com Ícone"
                placeholder="seuemail@exemplo.com"
                hint="Será usado para contato"
              />
              
              <InputPhone 
                v-model="form.phone"
                label="Telefone com Ícone"
                placeholder="(11) 99999-9999"
              />
              
              <InputPassword 
                v-model="form.password"
                label="Senha com Ícone"
                placeholder="Digite sua senha"
                :error="passwordError"
              />
            </div>
          </div>

          <!-- Input Sizes & States -->
          <div class="bg-white p-8 rounded-lg shadow-md">
            <h3 class="text-lg font-medium text-gray-700 mb-6">Tamanhos e Estados</h3>
            <div class="space-y-6">
              <BaseInput 
                v-model="form.small"
                size="sm"
                label="Small Input"
                placeholder="Tamanho pequeno"
              />
              
              <BaseInput 
                v-model="form.medium"
                size="md"
                label="Medium Input"
                placeholder="Tamanho médio"
              />
              
              <BaseInput 
                v-model="form.large"
                size="lg"
                label="Large Input"
                placeholder="Tamanho grande"
              />
              
              <BaseInput 
                v-model="form.disabled"
                label="Input Disabled"
                placeholder="Desabilitado"
                disabled
              />
              
              <BaseInput 
                v-model="form.readonly"
                label="Input Readonly"
                value="Valor somente leitura"
                readonly
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Interactive Demo -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-800 mb-8 text-center">
          Demo Interativo
        </h2>
        
        <div class="bg-white p-8 rounded-lg shadow-md">
          <div class="max-w-md mx-auto">
            <h3 class="text-lg font-medium text-gray-700 mb-6 text-center">
              Formulário de Teste
            </h3>
            
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <BaseInput 
                v-model="demoForm.name"
                label="Nome"
                placeholder="Seu nome"
                required
              />
              
              <BaseInput 
                v-model="demoForm.email"
                type="email"
                label="Email"
                placeholder="seuemail@exemplo.com"
                required
              />
              
              <div class="flex gap-3">
                <BaseButton 
                  type="submit" 
                  variant="primary"
                  class="flex-1"
                >
                  Enviar
                </BaseButton>
                
                <BaseButton 
                  type="button"
                  variant="outline"
                  @click="resetForm"
                >
                  Limpar
                </BaseButton>
              </div>
            </form>
            
            <div v-if="submitted" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-green-700 text-sm">
                ✓ Formulário enviado com sucesso!
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Data Display -->
      <section class="mt-12">
        <div class="bg-white p-8 rounded-lg shadow-md">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Dados dos Formulários</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-medium text-gray-600 mb-2">Form Data:</h4>
              <pre class="text-sm text-gray-600 bg-gray-50 p-3 rounded">{{ JSON.stringify(form, null, 2) }}</pre>
            </div>
            <div>
              <h4 class="font-medium text-gray-600 mb-2">Demo Form Data:</h4>
              <pre class="text-sm text-gray-600 bg-gray-50 p-3 rounded">{{ JSON.stringify(demoForm, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHead } from '@unhead/vue'
import { useToast } from 'vue-toastification'

const toast = useToast()

useHead({
  title: 'Teste de Componentes'
})

// Form data for testing
const form = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  small: '',
  medium: '',
  large: '',
  disabled: 'Valor fixo',
  readonly: 'Somente leitura'
})

// Demo form
const demoForm = ref({
  name: '',
  email: ''
})

const submitted = ref(false)
const isLoading = ref(false)

const passwordError = computed(() => {
  if (form.value.password && form.value.password.length < 6) {
    return 'A senha deve ter pelo menos 6 caracteres'
  }
  return ''
})

const showAlert = (message: string) => {
  alert(message)
}

const testLoading = async () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    toast.success('Loading test completed!')
  }, 2000)
}

const showToast = () => {
  const types = ['success', 'error', 'warning', 'info'] as const
  const type = types[Math.floor(Math.random() * types.length)] as 'success' | 'error' | 'warning' | 'info'
  const messages: Record<'success' | 'error' | 'warning' | 'info', string> = {
    success: 'Operação realizada com sucesso!',
    error: 'Ops! Algo deu errado.',
    warning: 'Atenção! Verifique os dados.',
    info: 'Informação importante.'
  }
  
  toast[type](messages[type])
}

const handleSubmit = () => {
  if (demoForm.value.name && demoForm.value.email) {
    submitted.value = true
    toast.success('Formulário enviado com sucesso!')
    setTimeout(() => {
      submitted.value = false
    }, 3000)
  } else {
    toast.error('Por favor, preencha todos os campos obrigatórios')
  }
}

const resetForm = () => {
  demoForm.value = {
    name: '',
    email: ''
  }
  submitted.value = false
  toast.info('Formulário limpo')
}
</script>