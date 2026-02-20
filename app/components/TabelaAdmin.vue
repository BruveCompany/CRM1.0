<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
      <h3 class="text-base font-semibold text-gray-900">Usuários do Sistema</h3>
      <BaseButton
        variant="primary"
        size="sm"
        @click="showModal = true"
      >
        <UserPlusIcon class="w-4 h-4 mr-2" />
        Novo Usuário
      </BaseButton>
    </div>

    <!-- Modal Novo Usuário -->
    <ModalNovoUsuario v-model="showModal" />
    
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nome
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Criado em
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="loading">
            <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
              Carregando usuários...
            </td>
          </tr>
          <tr v-else-if="perfis.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
              Nenhum usuário encontrado.
            </td>
          </tr>
          <tr v-for="perfil in perfis" :key="perfil.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ perfil.id }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ perfil.nome }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ perfil.email }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span :class="[
                'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                perfil.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
              ]">
                {{ perfil.role === 'admin' ? 'Administrador' : 'Usuário' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ new Date(perfil.created_at).toLocaleDateString('pt-BR') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserPlusIcon } from '@heroicons/vue/24/outline'
import type { AgPerfil } from '../../shared/types/database'

const { fetchPerfis } = useProfissionais()
const perfis = ref<AgPerfil[]>([])
const loading = ref(true)
const showModal = ref(false)

onMounted(async () => {
  try {
    perfis.value = await fetchPerfis()
  } catch (error) {
    console.error('Erro ao carregar perfis:', error)
  } finally {
    loading.value = false
  }
})
</script>
