<template>
  <div class="min-h-screen bg-[#f8fafc] p-6 lg:p-8">
      <!-- Page Title & Back Link -->
      <div class="mb-6 relative flex items-center justify-center pb-2 pt-2">
        <!-- Back Link (Compacto) -->
        <NuxtLink to="/leads" class="absolute left-0 group inline-flex items-center text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary-600 transition-all bg-white/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-100 shadow-sm hover:shadow-indigo-500/5">
          <Icon name="heroicons:arrow-left" class="w-3 h-3 mr-2 transition-transform group-hover:-translate-x-1" />
          Voltar
        </NuxtLink>

        <!-- Centered Title (Compact Premium) -->
        <div class="text-center group cursor-default select-none">
          <div class="inline-flex flex-col items-center">
            <h1 class="text-2xl font-black text-slate-900 tracking-tightest leading-none mb-1.5">
              Visão <span class="relative inline-block">
                <span class="bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 via-primary-600 to-violet-600">360º do Lead</span>
                <span class="absolute -bottom-0.5 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-600/0 via-indigo-600/40 to-indigo-600/0 rounded-full"></span>
              </span>
            </h1>
            <div class="flex items-center gap-3">
              <div class="h-[1px] w-5 bg-gradient-to-r from-transparent to-slate-200"></div>
              <p class="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-0">
                Painel de <span class="text-indigo-500/80">Inteligência</span> Comercial
              </p>
              <div class="h-[1px] w-5 bg-gradient-to-l from-transparent to-slate-200"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading && !lead" class="h-[60vh] flex items-center justify-center">
        <div class="flex flex-col items-center gap-4">
          <Icon name="svg-spinners:18-dots-indicator" class="w-12 h-12 text-primary-600" />
          <p class="text-gray-400 font-normal animate-pulse text-[10px] uppercase tracking-[0.2em]">Sincronizando dados estratégicos...</p>
        </div>
      </div>

      <!-- Not Found State -->
      <div v-else-if="!loading && !lead" class="h-[60vh] flex items-center justify-center">
        <div class="text-center">
          <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 class="text-lg font-semibold text-gray-900 uppercase tracking-wider">Lead não encontrado</h2>
          <p class="text-gray-500 font-medium text-xs">A inteligência comercial não localizou este registro.</p>
        </div>
      </div>

      <!-- Main Content (The Orchestration) -->
      <div v-if="lead" class="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        <!-- 1. Header Component -->
        <LeadDetailHeader 
          :lead="lead" 
          @whatsapp="openWhatsApp"
          @edit="isEditModalOpen = true"
          @add-task="isTaskModalOpen = true"
          @schedule="handleSchedule"
        />

        <!-- 1.1 Funil de Vendas Stepper -->
        <ClientOnly>
          <LeadFunilVendasStepper 
            v-if="leadStatuses.length > 0"
            :stages="leadStatuses.map(s => ({ name: s.display_name, color: s.color_bg || '#4f46e5' }))" 
            :current-stage-name="leadStatuses.find(s => isCurrentStatus(s.id))?.display_name || ''" 
          />
        </ClientOnly>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- 2. Left Column: Information (4 slots) -->
          <div class="lg:col-span-4 space-y-8">
            <LeadInfoCard :lead="lead" />
            
            <!-- Strategic Stats (Using UI Card) -->
            <UiCard class="bg-slate-900 text-white p-8 overflow-hidden" hover-effect>
              <Icon name="heroicons:rocket-launch" class="absolute -right-4 -bottom-4 w-40 h-40 text-white/5 -rotate-12" />
              <h2 class="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-6">Métricas de Conversão</h2>
              <div class="grid grid-cols-2 gap-6 relative z-10">
                <div>
                  <p class="text-[10px] font-medium text-white/50 mb-1 uppercase tracking-wider">Tempo de Vida</p>
                  <p class="text-2xl font-bold">{{ diasAberto }} Dias</p>
                </div>
                <div>
                  <p class="text-[10px] font-medium text-white/50 mb-1 uppercase tracking-wider">Interações</p>
                  <p class="text-2xl font-bold">{{ timelineActivities.length }}</p>
                </div>
                <div class="col-span-2">
                  <p class="text-[10px] font-semibold text-white/50 mb-1 uppercase tracking-wider">Confiança no Fechamento</p>
                  <div class="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div class="h-full bg-primary-400" :style="{ width: (lead.score || 0) + '%' }"></div>
                  </div>
                </div>
              </div>
            </UiCard>
          </div>

          <!-- 3. Center Column: Timeline (5 slots) -->
          <div class="lg:col-span-5">
            <ClientOnly>
              <LeadTimeline 
                :activities="timelineActivities" 
                :files="listaDeArquivos"
                @add-note="saveQuickNote" 
                @files-selected="processarUpload"
                @download-file="iniciarDownload"
                @delete-file="confirmarExclusao"
                @add-task="isTaskModalOpen = true"
              />
            </ClientOnly>
          </div>

          <!-- 4. Right Column: Strategic Actions (3 slots) -->
          <div class="lg:col-span-3 space-y-8">

            <!-- Próximo Passo Card -->
            <ClientOnly>
              <LeadProximoPassoCard
                :acao="proximaAcao"
                @agendar="handleSchedule"
              />
            </ClientOnly>

            <UiCard title="Ações Rápidas" icon="heroicons:bolt" padding>
              <div class="grid grid-cols-1 gap-3">

                <!-- Mudar Estágio: Dropdown com Teleport (escapa do overflow-hidden do Card) -->
                <div ref="stageMenuRef">
                  <UiActionButton
                    ref="stageBtnRef"
                    variant="outline"
                    class="justify-between w-full"
                    @click="toggleStageMenu"
                  >
                    Mudar Estágio
                    <Icon
                      name="heroicons:chevron-down"
                      class="transition-transform duration-200"
                      :class="{ 'rotate-180': showStageMenu }"
                    />
                  </UiActionButton>
                </div>

                <!-- Dropdown renderizado no body via Teleport -->
                <Teleport to="body">
                  <Transition
                    enter-active-class="transition ease-out duration-150"
                    enter-from-class="opacity-0 -translate-y-2"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition ease-in duration-100"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-2"
                  >
                    <div
                      v-if="showStageMenu"
                      :style="dropdownStyle"
                      class="fixed bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[9999] max-h-[480px]"
                    >
                      <button
                        v-for="status in leadStatuses"
                        :key="status.id"
                        @click="updateLeadStatus(status.id)"
                        class="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-normal text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                        :class="{ 'bg-indigo-50 text-indigo-700 font-semibold': isCurrentStatus(status.id) }"
                      >
                        <span
                          class="w-2 h-2 rounded-full flex-shrink-0"
                          :style="{ backgroundColor: status.color_bg || '#94a3b8' }"
                        />
                        {{ status.display_name }}
                        <Icon
                          v-if="isCurrentStatus(status.id)"
                          name="heroicons:check"
                          class="ml-auto w-4 h-4 text-indigo-600"
                        />
                      </button>
                    </div>
                  </Transition>
                </Teleport>

                <UiActionButton variant="outline" class="justify-between" @click="handleSchedule">
                  Agendar Reunião
                  <Icon name="heroicons:calendar" />
                </UiActionButton>
                <UiActionButton variant="outline" class="justify-between" @click="handleEdit">
                  Gerar Proposta
                  <Icon name="heroicons:document-text" />
                </UiActionButton>
              </div>
            </UiCard>

            <!-- Insight Card -->
            <div class="bg-white rounded-[2rem] p-6 border-2 border-dashed border-slate-200">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                <h2 class="text-xs font-semibold text-gray-900 uppercase tracking-[0.2em]">IA Insight</h2>
              </div>
              <p class="text-xs font-medium text-gray-500 leading-relaxed italic">
                Lead apresenta comportamento de compra acelerado no setor tecnológico. Recomendo envio de case de sucesso imediato.
              </p>
            </div>
          </div>

        </div>
        <!-- Modais -->
        <LeadEditModal
          v-model="isEditModalOpen"
          :lead="lead"
          :is-editing="true"
          @save="handleSave"
          @open-schedule-modal="handleOpenSchedule"
        />

        <ModalNovoAgendamento
          v-model="isScheduleModalOpen"
          :lead-id="id"
          :cliente-nome="lead.nome"
          :profissional-id="profile?.id"
          :profissionais="globalProfissionais"
          :dias-semana="globalDiasSemana"
          @salvar="handleScheduleSave"
        />

        <!-- Modal Nova Tarefa -->
        <LeadNovaTarefaModal
          v-if="isTaskModalOpen"
          v-model="isTaskModalOpen"
          :lead-name="lead?.nome || ''"
          :current-user="{ id: profile?.id, name: profile?.nome }"
          :team-members="globalProfissionais"
          @close="isTaskModalOpen = false"
          @save="handleSaveTask"
        />
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useLeads } from '~/composables/useLeads';
import ModalNovoAgendamento from '~/components/agendamentos/ModalNovoAgendamento.vue';
import { useAgendamentoStore } from '~/stores/agendamento';
import { useProfissionais } from '~/composables/useProfissionais';

