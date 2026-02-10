<template>
  <BaseModal id="modal-selecionar-profissional" v-model="modeloVisivel" size="sm">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900">Selecionar Profissional</h3>
    </template>

    <!-- Lista de profissionais -->
    <div class="flex flex-col gap-1">
      <button
        v-for="prof in profissionais"
        :key="prof.profissional_id"
        type="button"
        class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors"
        :class="prof.profissional_id === profissionalAtualId
          ? 'bg-purple-50 border border-purple-200'
          : 'hover:bg-gray-50 border border-transparent'"
        @click="selecionar(prof)"
      >
        <!-- Ícone avatar -->
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
          :class="prof.profissional_id === profissionalAtualId ? 'bg-purple-600' : 'bg-gray-400'"
        >
          {{ prof.nome.charAt(0).toUpperCase() }}
        </div>

        <!-- Nome e especialidade -->
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-gray-900 truncate">
            {{ prof.nome }}
          </div>
          <div class="text-xs text-gray-500 truncate">
            {{ prof.especialidade }}
          </div>
        </div>

        <!-- Check no selecionado -->
        <CheckIcon
          v-if="prof.profissional_id === profissionalAtualId"
          class="w-5 h-5 text-purple-600 flex-shrink-0"
        />
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * ================= ModalSelecionarProfissional.vue =================
 * Modal para selecionar um profissional da lista.
 * 
 * - Exibe todos os profissionais com nome, especialidade e avatar
 * - Destaca o profissional atualmente selecionado
 * - Ao clicar, emite o profissional escolhido e fecha o modal
 * ===================================================================
 */

import { computed } from 'vue'
import BaseModal from '~/components/BaseModal.vue'
import { CheckIcon } from '@heroicons/vue/24/solid'
import type { AgProfissional } from '../../../shared/types/database'

interface Props {
  modelValue: boolean
  profissionais: AgProfissional[]
  profissionalAtualId: number | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'selecionar': [profissional: AgProfissional]
}>()

const modeloVisivel = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})

function selecionar(prof: AgProfissional) {
  emit('selecionar', prof)
  emit('update:modelValue', false)
}
</script>
