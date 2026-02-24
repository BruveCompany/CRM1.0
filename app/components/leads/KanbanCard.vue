<!--
  Card Individual do Kanban
  Exibe informações resumidas do Lead, indicadores de temperatura e ações rápidas.
-->
<template>
  <div 
    class="kanban-card" 
    :class="{ 'card-hot': isHot, 'card-cold': isCold }"
    :style="{ '--column-color': columnColor }"
    draggable="true"
    @dragstart="$emit('dragstart', $event)"
    @click="task.id ? openDetails(task.id) : null"
  >
    <!-- Indicadores de Temperatura (Quente/Frio/Score) -->
    <div class="temperature-indicators">
      <!-- Exibe o Score numericamento se disponível -->
      <div v-if="task.score !== undefined && task.score !== null" 
           class="temp-score-badge" 
           :style="{ color: getScoreColor(task.score), backgroundColor: getScoreColor(task.score) + '15', borderColor: getScoreColor(task.score) + '30' }"
           :title="`Score de Qualificação: ${task.score}%`"
      >
        <Icon :name="task.score >= 50 ? 'lucide:flame' : 'lucide:thermometer'" class="temp-icon-mini" />
        <span class="score-text">{{ task.score }}</span>
      </div>
      
      <!-- Indicador de Inatividade (Frio) -->
      <div v-else-if="isCold" class="temp-icon cold" title="Lead Frio (Inativo > 7 dias)">
        <Icon name="lucide:snowflake" />
      </div>
    </div>

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
            </div>
          </div>
        </div>
      </div>
      <p class="card-phone-number">{{ task.phone }}</p>
      
      <div class="card-meta">
        <div class="card-meta-left">
          <div class="vendedor-avatar-wrapper">
            <img 
              v-if="task.vendedorNome && task.vendedorNome !== 'Não Atribuído'"
              :src="`https://api.dicebear.com/7.x/initials/svg?seed=${task.vendedorNome}&backgroundColor=818cf8`" 
              alt="Avatar" 
              class="vendedor-img" 
            />
            <div 
              v-if="task.vendedorNome && task.vendedorNome !== 'Não Atribuído'"
              class="vendedor-status-dot"
              :class="{ 'is-online': task.vendedorOnline }"
            ></div>
            <div v-else class="vendedor-avatar-placeholder">
              <span>??</span>
            </div>
          </div>
          <div class="vendedor-info">
            <span class="vendedor-nome" :title="task.vendedorNome || 'Não Atribuído'">{{ task.vendedorNome || 'Não Atribuído' }}</span>
            <span v-if="task.vendedorOnline" class="card-last-activity-small" style="color: #10b981; font-weight: 400; font-size: 0.65rem;">Online agora</span>
            <span v-else-if="task.lastActivityText || task.vendedorLastSeenText" class="card-last-activity-small">
              {{ task.lastActivityText || task.vendedorLastSeenText }}
            </span>
          </div>
        </div>
        <div class="card-meta-right">
          <div v-if="task.unreadMessages" class="card-unread-messages">
            <span class="message-count">{{ task.unreadMessages }}</span>
          </div>
          <div class="card-arrow-icon">
            <Icon name="lucide:chevron-right" />
          </div>
        </div>
      </div>

      <!-- Modal de Reatribuição (Movido para o final do card-content) -->
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
                <span>{{ v.nome }}</span>
              </div>
              <Icon name="lucide:chevron-right" class="btn-arrow" />
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  </div>
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

defineEmits(['dragstart']);
</script>

<style scoped>
.kanban-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 0;
  margin-bottom: 0; /* Removido: agora quem controla o espaçamento é o gap da lista */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  cursor: grab;
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: stretch;
  border: 1px solid #e2e8f0;
  min-height: 70px; /* Um pouco mais de espaço para as labels */
  flex-shrink: 0; 
  overflow: visible;
  user-select: none;
}

/* Indicadores de Temperatura - Removidas bordas laterais conforme solicitado */
/* Indicadores de Temperatura - Estilos de agrupamento */
.kanban-card.card-hot { border-left: 0; }
.kanban-card.card-cold { opacity: 0.9; }

.temperature-indicators {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 4px;
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
  background-color: #fcfdfe;
  border-color: #cbd5e1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
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
  top: calc(100% + 5px);
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  padding: 0.4rem;
  min-width: 180px;
  z-index: 100;
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
  transform: translateX(4px);
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

.seller-selection-btn span {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
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
  align-items: center; 
  gap: 0.4rem;
  margin-bottom: 0.1rem;
  padding-left: 48px; /* Aumentado de 28px para não encavalar com o score */
  position: relative;
  min-width: 0; /* Permite que o flex child encolha */
  width: 100%;
}

.card-header-right {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0; /* Garante que os ícones e menu não sumam */
}

.card-title {
  font-weight: 600; /* Suavizado de 700 para 600 */
  font-size: 0.9rem;
  color: #1e293b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0; /* ESSENCIAL para o text-overflow: ellipsis funcionar em flex */
}

.card-phone-number {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
  padding-left: 48px; /* Alinhado com o título (Aumentado de 28px) */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.25rem;
  padding-top: 0.25rem;
  border-top: 1px solid color-mix(in srgb, var(--column-color), transparent 92%);
}

.card-meta-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  overflow: hidden;
}

.vendedor-avatar-wrapper {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
}

.vendedor-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid white;
  box-shadow: 0 0 0 1px #e2e8f0;
}

.vendedor-status-dot {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #94a3b8;
  border: 1.5px solid white;
  transition: all 0.3s;
}

.vendedor-status-dot.is-online {
  background-color: #22c55e;
  box-shadow: 0 0 0 1px #22c55e40;
  animation: pulse-presence 2s infinite;
}

@keyframes pulse-presence {
  0% { box-shadow: 0 0 0 0px rgba(34, 197, 94, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0px rgba(34, 197, 94, 0); }
}

.vendedor-avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
  color: #94a3b8;
  font-size: 0.65rem;
  font-weight: 700;
}

.vendedor-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.vendedor-nome {
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
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