// --- SETUP ---
const route = useRoute();
const id = route.params.id as string;

definePageMeta({
  layout: 'default'
})
const { profile } = useAuth();
const agendamentoStore = useAgendamentoStore();
const { fetchProfissionais } = useProfissionais();

const globalProfissionais = ref<any[]>([]);
const globalDiasSemana = computed(() => agendamentoStore.diasSemana);
const supabase = useSupabaseClient();
const { notifySuccess, notifyError } = useNotification();


// --- STATUS DO KANBAN (dinâmicos, vindos do banco via ag_lead_statuses) ---
const { leadStatuses, fetchStatuses } = useLeads();

// Normaliza o status do lead para comparação com status.id
// Ex: 'Leads Novos' → 'leads_novos' para bater com o id cadastrado
const isCurrentStatus = (statusId: string): boolean => {
  if (!lead.value?.status) return false;
  const current = String(lead.value.status).toLowerCase().trim();
  const normalized = current.replace(/\s+/g, '_');
  return normalized === statusId.toLowerCase() || current === statusId.toLowerCase();
};

// --- STAGE MENU STATE ---
const showStageMenu = ref(false);
const stageMenuRef = ref<HTMLElement | null>(null);
const dropdownStyle = ref({ top: '0px', left: '0px', width: '0px' });

