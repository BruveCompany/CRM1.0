<template>
  <!-- Dropdown pesquisável de profissionais -->
  <div>
    <label class="block text-sm font-medium text-neutral-700 mb-1">
      Profissional
    </label>
    <div class="relative" ref="dropdownRef">
      <!-- Input de busca -->
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon class="h-4 w-4 text-neutral-400" />
        </div>
        <input
          v-model="busca"
          type="text"
          placeholder="Digite para pesquisar ou selecione um profissional"
          class="w-full pl-9 pr-3 py-1.5 border border-neutral-300 rounded-sm text-sm hover:border-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-700 focus:border-primary-700 transition-all"
          @focus="dropdownAberto = true"
          @input="dropdownAberto = true"
        />
      </div>
      
      <!-- Profissional selecionado (tag) -->
      <div 
        v-if="profissionalObj && !dropdownAberto"
        class="absolute inset-0 flex items-center px-3 bg-white border border-neutral-300 rounded-sm cursor-pointer hover:border-primary-700 transition-colors"
        @click="dropdownAberto = true; busca = ''"
      >
        <span class="text-sm text-neutral-700 truncate flex-1">
          {{ profissionalObj.nome }} - {{ profissionalObj.especialidade }}
        </span>
        <button 
          type="button" 
          class="text-neutral-400 hover:text-neutral-600 ml-1"
          @click.stop="limpar"
        >
          ✕
        </button>
      </div>
      
      <!-- Lista de opções filtradas -->
      <ul
        v-if="dropdownAberto && profissionaisFiltrados.length > 0"
        class="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-sm shadow-lg max-h-80 overflow-y-auto"
      >
        <li
          v-for="profissional in profissionaisFiltrados"
          :key="profissional.profissional_id"
          class="px-3 py-2 cursor-pointer hover:bg-primary-700/10 hover:border-primary-700/30 transition-colors border-b border-neutral-100 last:border-b-0"
          @mousedown.prevent="selecionar(profissional)"
        >
          <p class="text-sm font-medium text-neutral-800">{{ profissional.nome }}</p>
          <p class="text-xs text-neutral-500">{{ profissional.especialidade }}</p>
        </li>
      </ul>
      
      <!-- Nenhum resultado -->
      <ul
        v-if="dropdownAberto && busca && profissionaisFiltrados.length === 0"
        class="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-sm shadow-lg"
      >
        <li class="px-3 py-1.5 text-sm text-neutral-500 italic">
          Nenhum profissional encontrado
        </li>
      </ul>
    </div>
    <p class="text-xs text-neutral-400 mt-1">Selecione um profissional para filtrar os agendamentos</p>
  </div>
</template>

<script setup lang="ts">
/**
 * ================= SeletorProfissional.vue =================
 * Componente reusável de dropdown pesquisável para profissionais.
 * 
 * Exibe lista de profissionais com busca por nome/especialidade,
 * tag do profissional selecionado.
 * 
 * Props:
 * @param {string} modelValue - ID do profissional selecionado (string)
 * @param {AgProfissional[]} profissionais - Lista completa de profissionais
 * 
 * Emits:
 * @event update:modelValue - Emitido ao selecionar/limpar profissional
 * ============================================================
 */

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import type { AgProfissional } from '../../shared/types/database'

interface Props {
  modelValue: string
  profissionais: AgProfissional[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

// Estado interno
const busca = ref('')
const dropdownAberto = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

/**
 * Filtra a lista de profissionais pelo texto digitado (nome ou especialidade)
 */
const profissionaisFiltrados = computed(() => {
  const termo = busca.value.toLowerCase().trim()
  if (!termo) return props.profissionais
  return props.profissionais.filter((p) => {
    const nome = p.nome?.toLowerCase() || ''
    const especialidade = p.especialidade?.toLowerCase() || ''
    return nome.includes(termo) || especialidade.includes(termo)
  })
})

/**
 * Retorna o objeto do profissional selecionado (para exibir a tag)
 */
const profissionalObj = computed(() => {
  if (!props.modelValue) return null
  return props.profissionais.find((p) => String(p.profissional_id) === String(props.modelValue)) || null
})

/**
 * Seleciona um profissional da lista e fecha o dropdown
 */
function selecionar(profissional: AgProfissional) {
  emit('update:modelValue', String(profissional.profissional_id))
  busca.value = ''
  dropdownAberto.value = false
}

/**
 * Limpa a seleção atual
 */
function limpar() {
  emit('update:modelValue', '')
  busca.value = ''
}

/**
 * Reseta o estado interno
 */
function resetar() {
  busca.value = ''
  dropdownAberto.value = false
}

/**
 * Fecha o dropdown ao clicar fora dele
 */
function handleClickFora(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    dropdownAberto.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickFora)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickFora)
})

// Expõe método resetar para o componente pai
defineExpose({ resetar })
</script>
