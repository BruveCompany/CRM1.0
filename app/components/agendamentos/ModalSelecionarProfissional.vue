<template>
  <BaseModal id="modal-selecionar-profissional" v-model="modeloVisivel" size="md">
    <template #header>
      <div class="flex flex-col gap-0.5">
        <h3 class="text-lg font-semibold text-neutral-900 tracking-tight">Selecionar Profissional</h3>
        <p class="text-[11px] text-neutral-500 font-normal">Selecione um membro da equipe para visualizar a agenda</p>
      </div>
    </template>

    <div class="flex flex-col gap-5 py-2">
      <!-- Opção "Geral/Todos" em destaque - Cores do Sistema -->
      <button
        type="button"
        class="flex items-center gap-4 w-full px-4 py-3 border transition-all rounded-xl relative group"
        :class="!profissionalAtualId
          ? 'bg-primary-50 border-primary-200 ring-1 ring-primary-500/20'
          : 'bg-white border-neutral-100 hover:border-primary-200 hover:bg-neutral-50'"
        @click="selecionarTodos"
      >
        <div 
          class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
          :class="!profissionalAtualId ? 'bg-primary-700 text-white' : 'bg-neutral-100 text-neutral-400'"
        >
          <UsersIcon class="w-5 h-5" />
        </div>

        <div class="flex-1 text-left">
          <div 
            class="text-[14px] font-semibold leading-tight transition-colors"
            :class="!profissionalAtualId ? 'text-primary-900' : 'text-neutral-700'"
          >
            Todos os Profissionais
          </div>
          <div class="text-[10px] text-neutral-400 font-medium uppercase tracking-widest mt-0.5">Visão Geral Consolidada</div>
        </div>

        <CheckCircleIcon v-if="!profissionalAtualId" class="w-6 h-6 text-primary-600" />
        <div v-else class="w-5 h-5 rounded-full border border-neutral-200 group-hover:border-primary-300"></div>
      </button>

      <!-- Grade de Profissionais - Sem Scroll -->
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="prof in profissionais"
          :key="prof.profissional_id"
          type="button"
          class="flex items-center gap-3 p-3 border transition-all rounded-xl group relative truncate"
          :class="String(prof.profissional_id) === String(profissionalAtualId)
            ? 'bg-primary-50 border-primary-200 ring-1 ring-primary-500/20'
            : 'bg-white border-neutral-100 hover:border-primary-200 hover:bg-neutral-50 shadow-sm shadow-black/[0.02]'"
          @click="selecionar(prof)"
        >
          <!-- Iniciais do Profissional -->
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 uppercase transition-colors"
            :class="String(prof.profissional_id) === String(profissionalAtualId) 
              ? 'bg-primary-700 text-white shadow-md shadow-primary-200' 
              : 'bg-neutral-100 text-neutral-500 group-hover:bg-primary-100 group-hover:text-primary-700'"
          >
            {{ (prof.nome || '?').charAt(0) }}
          </div>

          <div class="flex-1 text-left min-w-0">
            <div 
              class="text-[13px] font-semibold leading-tight truncate px-0.5"
              :class="String(prof.profissional_id) === String(profissionalAtualId) ? 'text-primary-900' : 'text-slate-900'"
            >
              {{ prof.nome }}
            </div>
            <div class="text-[10px] font-medium uppercase tracking-widest mt-1 truncate"
              :class="String(prof.profissional_id) === String(profissionalAtualId) ? 'text-primary-600' : 'text-slate-400'"
            >
              {{ prof.especialidade }}
            </div>
          </div>

          <CheckCircleIcon v-if="String(prof.profissional_id) === String(profissionalAtualId)" class="w-5 h-5 text-primary-600 shrink-0" />
        </button>
      </div>
      
      <!-- Fallback caso não existam profissionais -->
      <div v-if="profissionais.length === 0" class="py-6 text-center text-neutral-400 text-xs italic">
        Nenhum profissional cadastrado.
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * ================= ModalSelecionarProfissional.vue =================
 * Modal otimizado em grid para visualização completa sem scroll.
 * Cores integradas com a identidade visual do sistema (Primary).
 */

import { computed } from 'vue'
import BaseModal from '~/components/BaseModal.vue'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
import { UsersIcon } from '@heroicons/vue/24/outline'
import type { AgProfissional } from '../../../shared/types/database'

interface Props {
  modelValue: boolean
  profissionais: AgProfissional[]
  profissionalAtualId: number | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'selecionar': [profissional: AgProfissional | null]
}>()

const modeloVisivel = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})

function selecionar(prof: AgProfissional) {
  emit('selecionar', prof)
  emit('update:modelValue', false)
}

function selecionarTodos() {
  emit('selecionar', null)
  emit('update:modelValue', false)
}
</script>

<style scoped>
/* Removemos qualquer estilo de scrollbar pois o layout agora é em grade sem limites forçados */
</style>
