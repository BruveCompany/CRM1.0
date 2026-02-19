<template>
  <div class="relative" ref="dropdownRef">
    <button
      @click="toggleMenu"
      :class="['w-full px-4 py-2.5 text-left rounded-lg hover:bg-gray-50 flex items-center transition-colors', isCollapsed ? 'justify-center' : 'gap-3']"
      aria-haspopup="true"
      :aria-expanded="isOpen"
      :title="isCollapsed ? 'Configurações' : ''"
    >
      <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
        <UserCircleIcon class="w-5 h-5 text-gray-600 stroke-[1.5]" />
      </div>
      <span v-if="!isCollapsed" class="text-sm font-normal text-gray-700 flex-1">Configurações</span>
      <ChevronUpIcon v-if="isOpen && !isCollapsed" class="w-4 h-4 text-gray-500" />
      <ChevronDownIcon v-else-if="!isCollapsed" class="w-4 h-4 text-gray-500" />
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        :class="['absolute bottom-full mb-2 bg-white rounded-lg shadow-lg border border-neutral-200 py-2', isCollapsed ? 'left-full ml-2 w-48' : 'left-0 right-0']"
        role="menu"
      >
        <NuxtLink
          to="/perfil"
          class="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 transition-colors flex items-center gap-2"
          role="menuitem"
          @click="closeMenu"
        >
          <UserIcon class="w-4 h-4" />
          <span>Perfil</span>
        </NuxtLink>
        
        <button
          type="button"
          @click="handleLogout"
          class="w-full px-4 py-2 text-left text-sm text-error-600 hover:bg-error-50 transition-colors flex items-center gap-2"
          role="menuitem"
        >
          <ArrowRightOnRectangleIcon class="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
/**
 * ================= Componente: MenuDropdown =================
 * Menu de configurações e ações do usuário localizado na sidebar.
 * 
 * Funcionalidades:
 * - Link para o perfil
 * - Botão de logout
 * - Comportamento de dropdown
 * - Detecção de clique fora para fechar
 * ========================================================
 */

import { 
  UserCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

interface Props {
  isCollapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isCollapsed: false
})

const { logout } = useAuth()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}

const handleLogout = async () => {
  closeMenu()
  await logout()
}

// Fechar menu ao clicar fora
onMounted(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
      closeMenu()
    }
  }

  document.addEventListener('mousedown', handleClickOutside)

  onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside)
  })
})
</script>
