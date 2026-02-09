<template>
  <BaseModal :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900">
        {{ isEdicao ? 'Editar Cliente' : 'Novo Cliente' }}
      </h3>
    </template>
    
    <form @submit.prevent="onConfirmar" class="space-y-4">
      <!-- Campo CPF com máscara -->
      <div>
        <InputCPF
          v-model="cpf"
          label="CPF"
          required
          size="md"
          :disabled="isEdicao"
        />
      </div>
      
      <!-- Campo Nome -->
      <div>
        <BaseInput
          v-model="nome"
          label="Nome Completo"
          placeholder="Digite o nome completo"
          required
          size="md"
        />
      </div>
      
      <!-- Campo Email com validação -->
      <div>
        <InputEmail
          v-model="email"
          label="Email"
          size="md"
        />
      </div>
      
      <!-- Campo Telefone com máscara -->
      <div>
        <InputPhone
          v-model="telefone"
          label="Telefone"
          size="md"
        />
      </div>
      
      <!-- Campo Endereço -->
      <div>
        <BaseInput
          v-model="endereco"
          label="Endereço"
          placeholder="Rua, número, bairro, cidade"
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
/**
 * ================= ModalCliente.vue =================
 * Modal para criar ou editar clientes
 * 
 * Props:
 * - modelValue: Controla visibilidade do modal
 * - isEdicao: Define se é edição (true) ou criação (false)
 * - id: ID do cliente (apenas em modo edição)
 * - clienteInicial: Dados iniciais do cliente para edição
 * - loading: Estado de carregamento durante submit
 * 
 * Emits:
 * - update:modelValue: Atualiza estado de abertura/fechamento
 * - confirmar: Disparado ao confirmar (envia dados do cliente)
 * - cancelar: Disparado ao cancelar
 * 
 * Campos com validação:
 * - CPF (obrigatório, apenas números, máscara XXX.XXX.XXX-XX, desabilitado em edição)
 * - Nome (obrigatório)
 * - Email (opcional, validação de formato com @)
 * - Telefone (opcional, máscara (XX) XXXXX-XXXX)
 * - Endereço (opcional)
 * ====================================================
 */

//Imports
import { ref, watch } from 'vue'
import type { AgCliente } from '../../shared/types/database'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'
import BaseInput from './BaseInput.vue'
import InputCPF from './InputCPF.vue'
import InputEmail from './InputEmail.vue'
import InputPhone from './InputPhone.vue'

//Props e emits
const props = defineProps<{
  modelValue: boolean
  isEdicao?: boolean
  id?: number
  clienteInicial?: AgCliente
  loading?: boolean
}>()
const emit = defineEmits(['update:modelValue', 'confirmar', 'cancelar'])

//Estado reativo
const cpf = ref('')
const nome = ref('')
const email = ref('')
const telefone = ref('')
const endereco = ref('')

/**
 * Watcher para preencher ou limpar campos ao abrir o modal
 * Modo edição: preenche com dados do clienteInicial
 * Modo criação: limpa todos os campos
 */
watch([() => props.modelValue, () => props.clienteInicial, () => props.isEdicao], ([isOpen, inicial, edicao]) => {
  if (isOpen) {
    if (edicao && inicial) {
      // Modo edição: preenche com os valores iniciais
      cpf.value = inicial.cpf || ''
      nome.value = inicial.nome || ''
      email.value = inicial.email || ''
      telefone.value = inicial.telefone || ''
      endereco.value = inicial.endereco || ''
    } else {
      // Modo criação: limpa todos os campos
      cpf.value = ''
      nome.value = ''
      email.value = ''
      telefone.value = ''
      endereco.value = ''
    }
  }
}, { immediate: true })

/**
 * Submete o formulário e emite evento confirmar com os dados
 */
function onConfirmar() {
  emit('confirmar', {
    id: props.id,
    cpf: cpf.value,
    nome: nome.value,
    email: email.value || undefined,
    telefone: telefone.value || undefined,
    endereco: endereco.value || undefined
  })
}

/**
 * Cancela a operação e fecha o modal
 */
function onCancelar() {
  emit('cancelar')
  emit('update:modelValue', false)
}
</script>
