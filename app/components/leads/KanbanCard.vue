<!--
  Card Individual do Kanban
  Exibe informações resumidas do Lead, indicadores de temperatura e ações rápidas.
-->
<template>
  <div 
    class="kanban-card" 
    :class="{ 'card-hot': isHot, 'card-cold': isCold, 'is-menu-open': showActionsMenu }"
    :style="{ '--column-color': columnColor }"
    draggable="true"
    @dragstart="$emit('dragstart', $event)"
    @click="task.id ? openDetails(task.id) : null"
  >
    <!-- Indicadores de Temperatura (Quente/Frio/Score) -->

    <!-- Conteúdo do Card -->
    <div class="card-content">
      <div class="card-header">
        <h4 class="card-title" :title="task.leadName">{{ task.leadName }}</h4>
        
        <div class="card-header-right">
          <div v-if="task.statusIcon" class="card-status-icon-wrapper" :style="{ 'border-color': columnColor }">
            <Icon :name="`lucide:${task.statusIcon}`" :class="`status-icon status-${task.statusIcon}`" :style="{ 'color': columnColor }" />
          </div>

          <!-- Menu de Ações Rápidas -->
          <div class="quick-actions-trigger" @click.stop="showActionsMenu = !showActionsMenu">
            <Icon name="lucide:more-vertical" class="action-icon" />
            
            <!-- Popover de Ações -->
            <div v-if="showActionsMenu" class="actions-popover" v-click-outside="() => showActionsMenu = false">
              <button class="action-item" @click.stop="openDetails(task.id); showActionsMenu = false">
                <div class="icon-circle">
                  <Icon name="lucide:eye" class="item-icon" />
                </div>
                <span>Ver Detalhes</span>
              </button>

              <button 
                v-if="!task.vendedor_id" 
                class="action-item" 
                @click.stop="assignToMe"
              >
                <div class="icon-circle">
                  <Icon name="lucide:user-plus" class="item-icon" />
                </div>
                <span>Atribuir a mim</span>
              </button>
              
              <button 
                v-if="isAdmin"
                class="action-item" 
                @click.stop="openReassignModal"
              >
                <div class="icon-circle">
                  <Icon name="lucide:users" class="item-icon" />
                </div>
                <span class="flex-1">Reatribuir</span>
                <Icon name="lucide:chevron-right" class="submenu-arrow" />
              </button>

              <div class="dropdown-divider"></div>

              <button class="action-item" @click.stop="() => { openAppointmentModalForNew(task.id); showActionsMenu = false; }">
                <div class="icon-circle">
                  <Icon name="lucide:calendar-plus" class="item-icon" />
                </div>
                <span>Agendar Novo Contato</span>
              </button>

              <button class="action-item" @click.stop="() => { openAppointmentModalForView(task.id); showActionsMenu = false; }">
                <div class="icon-circle">
                  <Icon name="lucide:calendar-days" class="item-icon" />
                </div>
                <span>Ver Agendamentos</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="card-info-row">
        <!-- Temperatura integrada -->
        <div v-if="task.score !== undefined && task.score !== null" 
             class="inline-score-badge" 
             :style="{ color: getScoreColor(task.score), backgroundColor: getScoreColor(task.score) + '10' }"
        >
          <Icon :name="task.score >= 50 ? 'lucide:flame' : 'lucide:thermometer'" class="temp-icon-inline" />
          <span>{{ task.score }}</span>
        </div>
        <div v-else-if="isCold" class="inline-cold-icon">
          <Icon name="lucide:snowflake" />
        </div>

        <p class="card-phone-number">{{ task.phone }}</p>
      </div>
      
      <!-- Módulo de Agendamento Moderno -->
      <div 
        v-if="task.nextAppointment" 
        class="card-appointment-module" 
        :class="{ 'is-late': isAppointmentLate }"
        :title="appointmentTooltip"
        @click.stop="openAppointmentModalForView(task.id)"
      >
        <div class="appointment-content">
          <div class="appointment-header">
            <Icon :name="isAppointmentLate ? 'lucide:calendar-clock' : 'lucide:calendar-days'" class="module-icon" />
            <span v-if="isMounted" class="appointment-time">
              {{ formatAppointmentDate(task.nextAppointment.appointment_date).split(' ')[0] }}
              <span class="appointment-hours">
                {{ formatAppointmentDate(task.nextAppointment.appointment_date).split(' ')[1] }}
                <template v-if="task.nextAppointment.hora_fim">
                  - {{ task.nextAppointment.hora_fim.substring(0, 5) }}
                </template>
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- Placeholder para manter consistência de tamanho -->
      <div 
        v-else 
        class="card-appointment-module-placeholder"
        @click.stop="openAppointmentModalForNew(task.id)"
        title="Clique para agendar um compromisso"
      >
        <Icon name="lucide:calendar-plus" class="placeholder-icon" />
        <span class="placeholder-text">Agendar contato</span>
      </div>
      
      <!-- Footer do Card Enriquecido -->
      <div class="card-footer-modern">
        <div class="footer-left">
          <div class="vendedor-compact">
            <div class="avatar-mini-wrapper">
              <img 
                v-if="task.vendedorNome && task.vendedorNome !== 'Não Atribuído'"
                :src="`https://api.dicebear.com/7.x/initials/svg?seed=${task.vendedorNome.split(' ')[0]?.substring(0, 2) || 'VN'}&backgroundColor=818cf8`" 
                alt="Avatar" 
                class="avatar-mini" 
              />
              <div v-else class="avatar-placeholder-mini" style="background-color: #818CF8">
                <span>{{ task.leadName?.split(' ')[0]?.substring(0, 2).toUpperCase() || '?' }}</span>
              </div>
              <div 
                v-if="task.vendedorNome && task.vendedorNome !== 'Não Atribuído'"
                class="status-orbit"
                :class="{ 'is-online': task.vendedorOnline }"
              ></div>
            </div>
            <div class="vendedor-details">
              <span class="corretor-label">{{ task.vendedorNome || 'Livre' }}</span>
              <span v-if="task.vendedorOnline" class="online-indicator-text">Online agora</span>
              <span v-else-if="isMounted && task.vendedorNome && task.vendedorNome !== 'Não Atribuído'" class="last-seen-text">
                {{ task.lastActivityText || task.vendedorLastSeenText || 'Sem atividade' }}
              </span>
            </div>
          </div>
        </div>

        <div class="footer-right">
          <!-- Badges de Atividade -->
          <div class="badges-row">
            <div v-if="task.unreadMessages" class="badge-msg" title="Mensagens não lidas">
              {{ task.unreadMessages }}
            </div>
            
            <div 
              v-if="task.appointmentsCount && task.appointmentsCount > 1" 
              class="badge-count" 
              title="Total de agendamentos"
            >
              <Icon name="lucide:layers" class="mini-icon" />
              <span>{{ task.appointmentsCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Reatribuição (Movido para fora da div .kanban-card para evitar conflitos de transform/hover) -->
  <BaseModal 
    v-model="showReassignModal"
  >
    <template #header>
      <h3 class="text-lg font-bold text-neutral-900">Reatribuir Lead</h3>
    </template>

    <div class="reassign-modal-content">
      <p class="modal-subtitle">Selecione o novo vendedor para <strong>{{ task.leadName }}</strong>:</p>
      
      <div class="sellers-list-grid">
        <button 
          v-for="v in vendedores" 
          :key="v.id" 
          class="seller-selection-btn"
          @click="reassignTo(v.id, v.nome)"
        >
          <div class="seller-btn-info">
            <div class="seller-avatar-small" :style="{ backgroundColor: '#eef2ff', color: '#4f46e5' }">
              {{ getInitials(v.nome) }}
            </div>
            <span class="seller-name-atrib">{{ v.nome }}</span>
          </div>
          <Icon name="lucide:chevron-right" class="btn-arrow" />
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
/**
 * LÓGICA DO CARD DE LEAD
 */
import { ref, computed, onMounted } from 'vue';
import { useLeads } from '~/composables/useLeads';
import type { LeadTask } from '~/composables/useLeads';
import { useNotification } from '~/composables/useNotification';
import { useAuth } from '~/composables/useAuth';

const props = defineProps<{
  task: LeadTask;
  columnColor: string;
}>();

const { openDetails, vendedores, fetchLeads } = useLeads();
const { notifySuccess, notifyError } = useNotification();
const { checkIsAdmin } = useAuth();
const supabase = useSupabaseClient();

const showActionsMenu = ref(false);
const showReassignModal = ref(false);
const isAdmin = ref(false);

const isMounted = ref(false);
onMounted(async () => {
  isAdmin.value = await checkIsAdmin();
  isMounted.value = true;
});

// Cálculo de Temperatura Quente (Lead com score alto)
const isHot = computed(() => (props.task.score || 0) > 50);

// Cálculo de Temperatura Fria (Lead sem atividade por mais de 7 dias)
const isCold = computed(() => {
  if (!isMounted.value || !props.task.ultima_mensagem_data) return false;
  const lastDate = new Date(props.task.ultima_mensagem_data);
  const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 7;
});

// --- LÓGICA DE AGENDAMENTOS ---

const isAppointmentLate = computed(() => {
  if (!props.task.nextAppointment) return false;
  return new Date(props.task.nextAppointment.appointment_date).getTime() < new Date().getTime();
});

const appointmentClass = computed(() => {
  if (!props.task.nextAppointment) return 'status-none';
  return isAppointmentLate.value ? 'status-late' : 'status-upcoming';
});

const appointmentTooltip = computed(() => {
  const app = props.task.nextAppointment;
  if (!app) return 'Nenhum agendamento futuro';

  const prefix = isAppointmentLate.value ? '🚨 ATRASADO: ' : '📅 AGENDADO: ';
  let text = `${prefix}${app.titulo || 'Sem título'}`;

  if (app.categoria) {
    text += `\n🏷️ Categoria: ${app.categoria}`;
  }

  const date = formatAppointmentDate(app.appointment_date).split(' ')[0];
  const start = formatAppointmentDate(app.appointment_date).split(' ')[1];
  const end = app.hora_fim ? app.hora_fim.substring(0, 5) : null;
  
  text += `\n⏰ Horário: ${date} das ${start}${end ? ' às ' + end : ''}`;

  if (app.descricao) {
    text += `\n\n📝 Notas: ${app.descricao}`;
  }

  return text;
});

const formatAppointmentDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const h = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  return `${d}/${m} ${h}:${min}`;
};

/**
 * Funções de abertura de modal (Assumindo que existem conforme solicitado)
 * Podem ser implementadas como emissões ou chamadas globais.
 */
const openAppointmentModalForNew = (leadId: string) => {
  // @ts-ignore
  if (typeof window.openAppointmentModalForNew === 'function') {
    // @ts-ignore
    window.openAppointmentModalForNew(leadId);
  } else {
    emit('open-appointment-new', leadId);
  }
};

const openAppointmentModalForView = (leadId: string) => {
  // @ts-ignore
  if (typeof window.openAppointmentModalForView === 'function') {
    // @ts-ignore
    window.openAppointmentModalForView(leadId);
  } else {
    emit('open-appointment-view', leadId);
  }
};

const openReassignModal = () => {
  showActionsMenu.value = false;
  showReassignModal.value = true;
};

// Cores baseadas no score (seguindo o padrão do modal de detalhes)
const getScoreColor = (score: number) => {
  if (score >= 80) return '#10B981'; // Verde (Quente/Excelente)
  if (score >= 50) return '#F59E0B'; // Amarelo (Morno/Bom)
  return '#EF4444'; // Vermelho (Frio/Baixo)
};

/**
 * ATRIBUIR A MIM
 * Associa o lead ao corretor/vendedor atualmente logado.
 */
const assignToMe = async () => {
  showActionsMenu.value = false;
  console.log("--> INICIANDO ATRIBUIR A MIM PARA LEAD ID:", props.task.id, "<--");

  try {
    // 1. Obter a sessão do usuário de forma explícita e garantida
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const currentLoggedInUserId = sessionData?.session?.user?.id;

    if (sessionError) {
      throw new Error('Falha ao obter sessão do usuário: ' + sessionError.message);
    }
    if (!currentLoggedInUserId) {
      throw new Error('Usuário não logado ou sessão expirada. Por favor, faça login novamente.');
    }
    console.log("1. User ID logado (getSession):", currentLoggedInUserId);


    // 2. Buscar o 'id' do perfil do usuário logado na view_vendedores_ativos
    console.log("2. Buscando perfil na view_vendedores_ativos para user ID:", currentLoggedInUserId);
    const { data: profile, error: profileError } = await supabase
      .from('view_vendedores_ativos') // Usa a VIEW que inclui admins
      .select('id') // Seleciona o 'id' do perfil (que será o vendedor_id)
      .eq('user_id', currentLoggedInUserId) // Filtra pelo user_id obtido da sessão
      .single(); // Espera um único resultado

    if (profileError) {
      throw new Error('Erro ao buscar seu perfil de vendedor: ' + profileError.message);
    }
    if (!profile) {
      throw new Error('Seu perfil de vendedor não foi encontrado. Verifique a tabela ag_profiles.');
    }

    const loggedInProfileId = (profile as any).id; // Este é o ID do perfil que será atribuído ao lead
    console.log("3. Profile ID do usuário logado encontrado:", loggedInProfileId);


    // 3. Atualizar o lead no banco de dados com o vendedor_id correto
    console.log(`4. Atualizando lead ${props.task.id} com vendedor_id: ${loggedInProfileId}`);
    const { error: updateError } = await (supabase.from('ag_leads') as any) // 'as any' para compatibilidade com TS
      .update({ vendedor_id: loggedInProfileId })
      .eq('id', props.task.id);

    if (updateError) {
      throw new Error('Falha ao atribuir lead: ' + updateError.message);
    }

    notifySuccess('Lead atribuído com sucesso!');
    console.log("5. Lead atribuído com sucesso! Recarregando leads...");
    await fetchLeads(); // Recarrega os leads para atualizar o Kanban
  } catch (err: any) {
    console.error("ERRO FINAL NA ATRIBUIÇÃO:", err.message);
    notifyError('Erro ao atribuir lead: ' + err.message);
  }
};

const reassignTo = async (vendedorId: string, vendedorNome: string) => {
  showActionsMenu.value = false;
  showReassignModal.value = false;
  try {
    const { error } = await (supabase.from('ag_leads') as any)
      .update({ vendedor_id: vendedorId })
      .eq('id', props.task.id);

    if (error) throw error;

    notifySuccess(`Lead reatribuído para ${vendedorNome}`);
    await fetchLeads();
  } catch (err: any) {
    notifyError('Erro ao reatribuir lead: ' + err.message);
  }
};

const getInitials = (nome: string) => {
  if (!nome) return '?';
  const preposicoes = ['de', 'da', 'do', 'das', 'dos', 'e'];
  const parts = nome.trim().split(/\s+/)
    .filter(p => !preposicoes.includes(p.toLowerCase()));
  
  if (parts.length >= 2 && parts[0]?.[0] && parts[1]?.[0]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0] ? parts[0].substring(0, 2).toUpperCase() : '?';
};

// Diretiva simples para fechar ao clicar fora
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el: any) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  }
};

