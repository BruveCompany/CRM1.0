<template>
  <BaseModal :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-900">
        {{ isEdicao ? 'Editar Cliente' : 'Novo Cliente' }}
      </h3>
    </template>
    
    <form @submit.prevent="onConfirmar" class="space-y-4">
      <!-- Mensagem de erro geral -->
      <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-600">{{ errorMessage }}</p>
      </div>
      
      <!-- Campo CPF com máscara -->
      <div>
        <InputCPF
          v-model="cpf"
          label="CPF"
          required
          size="md"
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
const errorMessage = ref('')

/**
 * Remove todos os caracteres não numéricos
 */
function removeNonNumeric(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Valida CPF usando algoritmo oficial dos dígitos verificadores
 */
function isValidCPF(cpf: string): boolean {
  const cleaned = removeNonNumeric(cpf)
  
  if (cleaned.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cleaned)) return false
  
  // Valida primeiro dígito verificador
  let soma = 0
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cleaned.charAt(i)) * (10 - i)
  }
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cleaned.charAt(9))) return false
  
  // Valida segundo dígito verificador
  soma = 0
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cleaned.charAt(i)) * (11 - i)
  }
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cleaned.charAt(10))) return false
  
  return true
}

/**
 * Watcher para preencher ou limpar campos ao abrir o modal
 * Modo edição: preenche com dados do clienteInicial
 * Modo criação: limpa todos os campos
 */
watch([() => props.modelValue, () => props.clienteInicial, () => props.isEdicao], ([isOpen, inicial, edicao]) => {
  if (isOpen) {
    // Limpa mensagem de erro ao abrir
    errorMessage.value = ''
    
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
 * Limpa mensagem de erro quando usuário modifica os campos
 */
watch([cpf, nome], () => {
  if (errorMessage.value) {
    errorMessage.value = ''
  }
})

/**
 * Submete o formulário e emite evento confirmar com os dados
 */
function onConfirmar() {
  // Limpa erro anterior
  errorMessage.value = ''
  
  // Valida CPF antes de enviar
  const cleaned = removeNonNumeric(cpf.value)
  
  if (!cleaned || cleaned.length === 0) {
    errorMessage.value = 'CPF é obrigatório'
    return
  }
  
  if (cleaned.length !== 11) {
    errorMessage.value = 'CPF deve conter 11 dígitos'
    return
  }
  
  if (!isValidCPF(cpf.value)) {
    errorMessage.value = 'CPF inválido. Verifique os dígitos verificadores'
    return
  }
  
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
