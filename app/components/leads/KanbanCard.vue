<template>
  <div 
    class="kanban-card" 
    :style="{ '--column-color': columnColor }"
    draggable="true"
    @dragstart="$emit('dragstart', $event)"
    @click="openDetails(task.id)"
  >
    <div class="card-content">
      <div class="card-header">
        <h4 class="card-title">{{ task.leadName }}</h4>
        <!-- Ícone de Status (Alerta, Check, X - Movido para o topo) -->
        <div v-if="task.statusIcon" class="card-status-icon-wrapper" :style="{ 'border-color': columnColor }">
          <Icon :name="`lucide:${task.statusIcon}`" :class="`status-icon status-${task.statusIcon}`" :style="{ 'color': columnColor }" />
        </div>
      </div>
      <p class="card-phone-number">{{ task.phone }}</p>
      
      <div class="card-meta">
        <div class="card-meta-left">
          <!-- Avatar do Vendedor -->
          <div class="vendedor-avatar" :style="{ backgroundColor: 'color-mix(in srgb, ' + columnColor + ', white 60%)' }">
            <span>{{ task.avatarText || '??' }}</span>
          </div>
          <!-- Nome do Vendedor e Última Atividade -->
          <div class="vendedor-info">
            <span class="vendedor-nome">{{ task.vendedorNome || 'Não Atribuído' }}</span>
            <span v-if="task.lastActivityText" class="card-last-activity-small">{{ task.lastActivityText }}</span>
          </div>
        </div>
        <div class="card-meta-right">
          <!-- Badge de Mensagens Não Lidas (Círculo Vermelho) -->
          <div v-if="task.unreadMessages" class="card-unread-messages">
            <span class="message-count">{{ task.unreadMessages }}</span>
          </div>
          
          <!-- Seta para Abrir Detalhes -->
          <div class="card-arrow-icon">
            <Icon name="lucide:chevron-right" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLeads } from '~/composables/useLeads';
import type { LeadTask } from '~/composables/useLeads';

const props = defineProps<{
  task: LeadTask;
  columnColor: string;
}>();

const { openDetails } = useLeads();

defineEmits(['dragstart']);
</script>

<style scoped>
.kanban-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 0;
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  cursor: grab;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  display: flex;
  align-items: stretch;
  border: 1px solid #e2e8f0;
  min-height: 100px;
  overflow: hidden;
  user-select: none;
}

.kanban-card:hover {
  background-color: #fcfdfe; /* Fundo levemente alterado */
  border-color: #cbd5e1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); /* Sombra muito discreta */
}

.card-content {
  flex-grow: 1;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.1rem;
}

.card-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: #334155;
  margin: 0;
}

.card-phone-number {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid color-mix(in srgb, var(--column-color), transparent 92%);
}

.card-meta-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vendedor-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.vendedor-info {
  display: flex;
  flex-direction: column;
}

.vendedor-nome {
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  line-height: 1.2;
}

.card-last-activity-small {
  font-size: 0.7rem;
  color: #94a3b8;
}

.card-meta-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-unread-messages {
  background-color: #dc2626;
  color: white;
  min-width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0 4px;
}

.card-status-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid transparent;
  background-color: white;
}

.status-icon {
  width: 1rem;
  height: 1rem;
}

.card-arrow-icon {
  color: #cbd5e1;
  display: flex;
  align-items: center;
}
</style>
