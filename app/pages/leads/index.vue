<template>
  <NuxtLayout>
    <div class="page-container">
      <LeadsHeader />

      <main class="main-content">
        <ClientOnly>
          <LeadsKanban v-if="showKanbanView" />
          <LeadsTable v-else />
          <LeadsLeadDetailsModal />
        </ClientOnly>
      </main>

      <!-- Notificação Flutuante (Toast) integrada ao sistema global ou local -->
      <Transition name="toast">
        <div v-if="toast.show" class="toast-notification" :class="toast.type">
          <div class="toast-content">
            <Icon 
              :name="toast.type === 'success' ? 'lucide:check-circle-2' : 'lucide:alert-circle'" 
              class="toast-icon" 
            />
            <span>{{ toast.message }}</span>
          </div>
          <div class="toast-progress" :class="toast.type"></div>
        </div>
      </Transition>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useLeads } from '~/composables/useLeads';

definePageMeta({
  layout: 'default'
});

const { showKanbanView, fetchLeads } = useLeads();

// TOAST LOCAL (Como estava no original)
const toast = useState('leads-local-toast', () => ({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
}));

onMounted(() => {
  fetchLeads();
});
</script>

<style scoped>
.page-container {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8fafc;
  overflow: hidden;
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* --- ESTILOS DO TOAST (NOTIFICAÇÃO) --- */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 9999;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  min-width: 320px;
  border: 1px solid #f1f5f9;
}

.toast-notification.success { border-left: 5px solid #10b981; }
.toast-notification.error { border-left: 5px solid #ef4444; }

.toast-content {
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #1e293b;
  font-weight: 600;
  font-size: 0.9rem;
}

.toast-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.toast-notification.success .toast-icon { color: #10b981; }
.toast-notification.error .toast-icon { color: #ef4444; }

.toast-progress {
  height: 3px;
  width: 100%;
  background: #f1f5f9;
  position: relative;
}

.toast-progress::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  transform-origin: left;
  animation: toast-progress 4s linear forwards;
}

.toast-progress.success::after { background: #10b981; }
.toast-progress.error::after { background: #ef4444; }

@keyframes toast-progress {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(100px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