// Calcula a posição do dropdown com base no botão (escapa de qualquer overflow-hidden)
const toggleStageMenu = () => {
  if (stageMenuRef.value) {
    const rect = stageMenuRef.value.getBoundingClientRect();
    dropdownStyle.value = {
      top: `${rect.bottom + 8}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    };
  }
  showStageMenu.value = !showStageMenu.value;
};

// Fechar dropdown ao clicar fora
const handleClickOutside = (event: MouseEvent) => {
  if (stageMenuRef.value && !stageMenuRef.value.contains(event.target as Node)) {
    showStageMenu.value = false;
  }
};

// --- STATE ---
const lead = ref<any>(null);
const loading = ref(true);
const timelineActivities = ref<any[]>([]);
const listaDeArquivos = ref<any[]>([]);
/**
 * Dados do próximo agendamento (hora_inicio + hora_fim).
 * Populado pelo handleScheduleSave após o modal confirmar.
 * Não buscamos ag_agendamentos diretamente por restrição de RLS.
 */
const proximoAgendamento = ref<any>(null);

// --- COMPUTED PROPERTIES ---
const diasAberto = computed(() => {
  if (!lead.value?.criado_em) return 0;
  const dataCriacao = new Date(lead.value.criado_em);
  if (isNaN(dataCriacao.getTime())) return 0;
  return Math.floor((Date.now() - dataCriacao.getTime()) / (1000 * 3600 * 24));
});

// --- FETCH DATA ---
const carregarArquivosDoLead = async (leadId: string) => {
  try {
    const { data, error } = await (supabase as any)
      .from('attachments')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Mapeia para o formato esperado pelo componente GerenciadorArquivos
    listaDeArquivos.value = ((data as any[]) || []).map(f => ({
      id: f.id,
      name: f.file_name || f.name, // Fallback caso ainda existam registros antigos
      size: f.file_size || f.size,
      uploadDate: f.created_at,
      uploadedBy: lead.value?.vendedor_nome || 'Consultor',
      file_path: f.file_path // Importante para o Storage
    }));
  } catch (err: any) {
    console.error('[Arquivos] Erro ao carregar:', err.message);
  }
};

const fetchData = async (silent = false) => {
  if (!silent) loading.value = true;
  console.log(`[REALTIME] ${silent ? 'Atualização silenciosa' : 'Carga total'} iniciada para o Lead ID: ${id}`);

  try {
    // 1. Validação de UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      console.warn('[AVISO] O ID fornecido não é um UUID válido.');
      if (!silent) loading.value = false;
      return;
    }

    // 2. Disparar buscas em paralelo
    const today = new Date().toISOString().split('T')[0];
    
    const [leadRes, agRes, timelineRes]: any = await Promise.all([
      supabase.from('ag_leads').select('*, ag_profiles(nome)').eq('id', id).limit(1),
      supabase.from('ag_view_agendamentos_completo').select('data, hora_inicio, hora_fim, titulo, categoria').eq('lead_id', id).eq('cancelado', false).gte('data', today).order('data').order('hora_inicio').limit(1),
      (supabase.rpc as any)('get_lead_timeline', { lead_id_param: id })
    ]);

    if (leadRes.error) throw leadRes.error;
    
    const leadData = leadRes.data?.[0];
    if (leadData) {
      lead.value = {
        ...leadData,
        vendedor_nome: leadData.ag_profiles?.nome
      };
      carregarArquivosDoLead(id);
    }

    if (!agRes.error && agRes.data?.length > 0) {
      proximoAgendamento.value = agRes.data[0];
    }

    if (!timelineRes.error) {
      timelineActivities.value = timelineRes.data || [];
    }

  } catch (error: any) {
    console.error('[FALHA CRÍTICA] Erro no carregamento:', error.message);
    } finally {
    if (!silent) {
       // Atraso mínimo apenas para evitar flicker
       setTimeout(() => { loading.value = false; }, 50);
    }
  }
};

// --- REALTIME PRIME (Lead Detail) ---
let leadChannel: any = null;

const subscribeToLeadChanges = () => {
  if (!id || leadChannel) return;

  console.log(`🔌 Realtime: Monitorando Lead ${id}...`);

  leadChannel = supabase
    .channel(`lead-detail-${id}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ag_leads', filter: `id=eq.${id}` },
      () => fetchData(true) // Atualização silenciosa
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'ag_labels', filter: `lead_id=eq.${id}` },
      () => fetchData(true)
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'ag_notas_internas', filter: `lead_id=eq.${id}` },
      () => fetchData(true)
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ag_tarefas', filter: `lead_id=eq.${id}` },
      () => fetchData(true)
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'attachments', filter: `lead_id=eq.${id}` },
      () => {
        carregarArquivosDoLead(id);
        fetchData(true);
      }
    )
    .subscribe();
};

