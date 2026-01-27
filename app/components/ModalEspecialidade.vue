<template>
  <BaseModal :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)">
    <template #header>
      <h3 class="text-lg font-semibold">
        {{ isEdicao ? 'Editar Especialidade' : 'Nova Especialidade' }}
      </h3>
    </template>
    <form @submit.prevent="onConfirmar">
      <div class="mb-4">
        <BaseInput
          v-model="especialidade"
          label="Especialidade"
          placeholder="Digite a especialidade"
          required
        />
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <BaseButton variant="secondary" @click="onCancelar" :disabled="props.loading" type="button">Cancelar</BaseButton>
        <BaseButton variant="primary" type="submit" :loading="props.loading">{{ isEdicao ? 'Salvar' : 'Adicionar' }}</BaseButton>
      </div>
    </form>
    <!-- Footer removido, botões só dentro do form -->
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
const especialidade = ref(props.especialidadeInicial || '')

//Watchers
watch(() => props.especialidadeInicial, (val) => {
  if (val !== undefined) especialidade.value = val
})

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
