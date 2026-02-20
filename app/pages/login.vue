<template>
  <div class="h-screen flex overflow-hidden">
    <!-- Coluna Esquerda - Branding -->
    <div class="hidden md:flex md:w-[53%] bg-gradient-to-b from-primary-500 via-primary-600 to-primary-900 relative overflow-hidden rounded-r-lg">
      <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      
      <div class="relative z-10 flex flex-col justify-center px-12 text-white">
        <div class="mb-7">
          <h1 class="text-4xl font-semibold mb-4 leading-tight">
            Converta mais com seus <span class="text-success-400">leads</span>
          </h1>
          <div class="w-24 h-1.5 bg-success-400 rounded"></div>
        </div>
        
        <p class="text-xl font-light mb-7 leading-relaxed">
          Gerencie conversas, acompanhe leads e feche mais vendas pelo WhatsApp.
        </p>
        
        <ul class="space-y-4 text-lg">
          <li class="flex items-start">
            <span class="w-2 h-2 rounded-full bg-success-400 mr-4 mt-2 flex-shrink-0"></span>
            <div>
              <span class="block font-semibold">Leads em um só lugar</span>
              <span class="text-success-400 text-sm">Visualize, filtre e acompanhe cada oportunidade</span>
            </div>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 rounded-full bg-success-400 mr-4 mt-2 flex-shrink-0"></span>
            <div>
              <span class="block font-semibold">Respostas rápidas no WhatsApp</span>
              <span class="text-success-400 text-sm">Templates prontos para cada etapa do funil</span>
            </div>
          </li>
          <li class="flex items-start">
            <span class="w-2 h-2 rounded-full bg-success-400 mr-4 mt-2 flex-shrink-0"></span>
            <div>
              <span class="block font-semibold">Resultados em tempo real</span>
              <span class="text-success-400 text-sm">Saiba exatamente onde estão suas vendas</span>
            </div>
          </li>
        </ul>

        <div class="mt-12 pt-4 border-t border-success-400">
          <p class="text-xs font-light italic leading-relaxed">
            "Do primeiro contato ao fechamento: tudo organizado, tudo no WhatsApp."
          </p>
        </div>
      </div>

      <!-- Elementos decorativos modernos -->
      <div class="absolute top-20 right-10 w-72 h-72 bg-success-400/10 rounded-3xl rotate-12 blur-3xl"></div>
      <div class="absolute bottom-20 left-10 w-80 h-80 bg-primary-300/10 rounded-3xl -rotate-12 blur-3xl"></div>
      
      <!-- Diagrama Circular Contemporâneo (Letras nítidas) -->
      <div class="absolute right-[5%] bottom-[25%] w-[220px] h-[220px] hidden xl:block pointer-events-none transition-all duration-1000">
        <div class="relative w-full h-full">
          <!-- Círculos de Órbita Finos (Com opacidade) -->
          <div class="absolute inset-0 border-[0.5px] border-white/20 rounded-full"></div>
          <div class="absolute inset-[15%] border-[0.5px] border-[#2DD4BF]/30 rounded-full"></div>
          
          <!-- Nodes do Diagrama -->
          <!-- Conversa -->
          <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div class="w-10 h-10 bg-white/5 border border-white/20 rounded-xl backdrop-blur-md flex items-center justify-center opacity-40 shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span class="text-[8px] font-medium mt-2 tracking-[0.2em] text-white/75 uppercase">Conversa</span>
          </div>

          <!-- Lead -->
          <div class="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div class="w-10 h-10 bg-white/5 border border-white/20 rounded-xl backdrop-blur-md flex items-center justify-center opacity-40 shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span class="text-[8px] font-medium mt-2 tracking-[0.2em] text-white/75 uppercase">Lead</span>
          </div>

          <!-- Agenda -->
          <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex flex-col items-center">
            <div class="w-10 h-10 bg-white/5 border border-white/20 rounded-xl backdrop-blur-md flex items-center justify-center opacity-40 shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span class="text-[8px] font-medium mt-2 tracking-[0.2em] text-white/75 uppercase">Agenda</span>
          </div>

          <!-- Venda -->
          <div class="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div class="w-10 h-10 bg-white/5 border border-white/20 rounded-xl backdrop-blur-md flex items-center justify-center opacity-40 shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#2df4bf]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span class="text-[8px] font-medium mt-2 tracking-[0.2em] text-[#2df4bf]/75 uppercase">Venda</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Coluna Direita - Formulário -->
    <div class="w-full md:w-[47%] flex items-center justify-center px-6 py-8 bg-neutral-50 overflow-y-auto">
      <div class="w-full max-w-md">
        <!-- Card do formulário -->
        <div class="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <FormLogin />
        </div>

        <!-- Footer -->
        <div class="mt-8 text-center">
          <p class="text-sm text-neutral-500">
            © 2026 Bruve Saas. Todos os direitos reservados.
          </p>
        </div>
      </div>
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
