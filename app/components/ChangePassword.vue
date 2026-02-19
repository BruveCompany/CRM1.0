<template>
  <form class="space-y-4" @submit.prevent="handleChangePassword">
    <h3 v-if="showTitle" class="text-lg font-medium text-gray-900">Alterar Senha</h3>
    <div class="space-y-4">
      <InputPassword
        v-model="newPassword"
        label="Nova Senha"
        placeholder="Digite sua nova senha"
      />
      <InputPassword
        v-model="confirmPassword"
        label="Confirmar Nova Senha"
        placeholder="Confirme sua nova senha"
      />

      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-sm font-medium text-gray-900 mb-2">Requisitos da senha:</h4>
        <ul class="text-xs text-gray-500 space-y-1 list-disc list-inside">
          <li>Pelo menos 8 caracteres</li>
          <li>Pelo menos um número</li>
          <li>Pelo menos uma letra</li>
          <li>Pelo menos um caractere especial (!@#$%^&*)</li>
        </ul>
      </div>
      
      <div class="flex justify-end gap-3 pt-2">
        <BaseButton 
          v-if="showClearButton"
          variant="outline" 
          type="button"
          @click="handleClear"
          :disabled="loading"
        >
          Limpar
        </BaseButton>
        <BaseButton 
          variant="primary" 
          type="submit"
          :loading="loading"
        >
          Alterar Senha
        </BaseButton>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
/**
 * ================= Componente: ChangePassword =================
 * Formulário para alteração de senha do usuário.
 * 
 * Funcionalidades:
 * - Campos para nova senha e confirmação
 * - Visualização de requisitos de senha
 * - Emissão de eventos para ações de limpar e alterar
 * - Controle de visibilidade da senha (via InputPassword)
 * ==========================================================
 */

import InputPassword from './InputPassword.vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  showTitle: {
    type: Boolean,
    default: true
  },
  showClearButton: {
    type: Boolean,
    default: true
  }
})

// Composables
const { changePassword } = useAuth()
const { notifyError } = useNotification()

// Estado Local
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)

/**
 * Limpa os campos do formulário
 */
const handleClear = () => {
  newPassword.value = ''
  confirmPassword.value = ''
}

/**
 * Executa a atualização da senha
 */
const handleChangePassword = async () => {
  // Validações
  if (!newPassword.value) return notifyError('Digite uma nova senha')
  if (newPassword.value !== confirmPassword.value) return notifyError('As senhas não conferem')
  if (newPassword.value.length < 8) return notifyError('A senha deve ter pelo menos 8 caracteres')

  loading.value = true
  try {
    const result = await changePassword(newPassword.value)
    if (result.success) {
      handleClear()
    }
  } finally {
    loading.value = false
  }
}
</script>
