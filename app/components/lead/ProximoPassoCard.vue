<template>
  <!--
    ProximoPassoCard.vue
    ─────────────────────────────────────────────────────────────────
    Exibe o próximo passo/ação agendada para este lead.

    DOIS ESTADOS:
      1. Com ação  → mostra detalhes: tipo, título, data/hora e responsável.
      2. Sem ação  → exibe aviso e botão para agendar; emite @agendar ao clicar.
    ─────────────────────────────────────────────────────────────────
  -->
  <div class="proximo-passo-card">

    <!-- ── Cabeçalho do Card ── -->
    <div class="card-header">
      <div class="card-header-top">
        <div class="card-icon-wrap">
          <Icon name="lucide:arrow-right-circle" class="card-icon" />
        </div>
        <h3 class="card-title">Próximo Passo</h3>
      </div>

      <!-- Badge de tipo quando há ação (Agora abaixo do título) -->
      <div v-if="acao" class="card-header-badge">
        <span class="tipo-badge">
          <Icon name="lucide:tag" class="badge-icon" />
          {{ acao.tipo }}
        </span>
      </div>
    </div>

    <!-- ─────────────────────────────────────────────
      ESTADO 1: Há uma ação agendada → exibe detalhes
      ───────────────────────────────────────────── -->
    <div v-if="acao" class="card-body card-body--with-action">

      <!-- Título da ação -->
      <div class="detail-row detail-row--title">
        <Icon name="lucide:clipboard-list" class="detail-icon" />
        <span class="detail-titulo">{{ acao.titulo }}</span>
      </div>

      <!-- Data e hora formatada -->
      <div class="detail-row">
        <Icon name="lucide:calendar-clock" class="detail-icon" />
        <div class="detail-content">
          <span class="detail-label">Agendado para</span>
          <span class="detail-value">{{ dataFormatada }}</span>
        </div>
      </div>

      <!-- Responsável pela ação -->
      <div class="detail-row">
        <Icon name="lucide:user-check" class="detail-icon" />
        <div class="detail-content">
          <span class="detail-label">Responsável</span>
          <span class="detail-value">{{ acao.responsavel }}</span>
        </div>
      </div>

    </div>

    <!-- ─────────────────────────────────────────────
      ESTADO 2: Nenhuma ação definida → aviso + botão
      ───────────────────────────────────────────── -->
    <div v-else class="card-body card-body--empty">

      <!-- Ícone decorativo de aviso -->
      <div class="empty-icon-wrap">
        <Icon name="lucide:calendar-x-2" class="empty-icon" />
      </div>

      <!-- Mensagem de aviso -->
      <p class="empty-message">Nenhum próximo passo definido!</p>
      <p class="empty-hint">Agende o próximo contato para manter o acompanhamento em dia.</p>

      <!--
        Botão de ação principal.
        Ao ser clicado, emite o evento "agendar" para o componente pai,
        que abrirá o modal de agendamento correspondente.
      -->
      <button class="btn-agendar" @click="emit('agendar')">
        <Icon name="lucide:calendar-plus" class="btn-icon" />
        + Agendar Próximo Contato
      </button>

    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// ─────────────────────────────────────────────────────────────────
// INTERFACE DA PROP
// Define a estrutura esperada do objeto de ação.
// O campo "acao" é opcional — pode ser null/undefined quando não
// há nenhum próximo passo agendado para o lead.
// ─────────────────────────────────────────────────────────────────
interface Acao {
  tipo: string;        // Ex: 'Reunião', 'Ligação', 'E-mail'
  titulo: string;      // Ex: 'Apresentar proposta'
  data: string;        // ISO 8601, ex: '2026-02-28T10:30:00'
  hora_fim?: string;   // Ex: '09:00' — hora de término (HH:MM)
  responsavel: string; // Ex: 'José Carlos'
}

const props = defineProps<{
  /**
   * Objeto com os detalhes da próxima ação agendada.
   * Quando null ou undefined, o card exibe o estado "sem ação".
   */
  acao?: Acao | null;
}>();

// ─────────────────────────────────────────────────────────────────
// EVENTOS
// O componente pai deve ouvir @agendar para abrir o modal.
// ─────────────────────────────────────────────────────────────────
const emit = defineEmits<{
  (e: 'agendar'): void;
}>();

