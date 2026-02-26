<template>
  <div class="stepper-container">
    <div 
      v-for="(stage, index) in stages" 
      :key="index" 
      class="step-item"
      :class="getStageStatus(index)"
    >
      <!-- Linha Conectora (aparece antes de cada item, exceto o primeiro) -->
      <div 
        v-if="index > 0" 
        class="connector" 
        :class="{ 'connector--active': index <= currentStageIndex }"
        :style="getConnectorStyle(index)"
      ></div>

      <!-- Círculo e Label da Etapa -->
      <div class="stage-wrapper">
        <div 
          class="stage-circle" 
          :style="getCircleStyle(index, stage)"
        >
          <Icon 
            v-if="getStageStatus(index) === 'completed'" 
            name="heroicons:check-20-solid" 
            class="check-icon" 
          />
          <span 
            v-else 
            class="stage-number"
            :style="getNumberStyle(index, stage)"
          >
            {{ index + 1 }}
          </span>
        </div>
        <span 
          class="stage-label"
          :style="getLabelStyle(index, stage)"
        >
          {{ stage.name }}
        </span>
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
 * Cores dinâmicas por estágio, design modernizado.
 * ─────────────────────────────────────────────────────────────────
 */

interface Stage {
  name: string;
  color: string;
}

interface Props {
  /** Lista de objetos de etapas do funil { name, color } */
  stages: Stage[];
  /** Nome exato da etapa em que o lead se encontra atualmente */
  currentStageName: string;
}

const props = defineProps<Props>();

// Encontra o índice da etapa atual para lógica de comparação
const currentStageIndex = computed(() => props.stages.findIndex(s => s.name === props.currentStageName));

/**
 * Determina o estado da etapa baseado na posição atual.
 * @param index Posição da etapa no array
 */
const getStageStatus = (index: number) => {
  if (index < currentStageIndex.value) return 'completed';
  if (index === currentStageIndex.value) return 'current';
  return 'inactive';
};

/**
 * Estilos dinâmicos para a linha conectora
 */
const getConnectorStyle = (index: number) => {
  const isCompleted = index <= currentStageIndex.value;
  if (isCompleted) {
    // A cor da linha vem da etapa anterior (ou da atual se preferir)
    const prevColor = props.stages[index - 1]?.color || '#4f46e5';
    return {
      backgroundColor: prevColor,
      boxShadow: `0 0 10px ${prevColor}33`
    };
  }
  return {}; // Segue o padrão do CSS
};

/**
 * Estilos dinâmicos para o círculo
 */
const getCircleStyle = (index: number, stage: Stage) => {
  const status = getStageStatus(index);
  
  if (status === 'completed') {
    return {
      backgroundColor: stage.color,
      borderColor: stage.color,
      boxShadow: `0 4px 12px ${stage.color}40`
    };
  }
  
  if (status === 'current') {
    return {
      borderColor: stage.color,
      boxShadow: `0 0 15px ${stage.color}40`
    };
  }
  
  // Inativo: Borda com cor da etapa em baixa opacidade
  return {
    borderColor: `${stage.color}40`,
    backgroundColor: '#f8fafc'
  };
};

/**
 * Estilos dinâmicos para o número interno
 */
const getNumberStyle = (index: number, stage: Stage) => {
  const status = getStageStatus(index);
  if (status === 'current') {
    return { color: stage.color };
  }
  return {};
};

/**
 * Estilos dinâmicos para o label (nome da etapa)
 */
const getLabelStyle = (index: number, stage: Stage) => {
  const status = getStageStatus(index);
  if (status === 'completed') return { color: stage.color };
  if (status === 'current') return { color: '#1e293b', fontWeight: '850' };
  return { color: '#94a3b8' };
};
</script>

<style scoped>
/* Container Principal */
.stepper-container {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  padding: 1.5rem 1.25rem;
  background: #ffffff;
  border-radius: 1.5rem;
  border: 1px solid #f1f5f9;
  user-select: none;
  gap: 0.25rem;
}

.step-item {
  display: flex;
  align-items: flex-start;
  flex: 0 0 auto;
  position: relative;
}

/* ── Linha Conectora ── */
.connector {
  width: 50px;
  height: 2px;
  background: #e2e8f0;
  margin-top: 15px;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  transition: all 0.4s ease;
  border-radius: 2px;
  flex-shrink: 0;
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
  background: #ffffff;
}

.stage-number {
  font-size: 0.75rem;
  font-weight: 800;
  color: #94a3b8;
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
  transition: all 0.3s ease;
  white-space: nowrap;
}

/* ── ESTADO: ATUAL (Scale) ── */
.step-item.current .stage-circle {
  transform: scale(1.15);
}

/* Responsividade Básica */
@media (max-width: 768px) {
  .stage-label {
    display: none;
  }
  .connector {
    margin: 0 0.5rem;
    width: 30px;
  }
}
</style>
