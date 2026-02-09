<template>
  <div class="flex flex-col items-center justify-center gap-1">
    <!-- Estado: Carregando dados -->
    <div v-if="loading" class="text-gray-500 text-sm">
      Carregando...
    </div>
    
    <!-- Estado: Profissional encontrado -->
    <template v-else-if="profissionalAtual">
      <!-- Nome do profissional -->
      <div class="text-lg font-bold text-gray-900">
        {{ profissionalAtual.nome }}
      </div>
      <!-- Especialidade -->
      <div class="text-sm text-gray-600">
        {{ profissionalAtual.especialidade }}
      </div>
    </template>
    
    <!-- Estado: Nenhum profissional disponível -->
    <div v-else class="text-gray-500 text-sm">
      Nenhum profissional encontrado
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ================= ProfissionalAtual.vue =================
 * Componente que exibe o nome e especialidade do profissional atual
 * 
 * Lógica:
 * 1. Busca todos os profissionais cadastrados
 * 2. Se o usuário logado for profissional, exibe seus dados
 * 3. Caso contrário, exibe o primeiro profissional da lista
 * 
 * Futuras melhorias:
 * - Adicionar seletor de profissional (dropdown)
 * - Permitir trocar profissional visualizado
 * ========================================================
 */

import { useProfissionais } from '~/composables/useProfissionais'
import { useUserStore } from '~/stores/user'
import type { AgProfissional } from '../../../shared/types/database'

// Composables
const { fetchProfissionais } = useProfissionais()
const userStore = useUserStore()

// Estado local do componente
const profissionais = ref<AgProfissional[]>([]) // Lista completa de profissionais
const loading = ref(true) // Controle de carregamento

/**
 * Computed que retorna o profissional a ser exibido
 * Prioridade: 1) Profissional logado, 2) Primeiro da lista
 */
const profissionalAtual = computed(() => {
  // Se não há profissionais, retorna null
  if (profissionais.value.length === 0) return null
  
  // Tentar encontrar o profissional logado pelo profile_id
  if (userStore.profile?.id) {
    const profissionalLogado = profissionais.value.find(
      p => p.profile_id === userStore.profile?.id
    )
    // Se encontrou o profissional logado, retorna ele
    if (profissionalLogado) return profissionalLogado
  }
  
  // Fallback: Se não encontrar ou usuário não for profissional, retorna o primeiro da lista
  return profissionais.value[0]
})

/**
 * Buscar profissionais ao montar o componente
 * Executa apenas uma vez quando o componente é criado
 */
onMounted(async () => {
  try {
    profissionais.value = await fetchProfissionais()
  } catch (error) {
    console.error('Erro ao carregar profissionais:', error)
  } finally {
    loading.value = false
  }
})
</script>