// Monitora o carregamento do perfil para buscar dados assim que a identidade for confirmada (Tarefa: Sincronismo 360)
watch(() => profile.value?.id, (newId) => {
  if (newId && !lead.value?.id) {
    console.log('[360] Perfil identificado, buscando dados do lead...');
    fetchData();
  }
});

// --- LIFECYCLE HOOKS ---
onMounted(async () => {
  fetchData();
  subscribeToLeadChanges(); // Ativa Realtime
  
  // Busca lista de profissionais para o modal de agendamento
  const profs = await fetchProfissionais();
  if (profs) globalProfissionais.value = profs;
  
  // Garante que os dias da semana estejam carregados na store
  if (agendamentoStore.diasSemana.length === 0) {
    await agendamentoStore.carregarAgendamentos(); 
  }

  // Carrega os status do Kanban se ainda não estiverem disponíveis
  if (leadStatuses.value.length === 0) {
    await fetchStatuses();
  }

  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  if (leadChannel) {
    console.log('🔌 Lead Detail: Desconectando Realtime...');
    supabase.removeChannel(leadChannel);
  }
});

// --- MÉTODOS DE AÇÃO ---
// --- GESTÃO DE ARQUIVOS (Supabase Integration) ---
const processarUpload = async (receivedFiles: any) => {
  // Limpa o console a cada tentativa para facilitar a leitura
  console.clear();
  console.log('--- INICIANDO PROCESSO DE UPLOAD ---');

  // Adiciona verificação e garante que estamos trabalhando com um array
  if (!receivedFiles) {
      console.error('Nenhum arquivo recebido no evento. O processo foi interrompido.');
      return;
  }
  
  const files = Array.isArray(receivedFiles) 
    ? receivedFiles 
    : (receivedFiles instanceof FileList ? Array.from(receivedFiles) : [receivedFiles]);

  console.log(`[PRE-CHECK] Quantidade de arquivos a processar: ${files.length}`);

  try {
    if (!lead.value || !id) {
      throw new Error('ID do Lead não encontrado.');
    }

    // 1. OBTÉM A SESSÃO COMPLETA PARA EXTRAIR O TOKEN JWT
    // Isso é crucial para garantir que o Supabase Storage valide o RLS corretamente
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!sessionData.session) throw new Error('Sessão do usuário não encontrada.');
    
    const accessToken = sessionData.session.access_token;
    const user = sessionData.session.user;

    console.log(`[CHECK 2] SUCESSO: Usuário autenticado com ID ${user.id}`);

    for (const file of files) {
      console.log(`--- Processando arquivo: ${file.name} ---`);
      
      const timestamp = Date.now();
      const fileName = file.name.replace(/[^\x00-\x7F]/g, ""); 
      const filePath = `lead_files/${id}/${timestamp}-${fileName}`;

      // 2. PASSA O TOKEN NA CHAMADA DE UPLOAD EXPLICITAMENTE
      // Isso força a autorização mesmo que o cliente não o faça automaticamente no Storage
      console.log('[AÇÃO] Enviando arquivo para o Storage com Header de Autorização...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lead-attachments')
        .upload(filePath, file, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;
      console.log('[CHECK 4] SUCESSO: Upload para Storage concluído.');

      // 3. Inserção no Banco de Dados (Metadados)
      console.log('[AÇÃO] Inserindo metadados na tabela "attachments"...');
      const { data: dbData, error: dbError } = await (supabase as any)
        .from('attachments')
        .insert({
          lead_id: id,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: user.id
        })
        .select()
        .single();
      
      if (dbError) throw dbError;
      
      listaDeArquivos.value.unshift({
        id: dbData.id,
        name: dbData.file_name,
        size: dbData.file_size,
        uploadDate: dbData.created_at,
        uploadedBy: lead.value?.vendedor_nome || 'Consultor',
        file_path: dbData.file_path
      });
      console.log('--- UPLOAD DO ARQUIVO CONCLUÍDO COM SUCESSO ---');
    }

    notifySuccess('Upload concluído com sucesso!');

  } catch (error: any) {
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.error('!!! ERRO CAPTURADO NO PROCESSO DE UPLOAD !!!');
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.error('Objeto do erro:', error);
    notifyError('Erro no upload: ' + (error.message || 'Verifique o console'));
  }
};

