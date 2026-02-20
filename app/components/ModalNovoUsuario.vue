<template>
  <BaseModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    size="md"
  >
    <template #header>
      <h3 class="text-lg font-semibold text-neutral-900">Novo Usuário</h3>
    </template>

    <div class="space-y-4 py-2">
      <BaseInput
        v-model="form.nome"
        label="Nome Completo"
        placeholder="Digite o nome completo"
        required
      />
      
      <BaseInput
        v-model="form.email"
        type="email"
        label="E-mail"
        placeholder="Digite o e-mail"
        required
      />
      
      <InputPassword
        v-model="form.senha"
        label="Senha"
        placeholder="Digite a senha"
        required
      />

      <InputPassword
        v-model="form.confirmarSenha"
        label="Confirmar Senha"
        placeholder="Confirme a senha"
        required
      />

      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1.5">
          Tipo de Usuário <span class="text-error-500">*</span>
        </label>
        <select
          v-model="form.role"
          class="block w-full border border-neutral-300 rounded-md shadow-sm px-3 py-1.5 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-700 focus:border-primary-700 hover:border-primary-700"
          required
        >
          <option value="" disabled>Selecione o tipo de usuário</option>
          <option value="user">Usuário Comum</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
    </div>

    <template #footer>
      <BaseButton
        variant="secondary"
        @click="$emit('update:modelValue', false)"
      >
        Cancelar
      </BaseButton>
      <BaseButton
        variant="primary"
        @click="handleCreate"
      >
        Criar Usuário
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import InputPassword from './InputPassword.vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'success'])

const form = ref({
  nome: '',
  email: '',
  senha: '',
  confirmarSenha: '',
  role: ''
})

const handleCreate = () => {
  // Ação será implementada posteriormente
  console.log('Criar usuário:', form.value)
}
</script>
