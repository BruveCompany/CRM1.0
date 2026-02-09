<template>
  <NuxtLayout>
    <div class="min-h-screen bg-white p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Clientes</h1>
      <div v-if="loading" class="text-gray-500">Carregando...</div>
      <TabelaClientes
        v-else
        :clientes="clientes"
        @add-cliente="handleAddCliente"
        @editar-cliente="handleEditarCliente"
        @deletar-cliente="handleDeletarCliente"
      />
      
      <!-- Modal de adicionar/editar cliente -->
      <ModalCliente
        v-model="modalAberto"
        :is-edicao="isEdicao"
        :id="idEdicao"
        :cliente-inicial="clienteEdicao"
        @confirmar="handleConfirmar"
        :loading="loadingModal"
      />
      
      <!-- Modal de confirmação de exclusão -->
      <ModalConfirmacao
        :model-value="modalDeleteAberto"
        @update:modelValue="modalDeleteAberto = $event"
        titulo="Confirmar Exclusão"
        :mensagem="`Tem certeza que deseja excluir o cliente &quot;${clienteDelete?.nome}&quot;?`"
        :loading="loadingDelete"
        @confirmar="handleConfirmarDelete"
        @cancelar="modalDeleteAberto = false"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
/**
 * ================= Página: Clientes =================
 * Página para gerenciamento de clientes do sistema
 * 
 * Funcionalidades:
 * - Listagem de todos os clientes cadastrados
 * - Adicionar novo cliente
 * - Editar cliente existente
 * - Deletar cliente (TODO)
 * 
 * Permissões:
 * - Ações de CRUD disponíveis para qualquer usuário logado
 * ===================================================
 */

//Imports
import { ref, onMounted } from 'vue'
import { useProfissionais } from '../composables/useProfissionais'
import { useNotification } from '../composables/useNotification'
import type { AgCliente } from '../../shared/types/database'
import TabelaClientes from '../components/TabelaClientes.vue'
import ModalCliente from '../components/ModalCliente.vue'
import ModalConfirmacao from '../components/ModalConfirmacao.vue'

//Estado - Listagem
const clientes = ref<AgCliente[]>([])
const loading = ref(true)

//Estado - Modal
const modalAberto = ref(false)
const isEdicao = ref(false)
const idEdicao = ref<number | undefined>(undefined)
const clienteEdicao = ref<AgCliente | undefined>(undefined)
const loadingModal = ref(false)

//Estado - Modal de exclusão
const modalDeleteAberto = ref(false)
const clienteDelete = ref<{ id: number, nome: string } | null>(null)
const loadingDelete = ref(false)

//Composables
const { fetchClientes, addCliente, updateCliente, deleteCliente } = useProfissionais()
const { notifySuccess, notifyError } = useNotification()

/**
 * Carrega a lista de clientes do banco de dados
 * Chamada automaticamente ao montar o componente
 */
async function carregarClientes() {
  loading.value = true
  try {
    clientes.value = await fetchClientes()
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
    notifyError('Erro ao carregar clientes')
  } finally {
    loading.value = false
  }
}

/**
 * Abre o modal para adicionar novo cliente
 */
function handleAddCliente() {
  isEdicao.value = false
  idEdicao.value = undefined
  clienteEdicao.value = undefined
  modalAberto.value = true
}

/**
 * Handler para editar cliente existente
 * Abre o modal em modo de edição com os dados do cliente
 * @param {AgCliente} cliente - Dados do cliente a ser editado
 */
function handleEditarCliente(cliente: AgCliente) {
  isEdicao.value = true
  idEdicao.value = cliente.id
  clienteEdicao.value = cliente
  modalAberto.value = true
}

/**
 * Abre modal de confirmação para deletar cliente
 */
function handleDeletarCliente(cliente: AgCliente) {
  clienteDelete.value = { id: cliente.id, nome: cliente.nome || 'Cliente sem nome' }
  modalDeleteAberto.value = true
}

/**
 * Confirma e executa a exclusão do cliente
 */
async function handleConfirmarDelete() {
  if (!clienteDelete.value) return
  
  try {
    loadingDelete.value = true
    const resultado = await deleteCliente(clienteDelete.value.id)
    
    if (resultado.success) {
      modalDeleteAberto.value = false
      clienteDelete.value = null
      
      // Recarrega a lista de clientes
      await carregarClientes()
      
      notifySuccess('Cliente excluído com sucesso!')
    } else {
      notifyError(resultado.message || 'Erro ao excluir cliente')
    }
  } catch (error: any) {
    console.error('Erro ao deletar cliente:', error)
    notifyError(error.message || 'Erro ao excluir cliente')
  } finally {
    loadingDelete.value = false
  }
}

/**
 * Confirma ação do modal (criar ou editar)
 * @param {Object} dados - Dados do formulário
 */
async function handleConfirmar(dados: any) {
  loadingModal.value = true
  
  try {
    if (isEdicao.value && dados.id) {
      // Editar cliente existente
      const resultado = await updateCliente(
        dados.id,
        dados.cpf,
        dados.nome,
        dados.endereco,
        dados.email,
        dados.telefone
      )
      
      if (resultado.success) {
        notifySuccess('Cliente atualizado com sucesso!')
        modalAberto.value = false
        await carregarClientes() // Recarrega a lista
      } else {
        notifyError(resultado.message || 'Erro ao atualizar cliente')
      }
    } else {
      // Criar novo cliente
      const resultado = await addCliente(
        dados.cpf,
        dados.nome,
        dados.endereco,
        dados.email,
        dados.telefone
      )
      
      if (resultado.success) {
        notifySuccess('Cliente criado com sucesso!')
        modalAberto.value = false
        await carregarClientes() // Recarrega a lista
      } else {
        notifyError(resultado.message || 'Erro ao criar cliente')
      }
    }
  } catch (error) {
    console.error('Erro ao salvar cliente:', error)
    notifyError('Erro ao salvar cliente')
  } finally {
    loadingModal.value = false
  }
}

//Carregar dados
onMounted(carregarClientes)

//Head
useHead({
  title: 'Clientes'
})
</script>