const iniciarDownload = async (file: any) => {
  try {
    const { data } = supabase.storage
      .from('lead-attachments')
      .getPublicUrl(file.file_path);

    if (data?.publicUrl) {
      window.open(data.publicUrl, '_blank');
    }
  } catch (err: any) {
    notifyError('Não foi possível gerar o link de download.');
  }
};

const confirmarExclusao = async (file: any) => {
  if (!confirm(`Tem certeza que deseja excluir o arquivo "${file.name}"?`)) return;

  try {
    // 1. Remover do Storage
    const { error: storageError } = await supabase.storage
      .from('lead-attachments')
      .remove([file.file_path]);

    if (storageError) throw storageError;

    // 2. Remover do Banco
    const { error: dbError } = await (supabase as any)
      .from('attachments')
      .delete()
      .eq('id', file.id);

    if (dbError) throw dbError;

    // 3. Atualizar UI
    listaDeArquivos.value = listaDeArquivos.value.filter(f => f.id !== file.id);
    notifySuccess('Arquivo excluído.');
  } catch (err: any) {
    notifyError('Erro ao excluir arquivo.');
  }
};

const saveQuickNote = async (content: string) => {
  try {
    const { profile } = useAuth();
    if (!profile.value?.id) {
      alert('Sessão expirada ou profissional não identificado.');
      return;
    }

    const { error } = await (supabase.from('ag_notas_internas') as any)
      .insert({
        lead_id: id,
        profissional_id: profile.value.id,
        conteudo: content
      });

    if (error) throw error;
    
    // Recarrega os dados para mostrar a nova nota na timeline
    await fetchData();
  } catch (error: any) {
    console.error('[ERRO AO SALVAR NOTA]', error.message);
    alert('Não foi possível salvar a nota no banco de dados.');
  }
};

