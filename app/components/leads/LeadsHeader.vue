<template>
  <header class="page-header">
    <!-- Esquerda: Controles de Vista e Add Lead -->
    <div class="header-left-group">
      <div class="view-toggle-group">
        <button class="view-toggle-btn" @click="showKanbanView = true" :class="{ 'active': showKanbanView }">
            <Icon name="lucide:columns-3" class="btn-icon" />
            <span>Kanban</span>
        </button>
        <button class="view-toggle-btn" @click="showKanbanView = false" :class="{ 'active': !showKanbanView }">
            <Icon name="lucide:list" class="btn-icon" />
            <span>Lista</span>
        </button>
      </div>
      <button class="btn-add-lead">+ Criar Lead</button>
    </div>

    <!-- Centro: Barra de Pesquisa -->
    <div class="header-center-group">
      <div class="search-container">
        <Icon name="lucide:search" class="search-icon" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Pesquisar leads..." 
          class="search-input"
        />
      </div>
    </div>

    <!-- Direita: Perfil do Vendedor e Status -->
    <div class="header-right-group">
      <div class="user-profile">
        <div class="user-info">
          <span class="user-name">Maria</span>
          <span class="user-status-text">online</span>
        </div>
        <div class="avatar-wrapper">
          <img src="https://api.dicebear.com/7.x/initials/svg?seed=Maria" alt="Avatar" class="user-avatar" />
          <div class="online-indicator"></div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useLeads } from '~/composables/useLeads';
const { showKanbanView, searchQuery } = useLeads();
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e1e5e8;
  gap: 1.5rem;
}

/* --- Header Actions (Botões Kanban/Lista) --- */
.header-left-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.view-toggle-group {
  display: flex;
  align-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  overflow: hidden;
  background: white;
}

.view-toggle-btn {
  height: 34px;
  padding: 0 0.9rem;
  border: none;
  background: white;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.15s;
}

.view-toggle-btn:hover {
  background-color: #f8fafc;
  color: #1e293b;
}

.view-toggle-btn.active {
  background-color: #eef2ff;
  color: #4f46e5;
}

.view-toggle-btn .btn-icon {
  width: 1rem;
  height: 1rem;
}

/* Botão + Criar Lead */
.btn-add-lead {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 1rem;
  height: 34px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background-color: #eef2ff;
  color: #4f46e5;
  white-space: nowrap;
}

.btn-add-lead:hover {
  background-color: #e0e7ff;
}

/* --- Header Search --- */
.header-center-group {
  flex: 2;
  display: flex;
  justify-content: center;
}

.search-container {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  width: 1rem;
  height: 1rem;
}

.search-input {
  width: 100%;
  height: 34px;
  padding: 0 1rem 0 2.5rem;
  background: #f1f5f9;
  border: 1px solid transparent;
  border-radius: 20px;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.search-input:focus {
  background: white;
  border-color: #cbd5e1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

/* --- User Profile --- */
.header-right-group {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  text-align: right;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 2px;
}

.user-status-text {
  font-size: 0.7rem;
  color: #22c55e;
  font-weight: 600;
}

.avatar-wrapper {
  position: relative;
  width: 32px;
  height: 32px;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 0 0 1px #e2e8f0;
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background-color: #22c55e;
  border: 2px solid white;
  border-radius: 50%;
}
</style>
