<template>
  <BaseInput
    v-model="model"
    type="email"
    :label="label"
    :placeholder="placeholder || 'Digite seu email'"
    :error="error"
    :hint="hint"
    :disabled="disabled"
    :required="required"
    :size="size"    :autocomplete="autocomplete"    v-bind="$attrs"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus', $event)"
  >
    <template #icon>
      <EnvelopeIcon class="h-5 w-5 text-gray-400" />
    </template>
  </BaseInput>
</template>

<script setup lang="ts">
import { EnvelopeIcon } from '@heroicons/vue/24/outline'

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

const model = computed({
  get: () => props.modelValue || '',
  set: (value: string) => emit('update:modelValue', value)
})
</script>