const emit = defineEmits(['dragstart', 'open-appointment-new', 'open-appointment-view']);
</script>

<style scoped>
.kanban-card {
  background-color: #ffffff;
  border-radius: 10px; /* Reduzi levemente o radius para ficar mais moderno */
  padding: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: grab;
  position: relative;
  display: flex;
  align-items: stretch;
  border: 1px solid #f1f5f9;
  min-height: 100px;
  user-select: none;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.kanban-card.is-menu-open {
  z-index: 50; 
}

/* Estágios de Temperatura */
.kanban-card.card-hot { border-left: 0; }
.kanban-card.card-cold { opacity: 0.9; }

.card-info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: -2px;
  margin-bottom: 4px;
}

.inline-score-badge {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
}

.temp-icon-inline {
  width: 11px;
  height: 11px;
}

.inline-cold-icon {
  color: #3b82f6;
  display: flex;
  align-items: center;
}

.inline-cold-icon :deep(svg) {
  width: 14px;
  height: 14px;
}

.temp-icon {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 0.7rem;
}

.temp-score-badge {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 1px 4px;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 800;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.temp-icon-mini {
  width: 10px;
  height: 10px;
}

.score-text {
  line-height: 1;
}

.temp-icon.hot {
  background-color: #fff7ed;
  color: #f97316;
}

.temp-icon.cold {
  background-color: #eff6ff;
  color: #3b82f6;
}

.kanban-card:hover {
  background-color: #fafafa;
  box-shadow: 0 6px 15px -4px rgba(0, 0, 0, 0.06); /* Sombra apenas para profundidade, sem cor */
}

.quick-actions-trigger {
  position: relative;
  z-index: 20;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: -4px; /* Ajuste para encostar na borda adequadamente */
}

.quick-actions-trigger:hover {
  background-color: #f1f5f9;
  color: #475569;
}

.action-icon {
  width: 14px;
  height: 14px;
}

/* --- Popover de Ações --- */
.actions-popover {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  padding: 0.4rem;
  min-width: 180px;
  z-index: 100; /* Prioridade máxima dentro do card */
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.6rem;
  border: none;
  background: none;
  width: 100%;
  color: #475569;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.action-item:hover {
  background-color: #f8fafc;
  color: #4f46e5;
}

.icon-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #64748b;
  transition: all 0.2s;
}

