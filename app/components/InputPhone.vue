<template>
  <BaseInput
    :model-value="maskedValue"
    @update:model-value="handleInput"
    type="tel"
    :label="label"
    :placeholder="placeholder || '(41) 99549-3118'"
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
      <PhoneIcon class="h-5 w-5 text-gray-400" />
    </template>
  </BaseInput>
</template>

<script setup lang="ts">
/**
 * ================= InputPhone.vue =================
 * Componente de input para telefone com máscara automática
 * 
 * Funcionalidades:
 * - Aceita apenas números
 * - Aplica máscara BR: (XX) XXXXX-XXXX (10-11 dígitos)
 * - Aceita internacional sem máscara (12-15 dígitos)
 * - Mínimo 10, máximo 15 dígitos
 * 
 * Props:
 * - modelValue: Valor do telefone (apenas números)
 * - label: Label do campo
 * - placeholder: Placeholder (padrão: (41) 99549-3118)
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
 * ==================================================
 */

import { PhoneIcon } from '@heroicons/vue/24/outline'
import { ref, computed } from 'vue'

export interface InputPhoneProps {
  modelValue?: string
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<InputPhoneProps>(), {
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
 * Mensagem de erro de validação
 */
const errorMessage = ref('')

/**
 * Remove todos os caracteres não numéricos
 * @param {string} value - Valor a ser limpo
 * @returns {string} Apenas números
 */
function removeNonNumeric(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Aplica máscara de telefone
 * - BR (10-11 dígitos): (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 * - Internacional (12-15 dígitos): sem máscara
 * @param {string} value - Telefone sem máscara (apenas números)
 * @returns {string} Telefone com ou sem máscara
 */
function applyPhoneMask(value: string): string {
  const cleaned = removeNonNumeric(value).slice(0, 15) // Limita a 15 dígitos (padrão E.164)
  
  // Se tiver mais de 11 dígitos, é internacional - retorna sem máscara
  if (cleaned.length > 11) {
    return cleaned
  }
  
  // Aplica máscara brasileira progressivamente (10-11 dígitos)
  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
  if (cleaned.length <= 10) {
    // Telefone fixo: (XX) XXXX-XXXX
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`
  }
  // Celular: (XX) XXXXX-XXXX
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
}

/**
 * Valor com máscara para exibição
 */
const maskedValue = computed(() => {
  if (!props.modelValue) return ''
  const cleaned = removeNonNumeric(props.modelValue).slice(0, 15)
  return applyPhoneMask(cleaned)
})

/**
 * Handler de input - remove máscara e emite apenas números
 * @param {string} value - Valor digitado (com máscara)
 */
function handleInput(value: string | number) {
  const stringValue = String(value)
  const cleaned = removeNonNumeric(stringValue).slice(0, 15) // Limita a 15 dígitos
  emit('update:modelValue', cleaned)
}

/**
 * Previne entrada de caracteres não numéricos e limita a 15 dígitos
 * @param {KeyboardEvent} event - Evento de teclado
 */
function onlyNumbers(event: KeyboardEvent) {
  const char = String.fromCharCode(event.keyCode || event.which)
  
  // Bloqueia caracteres não numéricos
  if (!/[0-9]/.test(char)) {
    event.preventDefault()
    return
  }
  
  // Bloqueia se já tiver 15 dígitos (máximo internacional)
  const currentLength = removeNonNumeric(props.modelValue || '').length
  if (currentLength >= 15) {
    event.preventDefault()
  }
}

/**
 * Valida telefone ao perder foco
 * Mínimo 10 dígitos (BR), máximo 15 dígitos (internacional)
 */
function handleBlur(event: FocusEvent) {
  const cleaned = removeNonNumeric(props.modelValue || '')
  
  if (cleaned.length > 0) {
    if (cleaned.length < 10) {
      errorMessage.value = 'Telefone inválido. Mínimo 10 dígitos'
    } else if (cleaned.length > 15) {
      errorMessage.value = 'Telefone inválido. Máximo 15 dígitos'
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