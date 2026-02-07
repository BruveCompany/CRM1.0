<template>
  <NuxtLayout>
    <div class="min-h-screen bg-white p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Profissionais</h1>
      <TabelaProfissionais :profissionais="profissionais" />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { AgProfissional } from '../../shared/types/database'

// Composable para gerenciar operações relacionadas a profissionais
const { fetchProfissionais } = useProfissionais()

// Estado reativo: lista de profissionais carregados do banco de dados
const profissionais = ref<AgProfissional[]>([])

/**
 * Lifecycle hook: carrega a lista de profissionais ao montar o componente
 * Busca todos os profissionais cadastrados via RPC ag_get_profissionais
 */
onMounted(async () => {
  profissionais.value = await fetchProfissionais()
})

useHead({
  title: 'Profissionais'
})
</script>
