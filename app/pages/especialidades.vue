
<template>
  <NuxtLayout>
    <div class="min-h-screen bg-white p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Especialidades</h1>
      <TabelaEspecialidade :especialidades="especialidades" @add-especialidade="abrirModalAdd" />
      <ModalEspecialidade v-model="modalAberto" :is-edicao="false" @confirmar="onConfirmarAdd" :loading="loadingAdd" />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Especialidade } from '../../shared/types/Especialidade'
import { useProfissionais } from '../composables/useProfissionais'
import TabelaEspecialidade from '../components/TabelaEspecialidade.vue'
import ModalEspecialidade from '../components/ModalEspecialidade.vue'

const especialidades = ref<Especialidade[]>([])
const modalAberto = ref(false)
const loadingAdd = ref(false)
const { fetchEspecialidades, inserirEspecialidade } = useProfissionais()

function abrirModalAdd() {
  modalAberto.value = true
}

async function onConfirmarAdd({ especialidade }: { especialidade: string }) {
  loadingAdd.value = true
  const result = await inserirEspecialidade(especialidade)
  loadingAdd.value = false
  if (result.success) {
    modalAberto.value = false
    especialidades.value = await fetchEspecialidades()
  } else {
    alert(result.message)
  }
}

onMounted(async () => {
  especialidades.value = await fetchEspecialidades()
})

useHead({
  title: 'Especialidades'
})
</script>
