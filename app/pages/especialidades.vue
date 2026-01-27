
<template>
  <NuxtLayout>
    <div class="min-h-screen bg-white p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Especialidades</h1>
      <TabelaEspecialidade
        :especialidades="especialidades"
        @add-especialidade="abrirModalAdd"
        @editar-especialidade="abrirModalEditar"
      />
      <ModalEspecialidade
        v-model="modalAberto"
        :is-edicao="isEdicao"
        :id="idEdicao"
        :especialidade-inicial="especialidadeEdicao"
        @confirmar="handleConfirmar"
        :loading="loadingAdd"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">

//Imports e tipos
import { ref, onMounted } from 'vue'
import type { Especialidade } from '../../shared/types/Especialidade'
import { useProfissionais } from '../composables/useProfissionais'
import { useNotification } from '../composables/useNotification'
import TabelaEspecialidade from '../components/TabelaEspecialidade.vue'
import ModalEspecialidade from '../components/ModalEspecialidade.vue'

//Estado reativo principal
const especialidades = ref<Especialidade[]>([])
const modalAberto = ref(false)
const loadingAdd = ref(false)
const isEdicao = ref(false)
const idEdicao = ref<number | undefined>(undefined)
const especialidadeEdicao = ref<string>('')

//Composables e notificações
const { fetchEspecialidades, inserirEspecialidade, editarEspecialidade } = useProfissionais()
const { notifySuccess, notifyError } = useNotification()

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

//Confirmar (adicionar/editar)
async function handleConfirmar({ especialidade, id }: { especialidade: string, id?: number }) {
  loadingAdd.value = true
  let result
  if (isEdicao.value && idEdicao.value !== undefined) {
    result = await editarEspecialidade(idEdicao.value, especialidade)
  } else {
    result = await inserirEspecialidade(especialidade)
  }
  loadingAdd.value = false
  if (result.success) {
    modalAberto.value = false
    especialidades.value = await fetchEspecialidades()
    notifySuccess(isEdicao.value ? 'Especialidade editada com sucesso!' : 'Especialidade adicionada com sucesso!')
  } else {
    notifyError(result.message || 'Erro ao salvar especialidade')
  }
}

//Carregar dados iniciais
onMounted(async () => {
  especialidades.value = await fetchEspecialidades()
})

useHead({ title: 'Especialidades' })
</script>
