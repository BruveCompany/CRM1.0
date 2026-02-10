<template>
  <!-- Dropdown pesquisável de clientes -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">
      Cliente <span class="text-red-500">*</span>
    </label>
    <div class="relative" ref="dropdownRef">
      <!-- Input de busca -->
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon class="h-4 w-4 text-gray-400" />
        </div>
        <input
          v-model="busca"
          type="text"
          placeholder="Digite para pesquisar ou selecione um cliente"
          class="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          @focus="dropdownAberto = true"
          @input="dropdownAberto = true"
        />
      </div>
      
      <!-- Cliente selecionado (tag) -->
      <div 
        v-if="clienteObj && !dropdownAberto"
        class="absolute inset-0 flex items-center px-3 bg-white border border-gray-300 rounded-lg cursor-pointer"
        @click="dropdownAberto = true; busca = ''"
      >
        <span class="text-sm text-gray-700 truncate flex-1">
          {{ clienteObj.nome }} - {{ clienteObj.cpf || 'Sem CPF' }}
        </span>
        <button 
          type="button" 
          class="text-gray-400 hover:text-gray-600 ml-1"
          @click.stop="limpar"
        >
          ✕
        </button>
      </div>
      
      <!-- Lista de opções filtradas -->
      <ul
        v-if="dropdownAberto && clientesFiltrados.length > 0"
        class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-52 overflow-y-auto"
      >
        <li
          v-for="cliente in clientesFiltrados"
          :key="cliente.id"
          class="px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
          @mousedown.prevent="selecionar(cliente)"
        >
          <p class="text-sm font-medium text-gray-800">{{ cliente.nome }}</p>
          <p v-if="cliente.cpf" class="text-xs text-gray-500">CPF: {{ cliente.cpf }}</p>
          <p v-if="cliente.email" class="text-xs text-blue-500">{{ cliente.email }}</p>
        </li>
      </ul>
      
      <!-- Nenhum resultado -->
      <ul
        v-if="dropdownAberto && busca && clientesFiltrados.length === 0"
        class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
      >
        <li class="px-3 py-1.5 text-sm text-gray-500 italic">
          Nenhum cliente encontrado
        </li>
      </ul>
    </div>
    <p class="text-xs text-gray-500 mt-1">
      Não encontrou o cliente? 
      <button type="button" class="text-indigo-600 hover:text-indigo-800 font-medium" @click="emit('cadastrar')">Cadastrar novo cliente</button>
    </p>
  </div>
</template>

<script setup lang="ts">
/**
 * ================= SeletorCliente.vue =================
 * Componente reusável de dropdown pesquisável para clientes.
 * 
 * Exibe lista de clientes com busca por nome/CPF,
 * tag do cliente selecionado e link para cadastro.
 * 
 * Props:
 * @param {string} modelValue - ID do cliente selecionado (string)
 * @param {AgCliente[]} clientes - Lista completa de clientes
 * 
 * Emits:
 * @event update:modelValue - Emitido ao selecionar/limpar cliente
 * @event cadastrar - Emitido ao clicar em "Cadastrar novo cliente"
 * ======================================================
 */

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import type { AgCliente } from '../../shared/types/database'

interface Props {
  modelValue: string
  clientes: AgCliente[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'cadastrar'])

// Estado interno
const busca = ref('')
const dropdownAberto = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

/**
 * Filtra a lista de clientes pelo texto digitado (nome ou CPF)
 */
const clientesFiltrados = computed(() => {
  const termo = busca.value.toLowerCase().trim()
  if (!termo) return props.clientes
  return props.clientes.filter((c) => {
    const nome = c.nome?.toLowerCase() || ''
    const cpf = c.cpf?.toLowerCase() || ''
    return nome.includes(termo) || cpf.includes(termo)
  })
})

/**
 * Retorna o objeto do cliente selecionado (para exibir a tag)
 */
const clienteObj = computed(() => {
  if (!props.modelValue) return null
  return props.clientes.find((c) => String(c.id) === String(props.modelValue)) || null
})

/**
 * Seleciona um cliente da lista e fecha o dropdown
 */
function selecionar(cliente: AgCliente) {
  emit('update:modelValue', String(cliente.id))
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
 * Reseta o estado interno (chamado pelo pai ao fechar modal)
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