const openWhatsApp = () => {
  if (lead.value?.telefone) {
    const numeroLimpo = lead.value.telefone.replace(/\D/g, '');
    window.open(`https://wa.me/${numeroLimpo}`, '_blank');
  }
};

const handleEdit = () => { isEditModalOpen.value = true; };
const handleSchedule = () => { isScheduleModalOpen.value = true; };

const isTaskModalOpen = ref(false);
const handleSaveTask = async (taskData: any) => {
  try {
    const { profile: authProfile } = useAuth();
    if (!authProfile.value?.id) {
       notifyError('Sessão expirada. Faça login novamente.');
       return;
    }

    const { error } = await (supabase.from('ag_tarefas') as any)
      .insert({
        lead_id: id,
        titulo: taskData.title,
        descricao: taskData.description,
        data_vencimento: taskData.dueDate,
        profissional_id: taskData.assigneeId,
        criado_por: authProfile.value.id
      });

    if (error) throw error;

    isTaskModalOpen.value = false;
    notifySuccess('Tarefa criada com sucesso!');
    
    // Atualiza a timeline para mostrar a nova tarefa (se o RPC incluir tarefas)
    await fetchData();
  } catch (err: any) {
    console.error('[ERRO AO SALVAR TAREFA]', err.message);
    notifyError('Erro ao criar tarefa. Verifique as permissões do banco de dados.');
  }
};

// --- EDIT & SCHEDULE MODALS ---
const isEditModalOpen = ref(false);
const isScheduleModalOpen = ref(false);

/**
 * Monta o objeto `acao` para o ProximoPassoCard.
 * Prioriza os dados do agendamento real (hora_inicio + hora_fim).
 * Fallback para proximo_contato_em do lead se não houver agendamento.
 * Retorna null se não houver data futura definida.
 */
const proximaAcao = computed(() => {
  // --- PRIORIDADE 1: agendamento real com hora_inicio e hora_fim ---
  if (proximoAgendamento.value) {
    const ag = proximoAgendamento.value;
    return {
      tipo: ag.categoria || lead.value?.tipo_proximo_contato || 'Contato',
      titulo: ag.titulo || `Contato com ${lead.value?.nome || 'Lead'}`,
      data: `${ag.data}T${(ag.hora_inicio || '00:00:00').substring(0, 5)}`,
      hora_fim: (ag.hora_fim || '').substring(0, 5),
      responsavel: lead.value?.vendedor_nome || 'Responsável não definido',
    };
  }

  // --- FALLBACK: campo proximo_contato_em do lead (sem hora_fim) ---
  if (!lead.value?.proximo_contato_em) return null;

  const dataAgendada = new Date(lead.value.proximo_contato_em);
  const agora = new Date();
  agora.setHours(0, 0, 0, 0);
  if (dataAgendada < agora) return null;

  return {
    tipo: lead.value.tipo_proximo_contato || 'Contato',
    titulo: lead.value.titulo_proximo_contato || `Contato com ${lead.value.nome || 'Lead'}`,
    data: lead.value.proximo_contato_em,
    hora_fim: '',
    responsavel: lead.value.vendedor_nome || 'Responsável não definido',
  };
});


