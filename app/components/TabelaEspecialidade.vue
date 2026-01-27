<template>
  <div>
    <div class="flex justify-end mb-4" v-if="isAdmin">
      <BaseButton variant="primary" @click="$emit('add-especialidade')">
        <PlusIcon class="w-5 h-5 mr-2" />
        <span class="font-semibold">Adicionar Especialidade</span>
      </BaseButton>
    </div>
    <table class="min-w-full bg-white border-separate border-spacing-0 bg-white rounded-lg">
      <thead>
        <tr>
          <th class="px-4 py-2 text-left">ID</th>
          <th class="px-4 py-2 text-left">Especialidade</th>
          <th v-if="isAdmin" class="px-4 py-2 text-left">Ação</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in especialidades" :key="item.id">
          <td class="px-4 py-2 border-t border-gray-200">{{ item.id }}</td>
          <td class="px-4 py-2 border-t border-gray-200">{{ item.especialidade }}</td>
          <td class="px-4 py-2 border-t border-gray-200 flex gap-2">
            <template v-if="isAdmin">
              <button class="p-1 rounded hover:bg-gray-100" title="Editar" @click="$emit('editar-especialidade', { id: item.id, especialidade: item.especialidade })">
                <PencilSquareIcon class="w-5 h-5 text-blue-600" />
              </button>
              <button class="p-1 rounded hover:bg-gray-100" title="Deletar" @click="$emit('deletar-especialidade', { id: item.id, especialidade: item.especialidade })">
                <TrashIcon class="w-5 h-5 text-red-600" />
              </button>
            </template>
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
