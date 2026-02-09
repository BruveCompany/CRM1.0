<template>
  <div class="h-screen flex overflow-hidden">
    <!-- Coluna Esquerda - Formulário -->
    <div class="w-full md:w-1/2 flex items-center justify-center px-6 py-8 bg-gray-50 overflow-y-auto">
      <div class="w-full max-w-md">
        <!-- Logo mobile -->
        <div class="md:hidden text-center mb-8">
          <h1 class="text-3xl font-bold text-primary-600 mb-2">
            Bruve Saas
          </h1>
          <p class="text-gray-600">Sistema de Agendamento</p>
        </div>

        <!-- Card do formulário -->
        <div class="bg-white rounded-xl shadow-lg p-8">
          <FormLogin />
        </div>

        <!-- Footer -->
        <div class="mt-8 text-center">
          <p class="text-sm text-gray-500">
            © 2026 Bruve Saas. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>

    <!-- Coluna Direita - Branding -->
    <div class="hidden md:flex w-1/2 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-900 relative overflow-hidden rounded-l-lg">
      <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      
      <div class="relative z-10 flex flex-col justify-center px-12 text-white">
        <div class="mb-10">
          <h1 class="text-5xl font-bold mb-4 leading-tight">
            Sistema de <span class="text-success-400">Agendamento</span>
          </h1>
          <div class="w-24 h-1.5 bg-success-400 rounded"></div>
        </div>
        
        <p class="text-2xl font-light mb-10 leading-relaxed">
          Gerencie seus agendamentos de forma simples e eficiente. Organize sua agenda e otimize seu tempo.
        </p>
        
        <ul class="space-y-5 text-lg">
          <li class="flex items-start">
            <span class="w-2 h-2 rounded-full bg-success-400 mr-4 mt-2 flex-shrink-0"></span>
            Agendamentos em tempo real
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 rounded-full bg-success-400 mr-4 mt-2 flex-shrink-0"></span>
            Notificações automáticas
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 rounded-full bg-success-400 mr-4 mt-2 flex-shrink-0"></span>
            Relatórios detalhados
          </li>
        </ul>

        <div class="mt-16 pt-8 border-t border-success-400">
          <p class="text-base opacity-90 italic leading-relaxed">
            "A melhor solução para gerenciar seus agendamentos de forma eficiente e profissional."
          </p>
        </div>
      </div>

      <!-- Elementos decorativos modernos -->
      <div class="absolute top-20 right-10 w-72 h-72 bg-success-400/10 rounded-3xl rotate-12 blur-3xl"></div>
      <div class="absolute bottom-20 left-10 w-80 h-80 bg-primary-300/10 rounded-3xl -rotate-12 blur-3xl"></div>
      <div class="absolute top-1/2 right-1/4 w-40 h-40 bg-success-300/20 rounded-2xl rotate-45 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-full h-full p-1 text-success-400/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="0.3">
          <rect x="3" y="6" width="18" height="15" rx="2.5" />
          <path d="M3 10h18M10 10v11M17 10v11" />
          <path d="M8 4v3M16 4v3" />
          <path d="M5.5 14l1 1l2-2" stroke-width="0.6" opacity="0.4" />
          <path d="M12 14l1 1l2-2" stroke-width="0.6" opacity="0.4" />
          <path d="M5.5 18l1 1l2-2" stroke-width="0.6" opacity="0.4" />
        </svg>
      </div>
      <div class="absolute bottom-1/3 left-1/3 w-32 h-32 bg-success-400/20 border-2 border-success-400/15 rounded-2xl rotate-12"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

useHead({
  title: 'Login - Bruve Saas'
})
</script>
