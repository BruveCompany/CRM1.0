<template>
  <aside :class="['bg-white border-r border-gray-200 flex flex-col h-screen transition-all duration-300', isCollapsed ? 'w-20' : 'w-64']">
    <!-- Header -->
    <div class="px-6 pt-[1.125rem] pb-5 border-b border-gray-200 flex items-center gap-3">
      <div v-if="!isCollapsed" class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
        <CalendarIcon class="w-7 h-7 text-white" />
      </div>
      <div v-if="!isCollapsed" class="flex-1">
        <h2 class="text-lg font-bold text-gray-900">AgendaPro</h2>
        <p class="text-xs text-gray-500">Sistema de Agendamento</p>
      </div>
      <button
        @click="toggleSidebar"
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        :class="isCollapsed ? 'mx-auto' : ''"
      >
        <ChevronLeftIcon v-if="!isCollapsed" class="w-5 h-5 text-gray-600" />
        <ChevronRightIcon v-else class="w-5 h-5 text-gray-600" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4 space-y-2">
      <NuxtLink 
        to="/" 
        :class="['w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors flex items-center', isCollapsed ? 'justify-center' : 'gap-3']"
        :title="isCollapsed ? 'Dashboard' : ''"
      >
        <HomeIcon class="w-5 h-5 flex-shrink-0" />
        <span v-if="!isCollapsed">Dashboard</span>
      </NuxtLink>

      <NuxtLink 
        to="/mensagens" 
        :class="['w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors flex items-center', isCollapsed ? 'justify-center' : 'gap-3']"
        :title="isCollapsed ? 'Mensagens' : ''"
      >
        <ChatBubbleLeftRightIcon class="w-5 h-5 flex-shrink-0" />
        <span v-if="!isCollapsed">Mensagens</span>
      </NuxtLink>

      <NuxtLink 
        to="/relatorios" 
        :class="['w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors flex items-center', isCollapsed ? 'justify-center' : 'gap-3']"
        :title="isCollapsed ? 'Relatórios' : ''"
      >
        <ChartBarIcon class="w-5 h-5 flex-shrink-0" />
        <span v-if="!isCollapsed">Relatórios</span>
      </NuxtLink>

      <NuxtLink 
        to="/agenda" 
        :class="['w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors flex items-center', isCollapsed ? 'justify-center' : 'gap-3']"
        :title="isCollapsed ? 'Agenda' : ''"
      >
        <CalendarIcon class="w-5 h-5 flex-shrink-0" />
        <span v-if="!isCollapsed">Agenda</span>
      </NuxtLink>

      <NuxtLink 
        to="/agendamentos" 
        :class="['w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors flex items-center', isCollapsed ? 'justify-center' : 'gap-3']"
        :title="isCollapsed ? 'Agendamentos' : ''"
      >
        <CalendarIcon class="w-5 h-5 flex-shrink-0" />
        <span v-if="!isCollapsed">Agendamentos</span>
      </NuxtLink>

      <NuxtLink 
        to="/clientes" 
        :class="['w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors flex items-center', isCollapsed ? 'justify-center' : 'gap-3']"
        :title="isCollapsed ? 'Clientes' : ''"
      >
        <UserIcon class="w-5 h-5 flex-shrink-0" />
        <span v-if="!isCollapsed">Clientes</span>
      </NuxtLink>

      <NuxtLink 
        to="/especialidades" 
        :class="['w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors flex items-center', isCollapsed ? 'justify-center' : 'gap-3']"
        :title="isCollapsed ? 'Especialidades' : ''"
      >
        <BookOpenIcon class="w-5 h-5 flex-shrink-0" />
        <span v-if="!isCollapsed">Especialidades</span>
      </NuxtLink>

      <NuxtLink 
        to="/profissionais" 
        :class="['w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors flex items-center', isCollapsed ? 'justify-center' : 'gap-3']"
        :title="isCollapsed ? 'Profissionais' : ''"
      >
        <UserGroupIcon class="w-5 h-5 flex-shrink-0" />
        <span v-if="!isCollapsed">Profissionais</span>
      </NuxtLink>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-gray-200">
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
  ChatBubbleLeftRightIcon
} from '@heroicons/vue/24/outline'

const user = useSupabaseUser()
const { logout } = useAuth()

const isCollapsed = ref(false)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>
