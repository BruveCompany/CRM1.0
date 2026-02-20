<template>
  <div class="kanban-card">
    <h4 class="card-title">{{ task.title }}</h4>
    <p class="card-details">{{ task.details }}</p>
    <span v-if="task.badge" class="card-badge">{{ task.badge }}</span>
  </div>
</template>

<script setup lang="ts">
interface Task {
  id: string;
  title: string;
  details: string;
  badge?: string;
}

defineProps<{
  task: Task;
}>();
</script>

<style scoped>
.kanban-card {
  background-color: #ffffff;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: grab;
  user-select: none;
}

.kanban-card:hover {
  background-color: #f8f9fa;
}

.card-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #333;
}

.card-details {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.75rem;
}

.card-badge {
  background-color: #e34055;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
  display: inline-block;
}
</style>
