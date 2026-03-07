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
        isActive ? 'bg-indigo-50/50 text-indigo-600 active-glow font-medium' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 font-normal',
        isCollapsed ? 'justify-center w-9 mx-auto px-0' : 'mx-2 px-3 gap-3 w-auto'
      ]"
      active-class="bg-indigo-50/50 text-indigo-600 shadow-sm"
      :title="isCollapsed ? item.label : ''"
    >
      <div 
        :class="[
          'flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110', 
          isCollapsed ? 'w-5 h-5' : 'w-5 h-5'
        ]"
      >
        <Icon :name="item.icon" class="w-[17px] h-[17px] stroke-[1.2]" />
      </div>
      
      <span 
        v-if="!isCollapsed" 
        class="flex-1 truncate transition-opacity duration-300 tracking-tight text-sm"
      >
        {{ item.label }}
      </span>

      <!-- Badge de contagem -->
      <div 
        v-if="item.count" 
        :class="[
          'flex items-center justify-center bg-indigo-500 text-white rounded-full font-bold',
          isCollapsed ? 'absolute top-0 right-0 w-3 h-3 text-[6px]' : 'min-w-[1.1rem] h-4 px-1.5 text-[9px]'
        ]"
      >
        {{ item.count }}
      </div>
    </NuxtLink>

    <!-- Item com Sub-menu (Ex: Configurações) -->
    <div v-else class="w-full flex flex-col items-center">
      <button
        @click="toggleSubMenu"
        :class="[
          'group flex items-center rounded-xl transition-all duration-300 relative h-9 my-0.5',
          (isSubMenuOpen || hasActiveChild) ? 'bg-neutral-50 text-neutral-800' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800',
          isCollapsed ? 'justify-center w-9 px-0' : 'mx-2 px-3 gap-3 w-[calc(100%-16px)]'
        ]"
        :title="isCollapsed ? item.label : ''"
      >
        <div 
          :class="[
            'flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110', 
            isCollapsed ? 'w-5 h-5' : 'w-5 h-5'
          ]"
        >
          <Icon :name="item.icon" class="w-[17px] h-[17px] stroke-[1.2]" />
        </div>
        
        <span 
          v-if="!isCollapsed" 
          class="flex-1 text-left truncate tracking-tight text-sm font-normal"
        >
          {{ item.label }}
        </span>

        <Icon 
          v-if="!isCollapsed" 
          name="heroicons:chevron-down" 
          :class="['w-3 h-3 text-neutral-300 transition-transform duration-300', isSubMenuOpen ? 'rotate-180' : '']" 
        />
      </button>

      <!-- Sub-menu Colapsável (Modo Aberto) -->
      <div 
        v-if="isSubMenuOpen && !isCollapsed" 
        class="w-full pl-10 pr-4 space-y-0.5"
      >
        <NuxtLink
          v-for="child in item.children"
          :key="child.to"
          :to="child.to"
          class="group flex items-center gap-3 py-1.5 text-sm font-normal text-neutral-400 hover:text-indigo-600 transition-all leading-tight"
          active-class="text-indigo-600 font-medium"
        >
          <Icon v-if="child.icon" :name="child.icon" class="w-4 h-4 stroke-[1.2]" />
          <span class="tracking-tight">{{ child.label }}</span>
        </NuxtLink>
      </div>

      <!-- Sub-menu Flyout (Modo Compacto) -->
      <div 
        v-if="isCollapsed && isHovered" 
        class="fixed left-20 z-[100] bg-white rounded-2xl shadow-xl border border-neutral-100 py-3 min-w-[200px]"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <div class="px-4 pb-3 mb-2 border-b border-neutral-50">
          <span class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{{ item.label }}</span>
        </div>
        <div class="px-2 space-y-1">
          <NuxtLink
            v-for="child in item.children"
            :key="child.to"
            :to="child.to"
            class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            active-class="text-indigo-700 bg-indigo-50"
          >
            <Icon v-if="child.icon" :name="child.icon" class="w-4 h-4" />
            <span>{{ child.label }}</span>
          </NuxtLink>
        </div>
      </div>
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
.active-glow::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(79, 70, 229, 0.05) 0%, transparent 70%);
  pointer-events: none;
}
</style>