const handleOpenSchedule = () => {
  isEditModalOpen.value = false;
  isScheduleModalOpen.value = true;
};

const handleScheduleSave = async (resultado: any) => {
  if (resultado) {
    // Sincroniza o campo proximo_contato_em no lead se for um agendamento futuro
    if (resultado.data && resultado.hora_inicio) {
      const fullDateStr = `${resultado.data}T${resultado.hora_inicio.substring(0, 5)}`;
      
      // Atualiza o campo no lead para manter consistência visual
      const { error } = await (supabase.from('ag_leads') as any)
        .update({ proximo_contato_em: fullDateStr })
        .eq('id', id);
        
      if (!error && lead.value) {
        lead.value.proximo_contato_em = fullDateStr;
      }

      // Popula proximoAgendamento com os dados do modal (já contém hora_fim)
      // Evita query adicional a ag_agendamentos (RLS restrita por profissional_id)
      proximoAgendamento.value = {
        data: resultado.data,
        hora_inicio: resultado.hora_inicio,
        hora_fim: resultado.hora_fim || '',
        titulo: resultado.titulo || `Contato com ${lead.value?.nome || 'Lead'}`,
        categoria: resultado.categoria || 'contato',
      };
    }
    await fetchData();
  }
};

const handleSave = async (formData: Record<string, any>) => {
  try {
    // ── 1. Campos base — sempre existem na tabela ──
    const basePayload = {
      nome:              formData.nome,
      email:             formData.email,
      telefone:          formData.telefone,
      temperatura:       formData.temperatura,
      empresa:           formData.empresa,
      origem:            formData.origem,
      score:             formData.score,
      notas:             formData.notas              || null,
      interesse:         formData.interesse,
      valor_estimado:    formData.valor_estimado     ?? null,
      setor_atuacao:     formData.setor_atuacao      || null,
      principal_desafio: formData.principal_desafio  || null,
      produtos_interesse: Array.isArray(formData.produtos_interesse)
        ? formData.produtos_interesse
        : (formData.produtos_interesse || '').split(',').map((t: string) => t.trim()).filter(Boolean),
    };

    const { error: baseError } = await (supabase
      .from('ag_leads') as any)
      .update(basePayload)
      .eq('id', id);

    if (baseError) throw baseError;

    // ── 2. Campos novos — tenta salvar, ignora se coluna ainda não existe ──
    const newPayload = {
      cargo:           formData.cargo           || null,
      tags:            Array.isArray(formData.tags)
        ? formData.tags
        : (formData.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
      proximo_contato_em: formData.proximo_contato_em  || null,
      linkedin_url:        formData.linkedin_url         || null,
      facebook_url:        formData.facebook_url         || null,
      instagram_url:       formData.instagram_url        || null,
      website_url:         formData.website_url          || null,
      notas_perfil:        formData.notas_perfil         || null,
    };

    const { error: newError } = await (supabase
      .from('ag_leads') as any)
      .update(newPayload)
      .eq('id', id);

    if (newError) {
      // Coluna ainda não existe no banco — avisa no console mas não bloqueia
      console.warn('[EDIT] Alguns campos extras não foram salvos (execute o SQL de migração):', newError.message);
    }

    isEditModalOpen.value = false;
    
    // ── 3. Sincroniza Agendamento ──
    await syncSchedule(id, formData.proximo_contato_em);

    await fetchData();
    notifySuccess('Lead atualizado com sucesso!');
    console.log('[EDIT] Lead atualizado com sucesso.');
  } catch (err: any) {
    console.error('[ERRO AO SALVAR LEAD]', err.message);
    if (err.message?.includes('unique') || err.message?.includes('duplicate key')) {
      notifyError('Telefone ou e-mail já pertence a outro lead.');
    } else {
      notifyError(`Erro ao salvar: ${err.message}`);
    }
  }
};

/**
 * Sincroniza a data do próximo contato com a tabela de agendamentos.
 * Garante que exista apenas um agendamento futuro (pendente) por lead.
 */
const syncSchedule = async (leadId: string, newDate: string | null) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Busca agendamento pendente futuro para este lead
    const { data: existing, error: fetchError } = await (supabase
      .from('ag_agendamentos') as any)
      .select('id, data, hora_inicio')
      .eq('lead_id', leadId)
      .eq('status', 'pendente')
      .gte('data', today)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (newDate) {
      const dateObj = new Date(newDate);
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(dateObj.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      const hh = String(dateObj.getHours()).padStart(2, '0');
      const min = String(dateObj.getMinutes()).padStart(2, '0');
      const ss = String(dateObj.getSeconds()).padStart(2, '0');
      const timeStr = `${hh}:${min}:${ss}`;

      // CENÁRIO A/B: Tem nova data
      if (existing) {
        // UPDATE se a data ou hora mudou
        if (existing.data !== dateStr || existing.hora_inicio !== timeStr) {
          await (supabase.from('ag_agendamentos') as any)
            .update({ 
              data: dateStr,
              hora_inicio: timeStr
            })
            .eq('id', existing.id);
        }
      } else {
        // INSERT se não havia agendamento
        await (supabase.from('ag_agendamentos') as any).insert({
          lead_id: leadId,
          cliente_id: null,
          profissional_id: profile.value?.id,
          data: dateStr,
          hora_inicio: timeStr,
          titulo: `Contato: ${lead.value?.nome || 'Lead'}`,
          descricao: `Agendamento sincronizado via edição de perfil.`,
          status: 'pendente',
          categoria: 'contato'
        });
      }
    } else if (existing) {
      // CENÁRIO C: Data foi removida, deleta o agendamento futuro
      await (supabase.from('ag_agendamentos') as any)
        .delete()
        .eq('id', existing.id);
    }
  } catch (err: any) {
    console.warn('[SYNC SCHEDULE] Erro ao sincronizar agendamento:', err.message);
  }
};




