<!--
  Componente Sidebar (Barra Lateral de Navegação)
  Gerencia os links principais do sistema, controle de acesso por nível de usuário e recolhimento da barra.
-->
<template>
  <aside 
    :class="[
      'bg-white border-r border-neutral-100 flex flex-col h-screen sticky top-0 left-0 transition-all duration-500 ease-in-out z-50',
      isCollapsed ? 'w-20' : 'w-64'
    ]"
  >
    <!-- Logo & Header -->
    <div :class="['flex items-center gap-3 px-5 py-6 shrink-0', isCollapsed ? 'justify-center px-2' : 'justify-between']">
      <div v-show="!isCollapsed" class="flex items-center gap-3 overflow-hidden transition-all duration-300">
        <div class="flex items-center justify-center w-9 h-9 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100 shrink-0">
          <Icon name="lucide:message-circle" class="w-5 h-5 text-white" />
        </div>
        <div class="flex flex-col">
          <h2 class="text-[13px] font-semibold text-neutral-900 leading-tight whitespace-nowrap tracking-tight">Painel Performance</h2>
          <span class="text-[10px] text-neutral-400 font-medium tracking-wide leading-tight">Resultados conectados</span>
        </div>
      </div>

      <!-- Compact Logo -->
      <div v-show="isCollapsed" class="flex items-center justify-center w-10 h-10 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 shrink-0 transform transition-transform duration-300 hover:scale-105">
        <Icon name="lucide:message-circle" class="w-6 h-6 text-white" />
      </div>

      <!-- Toggle Button (Absolute in compact mode to save space) -->
      <button
        @click="isCollapsed = !isCollapsed"
        :class="[
          'flex items-center justify-center p-2 rounded-xl text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300',
          isCollapsed ? 'hidden' : ''
        ]"
      >
        <Icon 
          name="lucide:panel-left-close" 
          class="w-4 h-4" 
        />
      </button>
    </div>

    <!-- Toggle Button for Compact Mode (shows when collapsed) -->
    <div v-if="isCollapsed" class="flex justify-center mb-4 px-2">
      <button
        @click="isCollapsed = !isCollapsed"
        class="flex items-center justify-center w-10 h-10 p-2 rounded-2xl text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
      >
        <Icon name="lucide:panel-left-open" class="w-5 h-5" />
      </button>
    </div>

    <!-- Main Navigation (No visible scrollbar) -->
    <nav class="flex-1 px-2 space-y-1 overflow-y-auto no-scrollbar scroll-smooth py-2">
      <SidebarItem 
        v-for="item in mainNavigation" 
        :key="item.to" 
        :item="item" 
        :is-collapsed="isCollapsed" 
      />

      <!-- Espaçador visual se houver nav administrativa -->
      <div v-if="userStore.userRole === 'admin'" class="my-4 mx-4 h-px bg-neutral-50" />

      <SidebarItem 
        v-if="userStore.userRole === 'admin'"
        :item="adminNavigation" 
        :is-collapsed="isCollapsed" 
      />
    </nav>

    <!-- Footer: User Profile Area -->
    <div class="p-4 border-t border-neutral-50 shrink-0">
      <div 
        @mouseenter="showUserFlyout = true"
        @mouseleave="showUserFlyout = false"
        class="relative"
      >
        <button
          @click="toggleUserMenu"
          :class="[
            'w-full flex items-center p-2 rounded-2xl duration-300 transition-all shadow-none hover:bg-neutral-50',
            isCollapsed ? 'justify-center p-1' : 'gap-3 px-2 border border-transparent hover:border-neutral-200'
          ]"
        >
          <div class="relative flex-shrink-0">
            <div class="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center border border-white shadow-sm overflow-hidden">
              <Icon name="lucide:user" class="w-5 h-5 text-neutral-400" />
            </div>
            <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          
          <div v-show="!isCollapsed" class="flex flex-col items-start min-w-0 flex-1">
            <span class="text-xs font-bold text-neutral-900 truncate tracking-tight">{{ userProfile?.nome || 'Consultor' }}</span>
            <span class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-tight">Admin</span>
          </div>

          <Icon 
            v-show="!isCollapsed" 
            name="lucide:chevrons-up-down" 
            class="w-3.5 h-3.5 text-neutral-300 ml-auto shrink-0" 
          />
        </button>

        <!-- Profile / Logout Transition Menu -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform scale-95 opacity-0 translate-y-2"
          enter-to-class="transform scale-100 opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform scale-100 opacity-100 translate-y-0"
          leave-to-class="transform scale-95 opacity-0 translate-y-2"
        >
          <div 
            v-show="isUserMenuOpen || (isCollapsed && showUserFlyout)" 
            :class="[
              'absolute z-[100] bg-white rounded-2xl shadow-2xl border border-neutral-100 p-2 min-w-[200px]',
              isCollapsed ? 'left-16 bottom-0' : 'bottom-full left-0 right-0 mb-4'
            ]"
          >
            <div v-if="isCollapsed" class="px-4 py-2 border-b border-neutral-50 mb-1">
               <p class="text-[10px] font-bold text-neutral-900 truncate">{{ userProfile?.nome }}</p>
               <p class="text-[8px] text-neutral-400 font-bold uppercase">Administrador</p>
            </div>
            
            <NuxtLink 
              to="/perfil" 
              class="flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-neutral-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              @click="isUserMenuOpen = false"
            >
              <Icon name="lucide:user-cog" class="w-4 h-4 stroke-[1.5]" />
              <span>Meu Perfil</span>
            </NuxtLink>
            
            <div class="h-px bg-neutral-50 my-1" />

            <button 
              @click="handleLogout"
              class="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <Icon name="lucide:log-out" class="w-4 h-4 stroke-[1.5]" />
              <span>Sair da conta</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import SidebarItem from './SidebarItem.vue';

