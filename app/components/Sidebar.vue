<template>
  <aside :class="['bg-white border-r border-gray-100 flex flex-col h-screen transition-all duration-300 relative', isCollapsed ? 'w-20' : 'w-64']">
    <!-- Toggle Button Overlay -->
    <button
      @click="toggleSidebar"
      class="absolute -right-3 top-9 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 transition-colors z-10"
    >
      <ChevronLeftIcon v-if="!isCollapsed" class="w-4 h-4 text-gray-400" />
      <ChevronRightIcon v-else class="w-4 h-4 text-gray-400" />
    </button>

    <!-- Header -->
    <div :class="['flex items-center gap-3 px-4 py-6', isCollapsed ? 'justify-center px-2' : '']">
      <div class="flex items-center justify-center flex-shrink-0">
        <ChatBubbleLeftRightIcon class="w-8 h-8 text-[#4338CA] stroke-1" />
      </div>
      <div v-if="!isCollapsed" class="flex-1 overflow-hidden">
        <h2 class="text-base font-medium text-gray-900 leading-tight whitespace-nowrap">Painel de<br>Atendimento</h2>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-4 space-y-1">
      <NuxtLink 
        v-for="item in navItems"
        :key="item.to"
        :to="item.to" 
        :class="['group flex items-center px-4 py-2.5 text-sm font-normal rounded-lg transition-all duration-200', 
          isCollapsed ? 'justify-center' : 'gap-3'
        ]"
        active-class="bg-indigo-50 text-[#4338CA] font-medium"
        class="text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        :title="isCollapsed ? item.label : ''"
      >
        <div class="w-8 flex items-center justify-center flex-shrink-0">
          <component 
            :is="item.icon" 
            :class="['w-5 h-5 transition-colors duration-200 stroke-[1.5]']" 
          />
        </div>
        <span v-if="!isCollapsed">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <!-- Footer -->
    <div class="p-3 border-t border-gray-100">
      <MenuDropdown :is-collapsed="isCollapsed" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { 
  HomeIcon, 
  BookOpenIcon, 
  CalendarIcon, 
  UserIcon, 
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  IdentificationIcon
} from '@heroicons/vue/24/outline'

const user = useSupabaseUser()
const { logout } = useAuth()
const userStore = useUserStore()

onMounted(() => {
  userStore.fetchProfile()
})

const isCollapsed = ref(false)

const navItems = computed(() => {
  const items = [
    { label: 'Dashboard', to: '/', icon: HomeIcon },
    { label: 'Mensagens', to: '/mensagens', icon: ChatBubbleLeftRightIcon },
    { label: 'Leads', to: '/leads', icon: IdentificationIcon },
    { label: 'Relatórios', to: '/relatorios', icon: ChartBarIcon },
    { label: 'Agenda', to: '/agenda', icon: CalendarIcon },
    { label: 'Agendamentos', to: '/agendamentos', icon: CalendarIcon },
    { label: 'Clientes', to: '/clientes', icon: UserIcon },
    { label: 'Especialidades', to: '/especialidades', icon: BookOpenIcon },
    { label: 'Profissionais', to: '/profissionais', icon: UserGroupIcon },
  ]

  if (userStore.userRole === 'admin') {
    items.push({ label: 'Admin', to: '/admin', icon: ShieldCheckIcon })
  }

  return items
})

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>
