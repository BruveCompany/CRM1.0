<template>
  <div class="relative" ref="dropdownRef">
    <!-- Trigger Button -->
    <button 
      @click.stop="toggleMenu"
      class="rounded-full p-2 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 transition-colors bg-neutral-50/50"
      aria-haspopup="true"
      :aria-expanded="isOpen"
    >
      <Icon name="lucide:more-vertical" class="w-[18px] h-[18px]" />
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
        class="absolute right-full mr-2 top-0 z-[100] w-48 bg-white rounded-lg shadow-xl border border-neutral-200 py-1"
        role="menu"
      >
        <button
          v-for="action in actions"
          :key="action.id"
          @click.stop="() => handleAction(action.id)"
          :class="[
            'w-full px-4 py-2 text-left text-[13px] hover:bg-neutral-100 transition-colors flex items-center gap-2',
            action.isDestructive ? 'text-error-600 hover:bg-error-50' : 'text-neutral-700'
          ]"
          role="menuitem"
        >
          <Icon v-if="action.icon" :name="action.icon" class="w-4 h-4" />
          <span>{{ action.label }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

export interface DropdownAction {
  id: string
  label: string
  icon?: string
  isDestructive?: boolean
}

const props = defineProps<{
  actions: DropdownAction[]
}>()

const emit = defineEmits<{
  (e: 'actionClicked', actionId: string): void
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}

const handleAction = (actionId: string) => {
  emit('actionClicked', actionId)
  closeMenu()
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
