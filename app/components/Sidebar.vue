<!--
  Componente Sidebar (Barra Lateral de Navegação)
  Gerencia os links principais do sistema, controle de acesso por nível de usuário e recolhimento da barra.
-->
<template>
  <aside 
    :class="[
      'bg-white border-r border-neutral-100 flex flex-col h-screen relative z-40 transition-all duration-500 ease-in-out',
      isCollapsed ? 'w-20' : 'w-64'
    ]"
  >
    <!-- Logo & Header -->
    <div :class="['flex items-center gap-2 px-5 py-4 shrink-0', isCollapsed ? 'justify-center px-2' : 'justify-between']">
      <div :class="['flex items-center gap-2', isCollapsed ? 'hidden' : '']">
        <div class="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100 shrink-0">
          <Icon name="lucide:message-circle" class="w-5 h-5 text-white" />
        </div>
        <div class="flex flex-col overflow-hidden animate-fade-in">
          <h2 class="text-xs font-semibold text-neutral-900 leading-none whitespace-nowrap tracking-tight">Painel Consultor</h2>
          <p class="text-[9px] text-neutral-400 font-normal mt-0.5">Gestão de atendimento</p>
        </div>
      </div>

      <!-- Compact Logo (visible when collapsed) -->
      <div v-if="isCollapsed" class="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100 shrink-0 mb-2">
        <Icon name="lucide:message-circle" class="w-5 h-5 text-white" />
      </div>

      <!-- Toggle Button (Header) -->
      <button
        @click="isCollapsed = !isCollapsed"
        :class="[
          'flex items-center justify-center p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-all duration-300',
          isCollapsed ? 'w-8 h-8' : ''
        ]"
        :title="isCollapsed ? 'Expandir' : 'Recolher'"
      >
        <Icon 
          :name="isCollapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'" 
          class="w-3.5 h-3.5" 
        />
      </button>
    </div>

    <!-- Main Navigation -->
    <nav class="flex-1 px-2 space-y-0 overflow-y-auto overflow-x-hidden flex flex-col pt-1 custom-scrollbar-hidden">
      <SidebarItem 
        v-for="item in mainNavigation" 
        :key="item.to" 
        :item="item" 
        :is-collapsed="isCollapsed" 
      />

      <SidebarItem 
        v-if="userStore.userRole === 'admin'"
        :item="adminNavigation" 
        :is-collapsed="isCollapsed" 
      />
    </nav>

    <!-- Footer: User Profile & Controls -->
    <div class="p-2 border-t border-neutral-50 shrink-0 bg-neutral-50/30">
      <!-- Profile Button -->
      <div 
        @mouseenter="showUserFlyout = true"
        @mouseleave="showUserFlyout = false"
        class="relative"
      >
        <button
          @click="toggleUserMenu"
          :class="[
            'w-full flex items-center p-2 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-neutral-100 transition-all duration-300',
            isCollapsed ? 'justify-center' : 'gap-3'
          ]"
        >
          <div class="relative flex-shrink-0">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <Icon name="lucide:user" class="w-5 h-5 text-indigo-600" />
            </div>
            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          
          <div v-if="!isCollapsed" class="flex flex-col items-start overflow-hidden">
            <span class="text-xs font-medium text-neutral-800 truncate w-full tracking-tight">{{ userProfile?.nome || 'Usuário' }}</span>
            <span class="text-[9px] text-neutral-400 font-normal uppercase truncate w-full tracking-wider">{{ userStore.userRole }}</span>
          </div>

          <Icon 
            v-if="!isCollapsed" 
            name="heroicons:chevron-up-down" 
            class="w-3.5 h-3.5 text-neutral-300 ml-auto" 
          />
        </button>

        <!-- Profile / Logout Dropdown -->
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
              'absolute z-[100] bg-white rounded-2xl shadow-2xl border border-neutral-100 py-2 p-2 min-w-[180px]',
              isCollapsed ? 'left-20 bottom-0' : 'bottom-full left-0 right-0 mb-3'
            ]"
          >
            <NuxtLink 
              to="/perfil" 
              class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              @click="isUserMenuOpen = false"
            >
              <Icon name="lucide:user-cog" class="w-4 h-4" />
              <span>Meu Perfil</span>
            </NuxtLink>
            <button 
              @click="handleLogout"
              class="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all mt-1"
            >
              <Icon name="lucide:log-out" class="w-4 h-4" />
              <span>Sair do Sistema</span>
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
  { label: 'Templates', to: '/configuracoes', icon: 'lucide:file-text' },
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
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      isUserMenuOpen.value = false
    }
  })
})
</script>

<style scoped>
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
