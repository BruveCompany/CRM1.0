<template>
  <BaseInput
    :model-value="maskedValue"
    @update:model-value="handleInput"
    type="text"
    :label="label"
    :placeholder="placeholder || '000.000.000-00'"
    :error="error || errorMessage"
    :hint="hint"
    :disabled="disabled"
    :required="required"
    :size="size"
    inputmode="numeric"
    v-bind="$attrs"
    @blur="handleBlur"
    @focus="handleFocus"
    @keypress="onlyNumbers"
  >
    <template #icon>
      <IdentificationIcon class="h-5 w-5 text-neutral-400" />
    </template>
  </BaseInput>
</template>

<script setup lang="ts">
/**
 * ================= InputCPF.vue =================
 * Componente de input para CPF com máscara automática
 * 
 * Funcionalidades:
 * - Aceita apenas números
 * - Aplica máscara: XXX.XXX.XXX-XX
 * - Valida formato (11 dígitos)
 * - Máximo 14 caracteres (com máscara)
 * 
 * Props:
 * - modelValue: Valor do CPF (apenas números)
 * - label: Label do campo
 * - placeholder: Placeholder (padrão: 000.000.000-00)
 * - hint: Dica exibida abaixo
 * - error: Mensagem de erro
 * - size: Tamanho (sm, md, lg)
 * - disabled: Desabilita input
 * - required: Campo obrigatório
 * 
 * Emits:
 * - update:modelValue: Emite apenas números (sem máscara)
 * - blur: Emitido ao perder foco (com validação)
 * - focus: Emitido ao ganhar foco
 * ================================================
 */

import { IdentificationIcon } from '@heroicons/vue/24/outline'
import { ref, computed } from 'vue'

export interface InputCPFProps {
  modelValue?: string
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<InputCPFProps>(), {
  disabled: false,
  required: false,
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

/**
 * Remove todos os caracteres não numéricos
 * @param {string} value - Valor a ser limpo
 * @returns {string} Apenas números
 */
function removeNonNumeric(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Valida CPF usando algoritmo oficial dos dígitos verificadores
 * @param {string} cpf - CPF apenas números (11 dígitos)
 * @returns {boolean} true se válido
 */
function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleaned = removeNonNumeric(cpf)
  
  // Verifica se tem 11 dígitos
  if (cleaned.length !== 11) return false
  
  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleaned)) return false
  
  // Valida primeiro dígito verificador
  let soma = 0
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cleaned.charAt(i)) * (10 - i)
  }
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cleaned.charAt(9))) return false
  
  // Valida segundo dígito verificador
  soma = 0
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cleaned.charAt(i)) * (11 - i)
  }
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cleaned.charAt(10))) return false
  
  return true
}

/**
 * Aplica máscara de CPF: XXX.XXX.XXX-XX
 * @param {string} value - CPF sem máscara (apenas números)
 * @returns {string} CPF com máscara
 */
function applyCPFMask(value: string): string {
  const cleaned = removeNonNumeric(value).slice(0, 11) // Limita a 11 dígitos
  
  // Aplica máscara progressivamente
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`
}

/**
 * Mensagem de erro de validação
 */
const errorMessage = ref('')

/**
 * Valor com máscara para exibição
 */
const maskedValue = computed(() => {
  if (!props.modelValue) return ''
  const cleaned = removeNonNumeric(props.modelValue).slice(0, 11)
  return applyCPFMask(cleaned)
})

/**
 * Handler de input - remove máscara e emite apenas números
 * @param {string | number} value - Valor digitado (com máscara)
 */
function handleInput(value: string | number) {
  const stringValue = String(value)
  const cleaned = removeNonNumeric(stringValue).slice(0, 11) // Limita a 11 dígitos
  emit('update:modelValue', cleaned)
}

/**
 * Previne entrada de caracteres não numéricos e limita a 11 dígitos
 * @param {KeyboardEvent} event - Evento de teclado
 */
function onlyNumbers(event: KeyboardEvent) {
  const char = String.fromCharCode(event.keyCode || event.which)
  
  // Bloqueia caracteres não numéricos
  if (!/[0-9]/.test(char)) {
    event.preventDefault()
    return
  }
  
  // Bloqueia se já tiver 11 dígitos
  const currentLength = removeNonNumeric(props.modelValue || '').length
  if (currentLength >= 11) {
    event.preventDefault()
  }
}

/**
 * Valida CPF ao perder foco
 * Verifica se tem 11 dígitos e se é válido pelo algoritmo
 */
function handleBlur(event: FocusEvent) {
  const cleaned = removeNonNumeric(props.modelValue || '')
  
  if (cleaned.length > 0) {
    if (cleaned.length !== 11) {
      errorMessage.value = 'CPF inválido. Deve conter 11 dígitos'
    } else if (!isValidCPF(cleaned)) {
      errorMessage.value = 'CPF inválido'
    } else {
      errorMessage.value = ''
    }
  } else {
    errorMessage.value = ''
  }
  
  emit('blur', event)
}

/**
 * Limpa erro ao focar no campo
 */
function handleFocus(event: FocusEvent) {
  errorMessage.value = ''
  emit('focus', event)
}
</script>
