<template>
  <button
    @click="$emit('click', $event)"
    :disabled="loading"
    :class="[
      'inline-flex items-center justify-center font-semibold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest',
      variantClasses,
      sizeClasses,
      roundedClasses
    ]"
  >
    <Icon v-if="icon && !loading" :name="icon" class="w-4 h-4 mr-2 opacity-80" />
    <Icon v-if="loading" name="svg-spinners:18-dots-indicator" class="w-4 h-4 mr-2" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  icon?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  rounded?: 'xl' | '2xl' | 'full';
}>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  rounded: 'xl'
});

defineEmits(['click']);

const variantClasses = computed(() => {
  const styles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-100',
    secondary: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    outline: 'border border-gray-200 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-400 hover:text-primary-600 hover:bg-primary-50',
    success: 'bg-[#25D366] text-white hover:brightness-105 shadow-sm shadow-green-100'
  };
  return styles[props.variant];
});

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-3 py-1.5 text-[10px]',
    md: 'px-5 py-2.5 text-xs',
    lg: 'px-6 py-3 text-sm'
  };
  return sizes[props.size];
});

const roundedClasses = computed(() => {
  const radius = {
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full'
  };
  return radius[props.rounded];
});
</script>
