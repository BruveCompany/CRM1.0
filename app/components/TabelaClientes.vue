<template>
  <div>
    <!-- Botão de adicionar cliente -->
    <div class="flex justify-end mb-4">
      <BaseButton
        variant="primary"
        @click="$emit('add-cliente')"
      >
        <PlusIcon class="w-5 h-5 mr-2" />
        <span class="font-semibold">Adicionar Cliente</span>
      </BaseButton>
    </div>
    
    <!-- Tabela de clientes -->
    <table class="min-w-full bg-white border-separate border-spacing-0 bg-white rounded-lg">
      <thead>
        <tr>
          <th class="px-4 py-2 text-left">ID</th>
          <th class="px-4 py-2 text-left">Nome</th>
          <th class="px-4 py-2 text-left">CPF</th>
          <th class="px-4 py-2 text-left">Email</th>
          <th class="px-4 py-2 text-left">Telefone</th>
          <th class="px-4 py-2 text-left">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="cliente in clientes"
          :key="cliente.id"
          class="transition-shadow duration-200 hover:shadow-sm hover:bg-neutral-50"
        >
          <td class="px-4 py-2 border-t border-neutral-200">{{ cliente.id }}</td>
          <td class="px-4 py-2 border-t border-neutral-200">{{ cliente.nome }}</td>
          <td class="px-4 py-2 border-t border-neutral-200">{{ cliente.cpf }}</td>
          <td class="px-4 py-2 border-t border-neutral-200">{{ cliente.email }}</td>
          <td class="px-4 py-2 border-t border-neutral-200">{{ cliente.telefone }}</td>
          <td class="px-4 py-2 border-t border-neutral-200 flex gap-2">
            <!-- Botão Editar -->
            <button
              class="p-1 rounded hover:bg-neutral-100"
              title="Editar"
              @click="$emit('editar-cliente', cliente)"
            >
              <PencilSquareIcon class="w-5 h-5 text-blue-600" />
            </button>
            <!-- Botão Excluir -->
            <button
              class="p-1 rounded hover:bg-neutral-100"
              title="Excluir"
              @click="$emit('deletar-cliente', cliente)"
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
