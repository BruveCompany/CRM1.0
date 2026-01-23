<template>
  <div class="min-h-screen flex">
    <!-- Coluna Esquerda - Formulário -->
    <div class="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
      <div class="w-full max-w-md">
        <!-- Logo mobile -->
        <div class="lg:hidden text-center mb-8">
          <h1 class="text-3xl font-bold text-blue-600 mb-2">
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
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
      <div class="absolute inset-0 bg-black opacity-10"></div>
      
      <div class="relative z-10 flex flex-col justify-center px-16 text-white">
        <div class="mb-8">
          <h1 class="text-5xl font-bold mb-4">
            Bruve Saas
          </h1>
          <div class="w-20 h-1 bg-white"></div>
        </div>
        
        <p class="text-2xl font-light mb-8 leading-relaxed">
          Sistema de Agendamento Inteligente
        </p>
        
        <ul class="space-y-4 text-lg">
          <li class="flex items-center">
            <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Gestão completa de agendamentos
          </li>
          <li class="flex items-center">
            <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Notificações automáticas
          </li>
          <li class="flex items-center">
            <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Relatórios em tempo real
          </li>
        </ul>

        <div class="mt-12 pt-8 border-t border-white/20">
          <p class="text-sm opacity-75">
            "A melhor solução para gerenciar seus agendamentos de forma eficiente e profissional."
          </p>
        </div>
      </div>

      <!-- Elementos decorativos -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Login - Bruve Saas'
})
</script>