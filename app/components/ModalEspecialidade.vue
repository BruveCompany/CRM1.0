<template>
  <BaseModal :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)" @confirmar="onConfirmar" @cancelar="onCancelar">
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
    </form>
    <template #footer>
      <BaseButton variant="secondary" @click="onCancelar" :disabled="props.loading">Cancelar</BaseButton>
      <BaseButton variant="primary" @click="onConfirmar" :loading="props.loading">{{ isEdicao ? 'Salvar' : 'Adicionar' }}</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'
import BaseInput from './BaseInput.vue'

const props = defineProps<{
  modelValue: boolean
  isEdicao?: boolean
  id?: number
  especialidadeInicial?: string
  loading?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'confirmar', 'cancelar'])

const especialidade = ref(props.especialidadeInicial || '')

watch(() => props.especialidadeInicial, (val) => {
  if (val !== undefined) especialidade.value = val
})

function onConfirmar() {
  emit('confirmar', { especialidade: especialidade.value, id: props.id })
}
function onCancelar() {
  emit('cancelar')
  emit('update:modelValue', false)
}
</script>
