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
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
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
          <tr v-for="perfil in perfisEnriched" :key="perfil.id">
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
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                @click="confirmDelete(perfil)"
                class="text-error-600 hover:text-error-900 transition-colors p-1 rounded-md hover:bg-error-50"
                title="Excluir Usuário"
              >
                <TrashIcon class="w-5 h-5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Confirmação -->
    <ModalConfirmacao
      v-model="showDeleteModal"
      titulo="Excluir Usuário"
      :mensagem="`Tem certeza que deseja excluir o usuário <b>${userToDelete?.nome}</b>? <br/> Esta ação removerá o acesso ao sistema e todos os dados de perfil vinculados.`"
      :loading="isDeleting"
      variant="danger"
      @confirmar="handleDeleteUser"
    />
  </div>
</template>

<script setup lang="ts">
import { UserPlusIcon, ArrowPathIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { AgPerfil } from '../../shared/types/database'
import ModalConfirmacao from './ModalConfirmacao.vue'

const { fetchPerfis } = useProfissionais()
const { notifySuccess, notifyError } = useNotification()
const perfis = ref<AgPerfil[]>([])
const loading = ref(true)
const showModal = ref(false)

// --- DELEÇÃO ---
const showDeleteModal = ref(false)
const isDeleting = ref(false)
const userToDelete = ref<AgPerfil | null>(null)

const confirmDelete = (perfil: AgPerfil) => {
  userToDelete.value = perfil
  showDeleteModal.value = true
}

const handleDeleteUser = async () => {
  if (!userToDelete.value?.user_id) {
    notifyError('ID de autenticação não encontrado para este usuário. Recarregue a página.')
    return
  }

  isDeleting.value = true
  try {
    const response = await $fetch('/api/admin/delete-user', {
      method: 'POST',
      body: { userId: userToDelete.value.user_id }
    })

    if (response) {
      notifySuccess('Usuário excluído com sucesso')
      showDeleteModal.value = false
      await loadData()
    }
  } catch (error: any) {
    console.error('Erro ao excluir usuário:', error)
    notifyError(error.statusMessage || 'Erro ao excluir usuário')
  } finally {
    isDeleting.value = false
    userToDelete.value = null
  }
}

// --- PRESENÇA PRIME (Realtime) ---
const { onlineUsers } = usePresence()

const perfisEnriched = computed(() => {
  return perfis.value.map(p => ({
    ...p,
    // Se o ID do usuário está no mapa de sockets online, ele está online.
    // Senão, cai no fallback do banco de dados ( Heartbeat/Polling antigo)
    is_online_calculated: !!onlineUsers.value[String(p.id)] || (p as any).is_online === true
  }))
})

const loadData = async () => {
  loading.value = true;
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
