<template>
  <header class="page-header">
    <!-- Esquerda: Controles de Vista -->
    <div class="header-left-group">
      <div class="view-toggle-group">
        <button 
          class="view-toggle-btn" 
          @click="$emit('update:activeView', 'agenda')" 
          :class="{ 'active': activeView === 'agenda' }"
        >
          <Icon name="lucide:calendar" class="btn-icon" />
          <span>Agenda</span>
        </button>
        <button 
          class="view-toggle-btn" 
          @click="$emit('update:activeView', 'lista')" 
          :class="{ 'active': activeView === 'lista' }"
        >
          <Icon name="lucide:list" class="btn-icon" />
          <span>Lista</span>
        </button>
      </div>

      <button class="btn-add-agendamento" @click="$emit('novo-agendamento')">
        <Icon name="lucide:plus" class="btn-icon" />
        <span>Novo Agendamento</span>
      </button>
    </div>

    <!-- Centro: Navegação de Data ou Busca -->
    <div class="header-center-group">
      <Transition name="fade" mode="out-in">
        <div v-if="activeView === 'agenda'" class="date-navigation-wrapper">
          <ControladorSemana />
        </div>
        <div v-else class="search-container">
          <Icon name="lucide:search" class="search-icon" />
          <input 
            type="text" 
            placeholder="Pesquisar agendamentos..." 
            class="search-input"
            @input="$emit('search', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </Transition>
    </div>

    <!-- Direita: Seletor de Profissional e Perfil -->
    <div class="header-right-group">
      <div class="professional-selector-wrapper">
        <ProfissionalAtual 
          :profissionais="profissionais" 
          :loading="loading" 
        />
      </div>
      <div class="divider"></div>
      <UserProfileHeader />
    </div>
  </header>
</template>

<script setup lang="ts">
import UserProfileHeader from '~/components/UserProfileHeader.vue';
import ControladorSemana from './ControladorSemana.vue';
import ProfissionalAtual from './ProfissionalAtual.vue';
import type { AgProfissional } from '../../../shared/types/database';

defineProps<{
  activeView: 'agenda' | 'lista'
  profissionais: AgProfissional[]
  loading: boolean
}>();

defineEmits(['update:activeView', 'novo-agendamento', 'search']);
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 1.25rem;
  background: white;
  border-bottom: 0.5px solid #ebebeb;
  gap: 1rem;
  z-index: 10;
  min-height: 56px;
}

/* --- Header Actions --- */
.header-left-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
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
  height: 32px;
  padding: 0 0.75rem;
  border: none;
  background: white;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
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
  width: 0.9rem;
  height: 0.9rem;
}

/* Botão + Novo Agendamento */
.btn-add-agendamento {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0 0.75rem;
  height: 32px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background-color: #eef2ff;
  color: #4f46e5;
  white-space: nowrap;
}

.btn-add-agendamento:hover {
  background-color: #e0e7ff;
}

.btn-add-agendamento .btn-icon {
  width: 1rem;
  height: 1rem;
}

/* --- Header Center: Data ou Busca --- */
.header-center-group {
  flex: 1;
  display: flex;
  justify-content: center;
}

.date-navigation-wrapper {
  transform: scale(0.95);
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

/* --- Header Right --- */
.header-right-group {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

.professional-selector-wrapper {
  display: flex;
  min-height: 40px;
}

.divider {
  width: 1px;
  height: 24px;
  background-color: #e2e8f0;
}

/* Transições */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
