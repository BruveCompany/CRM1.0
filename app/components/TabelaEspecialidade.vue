<template>
  <div>
    <div class="flex justify-end mb-4">
      <BaseButton
        variant="primary"
        @click="isAdmin && $emit('add-especialidade')"
        :disabled="!isAdmin"
        :class="!isAdmin ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''"
      >
        <PlusIcon class="w-5 h-5 mr-2" />
        <span class="font-semibold">Adicionar Especialidade</span>
      </BaseButton>
    </div>
    <table class="min-w-full bg-white border-separate border-spacing-0 bg-white rounded-lg">
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
          class="transition-shadow duration-200 hover:shadow-sm hover:bg-gray-50"
        >
          <td class="px-4 py-2 border-t border-gray-200">{{ item.id }}</td>
          <td class="px-4 py-2 border-t border-gray-200">{{ item.especialidade }}</td>
          <td class="px-4 py-2 border-t border-gray-200 flex gap-2">
            <button
              class="p-1 rounded hover:bg-gray-100"
              :class="!isAdmin ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''"
              title="Editar"
              :disabled="!isAdmin"
              @click="isAdmin && $emit('editar-especialidade', { id: item.id, especialidade: item.especialidade })"
            >
              <PencilSquareIcon class="w-5 h-5 text-blue-600" />
            </button>
            <button
              class="p-1 rounded hover:bg-gray-100"
              :class="!isAdmin ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''"
              title="Excluir"
              :disabled="!isAdmin"
              @click="isAdmin && $emit('deletar-especialidade', { id: item.id, especialidade: item.especialidade })"
            >
              <TrashIcon class="w-5 h-5 text-red-600" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Especialidade } from '../../shared/types/Especialidade'
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/vue/24/outline'
import BaseButton from './BaseButton.vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../stores/user'
import { computed } from 'vue'

const userStore = useUserStore()
const { userRole } = storeToRefs(userStore)
const isAdmin = computed(() => userRole.value === 'admin')

defineProps<{ especialidades: Especialidade[] }>()
</script>
