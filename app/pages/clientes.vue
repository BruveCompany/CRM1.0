<template>
  <NuxtLayout>
    <div class="min-h-screen bg-white p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Clientes</h1>
      <div class="flex justify-end mb-4">
        <BaseButton variant="primary">
          <PlusIcon class="w-5 h-5 mr-2" />
            <span>Cadastrar Novo Usuário</span>
        </BaseButton>
      </div>
      <div v-if="loading" class="text-gray-500">Carregando...</div>
      <table v-else class="min-w-full bg-white border-separate border-spacing-0 rounded-lg">
        <thead>
          <tr>
              <th class="px-4 py-2 text-left">ID</th>
              <th class="px-4 py-2 text-left">Nome</th>
              <th class="px-4 py-2 text-left">Perfil</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="perfil in perfis" :key="perfil.id" class="hover:bg-gray-50">
            <td class="px-4 py-2 border-t border-gray-200">{{ perfil.id }}</td>
            <td class="px-4 py-2 border-t border-gray-200">{{ perfil.nome }}</td>
            <td class="px-4 py-2 border-t border-gray-200">{{ perfil.role }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
//Imports
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import BaseButton from '../components/BaseButton.vue'
import { PlusIcon } from '@heroicons/vue/24/outline'

//Estado
const perfis = ref<any[]>([])
const loading = ref(true)

//Funções
const supabase = useSupabaseClient()
async function fetchPerfis() {
  loading.value = true
  const { data, error } = await supabase.from('ag_profiles').select('id, nome, role').order('id', { ascending: true })
  if (!error && data) {
    perfis.value = data
  }
  loading.value = false
}

//Carregar dados
onMounted(fetchPerfis)

//Head
useHead({
  title: 'Clientes'
})
</script>
