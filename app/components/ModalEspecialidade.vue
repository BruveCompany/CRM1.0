<template>
  <BaseModal :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900">
        {{ isEdicao ? 'Editar Especialidade' : 'Nova Especialidade' }}
      </h3>
    </template>
    
    <form @submit.prevent="onConfirmar" class="space-y-4">
      <div>
        <BaseInput
          v-model="especialidade"
          label="Nome da Especialidade"
          placeholder="Digite o nome da especialidade"
          required
          size="md"
        />
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
          {{ isEdicao ? 'Atualizar' : 'Criar' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
//Imports
import { ref, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'
import BaseInput from './BaseInput.vue'

//Props e emits
const props = defineProps<{
  modelValue: boolean
  isEdicao?: boolean
  id?: number
  especialidadeInicial?: string
  loading?: boolean
}>()
const emit = defineEmits(['update:modelValue', 'confirmar', 'cancelar'])

//Estado reativo
const especialidade = ref('')

//Watchers
watch([() => props.modelValue, () => props.especialidadeInicial, () => props.isEdicao], ([isOpen, inicial, edicao]) => {
  if (isOpen) {
    if (edicao && inicial) {
      // Modo edição: preenche com o valor inicial
      especialidade.value = inicial
    } else {
      // Modo criação: limpa o campo
      especialidade.value = ''
    }
  }
}, { immediate: true })

//Funções
function onConfirmar() {
  console.log('ModalEspecialidade emit confirmar', { especialidade: especialidade.value, id: props.id })
  emit('confirmar', { especialidade: especialidade.value, id: props.id })
}
function onCancelar() {
  emit('cancelar')
  emit('update:modelValue', false)
}
</script>
