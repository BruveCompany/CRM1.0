<template>
  <NuxtLayout>
    <div class="min-h-screen bg-white p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Profissionais</h1>
      <TabelaProfissionais 
        :profissionais="profissionais"
        @add-profissional="abrirModalAdicionar"
        @editar-profissional="abrirModalEditar"
        @deletar-profissional="abrirModalDeletar"
      />
      
      <!-- Modal Adicionar/Editar Profissional -->
      <ModalProfissional
        v-model="modalProfissionalAberto"
        :perfis="perfis"
        :especialidades="especialidades"
        :is-edicao="isEdicao"
        :profissional-inicial="profissionalSelecionado"
        :loading="loadingModal"
        @confirmar="salvarProfissional"
        @cancelar="fecharModal"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { AgProfissional, AgPerfil } from '../../shared/types/database'
import type { Especialidade } from '../../shared/types/Especialidade'

// Composable para gerenciar operações relacionadas a profissionais
const { fetchProfissionais, fetchPerfis, fetchEspecialidades } = useProfissionais()

// Estado reativo: lista de profissionais carregados do banco de dados
const profissionais = ref<AgProfissional[]>([])

// Estado reativo: lista de perfis disponíveis para seleção
const perfis = ref<AgPerfil[]>([])

// Estado reativo: lista de especialidades disponíveis para seleção
const especialidades = ref<Especialidade[]>([])

// Controle do modal
const modalProfissionalAberto = ref(false)
const isEdicao = ref(false)
const loadingModal = ref(false)
const profissionalSelecionado = ref<AgProfissional | null>(null)

/**
 * Lifecycle hook: carrega todos os dados necessários ao montar o componente
 * - Profissionais cadastrados
 * - Perfis disponíveis (para dropdown)
 * - Especialidades disponíveis (para dropdown)
 */
onMounted(async () => {
  try {
    // Busca dados em paralelo para otimizar carregamento
    const [profissionaisData, perfisData, especialidadesData] = await Promise.all([
      fetchProfissionais(),
      fetchPerfis(),
      fetchEspecialidades()
    ])
    
    profissionais.value = profissionaisData
    perfis.value = perfisData
    especialidades.value = especialidadesData
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  }
})

/**
 * Abre modal para adicionar novo profissional
 */
function abrirModalAdicionar() {
  isEdicao.value = false
  profissionalSelecionado.value = null
  modalProfissionalAberto.value = true
}

/**
 * Abre modal para editar profissional existente
 */
function abrirModalEditar(profissional: AgProfissional) {
  isEdicao.value = true
  profissionalSelecionado.value = profissional
  modalProfissionalAberto.value = true
}

/**
 * Abre modal de confirmação para deletar profissional
 */
function abrirModalDeletar(profissional: AgProfissional) {
  // TODO: Implementar modal de confirmação de exclusão
  console.log('Deletar profissional:', profissional)
}

/**
 * Fecha o modal e limpa o estado
 */
function fecharModal() {
  modalProfissionalAberto.value = false
  profissionalSelecionado.value = null
}

/**
 * Salva profissional (adicionar ou editar)
 * TODO: Implementar lógica de salvamento no banco
 */
function salvarProfissional(dados: any) {
  console.log('Salvar profissional:', dados)
  // A lógica de salvamento será implementada posteriormente
}

useHead({
  title: 'Profissionais'
})
</script>
