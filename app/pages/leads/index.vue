<template>
  <NuxtLayout name="default">
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
        <div class="view-wrapper">
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
        />
      </ClientOnly>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useLeads } from '~/composables/useLeads';
import LeadsHeader from '~/components/leads/LeadsHeader.vue';
import LeadsKanban from '~/components/leads/LeadsKanban.vue';
import LeadsTable from '~/components/leads/LeadsTable.vue';
import LeadsLeadDetailsModal from '~/components/leads/LeadsLeadDetailsModal.vue';
import LeadEditModal from '~/components/lead/EditModal.vue';

const { 
  fetchLeads, 
  fetchStatuses, 
  showKanbanView, 
  filteredLeadsList,
  subscribeToStatusChanges,
  subscribeToAppointmentChanges,
  isEditingStatuses,
  isCreateLeadModalOpen
} = useLeads();

const supabase = useSupabaseClient();
const { notifySuccess, notifyError } = useNotification();
const { profile } = useAuth();

// Estado para controlar se estamos editando ou criando
const leadToEdit = ref<any>({});

// Sempre que o modal for aberto, se não houver lead definido, ele começa vazio
watch(isCreateLeadModalOpen, (val) => {
  if (!val) leadToEdit.value = {};
});

const handleSave = async (formData: any) => {
  try {
    // 1. Prepara o payload (limpa campos virtuais do modal como _slug)
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
      // ── Lógica de UPDATE ──
      const { error } = await (supabase
        .from('ag_leads') as any)
        .update(payload)
        .eq('id', formData.id);

      if (error) throw error;
      notifySuccess('Lead atualizado com sucesso!');
    } else {
      // ── Lógica de INSERT (Duas Etapas) ──
      const { data: newLead, error } = await (supabase
        .from('ag_leads') as any)
        .insert([payload])
        .select('id')
        .single();

      if (error) throw error;

      // Se informou data, cria o agendamento correspondente na estrutura correta
      if (formData.proximo_contato_em) {
        const dateObj = new Date(formData.proximo_contato_em);
        
        // Extrai Data (YYYY-MM-DD) e Hora (HH:MM:SS) em formato local
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        
        const hh = String(dateObj.getHours()).padStart(2, '0');
        const min = String(dateObj.getMinutes()).padStart(2, '0');
        const ss = String(dateObj.getSeconds()).padStart(2, '0');
        const timeStr = `${hh}:${min}:${ss}`;

        await (supabase.from('ag_agendamentos') as any).insert({
          lead_id: newLead.id,
          cliente_id: null,
          profissional_id: profile.value?.id,
          data: dateStr,
          hora_inicio: timeStr,
          titulo: `Contato inicial com ${payload.nome}`,
          descricao: `Agendamento automático via criação de lead. Interesse: ${payload.interesse || 'Não informado'}`,
          status: 'pendente',
          categoria: 'contato'
        });
      }

      notifySuccess('Lead criado com sucesso!');
      isCreateLeadModalOpen.value = false;
      await fetchLeads();
      
      // Redireciona para a página do novo lead
      await navigateTo(`/leads/${newLead.id}`);
      return;
    }

    isCreateLeadModalOpen.value = false;
    await fetchLeads();
  } catch (err: any) {
    console.error('[ERRO AO SALVAR LEAD]', err.message);
    if (err.message?.includes('duplicate key') || err.message?.includes('unique')) {
      notifyError('Este telefone ou e-mail já pertence a outro lead.');
    } else {
      notifyError(`Erro ao salvar lead: ${err.message}`);
    }
  }
};

let statusSub: any = null;
let appointSub: any = null;

onMounted(async () => {
  // Carregamento inicial de dados
  await Promise.all([
    fetchStatuses(),
    fetchLeads()
  ]);

  // Inscricões Realtime
  statusSub = subscribeToStatusChanges();
  appointSub = subscribeToAppointmentChanges();
});

onUnmounted(() => {
  if (statusSub) statusSub.unsubscribe();
  if (appointSub) appointSub.unsubscribe();
});

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