const props = defineProps<{
  unreadCount?: number
}>()

const userStore = useUserStore()
const { logout } = useAuth()
const isCollapsed = ref(false)
const isUserMenuOpen = ref(false)
const showUserFlyout = ref(false)

const userProfile = computed(() => userStore.profile)

/**
 * Definição da Navegação Principal
 */
const mainNavigation = computed(() => [
  { label: 'Dashboard', to: '/dashboard', icon: 'lucide:layout-dashboard' },
  { label: 'Chat', to: '/chat', icon: 'lucide:message-square', count: props.unreadCount || 0 },
  { label: 'Leads', to: '/leads', icon: 'lucide:user-plus' },
  { label: 'Relatórios', to: '/relatorios', icon: 'lucide:bar-chart-3' },
  { label: 'Agenda', to: '/agenda', icon: 'lucide:calendar' },
  { label: 'Clientes', to: '/clientes', icon: 'lucide:users' },
])

/**
 * Definição da Seção Única de Configurações (Admin)
 */
const adminNavigation = {
  label: 'Configurações',
  icon: 'lucide:settings',
  children: [
    { label: 'Usuários', to: '/admin', icon: 'lucide:shield-check' },
    { label: 'Especialidades', to: '/especialidades', icon: 'lucide:graduation-cap' },
    { label: 'Profissionais', to: '/profissionais', icon: 'lucide:briefcase' },
    { label: 'Templates', to: '/configuracoes', icon: 'lucide:file-text' },
    { label: 'Integrações', to: '/configuracoes/n8n', icon: 'lucide:zap' },
  ]
}

const toggleUserMenu = () => {
  if (!isCollapsed.value) {
    isUserMenuOpen.value = !isUserMenuOpen.value
  }
}

const handleLogout = async () => {
  isUserMenuOpen.value = false
  await logout()
}

// Fechar menu de usuário ao clicar fora
onMounted(() => {
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    // Check if the click is outside the user profile button and the menu itself
    // The user profile button has a parent with class 'relative'
    if (!target.closest('.relative')) {
      isUserMenuOpen.value = false
    }
  }
  document.addEventListener('click', handleClickOutside)
  onUnmounted(() => document.removeEventListener('click', handleClickOutside))
})
</script>

<style scoped>
/* Remove a barra de rolagem mas permite o scroll */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Garante que o conteúdo caiba sem scrollbar visível */
aside {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
aside::-webkit-scrollbar {
  display: none;
}

.custom-scrollbar-hidden {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.custom-scrollbar-hidden::-webkit-scrollbar {
  display: none;
}
</style>
