<template>
  <!-- Seletor de cor: botão dropdown que abre popover com paleta + cor personalizada -->
  <div class="relative" ref="seletorRef">
    <label class="block text-sm font-medium text-gray-700 mb-1">Cor do Agendamento</label>
    
    <!-- Botão que mostra a cor atual -->
    <button
      type="button"
      class="w-full flex items-center gap-2.5 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      @click="aberto = !aberto"
    >
      <span
        class="w-5 h-5 rounded-full flex-shrink-0 border border-black/10"
        :style="{ backgroundColor: modelValue }"
      />
      <span class="text-gray-700 flex-1 text-left">{{ nomeDaCorAtual }}</span>
      <svg class="w-4 h-4 text-gray-400 transition-transform" :class="{ 'rotate-180': aberto }" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- Popover com paleta de cores (abre para cima) -->
    <div
      v-if="aberto"
      class="absolute z-20 bottom-full mb-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg"
    >
      <!-- Seção: Cores predefinidas -->
      <div class="p-3 pb-2">
        <p class="text-xs font-semibold text-gray-600 mb-2">Cores predefinidas</p>
        <div class="grid grid-cols-6 gap-2">
          <button
            v-for="cor in coresDisponiveis"
            :key="cor.valor"
            type="button"
            :title="cor.nome"
            class="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
            :class="modelValue === cor.valor ? 'border-gray-700 ring-2 ring-offset-1 ring-gray-300' : 'border-transparent'"
            :style="{ backgroundColor: cor.valor }"
            @click="selecionarCor(cor.valor)"
          />
        </div>
      </div>

      <!-- Divisor -->
      <div class="border-t border-gray-100 mx-3" />

      <!-- Seção: Cor personalizada -->
      <div class="p-3 pt-2">
        <p class="text-xs font-semibold text-gray-600 mb-2">Cor personalizada</p>
        <label class="flex items-center gap-2.5 cursor-pointer group">
          <span
            class="w-8 h-8 rounded-md border border-black/10 flex-shrink-0"
            :style="{ backgroundColor: modelValue }"
          />
          <span class="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">{{ modelValue }}</span>
          <input
            type="color"
            :value="modelValue"
            class="opacity-0 absolute w-0 h-0"
            @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          />
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ================= SeletorCor.vue =================
 * Componente reusável para seleção de cor de agendamento.
 * 
 * Exibe botão dropdown com a cor atual + nome.
 * Ao clicar, abre popover com duas seções:
 * - "Cores predefinidas": grade 6x2 de cores pastel
 * - "Cor personalizada": quadrado da cor + hex code + color picker nativo
 * 
 * Design baseado no layout do professor.
 * 
 * Props:
 * @param {string} modelValue - Cor selecionada (hexadecimal)
 * 
 * Emits:
 * @event update:modelValue - Emitido ao selecionar cor
 * ===================================================
 */

import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const aberto = ref(false)
const seletorRef = ref<HTMLElement | null>(null)

function selecionarCor(valor: string) {
  emit('update:modelValue', valor)
  aberto.value = false
}

function handleClickFora(event: MouseEvent) {
  if (seletorRef.value && !seletorRef.value.contains(event.target as Node)) {
    aberto.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickFora))
onBeforeUnmount(() => document.removeEventListener('click', handleClickFora))

/**
 * Paleta de cores pastel para agendamentos.
 * Tons suaves que combinam com o design do sistema.
 */
const coresDisponiveis = [
  { nome: 'Lavanda', valor: '#B4A7F5' },
  { nome: 'Menta', valor: '#A3E4B8' },
  { nome: 'Verde Claro', valor: '#B8E986' },
  { nome: 'Amarelo', valor: '#F5E680' },
  { nome: 'Pêssego', valor: '#F5C49A' },
  { nome: 'Salmão', valor: '#F5A3A3' },
  { nome: 'Azul Claro', valor: '#A3D5F5' },
  { nome: 'Lilás', valor: '#D5A3F5' },
  { nome: 'Ciano', valor: '#A3E8E0' },
  { nome: 'Rosa', valor: '#F5A3D5' },
  { nome: 'Lima', valor: '#D4F5A3' },
  { nome: 'Tangerina', valor: '#F5CDA3' }
]

/**
 * Retorna o nome amigável da cor atual para exibir no botão.
 * Se não for uma cor da paleta, mostra "Cor personalizada".
 */
const nomeDaCorAtual = computed(() => {
  const encontrada = coresDisponiveis.find((c) => c.valor === props.modelValue)
  return encontrada ? encontrada.nome : 'Cor personalizada'
})
</script>