.action-item:hover .icon-circle {
  background-color: #eef2ff;
  color: #4f46e5;
}

.item-icon {
  width: 0.9rem;
  height: 0.9rem;
}

.flex-1 { flex: 1; }

.has-submenu {
  justify-content: space-between;
}

.submenu-arrow {
  width: 12px;
  height: 12px;
  opacity: 0.4;
}

.dropdown-divider {
  height: 1px;
  background-color: #f1f5f9;
  margin: 4px 0;
}

/* --- Modal de Reatribuição --- */
.reassign-modal-content {
  padding: 0.5rem 0;
}

.modal-subtitle {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 1.25rem;
}

.sellers-list-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.seller-selection-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.seller-selection-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.seller-name-atrib {
  font-weight: 500; /* Suavizado conforme solicitado anteriormente */
  color: #1e293b;
  font-size: 0.9rem;
  text-align: left;
}

.seller-btn-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.seller-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
}



.btn-arrow {
  width: 1.1rem;
  height: 1.1rem;
  color: #cbd5e1;
}

/* --- Resto do Estilo --- */
.card-content {
  flex-grow: 1;
  padding: 0.25rem 0.5rem; /* Ultra compacto */
  display: flex;
  flex-direction: column;
  gap: 0; /* Removido gap para controle manual via margin */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; 
  gap: 0.4rem;
  margin-bottom: 0.1rem;
  position: relative;
  min-width: 0;
  width: 100%;
}

