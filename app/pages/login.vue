<template>
  <div class="min-h-screen flex">
    <!-- Coluna Esquerda - Formulário -->
    <div class="w-full md:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
      <div class="w-full max-w-md">
        <!-- Logo mobile -->
        <div class="md:hidden text-center mb-8">
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
    <div class="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden rounded-l-lg">
      <div class="absolute inset-0 bg-black opacity-10"></div>
      
      <div class="relative z-10 flex flex-col justify-center px-12 text-white">
        <div class="mb-10">
          <h1 class="text-5xl font-bold mb-4 leading-tight">
            Sistema de <span class="text-green-400">Agendamento</span>
          </h1>
          <div class="w-24 h-1.5 bg-green-400 rounded"></div>
        </div>
        
        <p class="text-2xl font-light mb-10 leading-relaxed">
          Gerencie seus agendamentos de forma simples e eficiente. Organize sua agenda e otimize seu tempo.
        </p>
        
        <ul class="space-y-5 text-lg">
          <li class="flex items-start">
            <span class="w-2 h-2 rounded-full bg-green-400 mr-4 mt-2 flex-shrink-0"></span>
            Agendamentos em tempo real
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 rounded-full bg-green-400 mr-4 mt-2 flex-shrink-0"></span>
            Notificações automáticas
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 rounded-full bg-green-400 mr-4 mt-2 flex-shrink-0"></span>
            Relatórios detalhados
          </li>
        </ul>

        <div class="mt-16 pt-8 border-t border-green-400">
          <p class="text-base opacity-90 italic leading-relaxed">
            "A melhor solução para gerenciar seus agendamentos de forma eficiente e profissional."
          </p>
        </div>
      </div>

      <!-- Elementos decorativos -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-green-400/20 rounded-full -mr-32 -mt-32"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-green-400/20 rounded-full -ml-48 -mb-48"></div>
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
