<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
      <h3 class="text-base font-semibold text-gray-900">Usuários do Sistema</h3>
      <div class="flex items-center gap-2">
        <BaseButton
          variant="secondary"
          size="sm"
          @click="loadData"
          :loading="loading"
          title="Atualizar lista"
        >
          <ArrowPathIcon :class="['w-4 h-4', loading ? 'animate-spin' : '']" />
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          @click="showModal = true"
        >
          <UserPlusIcon class="w-4 h-4 mr-2" />
          Novo Usuário
        </BaseButton>
      </div>
    </div>

    <!-- Modal Novo Usuário -->
    <ModalNovoUsuario v-model="showModal" @success="loadData" />
    
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
              Status
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Última Ativ.
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="loading && perfis.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
              Carregando usuários...
            </td>
          </tr>
          <tr v-else-if="perfis.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
              Nenhum usuário encontrado.
            </td>
          </tr>
          <tr v-for="perfil in perfis" :key="perfil.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ String(perfil.id).substring(0, 8) }}...
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ perfil.nome }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ perfil.email }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span :class="[
                'px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-md items-center gap-1.5',
                (perfil as any).is_online_calculated ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
              ]">
                <span :class="['w-2 h-2 rounded-full', (perfil as any).is_online_calculated ? 'bg-green-500 animate-pulse' : 'bg-slate-400']"></span>
                {{ (perfil as any).is_online_calculated ? 'Online' : 'Offline' }}
              </span>
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
              <div v-if="(perfil as any).last_activity" class="flex flex-col">
                <span class="text-xs">{{ new Date((perfil as any).last_activity).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }}</span>
                <span class="text-[10px] text-gray-400">{{ new Date((perfil as any).last_activity).toLocaleDateString('pt-BR') }}</span>
              </div>
              <span v-else>-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserPlusIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import type { AgPerfil } from '../../shared/types/database'

const { fetchPerfis } = useProfissionais()
const perfis = ref<AgPerfil[]>([])
const loading = ref(true)
const showModal = ref(false)
let refreshInterval: any = null

const loadData = async () => {
  try {
    const data = await fetchPerfis()
    perfis.value = data
  } catch (error) {
    console.error('Erro ao carregar perfis:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadData()
})
</script>
