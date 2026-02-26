<template>
  <div class="p-6 lg:p-8 space-y-8 animate-fade-in max-w-[1600px] mx-auto">
    <!-- Cabeçalho da Página -->
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-neutral-900 tracking-tight">Dashboard</h1>
        <p class="text-neutral-500 mt-1 font-medium">Bem-vindo de volta! Aqui está o resumo do seu CRM hoje.</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm flex items-center gap-2">
          <ClientOnly>
            <Icon name="heroicons:calendar" class="w-4 h-4" />
          </ClientOnly>
          Últimos 30 dias
        </button>
        <button class="px-4 py-2 bg-primary-600 rounded-lg text-sm font-semibold text-white hover:bg-primary-700 transition-colors shadow-sm flex items-center gap-2">
          <ClientOnly>
            <Icon name="heroicons:plus" class="w-4 h-4" />
          </ClientOnly>
          Novo Lead
        </button>
      </div>
    </header>

    <!-- Grade de KPIs -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <UiKpiCard 
        title="Leads Ativos" 
        value="42" 
        icon="heroicons:user-group" 
      />
      <UiKpiCard 
        title="Próximas Ações" 
        value="12" 
        icon="heroicons:clock" 
      />
      <UiKpiCard 
        title="Taxa de Conversão" 
        value="24.8%" 
        icon="heroicons:arrow-trending-up" 
      />
      <UiKpiCard 
        title="Valor em Negociação" 
        value="R$ 158.400" 
        icon="heroicons:currency-dollar" 
      />
    </section>

    <!-- Layout em Grade Principal -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Minha Agenda (Placeholder) -->
      <section class="lg:col-span-2 flex flex-col h-[450px]">
        <div class="flex items-center justify-between mb-4 px-1">
          <h2 class="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <ClientOnly>
              <Icon name="heroicons:calendar-days" class="w-5 h-5 text-primary-500" />
            </ClientOnly>
            Minha Agenda
          </h2>
          <button class="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">Ver agenda completa</button>
        </div>
        
        <div class="flex-1 bg-white rounded-2xl border border-neutral-200 border-dashed flex flex-col items-center justify-center p-8 bg-neutral-50/30 group hover:border-primary-300 transition-colors duration-500">
          <div class="w-16 h-16 bg-white rounded-full shadow-soft flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
            <ClientOnly>
              <Icon name="heroicons:calendar-days" class="w-8 h-8 text-neutral-300 group-hover:text-primary-400" />
            </ClientOnly>
          </div>
          <h3 class="text-lg font-semibold text-neutral-700">Seção em Desenvolvimento</h3>
          <p class="text-neutral-500 text-center max-w-xs mt-2">Estamos preparando o calendário para você visualizar seus compromissos.</p>
        </div>
      </section>

      <!-- Funil de Vendas (Placeholder) -->
      <section class="flex flex-col h-[450px]">
        <div class="flex items-center justify-between mb-4 px-1">
          <h2 class="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <ClientOnly>
              <Icon name="heroicons:funnel" class="w-5 h-5 text-success-500" />
            </ClientOnly>
            Funil de Vendas
          </h2>
        </div>
        
        <div class="flex-1 bg-white rounded-2xl border border-neutral-200 border-dashed flex flex-col items-center justify-center p-8 bg-neutral-50/30 group hover:border-success-300 transition-colors duration-500">
          <div class="w-16 h-16 bg-white rounded-full shadow-soft flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
            <ClientOnly>
              <Icon name="heroicons:chart-bar" class="w-8 h-8 text-neutral-300 group-hover:text-success-400" />
            </ClientOnly>
          </div>
          <h3 class="text-lg font-semibold text-neutral-700">Visão do Funil</h3>
          <p class="text-neutral-500 text-center max-w-xs mt-2">O funil de vendas será integrado aos seus leads em breve.</p>
        </div>
      </section>

      <!-- Atividades Recentes (Placeholder) -->
      <section class="lg:col-span-3 flex flex-col">
        <div class="flex items-center justify-between mb-4 px-1">
          <h2 class="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <ClientOnly>
              <Icon name="heroicons:rocket-launch" class="w-5 h-5 text-warning-500" />
            </ClientOnly>
            Atividades Recentes
          </h2>
        </div>
        
        <div class="h-[200px] bg-white rounded-2xl border border-neutral-200 border-dashed flex flex-col items-center justify-center p-8 bg-neutral-50/30 group hover:border-warning-300 transition-colors duration-500">
          <div class="flex items-center gap-4">
            <ClientOnly>
              <Icon name="heroicons:clock" class="w-8 h-8 text-neutral-300 group-hover:text-warning-400" />
            </ClientOnly>
            <p class="text-neutral-500 font-medium">Histórico de ações recentes aparecerá aqui.</p>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Página: Dashboard
 */

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Dashboard | Sistema CRM',
  meta: [
    { name: 'description', content: 'Visão geral de performance e leads.' }
  ]
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