// ─────────────────────────────────────────────────────────────────
// FORMATAÇÃO DE DATA
// Converte a string ISO 8601 em formato legível em pt-BR.
// Ex: '2026-02-28T10:30:00' → 'Sábado, 28 de fevereiro, às 10:30'
// ─────────────────────────────────────────────────────────────────
const dataFormatada = computed<string>(() => {
  if (!props.acao?.data) return '—';

  try {
    /**
     * CORREÇÃO DE FUSO HORÁRIO (timezone fix)
     * ─────────────────────────────────────────────────────────────
     * Strings sem sufixo de timezone (ex: '2026-02-27T08:00:00') são
     * interpretadas como UTC pelo JavaScript. Isso gera uma diferença
     * de 3 horas no Brasil (BRT = UTC-3), exibindo o horário errado.
     *
     * Solução: parsear os componentes manualmente e usar o construtor
     * `new Date(year, month, day, hour, min)` que SEMPRE usa o fuso local.
     * ─────────────────────────────────────────────────────────────
     */
    const raw = props.acao.data.replace('Z', ''); // remove 'Z' UTC se presente
    const parts = raw.split('T');
    const dateParts = (parts[0] || '').split('-');
    const timeParts = (parts[1] || '00:00:00').split(':');

    const year   = parseInt(dateParts[0] || '0', 10);
    const month  = parseInt(dateParts[1] || '1', 10);
    const day    = parseInt(dateParts[2] || '1', 10);
    const hour   = parseInt(timeParts[0] || '0', 10);
    const minute = parseInt(timeParts[1] || '0', 10);

    // Construtor com componentes individuais → SEMPRE interpreta como hora LOCAL
    const date = new Date(year, month - 1, day, hour, minute);

    // Dia da semana por extenso
    const diaSemana = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    // Dia, mês por extenso e ano
    const dataParte = date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
    });
    // Horário
    const horaParte = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Capitaliza o primeiro caractere do dia da semana
    const diaSemanaCapital = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

    // Se houver hora de término, formatamos como intervalo "das 08:00 às 09:00"
    if (props.acao.hora_fim) {
      const horaFim = props.acao.hora_fim.substring(0, 5);
      return `${diaSemanaCapital}, ${dataParte}, das ${horaParte} às ${horaFim}`;
    }

    return `${diaSemanaCapital}, ${dataParte}, às ${horaParte}`;
  } catch {
    return props.acao?.data ?? '—'; // Fallback: retorna a string original
  }
});

/**
 * Extrai apenas o horário de início no formato HH:MM
 * para exibir lado a lado com hora_fim (ex: "08:00 – 09:00").
 */
const horaInicioFormatada = computed<string>(() => {
  if (!props.acao?.data) return '';
  try {
    const parts = props.acao.data.replace('Z', '').split('T');
    const timeParts = (parts[1] || '00:00').split(':');
    const hour   = parseInt(timeParts[0] || '0', 10);
    const minute = parseInt(timeParts[1] || '0', 10);
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  } catch {
    return '';
  }
});
</script>

<style scoped>
/* ── Wrapper do Card ── */
.proximo-passo-card {
  background: #ffffff;
  border: 1px solid #eef2f6;
  border-radius: 16px;
  box-shadow: 0 4px 20px -5px rgba(79, 70, 229, 0.08);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.proximo-passo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.12);
}

/* ── Cabeçalho ── */
.card-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1.1rem 1.25rem 0.9rem;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(to bottom right, #ffffff, #fcfdff);
  gap: 0.75rem; /* Espaço entre o título e a badge abaixo */
}

.card-header-top {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.card-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 9px;
  background: #f0f3ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.05);
}

.card-icon {
  width: 15px;
  height: 15px;
  color: #4f46e5;
}

.card-title {
  font-size: 0.72rem;
  font-weight: 750;
  color: #475569; /* Slate 600 - Mais suave que o black */
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.card-header-badge {
  width: 100%;
}

/* Badge do tipo de ação */
.tipo-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.75rem;
  background: #f5f3ff;
  color: #6366f1;
  border-radius: 10px;
  font-size: 0.6rem;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border: 1px solid #e0e7ff;
}

.badge-icon {
  width: 10px;
  height: 10px;
  opacity: 0.7;
}

/* ── Corpo do Card ── */
.card-body {
  padding: 1.25rem 1rem;
}

/* ── ESTADO 1: Com ação ── */
.card-body--with-action {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.detail-row--title {
  align-items: flex-start;
  padding-bottom: 0.9rem;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 0.2rem;
}

.detail-icon {
  width: 18px;
  height: 18px;
  color: #818cf8;
  flex-shrink: 0;
  margin-top: 1px;
}

.detail-titulo {
  font-size: 0.92rem;
  font-weight: 700;
  color: #1e293b; /* Slate 800 - Menos pesado que o black 0f172a */
  line-height: 1.4;
  letter-spacing: -0.01em;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.detail-label {
  font-size: 0.6rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.15rem;
}

.detail-value {
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
  line-height: 1.45;
}

/* ── ESTADO 2: Sem ação ── */
.card-body--empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1.5rem;
  gap: 0.5rem;
}

.empty-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: #fffbeb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
}

.empty-icon {
  width: 24px;
  height: 24px;
  color: #f59e0b;
}

.empty-message {
  font-size: 0.88rem;
  font-weight: 700;
  color: #334155; /* Slate 700 */
  margin: 0;
}

.empty-hint {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0 0 1.2rem;
  line-height: 1.5;
  max-width: 240px;
}

/* ── Botão de Agendar ── */
.btn-agendar {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.75rem; /* Padding lateral reduzido */
  background: #ffffff;
  color: #4f46e5;
  border: 1.5px dashed #c7d2fe;
  border-radius: 12px;
  font-size: 0.75rem; /* Fonte levemente menor para garantir a linha única */
  font-weight: 650;
  cursor: pointer;
  transition: all 0.23s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  justify-content: center;
  white-space: nowrap; /* Força linha única */
}

.btn-agendar:hover {
  background: #f5f3ff;
  border-color: #4f46e5;
  border-style: solid;
  transform: scale(1.01);
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.1);
}

.btn-icon {
  width: 16px;
  height: 16px;
}
</style>
