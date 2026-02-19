<template>
  <div>
    <!-- Botão de adicionar especialidade (visível apenas para admin) -->
    <div class="flex justify-end mb-4">
      <BaseButton
        variant="primary"
        @click="isAdmin && $emit('add-especialidade')"
        :disabled="!isAdmin"
        :class="!isAdmin ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''"
      >
        <PlusIcon class="w-5 h-5 mr-2" />
        <span class="font-semibold">Criar Especialidade</span>
      </BaseButton>
    </div>
    
    <!-- Tabela de especialidades -->
    <table class="min-w-full bg-white border-separate border-spacing-0 rounded-lg">
      <thead>
        <tr>
          <th class="px-4 py-2 text-left">ID</th>
          <th class="px-4 py-2 text-left">Especialidade</th>
          <th class="px-4 py-2 text-left">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in especialidades"
          :key="item.id"
          class="transition-shadow duration-200 hover:shadow-sm hover:bg-neutral-50"
        >
          <td class="px-4 py-2 border-t border-neutral-200">{{ item.id }}</td>
          <td class="px-4 py-2 border-t border-neutral-200">{{ item.especialidade }}</td>
          <td class="px-4 py-2 border-t border-neutral-200 flex gap-2">
            <!-- Botão Editar (desabilitado para não-admin) -->
            <button
              class="p-1 rounded hover:bg-neutral-100"
              :class="!isAdmin ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''"
              title="Editar"
              :disabled="!isAdmin"
              @click="isAdmin && $emit('editar-especialidade', { id: item.id, especialidade: item.especialidade })"
            >
              <PencilSquareIcon class="w-5 h-5 text-blue-600" />
            </button>
            <!-- Botão Excluir (desabilitado para não-admin) -->
            <button
              class="p-1 rounded hover:bg-neutral-100"
              :class="!isAdmin ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''"
              title="Excluir"
              :disabled="!isAdmin"
              @click="isAdmin && $emit('deletar-especialidade', { id: item.id, especialidade: item.especialidade })"
            >
              <TrashIcon class="w-5 h-5 text-error-600" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
/**
 * ================= TabelaEspecialidades.vue =================
 * Componente para exibir tabela de especialidades com ações de CRUD
 * 
 * Props:
 * - especialidades: Array de especialidades a serem exibidas
 * 
 * Emits:
 * - add-especialidade: Disparado ao clicar no botão de criar especialidade
 * - editar-especialidade: Disparado ao clicar no botão de editar (envia {id, especialidade})
 * - deletar-especialidade: Disparado ao clicar no botão de excluir (envia {id, especialidade})
 * 
 * Restrições:
 * - Botões de ação habilitados apenas para usuários com role 'admin'
 * ============================================================
 */

import type { AgEspecialidade } from '../../shared/types/database'
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
 * @property {AgEspecialidade[]} especialidades - Lista de especialidades a serem exibidas na tabela
 */
defineProps<{ especialidades: AgEspecialidade[] }>()
</script>
