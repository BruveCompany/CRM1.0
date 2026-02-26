<template>
    <div class="min-h-screen bg-white p-8">
      <div>
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-neutral-900">Meu Perfil</h1>
          <p class="mt-1 text-sm text-neutral-500">Gerencie suas informações pessoais e segurança.</p>
        </div>

        <div class="space-y-6">
          <div class="bg-white border border-neutral-200 shadow-sm rounded-lg p-6 space-y-6">
            <h2 class="text-lg font-medium text-neutral-900">Dados Pessoais</h2>
            
            <div class="grid grid-cols-1 gap-6">
              <BaseInput
                v-model="name"
                label="Nome Completo"
                placeholder="Seu nome"
              />
              
              <BaseInput
                v-model="email"
                label="Email"
                type="email"
                disabled
                readonly
                hint="O email não pode ser alterado."
              />
            </div>
            
            <div class="flex justify-end gap-3 pt-4 border-t border-neutral-100">
              <BaseButton variant="outline" @click="handleCancel" :disabled="savingProfile">Cancelar</BaseButton>
              <BaseButton variant="primary" @click="handleSaveProfile" :loading="savingProfile">Salvar</BaseButton>
            </div>
          </div>

          <div class="bg-white border border-neutral-200 shadow-sm rounded-lg p-6">
            <ChangePassword />
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
/**
 * ================= Página: Perfil =================
 * Permite ao usuário visualizar e editar suas informações pessoais
 * e alterar sua senha de acesso.
 * ===================================================
 */

import { useUserStore } from '~/stores/user'
import { storeToRefs } from 'pinia'

// Store e Composables
const userStore = useUserStore()
const { user, profile } = storeToRefs(userStore)
const { updateUserName } = useAuth()
const { notifyError } = useNotification()

// Estado Local
// Informações do perfil
const name = ref(profile.value?.nome || '')
const email = ref(user.value?.email || '')
const savingProfile = ref(false)

// ================= Handlers =================

/**
 * Cancela a edição do perfil, restaurando os valores originais da store.
 */
const handleCancel = () => {
  name.value = profile.value?.nome || ''
}

/**
 * Salva as alterações do perfil (Nome).
 * Chama a função updateUserName do composable de autenticação.
 */
const handleSaveProfile = async () => {
  if (!name.value) return notifyError('O nome não pode ser vazio')

  savingProfile.value = true
  try {
    const result = await updateUserName(name.value)
    
    if (result.success) {
      // Atualiza o perfil na store para refletir a mudança
      if (profile.value) {
        profile.value.nome = name.value
      }
    }
  } finally {
    savingProfile.value = false
  }
}

// ================= Watchers =================

// Mantém os campos locais sincronizados se a store for atualizada externamente
watch(() => profile.value?.nome, (newName) => {
  if (newName) name.value = newName
})

watch(() => user.value?.email, (newEmail) => {
  if (newEmail) email.value = newEmail
})

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Meu Perfil'
})
</script>
