<template>
  <div 
    class="relative"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Item Principal -->
    <NuxtLink
      v-if="!item.children"
      :to="item.to"
      :class="[
        'group flex items-center rounded-xl transition-all duration-300 relative overflow-hidden h-9 my-0.5',
        isActive ? 'bg-indigo-50/80 text-indigo-600 active-glow' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900',
        isCollapsed ? 'justify-center w-10 mx-auto px-0' : 'mx-2 px-3 gap-3 w-auto'
      ]"
      active-class="bg-indigo-50/80 text-indigo-600 shadow-sm"
      :title="isCollapsed ? item.label : ''"
    >
      <div 
        :class="[
          'flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110', 
          isCollapsed ? 'scale-100' : ''
        ]"
      >
        <Icon :name="item.icon" class="w-[18px] h-[18px] stroke-[1.2]" />
      </div>
      
      <span 
        v-if="!isCollapsed" 
        class="flex-1 truncate transition-opacity duration-300 tracking-tight text-sm font-medium"
      >
        {{ item.label }}
      </span>

      <!-- Badge de contagem -->
      <div 
        v-if="item.count" 
        :class="[
          'flex items-center justify-center bg-indigo-500 text-white rounded-full font-bold shadow-sm',
          isCollapsed ? 'absolute -top-1 -right-1 w-3.5 h-3.5 text-[7px]' : 'min-w-[1.2rem] h-4.5 px-1.5 text-[10px]'
        ]"
      >
        {{ item.count }}
      </div>
    </NuxtLink>

    <!-- Item com Sub-menu -->
    <div v-else class="w-full flex flex-col items-center">
      <button
        @click="toggleSubMenu"
        :class="[
          'group flex items-center rounded-xl transition-all duration-300 relative h-9 my-0.5',
          (isSubMenuOpen || hasActiveChild) ? 'bg-neutral-50 text-neutral-900' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900',
          isCollapsed ? 'justify-center w-10 px-0' : 'mx-2 px-3 gap-3 w-[calc(100%-16px)]'
        ]"
        :title="isCollapsed ? item.label : ''"
      >
        <div 
          :class="[
            'flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110', 
            isCollapsed ? 'scale-100' : ''
          ]"
        >
          <Icon :name="item.icon" class="w-[18px] h-[18px] stroke-[1.2]" />
        </div>
        
        <span 
          v-if="!isCollapsed" 
          class="flex-1 text-left truncate tracking-tight text-sm font-medium"
        >
          {{ item.label }}
        </span>

        <Icon 
          v-if="!isCollapsed" 
          name="heroicons:chevron-down" 
          :class="['w-3.5 h-3.5 text-neutral-300 transition-transform duration-300', isSubMenuOpen ? 'rotate-180' : '']" 
        />
      </button>

      <!-- Sub-menu Colapsável (Modo Aberto) -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div 
          v-if="isSubMenuOpen && !isCollapsed" 
          class="w-full pl-11 pr-4 py-1 space-y-0.5 bg-neutral-50/20 rounded-b-xl"
        >
          <NuxtLink
            v-for="child in item.children"
            :key="child.to"
            :to="child.to"
            class="group flex items-center gap-3 py-2 text-xs font-normal text-neutral-400 hover:text-indigo-600 transition-all"
            active-class="text-indigo-600 font-medium"
          >
            <Icon v-if="child.icon" :name="child.icon" class="w-3.5 h-3.5 stroke-[1]" />
            <span>{{ child.label }}</span>
          </NuxtLink>
        </div>
      </Transition>

      <!-- Sub-menu Flyout (Modo Compacto) -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-x-2"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-2"
      >
        <div 
          v-if="isCollapsed && isHovered" 
          class="fixed left-16 ml-2 z-[100] bg-white rounded-2xl shadow-2xl border border-neutral-100 py-3 min-w-[200px]"
          @mouseenter="isHovered = true"
          @mouseleave="isHovered = false"
        >
          <div class="px-5 pb-3 mb-2 border-b border-neutral-50">
            <span class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{{ item.label }}</span>
          </div>
          <div class="px-2 space-y-1">
            <NuxtLink
              v-for="child in item.children"
              :key="child.to"
              :to="child.to"
              class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-neutral-500 hover:text-indigo-600 hover:bg-neutral-50 rounded-xl transition-all"
              active-class="text-indigo-600 bg-indigo-50/50"
            >
              <Icon v-if="child.icon" :name="child.icon" class="w-4 h-4 stroke-[1.2]" />
              <span>{{ child.label }}</span>
            </NuxtLink>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  item: {
    label: string
    to?: string
    icon: string
    count?: number
    children?: Array<{ label: string; to: string; icon?: string }>
  }
  isCollapsed: boolean
}>()

const route = useRoute()
const isSubMenuOpen = ref(false)
const isHovered = ref(false)

// Verifica se o item principal ou algum filho está ativo
const isActive = computed(() => props.item.to ? route.path === props.item.to : false)
const hasActiveChild = computed(() => {
  if (!props.item.children) return false
  return props.item.children.some(child => route.path === child.to)
})

// Abre o submenu automaticamente se um filho estiver ativo
watch(() => route.path, () => {
  if (hasActiveChild.value && !props.isCollapsed) {
    isSubMenuOpen.value = true
  }
}, { immediate: true })

const toggleSubMenu = () => {
  if (!props.isCollapsed) {
    isSubMenuOpen.value = !isSubMenuOpen.value
  }
}

// Handlers para Flyout no modo compacto
const handleMouseEnter = () => {
  if (props.isCollapsed) isHovered.value = true
}

const handleMouseLeave = () => {
  if (props.isCollapsed) isHovered.value = false
}
</script>

<style scoped>
.active-glow {
  position: relative;
}
.active-glow::before {
  content: '';
  position: absolute;
  top: 15%;
  bottom: 15%;
  left: 0;
  width: 3px;
  background: #4f46e5;
  border-radius: 0 4px 4px 0;
}
</style>

