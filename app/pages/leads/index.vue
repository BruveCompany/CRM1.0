<template>
  <div class="leads-page-container">
    <!-- Cabeçalho de Navegação e Filtros -->
    <LeadsHeader />

    <main class="leads-content">
      <!-- Dashboard / Título Local (Aparece apenas na Lista) -->
      <div v-if="!showKanbanView" class="px-6 pt-6 flex items-center justify-between">
        <div class="space-y-1.5">
          <h1 class="text-2xl font-semibold text-gray-900 tracking-tight">Lista de Leads</h1>
          <p class="text-sm text-slate-400 font-medium">Análise de performance e métricas comerciais</p>
        </div>
      </div>

      <!-- Renderização Condicional: Kanban vs Tabela -->
      <div class="view-wrapper relative">
        <!-- Indicador de Carregamento Centralizado (Tarefa: Feedback Visual) -->
        <div v-if="isLoadingLeads && filteredLeadsList.length === 0" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-[2px] py-32">
          <Icon name="svg-spinners:18-dots-indicator" class="w-12 h-12 mb-4 text-primary-600" />
          <p class="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Sincronizando Pipeline...</p>
        </div>

        <ClientOnly>
          <Transition name="fade" mode="out-in">
            <LeadsKanban v-if="showKanbanView" />
            <LeadsTable v-else />
          </Transition>
          
          <template #placeholder>
            <div class="flex flex-col items-center justify-center py-32 opacity-20">
              <Icon name="svg-spinners:18-dots-indicator" class="w-12 h-12 mb-4" />
              <p class="text-sm font-bold uppercase tracking-widest">Sincronizando Leads...</p>
            </div>
          </template>
        </ClientOnly>
      </div>
    </main>

    <ClientOnly>
      <LeadsLeadDetailsModal />
      
      <!-- Modal Unificado de Criação/Edição de Lead -->
      <LeadEditModal 
        v-if="isCreateLeadModalOpen"
        v-model="isCreateLeadModalOpen" 
        :lead="leadToEdit" 
        :is-editing="!!leadToEdit?.id"
        @save="handleSave"
        @open-schedule-modal="handleOpenSchedule"
      />

      <!-- Modal de Novo Agendamento (Secundário) -->
      <ModalNovoAgendamento
        v-model="isScheduleModalOpen"
        :lead-id="leadToEdit?.id"
        :cliente-nome="leadToEdit?.nome"
        :profissional-id="profile?.id"
        :profissionais="globalProfissionais"
        :dias-semana="globalDiasSemana"
        @salvar="handleScheduleSave"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useLeads } from '~/composables/useLeads';
import LeadsHeader from '~/components/leads/LeadsHeader.vue';
import LeadsKanban from '~/components/leads/LeadsKanban.vue';
import LeadsTable from '~/components/leads/LeadsTable.vue';
import LeadsLeadDetailsModal from '~/components/leads/LeadsLeadDetailsModal.vue';
import LeadEditModal from '~/components/lead/EditModal.vue';
import ModalNovoAgendamento from '~/components/agendamentos/ModalNovoAgendamento.vue';
import { useProfissionais } from '~/composables/useProfissionais';
import { useAgendamentoStore } from '~/stores/agendamento';
import { useAgendamento } from '~/composables/useAgendamento';




const { 
  fetchLeads, 
  fetchStatuses, 
  showKanbanView, 
  filteredLeadsList,
  isLoadingLeads,
  subscribeToStatusChanges,
  subscribeToLeadChanges, // Adicionado (Tarefa: Sincronismo Realtime)
  subscribeToAppointmentChanges,
  isEditingStatuses,
  isCreateLeadModalOpen
} = useLeads();

const supabase = useSupabaseClient();
const { notifySuccess, notifyError } = useNotification();
const { profile } = useAuth();
const { fetchProfissionais } = useProfissionais();
const agendamentoStore = useAgendamentoStore();
const { inserirAgendamento } = useAgendamento();
const { triggerN8NWebhook } = useN8N();

// Refs globais para o modal de agendamento
const globalProfissionais = ref<any[]>([]);
const globalDiasSemana = computed(() => agendamentoStore.diasSemana);



// Estado para controlar se estamos editando ou criando
const leadToEdit = ref<any>({});

const isScheduleModalOpen = ref(false);

// Sempre que o modal for aberto, se não houver lead definido, ele começa vazio
watch(isCreateLeadModalOpen, (val) => {
  if (!val) leadToEdit.value = {};
});

const handleOpenSchedule = (currentForm?: any) => {
  if (currentForm?.nome) {
    leadToEdit.value.nome = currentForm.nome;
  }
  isScheduleModalOpen.value = true;
};

