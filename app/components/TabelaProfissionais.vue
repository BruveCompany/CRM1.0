<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <!-- Header with title and button -->
    <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
      <h3 class="text-base font-semibold text-gray-900">Listagem de Profissionais</h3>
      <BaseButton
        variant="primary"
        size="sm"
        @click="isAdmin && $emit('add-profissional')"
        :disabled="!isAdmin"
        :class="!isAdmin ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        Criar Profissional
      </BaseButton>
    </div>
    
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
              Especialidade
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="!profissionais || profissionais.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500 font-medium">
              Nenhum profissional encontrado.
            </td>
          </tr>
          <tr
            v-for="profissional in profissionais"
            :key="profissional.profissional_id"
            class="hover:bg-neutral-50 transition-colors duration-150"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
              {{ profissional.profissional_id }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ profissional.nome }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ profissional.especialidade }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex justify-end gap-2">
                <button
                  class="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                  :class="!isAdmin ? 'opacity-30 cursor-not-allowed' : ''"
                  title="Editar"
                  :disabled="!isAdmin"
                  @click="isAdmin && $emit('editar-profissional', { ...profissional })"
                >
                  <PencilSquareIcon class="w-5 h-5 stroke-[1.5]" />
                </button>
                
                <button
                  class="p-1.5 rounded-lg text-error-600 hover:bg-error-50 transition-colors"
                  :class="!isAdmin ? 'opacity-30 cursor-not-allowed' : ''"
                  title="Excluir"
                  :disabled="!isAdmin"
                  @click="isAdmin && $emit('deletar-profissional', { profissional_id: profissional.profissional_id, nome: profissional.nome })"
                >
                  <TrashIcon class="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ================= TabelaProfissionais.vue =================
 * Componente para exibir tabela de profissionais com ações de CRUD
 * 
 * Props:
 * - profissionais: Array de profissionais a serem exibidos
 * 
 * Emits:
 * - add-profissional: Disparado ao clicar no botão de criar profissional
 * - editar-profissional: Disparado ao clicar no botão de editar (envia objeto completo do profissional)
 * - deletar-profissional: Disparado ao clicar no botão de excluir (envia {profissional_id, nome})
 * 
 * Restrições:
 * - Botões de ação habilitados apenas para usuários com role 'admin'
 * ===========================================================
 */

import type { AgProfissional } from '../../shared/types/database'
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/vue/24/outline'
import BaseButton from './BaseButton.vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../stores/user'
import { computed } from 'vue'

// Store e verificação de admin
const userStore = useUserStore()
const { userRole } = storeToRefs(userStore)

/**
 * Computed que verifica se o usuário logado é admin
 * @returns {boolean} true se role === 'admin'
 */
const isAdmin = computed(() => userRole.value === 'admin')

/**
 * Props do componente
 * @property {AgProfissional[]} profissionais - Lista de profissionais a serem exibidos na tabela
 */
defineProps<{
  profissionais: AgProfissional[]
}>()
</script>
