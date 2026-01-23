<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-16">
      <!-- Header -->
      <header class="text-center mb-12">
        <h1 class="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          Sistema de <span class="text-blue-600">Agendamento</span>
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Teste do Tailwind CSS funcionando perfeitamente!
        </p>
      </header>

      <!-- Cards Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <!-- Card 1 -->
        <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div class="w-12 h-12 bg-blue-500 rounded-lg mb-4 flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">Agendamentos</h3>
          <p class="text-gray-600">Gerencie seus compromissos de forma fácil e eficiente.</p>
        </div>

        <!-- Card 2 -->
        <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div class="w-12 h-12 bg-green-500 rounded-lg mb-4 flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">Clientes</h3>
          <p class="text-gray-600">Mantenha o cadastro dos seus clientes sempre atualizado.</p>
        </div>

        <!-- Card 3 -->
        <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div class="w-12 h-12 bg-purple-500 rounded-lg mb-4 flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">Relatórios</h3>
          <p class="text-gray-600">Acompanhe métricas e relatórios detalhados.</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="text-center space-x-4">
        <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
          Novo Agendamento
        </button>
        <button class="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-8 rounded-lg border border-gray-300 transition-colors duration-200 shadow-lg hover:shadow-xl">
          Ver Agenda
        </button>
      </div>

      <!-- Status Badge -->
      <div class="mt-8 text-center">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          Tailwind CSS funcionando!
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Página inicial do sistema de agendamento
useHead({
  title: 'Sistema de Agendamento - Página Inicial',
  meta: [
    { name: 'description', content: 'Sistema de agendamento com Nuxt 4 e Tailwind CSS' }
  ]
})
</script>