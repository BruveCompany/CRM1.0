<template>
  <BaseModal 
    :modelValue="modelValue" 
    @update:modelValue="$emit('update:modelValue', $event)"
    title="Data Personalizada"
    size="md"
  >
    <div class="space-y-6 p-1">
      <div class="space-y-2">
        <label class="text-xs font-bold text-neutral-400 uppercase">Intervalo de Datas</label>
        <div class="calendar-wrapper bg-neutral-50 rounded-2xl p-2 border border-neutral-100">
          <ClientOnly>
            <VueDatePicker
              v-model="dateRange"
              range
              inline
              auto-apply
              :locale="ptBR"
              :format-locale="ptBR"
              :enable-time-picker="false"
              format="dd/MM/yyyy"
            />
          </ClientOnly>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button @click="$emit('update:modelValue', false)" class="flex-1 py-3 text-sm font-bold text-neutral-500 hover:bg-neutral-50 rounded-xl transition-all">
          Cancelar
        </button>
        <button 
          @click="apply" 
          class="flex-[2] py-3 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 shadow-lg disabled:opacity-50"
          :disabled="!dateRange || !dateRange[0] || !dateRange[1]"
        >
          Aplicar Filtro
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

import { ptBR } from 'date-fns/locale';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue', 'apply']);
const dateRange = ref<[Date, Date] | null>(null);

const apply = () => {
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    emit('apply', {
      start: dateRange.value[0].toISOString(),
      end: dateRange.value[1].toISOString()
    });
    emit('update:modelValue', false);
  }
};
</script>

<style>
.dp__theme_light {
  --dp-primary-color: #4f46e5;
  --dp-border-radius: 12px;
}
</style>
