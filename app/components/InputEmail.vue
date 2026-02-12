<template>
  <BaseInput
    v-model="model"
    type="email"
    :label="label"
    :placeholder="placeholder || 'Digite seu email'"
    :error="errorMessage"
    :hint="hint"
    :disabled="disabled"
    :required="required"
    :size="size"
    :autocomplete="autocomplete"
    v-bind="$attrs"
    @blur="handleBlur"
    @focus="handleFocus"
  >
    <template #icon>
      <EnvelopeIcon class="h-5 w-5 text-neutral-400" />
    </template>
  </BaseInput>
</template>

<script setup lang="ts">
/**
 * ================= InputEmail.vue =================
 * Componente de input para email com validação automática
 * 
 * Funcionalidades:
 * - Valida formato de email (presença de @)
 * - Validação apenas se campo for preenchido
 * - Se vazio e não obrigatório, não valida
 * 
 * Props:
 * - modelValue: Valor do email
 * - label: Label do campo
 * - placeholder: Placeholder
 * - hint: Dica exibida abaixo
 * - error: Mensagem de erro externa
 * - size: Tamanho (sm, md, lg)
 * - disabled: Desabilita input
 * - required: Campo obrigatório
 * - autocomplete: Atributo autocomplete
 * 
 * Emits:
 * - update:modelValue: Emite valor do email
 * - blur: Emitido ao perder foco (com validação)
 * - focus: Emitido ao ganhar foco
 * ==================================================
 */

import { EnvelopeIcon } from '@heroicons/vue/24/outline'
import { ref, computed } from 'vue'

export interface InputEmailProps {
  modelValue?: string
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  required?: boolean
  autocomplete?: string
}

const props = withDefaults(defineProps<InputEmailProps>(), {
  disabled: false,
  required: false,
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const internalError = ref<string>('')

/**
 * Model computado com two-way binding
 */
const model = computed({
  get: () => props.modelValue || '',
  set: (value: string) => {
    emit('update:modelValue', value)
    // Limpa erro interno ao digitar
    if (internalError.value) internalError.value = ''
  }
})

/**
 * Mensagem de erro final (externa ou interna)
 */
const errorMessage = computed(() => props.error || internalError.value)

/**
 * Valida formato de email (regex simples)
 * @param {string} email - Email a ser validado
 * @returns {boolean} true se válido
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Handler de blur - valida email se preenchido
 */
function handleBlur(event: FocusEvent) {
  const value = model.value.trim()
  
  // Se preenchido, valida formato
  if (value && !isValidEmail(value)) {
    internalError.value = 'Email inválido. Deve conter @'
  } else {
    internalError.value = ''
  }
  
  emit('blur', event)
}

/**
 * Handler de focus - limpa erro ao focar
 */
function handleFocus(event: FocusEvent) {
  internalError.value = ''
  emit('focus', event)
}
</script>