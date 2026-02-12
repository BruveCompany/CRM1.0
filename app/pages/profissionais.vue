<template>
  <NuxtLayout>
    <div class="min-h-screen bg-white p-8">
      <h1 class="text-3xl font-bold text-neutral-900 mb-6">Profissionais</h1>
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
      
      <!-- Modal de confirmação de exclusão -->
      <ModalConfirmacao
        :model-value="modalDeleteAberto"
        @update:modelValue="modalDeleteAberto = $event"
        titulo="Confirmar Exclusão"
        :mensagem="`Tem certeza que deseja excluir o profissional &quot;${profissionalDelete?.nome}&quot;?`"
        :loading="loadingDelete"
        @confirmar="handleConfirmarDelete"
        @cancelar="modalDeleteAberto = false"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { AgProfissional, AgPerfil } from '../../shared/types/database'
import type { AgEspecialidade } from '../../shared/types/database'
import ModalConfirmacao from '~/components/ModalConfirmacao.vue'

// Composable para gerenciar operações relacionadas a profissionais
const { fetchProfissionais, fetchPerfis, fetchEspecialidades, addProfissional, updateProfissional, deleteProfissional } = useProfissionais()

// Composable de notificações
const { notifySuccess, notifyError } = useNotification()

// Estado reativo: lista de profissionais carregados do banco de dados
const profissionais = ref<AgProfissional[]>([])

// Estado reativo: lista de perfis disponíveis para seleção
const perfis = ref<AgPerfil[]>([])

// Estado reativo: lista de especialidades disponíveis para seleção
const especialidades = ref<AgEspecialidade[]>([])

// Controle do modal de adicionar/editar
const modalProfissionalAberto = ref(false)
const isEdicao = ref(false)
const loadingModal = ref(false)
const profissionalSelecionado = ref<AgProfissional | null>(null)

// Controle do modal de exclusão
const modalDeleteAberto = ref(false)
const profissionalDelete = ref<{ profissional_id: number, nome: string } | null>(null)
const loadingDelete = ref(false)

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
function abrirModalDeletar(dados: { profissional_id: number, nome: string }) {
  profissionalDelete.value = dados
  modalDeleteAberto.value = true
}

/**
 * Confirma e executa a exclusão do profissional
 */
async function handleConfirmarDelete() {
  if (!profissionalDelete.value) return
  
  try {
    loadingDelete.value = true
    const resultado = await deleteProfissional(profissionalDelete.value.profissional_id)
    
    if (resultado.success) {
      modalDeleteAberto.value = false
      profissionalDelete.value = null
      
      // Atualiza a lista de profissionais
      profissionais.value = await fetchProfissionais()
      
      notifySuccess('Profissional excluído com sucesso!')
    } else {
      notifyError(resultado.message || 'Erro ao excluir profissional')
    }
  } catch (error: any) {
    console.error('Erro ao deletar profissional:', error)
    notifyError(error.message || 'Erro ao excluir profissional')
  } finally {
    loadingDelete.value = false
  }
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
 */
async function salvarProfissional(dados: { profile_id: number; especialidade_id: number; profissional_id?: number }) {
  try {
    loadingModal.value = true

    if (isEdicao.value && dados.profissional_id) {
      // Editar profissional existente (apenas a especialidade)
      const resultado = await updateProfissional(dados.profissional_id, dados.especialidade_id)
      
      if (resultado.success) {
        notifySuccess('Profissional atualizado com sucesso!')
        
        // Atualiza a lista de profissionais
        profissionais.value = await fetchProfissionais()
        
        // Fecha o modal
        fecharModal()
      } else {
        notifyError(resultado.message || 'Erro ao atualizar profissional')
      }
    } else {
      // Criar novo profissional
      const resultado = await addProfissional(dados.profile_id, dados.especialidade_id)
      
      if (resultado.success) {
        notifySuccess('Profissional criado com sucesso!')
        
        // Atualiza a lista de profissionais
        profissionais.value = await fetchProfissionais()
        
        // Fecha o modal
        fecharModal()
      } else {
        notifyError(resultado.message || 'Erro ao criar profissional')
      }
    }
  } catch (error: any) {
    console.error('Erro ao salvar profissional:', error)
    notifyError(error.message || 'Erro ao salvar profissional')
  } finally {
    loadingModal.value = false
  }
}

useHead({
  title: 'Profissionais'
})
</script>
