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
          <!-- Botão Visão 360º (Olho FS) -->
          <button 
            class="view-360-btn" 
            title="Visão 360º do Lead"
            @click.stop="router.push(`/leads/${task.id}`)"
          >
            <Icon name="lucide:eye" />
          </button>

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
                v-if="!isAssignedToMe || task.vendedorNome === 'Livre' || task.vendedorNome === 'Não Atribuído'" 
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

  <!-- Modal de Reatribuição Extraído para Componente à Parte -->
  <ReatribuirModal 
    v-model="showReassignModal"
    :lead-name="task.leadName"
    :vendedores="vendedores"
    @reassign="reassignTo"
  />
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
import ReatribuirModal from './ReatribuirModal.vue';

const props = defineProps<{
  task: LeadTask;
  columnColor: string;
}>();

const { openDetails, vendedores, fetchLeads } = useLeads();
const { notifySuccess, notifyError } = useNotification();
const { checkIsAdmin, profile } = useAuth();
const supabase = useSupabaseClient();
const router = useRouter();

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

// Verifica se o lead já está atribuído ao usuário atual
const isAssignedToMe = computed(() => {
  if (!props.task.vendedor_id || !profile.value?.id) return false;
  return String(props.task.vendedor_id) === String(profile.value.id);
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

<style src="./KanbanCard.css"></style>
