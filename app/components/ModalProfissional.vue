<template>
  <BaseModal :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900">
        {{ isEdicao ? 'Editar Profissional' : 'Novo Profissional' }}
      </h3>
    </template>
    
    <form @submit.prevent="onConfirmar" class="space-y-4">
      <!-- Dropdown Perfil -->
      <div>
        <label for="perfil-select" class="block text-sm font-medium text-gray-700 mb-1.5">
          Usuário <span class="text-red-500">*</span>
        </label>
        <select
          id="perfil-select"
          v-model="perfilSelecionado"
          required
          class="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-1.5 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:border-primary-500 focus:ring-primary-500 hover:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500"
          :disabled="isEdicao"
        >
          <option value="" disabled>Selecione um usuário</option>
          <option 
            v-for="perfil in perfis" 
            :key="perfil.id" 
            :value="perfil.id"
          >
            {{ perfil.nome }}
          </option>
        </select>
        <p v-if="isEdicao" class="text-xs text-gray-500 mt-1.5">
          O perfil não pode ser alterado após criação
        </p>
      </div>
      
      <!-- Dropdown Especialidade -->
      <div>
        <label for="especialidade-select" class="block text-sm font-medium text-gray-700 mb-1.5">
          Especialidade <span class="text-red-500">*</span>
        </label>
        <select
          id="especialidade-select"
          v-model="especialidadeSelecionada"
          required
          class="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-1.5 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:border-primary-500 focus:ring-primary-500 hover:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500"
        >
          <option value="" disabled>Selecione uma especialidade</option>
          <option 
            v-for="especialidade in especialidades" 
            :key="especialidade.id" 
            :value="especialidade.id"
          >
            {{ especialidade.especialidade }}
          </option>
        </select>
      </div>
      
      <div class="flex justify-end gap-2.5">
        <BaseButton 
          variant="secondary" 
          @click="onCancelar" 
          :disabled="props.loading" 
          type="button"
        >
          Cancelar
        </BaseButton>
        <BaseButton 
          variant="primary" 
          type="submit" 
          :loading="props.loading"
        >
          {{ isEdicao ? 'Salvar' : 'Criar' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'
import type { AgProfissional, AgPerfil } from '../../shared/types/database'
import type { Especialidade } from '../../shared/types/Especialidade'

// Props
const props = defineProps<{
  modelValue: boolean
  perfis: AgPerfil[]
  especialidades: Especialidade[]
  isEdicao?: boolean
  profissionalInicial?: AgProfissional | null
  loading?: boolean
}>()

// Emits
const emit = defineEmits(['update:modelValue', 'confirmar', 'cancelar'])

// Estado reativo
const perfilSelecionado = ref<number | string>('')
const especialidadeSelecionada = ref<number | string>('')

// Watchers para preencher dados ao editar ou limpar ao adicionar novo
watch([() => props.modelValue, () => props.profissionalInicial, () => props.isEdicao], ([isOpen, profissional, edicao]) => {
  if (isOpen) {
    if (edicao && profissional) {
      // Modo edição: preenche com os IDs do profissional
      perfilSelecionado.value = profissional.profile_id
      especialidadeSelecionada.value = profissional.especialidade_id
    } else {
      // Modo criação: limpa os campos
      perfilSelecionado.value = ''
      especialidadeSelecionada.value = ''
    }
  }
}, { immediate: true })

/**
 * Confirma a operação e envia os dados
 */
function onConfirmar() {
  const dados = {
    profile_id: Number(perfilSelecionado.value),
    especialidade_id: Number(especialidadeSelecionada.value),
    ...(props.isEdicao && props.profissionalInicial && {
      profissional_id: props.profissionalInicial.profissional_id
    })
  }
  
  console.log('ModalProfissional emit confirmar', dados)
  emit('confirmar', dados)
}

/**
 * Cancela a operação e fecha o modal
 */
function onCancelar() {
  emit('cancelar')
  emit('update:modelValue', false)
}
</script>
