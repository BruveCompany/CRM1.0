<!--
  MODAL DE SELEÇÃO DE COR - VERSÃO ULTRA COMPACT PRIME
  Design minimalista, ágil e sofisticado com refinamento estético.
-->
<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
    modelValue: boolean;
    initialColor: string;
    title: string;
}>();

const emit = defineEmits(['update:modelValue', 'save']);

const currentColor = ref(props.initialColor);
const customColorInput = ref(props.initialColor);

watch(() => props.modelValue, (isOpen) => {
    if (isOpen) {
      currentColor.value = props.initialColor;
      customColorInput.value = props.initialColor;
    }
});

const handleClose = () => emit('update:modelValue', false);
const handleSave = () => {
    emit('save', currentColor.value);
    handleClose();
};

const updateFromCustom = () => {
  if (/^#[0-9A-F]{6}$/i.test(customColorInput.value)) {
    currentColor.value = customColorInput.value;
  }
};

// Helper para decidir a cor do ícone no seletor (claro/escuro)
const isDark = (color: string) => {
  const hex = color.replace('#', '');
  if (hex.length !== 6) return false;
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 155;
};

// Paletas de cores elegantes
const presetColors = [
    '#94A3B8', '#93C5FD', '#6EE7B7', '#FCD34D', '#FCA5A5', 
    '#C4B5FD', '#F9A8D4', '#67E8F9', '#818CF8', '#475569'
];
</script>

<template>
  <BaseModal :model-value="modelValue" @update:model-value="handleClose" size="sm">
    <template #header>
      <div class="flex items-center gap-2.5 py-1">
        <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-100"></div>
        <h3 class="text-[13px] font-bold text-slate-700 tracking-tight">{{ title }}</h3>
      </div>
    </template>

    <div class="px-5 py-3 space-y-4">
      <!-- Preview Compacto -->
      <div class="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-3">
        <div 
          class="w-8 h-8 rounded-full border border-white shadow-sm transition-all duration-500 shrink-0"
          :style="{ backgroundColor: currentColor }"
        ></div>
        <div class="flex flex-col">
          <span class="text-[9px] uppercase font-bold text-slate-400 tracking-tight leading-none mb-0.5">Preview</span>
          <span class="text-xs font-mono font-bold text-slate-600 uppercase">{{ currentColor }}</span>
        </div>
      </div>

      <!-- Suggested Palette -->
      <div class="space-y-2">
        <div class="flex items-center justify-center">
          <span class="h-[1px] flex-1 bg-slate-100"></span>
          <span class="px-2 text-[8px] font-bold text-slate-300 uppercase tracking-widest">Sugeridas</span>
          <span class="h-[1px] flex-1 bg-slate-100"></span>
        </div>
        <div class="grid grid-cols-5 gap-2 px-1">
          <button 
            v-for="color in presetColors" 
            :key="color"
            @click="currentColor = color; customColorInput = color"
            class="w-6 h-6 mx-auto rounded-full border transition-all duration-200 hover:scale-110 active:scale-90"
            :class="currentColor === color ? 'border-indigo-500 ring-2 ring-indigo-50 shadow-sm z-10' : 'border-white shadow-sm hover:border-slate-200'"
            :style="{ backgroundColor: color }"
            type="button"
          ></button>
        </div>
      </div>

      <!-- Custom Input Section -->
      <div class="space-y-2">
        <p class="text-[8px] font-bold text-slate-300 uppercase tracking-widest text-center">Personalizada</p>
        <div class="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all">
          <div class="flex items-center flex-grow pl-2">
            <span class="text-slate-300 font-bold text-xs mr-1">#</span>
            <input 
              type="text" 
              v-model="customColorInput"
              @input="updateFromCustom"
              class="w-full bg-transparent border-none text-[11px] font-bold text-slate-600 uppercase focus:ring-0 p-0 tracking-tight"
              placeholder="F1F5F9"
            />
          </div>
          
          <div class="relative w-7 h-7 rounded-md border border-slate-100 overflow-hidden shrink-0 group transition-all">
            <div 
              class="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-50 transition-opacity" 
              :class="isDark(currentColor) ? 'text-white' : 'text-black'"
            >
              <Icon name="lucide:pipette" class="w-3 h-3" />
            </div>
            <input 
              type="color" 
              v-model="currentColor"
              @input="customColorInput = currentColor"
              class="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer opacity-0 z-20"
            />
            <div class="absolute inset-0" :style="{ backgroundColor: currentColor }"></div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col gap-1.5 pt-1">
        <button 
          @click="handleSave"
          class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] uppercase tracking-[1px] shadow-sm transition-all active:scale-[0.98]"
        >
          Confirmar Escolha
        </button>
        <button 
          @click="handleClose"
          class="w-full py-1 text-slate-400 hover:text-slate-500 font-bold text-[8px] uppercase tracking-widest transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
input[type="color"]::-webkit-color-swatch { border: none; }
</style>
