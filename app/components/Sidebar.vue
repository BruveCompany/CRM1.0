<!--
  Componente Sidebar (Barra Lateral de Navegação)
  Gerencia os links principais do sistema, controle de acesso por nível de usuário e recolhimento da barra.
-->
<template>
  <aside :class="['bg-white border-r border-gray-100 flex flex-col h-screen transition-all duration-300 relative', isCollapsed ? 'w-20' : 'w-64']">
    <!-- Toggle Button Overlay -->
    <button
      @click="toggleSidebar"
      class="absolute -right-3 top-9 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 transition-colors z-10"
    >
      <ClientOnly>
        <ChevronLeftIcon v-if="!isCollapsed" class="w-4 h-4 text-gray-400" />
        <ChevronRightIcon v-else class="w-4 h-4 text-gray-400" />
      </ClientOnly>
    </button>

    <!-- Header -->
    <div :class="['flex items-center gap-3 px-4 py-6', isCollapsed ? 'justify-center px-2' : '']">
      <div class="flex items-center justify-center flex-shrink-0">
        <ClientOnly>
          <ChatBubbleLeftRightIcon class="w-8 h-8 text-[#4338CA] stroke-1" />
        </ClientOnly>
      </div>
      <div v-if="!isCollapsed" class="flex-1 overflow-hidden">
        <h2 class="text-base font-medium text-gray-900 leading-tight whitespace-nowrap">Painel de<br>Atendimento</h2>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
      <ClientOnly>
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

        <!-- Seção Configurações (Apenas Admin) -->
        <div v-if="userStore.userRole === 'admin'" class="pt-2">
          <div v-if="!isCollapsed" class="px-4 mb-1">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gestão</span>
          </div>

          <button 
            @click="isConfigOpen = !isConfigOpen"
            :class="['w-full group flex items-center px-4 py-2.5 text-sm font-normal rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900', 
              isCollapsed ? 'justify-center' : 'gap-3',
              isConfigOpen && !isCollapsed ? 'bg-gray-50/50' : ''
            ]"
            :title="isCollapsed ? 'Configurações' : ''"
          >
            <div class="w-8 flex items-center justify-center flex-shrink-0">
              <Cog6ToothIcon class="w-5 h-5 transition-colors duration-200 stroke-[1.5]" />
            </div>
            <span v-if="!isCollapsed" class="flex-1 text-left">Configurações</span>
            <ChevronDownIcon 
              v-if="!isCollapsed" 
              :class="['w-4 h-4 text-gray-400 transition-transform duration-200', isConfigOpen ? 'rotate-180' : '']" 
            />
          </button>

          <!-- Submenu de Configurações -->
          <div v-if="isConfigOpen && !isCollapsed" class="mt-1 ml-4 pl-4 border-l border-gray-100 space-y-1">
            <NuxtLink 
              to="/admin" 
              class="group flex items-center gap-3 px-4 py-2 text-sm text-gray-500 hover:text-[#4338CA] hover:bg-indigo-50/50 rounded-lg transition-all"
              active-class="text-[#4338CA] font-medium bg-indigo-50"
            >
              <ShieldCheckIcon class="w-4 h-4 stroke-[1.5]" />
              <span>Usuários</span>
            </NuxtLink>
            <NuxtLink 
              to="/especialidades" 
              class="group flex items-center gap-3 px-4 py-2 text-sm text-gray-500 hover:text-[#4338CA] hover:bg-indigo-50/50 rounded-lg transition-all"
              active-class="text-[#4338CA] font-medium bg-indigo-50"
            >
              <BookOpenIcon class="w-4 h-4 stroke-[1.5]" />
              <span>Especialidades</span>
            </NuxtLink>
            <NuxtLink 
              to="/profissionais" 
              class="group flex items-center gap-3 px-4 py-2 text-sm text-gray-500 hover:text-[#4338CA] hover:bg-indigo-50/50 rounded-lg transition-all"
              active-class="text-[#4338CA] font-medium bg-indigo-50"
            >
              <UserGroupIcon class="w-4 h-4 stroke-[1.5]" />
              <span>Profissionais</span>
            </NuxtLink>
          </div>
        </div>

        <template #fallback>
          <div class="animate-pulse space-y-2 px-4">
            <div v-for="i in 6" :key="i" class="h-10 bg-gray-50 rounded-lg"></div>
          </div>
        </template>
      </ClientOnly>
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
  ChevronDownIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  IdentificationIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'

const user = useSupabaseUser()
const { logout } = useAuth()
const userStore = useUserStore()

// Estado de recolhimento da sidebar
const isCollapsed = ref(false)
// Estado do submenu de configurações
const isConfigOpen = ref(false)

/**
 * Itens de Navegação Dinâmicos
 * Define a ordem e os ícones dos links principais na sidebar.
 */
const navItems = computed(() => {
  return [
    { label: 'Dashboard', to: '/dashboard', icon: HomeIcon },
    { label: 'Chat', to: '/chat', icon: ChatBubbleLeftRightIcon },
    { label: 'Leads', to: '/leads', icon: IdentificationIcon },
    { label: 'Relatórios', to: '/relatorios', icon: ChartBarIcon },
    { label: 'Agenda', to: '/agenda', icon: CalendarIcon },
    { label: 'Clientes', to: '/clientes', icon: UserIcon },
    { label: 'Configurações', to: '/configuracoes', icon: Cog6ToothIcon },
  ]
})

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  if (isCollapsed.value) isConfigOpen.value = false
}
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #f1f5f9 transparent;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #f1f5f9;
  border-radius: 10px;
}
</style>
