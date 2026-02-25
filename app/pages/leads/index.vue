<template>
  <NuxtLayout name="default">
    <div class="leads-page-container">
      <!-- Cabeçalho de Navegação e Filtros -->
      <LeadsHeader />

      <main class="leads-content">
        <!-- Dashboard / Título Local (Aparece apenas na Lista) -->
        <div v-if="!showKanbanView" class="px-6 pt-6 flex items-center justify-between">
          <div class="space-y-1.5">
            <h1 class="text-2xl font-semibold text-gray-900 tracking-tight">Lista de Leads</h1>
            <p class="text-sm text-slate-400 font-medium">Análise de performance e métricas comerciais</p>
          </div>
        </div>

        <!-- Renderização Condicional: Kanban vs Tabela -->
        <div class="view-wrapper">
          <ClientOnly>
            <Transition name="fade" mode="out-in">
              <LeadsKanban v-if="showKanbanView" />
              <LeadsTable v-else />
            </Transition>
            
            <template #placeholder>
              <div class="flex flex-col items-center justify-center py-32 opacity-20">
                <Icon name="svg-spinners:18-dots-indicator" class="w-12 h-12 mb-4" />
                <p class="text-sm font-bold uppercase tracking-widest">Sincronizando Leads...</p>
              </div>
            </template>
          </ClientOnly>
        </div>
      </main>

      <!-- Detalhes do Lead (Modal Lateral ou Central) -->
      <LeadsLeadDetailsModal />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useLeads } from '~/composables/useLeads';
import LeadsHeader from '~/components/leads/LeadsHeader.vue';
import LeadsKanban from '~/components/leads/LeadsKanban.vue';
import LeadsTable from '~/components/leads/LeadsTable.vue';
import LeadsLeadDetailsModal from '~/components/leads/LeadsLeadDetailsModal.vue';

const { 
  fetchLeads, 
  fetchStatuses, 
  showKanbanView, 
  filteredLeadsList,
  subscribeToStatusChanges,
  subscribeToAppointmentChanges
} = useLeads();

let statusSub: any = null;
let appointSub: any = null;

onMounted(async () => {
  // Carregamento inicial de dados
  await Promise.all([
    fetchStatuses(),
    fetchLeads()
  ]);

  // Inscricões Realtime
  statusSub = subscribeToStatusChanges();
  appointSub = subscribeToAppointmentChanges();
});

onUnmounted(() => {
  if (statusSub) statusSub.unsubscribe();
  if (appointSub) appointSub.unsubscribe();
});

// SEO
useHead({
  title: 'Gestão de Leads | Painel de Atendimento',
  meta: [
    { name: 'description', content: 'Gerencie seu pipeline de vendas de forma inteligente e visual.' }
  ]
});
</script>

<style scoped>
.leads-page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8fafc;
  overflow: hidden;
}

.leads-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.view-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* Transições */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.content-wrapper) {
  padding-top: 1rem !important;
}
</style>