// --- UPDATE STATUS ---
// Salva o status.id (ex: 'leads_novos') no banco — consistente com o Kanban
const updateLeadStatus = async (statusId: string) => {
  try {
    const { error } = await (supabase
      .from('ag_leads') as any)
      .update({ status: statusId })
      .eq('id', id);

    if (error) throw error;

    // Atualiza o estado local instantaneamente (sem reload)
    if (lead.value) lead.value.status = statusId;

    const label = leadStatuses.value.find(s => s.id === statusId)?.display_name || statusId;
    console.log(`[STATUS] Lead atualizado para: "${label}" (id: ${statusId})`);
  } catch (err: any) {
    console.error('[ERRO AO ATUALIZAR STATUS]', err.message);
    alert(`Não foi possível atualizar o estágio: ${err.message}`);
  } finally {
    showStageMenu.value = false;
  }
};

</script>

<style>
/* Scrollbar fina e discreta para o dropdown de estágios */
.stage-dropdown {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  transition: scrollbar-color 0.3s;
}
.stage-dropdown:hover {
  scrollbar-color: #c7d2fe transparent;
}
.stage-dropdown::-webkit-scrollbar {
  width: 3px;
}
.stage-dropdown::-webkit-scrollbar-track {
  background: transparent;
}
.stage-dropdown::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 99px;
  transition: background-color 0.3s;
}
.stage-dropdown:hover::-webkit-scrollbar-thumb {
  background-color: #c7d2fe;
}
</style>
