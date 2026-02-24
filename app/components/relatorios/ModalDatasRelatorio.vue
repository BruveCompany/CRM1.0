<template>
  <BaseModal 
    :model-value="modelValue" 
    @update:modelValue="$emit('update:modelValue', $event)"
    size="sm"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <Icon name="heroicons:outline:calendar" class="w-5 h-5 text-primary-600" />
        <h3 class="text-lg font-bold text-gray-900">Período Personalizado</h3>
      </div>
    </template>

    <div class="space-y-4 py-2">
      <div class="flex flex-col gap-1.5">
        <label class="text-[11px] font-bold uppercase text-gray-400 ml-1 tracking-wider">Data de Início</label>
        <div class="relative">
          <input 
            type="date" 
            v-model="internalStart" 
            class="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
          />
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-[11px] font-bold uppercase text-gray-400 ml-1 tracking-wider">Data de Fim</label>
        <div class="relative">
          <input 
            type="date" 
            v-model="internalEnd" 
            class="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <BaseButton 
        variant="ghost" 
        size="sm" 
        @click="$emit('update:modelValue', false)"
      >
        Cancelar
      </BaseButton>
      <BaseButton 
        variant="primary" 
        size="sm" 
        @click="handleConfirmar"
        :disabled="!internalStart || !internalEnd"
      >
        Aplicar Período
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseModal from '../BaseModal.vue';
import BaseButton from '../BaseButton.vue';

const props = defineProps<{
  modelValue: boolean;
  startDate: string;
  endDate: string;
}>();

const emit = defineEmits(['update:modelValue', 'confirmar']);

const internalStart = ref(props.startDate);
const internalEnd = ref(props.endDate);

// Sincroniza quando o modal abre
watch(() => props.modelValue, (val) => {
  if (val) {
    internalStart.value = props.startDate;
    internalEnd.value = props.endDate;
  }
});

const handleConfirmar = () => {
  emit('confirmar', {
    start: internalStart.value,
    end: internalEnd.value
  });
  emit('update:modelValue', false);
};
</script>