.card-header-right {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0; /* Garante que os ícones e menu não sumam */
}

.card-title {
  font-weight: 500; /* Suavizado de 600 para 500 */
  font-size: 0.9rem;
  color: #1e293b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
  flex: 1;
}

.card-phone-number {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

/* MÓDULO DE AGENDAMENTO PREMIUM */
.card-appointment-module {
  margin: 2px 6px; 
  background-color: #f0fdf4; 
  border-radius: 6px; /* Restaurado como solicitado */
  display: flex;
  width: auto;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #dcfce7;
  height: 16px; /* Ainda mais estrito na vertical */
}

.card-appointment-module:hover {
  filter: brightness(0.98);
}

.appointment-content {
  padding: 0 6px; 
  display: flex;
  align-items: center;
  flex-grow: 1;
  min-width: 0;
  height: 100%;
}

.appointment-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 2px;
}

.module-icon {
  width: 10px;
  height: 10px;
  color: #64748b;
}

.appointment-time {
  font-size: 0.62rem;
  font-weight: 500;
  color: #166534;
  text-transform: uppercase;
  letter-spacing: 0.01em;
  display: flex;
  align-items: center;
  gap: 4px;
}

.appointment-hours {
  font-weight: 500;
}

.card-appointment-module.is-late {
  background-color: #fef2f2;
  border-color: #fee2e2;
}

