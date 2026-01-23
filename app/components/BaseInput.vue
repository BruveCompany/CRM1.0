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

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}

const inputClasses = computed(() => {
  const base = 'block w-full border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-gray-50 disabled:text-gray-500'
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  }
  
  const state = props.error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
  
  // Add padding for icons
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