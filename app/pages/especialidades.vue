
<template>
  <NuxtLayout name="default">
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Especialidades</h1>
      <p class="text-gray-600 mb-6">Cadastre e gerencie as especialidades médicas do sistema.</p>
      <TabelaEspecialidades
        :especialidades="especialidades"
        @add-especialidade="abrirModalAdd"
        @editar-especialidade="abrirModalEditar"
        @deletar-especialidade="abrirModalDeletar"
      />
      <ModalEspecialidade
        v-model="modalAberto"
        :is-edicao="isEdicao"
        :id="idEdicao"
        :especialidade-inicial="especialidadeEdicao"
        @confirmar="handleConfirmar"
        :loading="loadingAdd"
      />
      <!-- Modal de confirmação de exclusão agora padronizado com ModalConfirmacao.vue -->
      <ModalConfirmacao
        :model-value="modalDeleteAberto"
        @update:modelValue="modalDeleteAberto = $event"
        :titulo="'Confirmar Exclusão'"
        :mensagem="`Tem certeza que deseja excluir a especialidade ${especialidadeDelete?.especialidade}?`"
        :loading="loadingDelete"
        @confirmar="handleConfirmarDelete"
        @cancelar="modalDeleteAberto = false"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">

//Imports e tipos
import { ref, onMounted } from 'vue'
import ModalConfirmacao from '~/components/ModalConfirmacao.vue'

const modalAberto = ref(false)
const isEdicao = ref(false)
const idEdicao = ref<number | undefined>(undefined)
const especialidadeEdicao = ref<string>('')

// Adição/edição
const loadingAdd = ref(false)

// Exclusão
const modalDeleteAberto = ref(false)
const especialidadeDelete = ref<{ id: number, especialidade: string } | null>(null)
const loadingDelete = ref(false)

//Composables e notificações
const { fetchEspecialidades, addEspecialidade, updateEspecialidade, deleteEspecialidade } = useProfissionais()
const { notifySuccess, notifyError } = useNotification()

// Lista de especialidades
const especialidades = ref<Array<{ id: number, especialidade: string }>>([])

//Abrir modais
function abrirModalAdd() {
  isEdicao.value = false
  idEdicao.value = undefined
  especialidadeEdicao.value = ''
  modalAberto.value = true
}

function abrirModalEditar({ id, especialidade }: { id: number, especialidade: string }) {
  isEdicao.value = true
  idEdicao.value = id
  especialidadeEdicao.value = especialidade
  modalAberto.value = true
}

function abrirModalDeletar({ id, especialidade }: { id: number, especialidade: string }) {
  especialidadeDelete.value = { id, especialidade }
  modalDeleteAberto.value = true
}

//Confirmar (adicionar/editar)
async function handleConfirmar({ especialidade, id }: { especialidade: string, id?: number }) {
  loadingAdd.value = true
  let result
  if (isEdicao.value && idEdicao.value !== undefined) {
    result = await updateEspecialidade(idEdicao.value, especialidade)
  } else {
    result = await addEspecialidade(especialidade)
  }
  loadingAdd.value = false
  if (result.success) {
    modalAberto.value = false
    especialidades.value = (await fetchEspecialidades()).map(e => ({
      id: e.id,
      especialidade: e.especialidade ?? ''
    }))
    notifySuccess(isEdicao.value ? 'Especialidade editada com sucesso!' : 'Especialidade adicionada com sucesso!')
  } else {
    notifyError(result.message || 'Erro ao salvar especialidade')
  }
}

// Confirmar exclusão
async function handleConfirmarDelete() {
  if (!especialidadeDelete.value) return
  loadingDelete.value = true
  const result = await deleteEspecialidade(especialidadeDelete.value.id)
  loadingDelete.value = false
  if (result.success) {
    modalDeleteAberto.value = false
    especialidadeDelete.value = null
    especialidades.value = (await fetchEspecialidades()).map(e => ({
      id: e.id,
      especialidade: e.especialidade ?? ''
    }))
    notifySuccess('Especialidade excluída com sucesso!')
  } else {
    notifyError(result.message || 'Erro ao excluir especialidade')
  }
}

//Carregar dados iniciais
onMounted(async () => {
  especialidades.value = (await fetchEspecialidades()).map(e => ({
    id: e.id,
    especialidade: e.especialidade ?? ''
  }))
})

useHead({ title: 'Especialidades' })
</script>