.card-appointment-module.is-late .appointment-time,
.card-appointment-module.is-late .module-icon {
  color: #e11d48;
}

/* PLACEHOLDER DE AGENDAMENTO */
.card-appointment-module-placeholder {
  margin: 2px 6px;
  background-color: transparent;
  border: 1px dashed #e2e8f0;
  border-radius: 6px; /* Restaurado como solicitado */
  display: flex;
  width: auto;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  padding: 0 6px;
  cursor: pointer;
  transition: all 0.2s;
  height: 16px; /* Ainda mais estrito na vertical */
}

.card-appointment-module-placeholder:hover {
  border-color: #cbd5e1;
  background-color: #f8fafc;
}

.placeholder-icon {
  width: 10px;
  height: 10px;
  color: #94a3b8;
}

.placeholder-text {
  font-size: 0.62rem;
  color: #94a3b8;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.01em;
}

/* FOOTER MODERNO */
.card-footer-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.35rem 0.4rem 0.35rem 0.4rem;
  border-top: 1px solid #f8fafc;
  margin-top: 0.1rem;
}

.vendedor-details {
  display: flex;
  flex-direction: column;
}

.online-indicator-text, .last-seen-text {
  font-size: 0.65rem;
  line-height: 1.2;
}

.online-indicator-text {
  color: #10b981;
  font-weight: 600;
}

