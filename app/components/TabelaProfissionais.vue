<template>
  <div class="tabela-profissionais-container">
    <!-- Botão para criar novo profissional -->
    <div class="flex justify-end mb-4">
      <BaseButton
        variant="primary"
        @click="isAdmin && $emit('add-profissional')"
        :disabled="!isAdmin"
        :class="!isAdmin ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''"
      >
        <PlusIcon class="w-5 h-5 mr-2" />
        <span class="font-semibold">Criar Profissional</span>
      </BaseButton>
    </div>
    
    <!-- Tabela de listagem de profissionais -->
    <table class="min-w-full bg-white border-separate border-spacing-0 bg-white rounded-lg">
      <!-- Cabeçalho da tabela -->
      <thead>
        <tr class="tabela-header">
          <th class="tabela-coluna-header px-4 py-2 text-left">ID</th>
          <th class="tabela-coluna-header px-4 py-2 text-left">Nome</th>
          <th class="tabela-coluna-header px-4 py-2 text-left">Especialidade</th>
          <th class="tabela-coluna-header px-4 py-2 text-left">Ações</th>
        </tr>
      </thead>
      
      <!-- Corpo da tabela com lista de profissionais -->
      <tbody>
        <tr
          v-for="profissional in profissionais"
          :key="profissional.profissional_id"
          class="tabela-linha transition-shadow duration-200 hover:shadow-sm hover:bg-neutral-50"
        >
          <td class="tabela-coluna px-4 py-2 border-t border-neutral-200">{{ profissional.profissional_id }}</td>
          <td class="tabela-coluna px-4 py-2 border-t border-neutral-200">{{ profissional.nome }}</td>
          <td class="tabela-coluna px-4 py-2 border-t border-neutral-200">{{ profissional.especialidade }}</td>
          <td class="tabela-coluna px-4 py-2 border-t border-neutral-200 flex gap-2">
            <!-- Botão Editar -->
            <button
              class="p-1 rounded hover:bg-neutral-100"
              :class="!isAdmin ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''"
              title="Editar"
              :disabled="!isAdmin"
              @click="isAdmin && $emit('editar-profissional', { profissional_id: profissional.profissional_id, profile_id: profissional.profile_id, nome: profissional.nome, especialidade_id: profissional.especialidade_id, especialidade: profissional.especialidade })"
            >
              <PencilSquareIcon class="w-5 h-5 text-blue-600" />
            </button>
            
            <!-- Botão Deletar -->
            <button
              class="p-1 rounded hover:bg-neutral-100"
              :class="!isAdmin ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''"
              title="Excluir"
              :disabled="!isAdmin"
              @click="isAdmin && $emit('deletar-profissional', { profissional_id: profissional.profissional_id, nome: profissional.nome })"
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