const handleScheduleSave = async (data: any) => {
  if (data?.isTemplate) {
    // Se for um lead novo, guardamos a data para o formulário
    const fullDate = `${data.data}T${data.horaInicio}`;
    leadToEdit.value.proximo_contato_em = fullDate;
    
    // Podemos guardar o objeto completo para salvar depois se necessário
    leadToEdit.value._pendingSchedule = data;
    
    notifySuccess('Horário selecionado! Salve o lead para confirmar.');
  } else {
    await fetchLeads();
  }
  isScheduleModalOpen.value = false;
};

const handleSave = async (formData: any) => {
  try {
    const payload = {
      nome:               formData.nome,
      email:              formData.email,
      telefone:           formData.telefone,
      temperatura:        formData.temperatura,
      empresa:            formData.empresa,
      cargo:              formData.cargo,
      origem:             formData.origem,
      score:              formData.score,
      notas:              formData.notas,
      interesse:          formData.interesse,
      valor_estimado:     formData.valor_estimado,
      setor_atuacao:      formData.setor_atuacao,
      principal_desafio:  formData.principal_desafio,
      produtos_interesse: formData.produtos_interesse,
      tags:               formData.tags,
      proximo_contato_em: formData.proximo_contato_em,
      linkedin_url:       formData.linkedin_url,
      facebook_url:       formData.facebook_url,
      instagram_url:      formData.instagram_url,
      website_url:        formData.website_url,
      notas_perfil:       formData.notas_perfil,
    };

    if (formData.id) {
      const { error } = await (supabase.from('ag_leads') as any).update(payload).eq('id', formData.id);
      if (error) throw error;
      notifySuccess('Lead atualizado com sucesso!');
      
      // DISPARADOR N8N: Lead Editado
      triggerN8NWebhook('lead_status_changed', payload, leadToEdit.value)
    } else {
      const { data: newLead, error } = await (supabase.from('ag_leads') as any).insert([payload]).select('id').single();
      if (error) throw error;

      if (formData.proximo_contato_em) {
        const pending = leadToEdit.value._pendingSchedule;
        const dateObj = new Date(formData.proximo_contato_em);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const hh = String(dateObj.getHours()).padStart(2, '0');
        const min = String(dateObj.getMinutes()).padStart(2, '0');
        const ss = String(dateObj.getSeconds()).padStart(2, '0');
        const timeStr = `${hh}:${min}:${ss}`;

        const currentProfId = globalProfissionais.value.find(p => p.profile_id === profile.value?.id)?.profissional_id;
        
        const agPayload = {
          profissional_id: pending?.profissionalId || currentProfId || profile.value?.id,
          lead_id: newLead.id as string,
          data: pending?.data || dateStr,
          hora_inicio: pending?.horaInicio || timeStr.slice(0, 5),
          hora_fim: pending?.horaFim || pending?.horaInicio || timeStr.slice(0, 5),
          titulo: pending?.titulo || `Contato inicial com ${payload.nome}`,
          descricao: pending?.descricao || `Agendamento automático via criação de lead.`,
          categoria: pending?.categoria || 'Visita ao Showroom / Loja',
          cor: pending?.cor || null
        };

        await inserirAgendamento(agPayload);
      }

      notifySuccess('Lead criado com sucesso!');

      // DISPARADOR N8N: Novo Lead
      triggerN8NWebhook('lead_created', { ...payload, id: newLead.id })

      isCreateLeadModalOpen.value = false;
      await fetchLeads();
      await navigateTo(`/leads/${newLead.id}`);
      return;
    }

    isCreateLeadModalOpen.value = false;
    await fetchLeads();
  } catch (err: any) {
    console.error('[ERRO AO SALVAR LEAD]', err.message);
    notifyError(`Erro ao salvar: ${err.message}`);
  }
};

let statusSub: any = null;
let leadSub: any = null;
let appointSub: any = null;

onMounted(async () => {
  const profs = await fetchProfissionais();
  if (profs) globalProfissionais.value = profs;
  
  if (agendamentoStore.diasSemana.length === 0) {
    await agendamentoStore.carregarAgendamentos(); 
  }

  fetchStatuses();
  fetchLeads();

  statusSub = subscribeToStatusChanges();
  leadSub = subscribeToLeadChanges(); 
  appointSub = subscribeToAppointmentChanges();
});

onUnmounted(() => {
  if (statusSub) supabase.removeChannel(statusSub);
  if (leadSub) supabase.removeChannel(leadSub); 
  if (appointSub) supabase.removeChannel(appointSub);
});

definePageMeta({
  layout: 'default'
})

// SEO
useHead({
  title: 'Gestão de Leads | Painel de Atendimento',
  meta: [
    { name: 'description', content: 'Gerencie seu pipeline de vendas de forma inteligente e visual.' }
  ]
});
</script>

<style scoped>
.leads-page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8fafc;
  overflow: hidden;
}

.leads-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.view-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* Transições */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

:deep(.content-wrapper) {
  padding-top: 1rem !important;
}
</style>