.last-seen-text {
  color: #94a3b8;
  font-weight: 400;
}

.vendedor-compact {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.avatar-mini-wrapper {
  position: relative;
  width: 20px;
  height: 20px;
}

.avatar-mini {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder-mini {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 700;
  color: #64748b;
}

.status-orbit {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: 1.5px solid white;
  background-color: #cbd5e1;
}

.status-orbit.is-online {
  background-color: #10b981;
}

.corretor-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #64748b;
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.footer-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.badges-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.badge-msg {
  background-color: #ef4444;
  color: white;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-count {
  display: flex;
  align-items: center;
  gap: 2px;
  background-color: #f1f5f9;
  color: #64748b;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.mini-icon {
  width: 10px;
  height: 10px;
}

.last-seen-text {
  font-size: 0.6rem;
  color: #94a3b8;
  font-weight: 400;
}
.card-appointment-pill.status-upcoming {
  background-color: #f0fdf4;
  color: #16a34a;
  border: 1px solid #dcfce7;
}

.card-appointment-pill.status-late {
  background-color: #fff7ed;
  color: #ea580c;
  border: 1px solid #ffedd5;
  animation: pulse-late 2s infinite;
}

.card-appointment-pill.status-none {
  color: #cbd5e1;
  background-color: #f8fafc;
  opacity: 0.6;
}

/* --- Nova Linha de Agendamento --- */
.card-appointment-line {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  margin-bottom: 2px;
  padding: 4px 8px;
  background-color: #f0fdf4;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #dcfce7;
  transition: all 0.2s;
}

.card-appointment-line:hover {
  background-color: #dcfce7;
}

.card-appointment-line.is-late {
  background-color: #fff7ed;
  border-color: #ffedd5;
}

.card-appointment-line.is-late:hover {
  background-color: #ffedd5;
}

.line-icon {
  width: 14px;
  height: 14px;
  color: #16a34a;
}

.is-late .line-icon {
  color: #ea580c;
}

.line-text {
  font-size: 0.7rem;
  font-weight: 600;
  color: #166534;
}

.is-late .line-text {
  color: #9a3412;
}

.late-label {
  font-weight: 800;
  text-transform: uppercase;
  font-size: 0.6rem;
  margin-right: 2px;
}

.appointment-title {
  display: inline-block;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
  font-weight: 700;
}

.pill-icon {
  width: 12px;
  height: 12px;
}

.pill-date {
  white-space: nowrap;
}

@keyframes pulse-late {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
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
