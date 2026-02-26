<template>
  <div class="stepper-container">
    <div 
      v-for="(stage, index) in stages" 
      :key="index" 
      class="step-item"
      :class="getStageStatus(index)"
    >
      <!-- Linha Conectora (aparece antes de cada item, exceto o primeiro) -->
      <div v-if="index > 0" class="connector" :class="{ 'connector--active': index <= currentStageIndex }"></div>

      <!-- Círculo e Label da Etapa -->
      <div class="stage-wrapper">
        <div class="stage-circle">
          <Icon v-if="getStageStatus(index) === 'completed'" name="heroicons:check-20-solid" class="check-icon" />
          <span v-else class="stage-number">{{ index + 1 }}</span>
        </div>
        <span class="stage-label">{{ stage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

/**
 * FunilVendasStepper.vue
 * ─────────────────────────────────────────────────────────────────
 * Exibe o progresso de um lead através de etapas customizáveis.
 * Design moderno, horizontal e totalmente reativo.
 * ─────────────────────────────────────────────────────────────────
 */

interface Props {
  /** Lista de nomes das etapas do funil */
  stages: string[];
  /** Nome exato da etapa em que o lead se encontra atualmente */
  currentStage: string;
}

const props = defineProps<Props>();

// Encontra o índice da etapa atual para lógica de comparação
const currentStageIndex = computed(() => props.stages.indexOf(props.currentStage));

/**
 * Determina o estado da etapa baseado na posição atual.
 * @param index Posição da etapa no array
 */
const getStageStatus = (index: number) => {
  if (index < currentStageIndex.value) return 'completed';
  if (index === currentStageIndex.value) return 'current';
  return 'inactive';
};
</script>

<style scoped>
/* Container Principal */
.stepper-container {
  display: flex;
  align-items: flex-start;
  justify-content: center; /* Centraliza o stepper no meio do card */
  width: 100%;
  padding: 1.5rem 1.25rem;
  background: #ffffff;
  border-radius: 1.5rem;
  border: 1px solid #f1f5f9;
  user-select: none;
  gap: 0.25rem; /* Ajuste fino do espaçamento entre itens */
}

.step-item {
  display: flex;
  align-items: flex-start;
  flex: 0 0 auto; /* Impede que o item estique desproporcionalmente */
  position: relative;
}

/* ── Linha Conectora ── */
.connector {
  width: 50px; /* Largura fixa para manter a proporção elegante */
  height: 2px;
  background: #e2e8f0;
  margin-top: 15px; /* Alinhamento vertical com o centro do círculo */
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  transition: all 0.4s ease;
  border-radius: 2px;
  flex-shrink: 0;
}

.connector--active {
  background: #4f46e5; /* Cor ativa (brand) */
  box-shadow: 0 0 10px rgba(79, 70, 229, 0.2);
}

/* ── Wrapper da Etapa (Círculo + Texto) ── */
.stage-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  z-index: 10;
}

/* ── Círculo de Estado ── */
.stage-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.stage-number {
  font-size: 0.75rem;
  font-weight: 800;
}

.check-icon {
  width: 18px;
  height: 18px;
  color: #ffffff;
}

/* Label da Etapa */
.stage-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  transition: color 0.3s ease;
  white-space: nowrap;
}

/* ── ESTADO: CONCLUÍDO (Completed) ── */
.step-item.completed .stage-circle {
  background: #4f46e5; /* Pode ser verde se preferir: #10b981 */
  border-color: #4f46e5;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
}

.step-item.completed .stage-label {
  color: #4f46e5;
}

/* ── ESTADO: ATUAL (Current) ── */
.step-item.current .stage-circle {
  background: #ffffff;
  border: 2px solid #4f46e5;
  transform: scale(1.15);
  box-shadow: 0 0 15px rgba(79, 70, 229, 0.25);
}

.step-item.current .stage-number {
  color: #4f46e5;
}

.step-item.current .stage-label {
  color: #1e293b;
  font-weight: 850;
}

/* ── ESTADO: INATIVO (Inactive/Future) ── */
.step-item.inactive .stage-circle {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
}

.step-item.inactive .stage-number {
  color: #94a3b8;
}

/* Responsividade Básica */
@media (max-width: 768px) {
  .stage-label {
    display: none; /* Esconde texto em telas muito pequenas para não quebrar */
  }
  .connector {
    margin: 0 0.5rem;
  }
}
</style>
