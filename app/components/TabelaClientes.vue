<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <!-- Header with title and button -->
    <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
      <h3 class="text-base font-semibold text-gray-900">Base de Clientes</h3>
      <BaseButton
        variant="primary"
        size="sm"
        @click="$emit('add-cliente')"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        Adicionar Cliente
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
              CPF
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Telefone
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="!clientes || clientes.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500 font-medium">
              Nenhum cliente encontrado.
            </td>
          </tr>
          <tr
            v-for="cliente in clientes"
            :key="cliente.id"
            class="hover:bg-neutral-50 transition-colors duration-150"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
              {{ cliente.id || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ cliente.nome || 'N/A' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ cliente.cpf || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ cliente.email || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ cliente.telefone || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex justify-end gap-2">
                <button
                  class="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="Editar"
                  @click="$emit('editar-cliente', cliente)"
                >
                  <PencilSquareIcon class="w-5 h-5 stroke-[1.5]" />
                </button>
                
                <button
                  class="p-1.5 rounded-lg text-error-600 hover:bg-error-50 transition-colors"
                  title="Excluir"
                  @click="$emit('deletar-cliente', cliente)"
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
 * ================= TabelaClientes.vue =================
 * Componente para exibir tabela de clientes com ações de CRUD
 * 
 * Props:
 * - clientes: Array de clientes a serem exibidos
 * 
 * Emits:
 * - add-cliente: Disparado ao clicar no botão de criar cliente
 * - editar-cliente: Disparado ao clicar no botão de editar (envia objeto cliente)
 * - deletar-cliente: Disparado ao clicar no botão de excluir (envia objeto cliente)
 * 
 * Permissões:
 * - Todas as ações disponíveis para qualquer usuário logado no sistema
 * ======================================================
 */

import type { AgCliente } from '../../shared/types/database'
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/vue/24/outline'
import BaseButton from './BaseButton.vue'

/**
 * Props do componente
 * @property {AgCliente[]} clientes - Lista de clientes a serem exibidos na tabela
 */
defineProps<{ clientes: AgCliente[] }>()
</script>
