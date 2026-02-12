<template>
  <BaseInput
    v-model="model"
    :type="inputType"
    :label="label"
    :placeholder="placeholder || 'Digite sua senha'"
    :error="error"
    :hint="hint"
    :disabled="disabled"
    :required="required"
    :size="size"
    :autocomplete="autocomplete"
    v-bind="$attrs"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus', $event)"
  >
    <template #icon>
      <LockClosedIcon class="h-5 w-5 text-neutral-400" />
    </template>
    
    <template #suffix>
      <button
        type="button"
        class="text-neutral-400 hover:text-neutral-600 transition-colors"
        @click="toggleVisibility"
      >
        <EyeIcon v-if="showPassword" class="h-5 w-5" />
        <EyeSlashIcon v-else class="h-5 w-5" />
      </button>
    </template>
  </BaseInput>
</template>

<script setup lang="ts">
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

export interface InputPasswordProps {
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

const props = withDefaults(defineProps<InputPasswordProps>(), {
  disabled: false,
  required: false,
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const showPassword = ref(false)

const model = computed({
  get: () => props.modelValue || '',
  set: (value: string) => emit('update:modelValue', value)
})

const inputType = computed(() => showPassword.value ? 'text' : 'password')

const toggleVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>