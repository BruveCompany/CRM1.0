<template>
  <BaseModal id="modal-selecionar-profissional" v-model="modeloVisivel" size="md">
    <template #header>
      <div class="flex flex-col gap-0.5">
        <h3 class="text-base font-semibold text-neutral-900 tracking-tight">Selecionar Profissional</h3>
        <p class="text-[11px] text-neutral-400">Selecione um membro da equipe para visualizar a agenda</p>
      </div>
    </template>

    <div class="flex flex-col gap-4 py-2">
      <!-- Opção "Todos os Profissionais" -->
      <button
        type="button"
        class="todos-btn"
        :class="!profissionalAtualId ? 'todos-btn--ativo' : ''"
        @click="selecionarTodos"
      >
        <div class="todos-icon" :class="!profissionalAtualId ? 'todos-icon--ativo' : ''">
          <Icon name="lucide:users" class="w-4 h-4" />
        </div>

        <div class="flex-1 text-left">
          <div class="text-[13px] font-semibold text-neutral-800 leading-tight">Todos os Profissionais</div>
          <div class="text-[10px] text-neutral-400 font-medium uppercase tracking-widest mt-0.5">Visão Geral</div>
        </div>

        <Icon v-if="!profissionalAtualId" name="lucide:check" class="w-4 h-4 text-neutral-500 shrink-0" />
      </button>

      <!-- Grade de Profissionais -->
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="prof in profissionais"
          :key="prof.profissional_id"
          type="button"
          class="prof-card"
          :class="String(prof.profissional_id) === String(profissionalAtualId) ? 'prof-card--ativo' : ''"
          @click="selecionar(prof)"
        >
          <!-- Inicial -->
          <div
            class="prof-initial"
            :class="String(prof.profissional_id) === String(profissionalAtualId) ? 'prof-initial--ativo' : ''"
          >
            {{ (prof.nome || '?').charAt(0) }}
          </div>

          <div class="flex-1 text-left min-w-0">
            <div class="text-[13px] font-semibold text-neutral-800 leading-tight truncate">
              {{ prof.nome }}
            </div>
            <div class="text-[10px] font-medium text-neutral-400 uppercase tracking-widest mt-0.5 truncate">
              {{ prof.especialidade }}
            </div>
          </div>

          <Icon
            v-if="String(prof.profissional_id) === String(profissionalAtualId)"
            name="lucide:check"
            class="w-4 h-4 text-neutral-500 shrink-0"
          />
        </button>
      </div>

      <!-- Fallback -->
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
/* Botão "Todos os Profissionais" */
.todos-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #E4E2F6;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
  text-align: left;
}

.todos-btn:hover {
  background: #F3F2FB;
}

.todos-btn--ativo {
  background: #F3F2FB;
  border-color: #C7C3EC;
}

.todos-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #ECEAF7;
  color: #9691D4;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.12s, color 0.12s;
}

.todos-icon--ativo {
  background: #4338CA;
  color: white;
}

/* Cards de profissional */
.prof-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #E4E2F6;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
  text-align: left;
  overflow: hidden;
}

.prof-card:hover {
  background: #F3F2FB;
  border-color: #C7C3EC;
}

.prof-card--ativo {
  background: #F3F2FB;
  border-color: #C7C3EC;
}

.prof-initial {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #ECEAF7;
  color: #9691D4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
  text-transform: uppercase;
  transition: background 0.12s, color 0.12s;
}

.prof-initial--ativo {
  background: #4338CA;
  color: white;
}
</style>
