<template>
  <header class="page-header">

    <!-- ESQUERDA: Toggle de visão + controles contextuais -->
    <div class="header-left-group">
      <!-- Toggle Agenda/Lista — sempre visível -->
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

      <!-- [AGENDA] Botão Novo Agendamento -->
      <template v-if="activeView === 'agenda'">
        <button class="btn-add-agendamento" @click="$emit('novo-agendamento')">
          <Icon name="lucide:plus" class="btn-icon" />
          <span>Novo Agendamento</span>
        </button>
      </template>

      <!-- [LISTA] Busca + Seletor de profissional agrupados -->
      <template v-else>
        <!-- [LISTA] Filtros lado a lado, cada um com identidade própria -->
        <div class="filters-group">

          <!-- Campo de busca: componente independente -->
          <div class="search-container">
            <Icon name="lucide:search" class="search-icon" />
            <input
              type="text"
              placeholder="Pesquisar agendamentos..."
              class="search-input"
              @input="$emit('search', ($event.target as HTMLInputElement).value)"
            />
          </div>

          <!-- Seletor de profissional: componente independente -->
          <ProfissionalAtual
            :profissionais="profissionais"
            :loading="loading"
          />

        </div>
      </template>
    </div>

    <!-- CENTRO: Data (apenas na Agenda) -->
    <div class="header-center-group">
      <Transition name="fade" mode="out-in">
        <div v-if="activeView === 'agenda'" class="date-navigation-wrapper">
          <ControladorSemana />
        </div>
      </Transition>
    </div>

    <!-- DIREITA: Profissional (agenda) + Perfil -->
    <div class="header-right-group">
      <!-- [AGENDA] Seletor de profissional fica aqui -->
      <template v-if="activeView === 'agenda'">
        <div class="professional-selector-wrapper">
          <ProfissionalAtual
            :profissionais="profissionais"
            :loading="loading"
          />
        </div>
        <div class="divider"></div>
      </template>

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
  border: 1px solid #E4E2F6;
  border-radius: 6px;
  overflow: hidden;
  background: #F3F2FB;
}

.view-toggle-btn {
  height: 32px;
  padding: 0 0.75rem;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.15s;
}

.view-toggle-btn:hover {
  background-color: #ECEAF7;
  color: #4338CA;
}

.view-toggle-btn.active {
  background-color: #ECEAF7;
  color: #4338CA;
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
  background-color: #F3F2FB;
  color: #4338CA;
  white-space: nowrap;
}

.btn-add-agendamento:hover {
  background-color: #ECEAF7;
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

/* [LISTA] Container flex — apenas agrupa, sem visual próprio */
.filters-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Campo de busca: componente independente com identidade visual própria */
.search-container {
  position: relative;
  display: flex;
  align-items: center;
  height: 32px;
  width: 220px;
  background: #F3F2FB;
  border: 1px solid #E4E2F6;
  border-radius: 6px;
  padding: 0 10px 0 32px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.search-container:focus-within {
  border-color: #C7C3EC;
  box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.08);
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #9691D4;
  width: 0.85rem;
  height: 0.85rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 100%;
  padding: 0;
  background: transparent;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  color: #4338CA;
  transition: all 0.2s;
}

.search-input::placeholder {
  color: #9691D4;
  font-weight: 400;
}

.search-input:focus {
  outline: none;
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
