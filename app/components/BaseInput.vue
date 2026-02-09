<template>
  <div class="space-y-1">
    <label 
      v-if="label" 
      :for="inputId"
      class="block text-sm font-medium text-gray-700"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div class="relative">
      <input
        :id="inputId"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :class="inputClasses"
        :value="modelValue"
        @input="handleInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      
      <div v-if="$slots.icon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <slot name="icon" />
      </div>
      
      <div v-if="$slots.suffix" class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <slot name="suffix" />
      </div>
    </div>
    
    <p 
      v-if="error || hint" 
      :class="[
        'text-sm',
        error ? 'text-red-500' : 'text-gray-500'
      ]"
    >
      {{ error || hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
/**
 * ================= BaseInput.vue =================
 * Componente de input reutilizável com suporte a:
 * - Múltiplos tipos (text, email, password, number, tel, url)
 * - Validação e mensagens de erro
 * - Ícones e sufixos
 * - Diferentes tamanhos (sm, md, lg)
 * - Estados (disabled, readonly, required)
 * 
 * Props:
 * - modelValue: Valor do input (two-way binding)
 * - type: Tipo do input
 * - label: Label do campo
 * - placeholder: Texto placeholder
 * - hint: Dica exibida abaixo do input
 * - error: Mensagem de erro (muda estilo para vermelho)
 * - size: Tamanho do input (sm, md, lg)
 * - disabled: Desabilita o input
 * - readonly: Input somente leitura
 * - required: Campo obrigatório (adiciona asterisco vermelho)
 * - autocomplete: Atributo autocomplete HTML
 * 
 * Emits:
 * - update:modelValue: Emitido quando o valor muda
 * - blur: Emitido quando perde o foco
 * - focus: Emitido quando recebe o foco
 * 
 * Slots:
 * - icon: Ícone no início do input
 * - suffix: Conteúdo no final do input
 * =================================================
 */

export interface BaseInputProps {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  autocomplete?: string
}

const props = withDefaults(defineProps<BaseInputProps>(), {
  type: 'text',
  size: 'md',
  disabled: false,
  readonly: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const slots = useSlots()

/**
 * Gera ID único consistente entre SSR e cliente
 * Garante que o ID seja o mesmo no servidor e no navegador
 */
const inputId = useId()

/**
 * Handler do evento input
 * Converte valor para number se type='number', caso contrário mantém string
 * @param {Event} event - Evento de input do DOM
 */
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}

/**
 * Computed que gera classes dinâmicas do input baseado em:
 * - Tamanho (sm, md, lg)
 * - Estado de erro
 * - Presença de ícones/sufixos
 * @returns {string} String com todas as classes CSS
 */
const inputClasses = computed(() => {
  const base = 'block w-full border rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-gray-50 disabled:text-gray-500'
  
  // Tamanhos disponíveis
  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-3 py-1.5 text-base',
    lg: 'px-4 py-2.5 text-lg'
  }
  
  // Estado visual (normal ou erro)
  const state = props.error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500 hover:border-red-400'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500 hover:border-gray-500'
  
  // Padding adicional se tiver ícones nos slots
  const iconPadding = slots.icon ? 'pl-10' : ''
  const suffixPadding = slots.suffix ? 'pr-10' : ''
  
  return [
    base,
    sizes[props.size],
    state,
    iconPadding,
    suffixPadding
  ].join(' ')
})
</script>