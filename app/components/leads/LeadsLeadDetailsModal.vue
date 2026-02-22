<template>
  <BaseModal 
    v-model="isOpen" 
    size="3xl"
  >
    <template #header>
      <div class="header-details w-full flex justify-between items-center pr-8 py-1">
        <div class="flex items-center gap-4 flex-1 mr-4">
          <input 
            v-if="isEditing"
            v-model="editableLead.nome"
            class="edit-input-title"
            placeholder="Nome do Lead"
          />
          <h3 v-else class="text-xl font-bold text-slate-800">{{ lead?.nome || lead?.leadName || 'Detalhes do Lead' }}</h3>
          <span class="status-badge-header" :style="{ backgroundColor: getStatusColor(lead?.status) + '15', color: getStatusColor(lead?.status) }">
            {{ lead?.status?.replace(/_/g, ' ') || 'Novo' }}
          </span>
        </div>
        <div class="flex items-center gap-3">
          <button 
            v-if="!isEditing && isAdmin"
            @click="isEditing = true"
            class="edit-mode-btn"
          >
            <Icon name="lucide:edit-3" class="w-4 h-4 mr-1.5" />
            Editar
          </button>
          <template v-else-if="isAdmin">
            <button @click="cancelEdit" class="cancel-edit-btn">Cancelar</button>
            <button @click="updateLead" :disabled="updatingLead" class="update-lead-btn">
              <Icon v-if="!updatingLead" name="lucide:check-circle" class="w-4 h-4 mr-2" />
              <span>{{ updatingLead ? 'Salvando...' : 'Salvar Alterações' }}</span>
            </button>
          </template>
        </div>
      </div>
    </template>

    <div class="lead-details-content">
      <!-- Grid de Informações -->
      <div class="info-grid">
        <div class="info-item">
          <label>Telefone</label>
          <div class="info-value">
            <input 
              v-if="isEditing"
              v-model="editableLead.telefone"
              class="edit-input-field"
            />
            <div v-else class="flex items-center gap-2">
              <span>{{ lead?.telefone || lead?.phone || 'N/A' }}</span>
              <a v-if="lead?.telefone || lead?.phone" :href="`https://wa.me/${(lead?.telefone || lead?.phone).replace(/\D/g, '')}`" target="_blank" class="wa-link">
                <Icon name="lucide:message-circle" class="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        <div class="info-item">
          <label>Vendedor</label>
          <div class="info-value">{{ lead?.vendedor_nome || lead?.vendedorNome || 'Não Atribuído' }}</div>
        </div>
        <div class="info-item">
          <label>Criado em</label>
          <div class="info-value">{{ formatDate(lead?.criado_em) }}</div>
        </div>
        <div class="info-item">
          <label>Email</label>
          <div class="info-value">
            <input 
              v-if="isEditing"
              v-model="editableLead.email"
              class="edit-input-field"
              type="email"
            />
            <div v-else class="text-sm truncate" :title="lead?.email">{{ lead?.email || 'N/A' }}</div>
          </div>
        </div>
        <div class="info-item">
          <label>Score</label>
          <div class="info-value">
            <input 
              v-if="isEditing"
              v-model.number="editableLead.score"
              type="number"
              class="edit-input-field"
              min="0"
              max="100"
            />
            <template v-else>
              <span v-if="lead?.score !== undefined" class="score-badge" :style="{ backgroundColor: getScoreColor(lead.score) + '20', color: getScoreColor(lead.score) }">
                {{ lead.score }}
              </span>
              <span v-else>N/A</span>
            </template>
          </div>
        </div>
        <div class="info-item">
          <label>Origem</label>
          <div class="info-value">
            <input 
              v-if="isEditing"
              v-model="editableLead.origem"
              class="edit-input-field"
            />
            <span v-else class="origin-tag">{{ lead?.origem || 'N/A' }}</span>
          </div>
        </div>
      </div>

      <!-- Abas ou Seções -->
      <div class="sections-container">
        <!-- Histórico de Mensagens -->
        <div class="section-messages">
          <h4 class="section-title">Histórico de Mensagens</h4>
          <div class="messages-list" ref="messageBox">
            <div v-if="loadingMessages" class="loading-state">
              Carregando histórico...
            </div>
            <div v-else-if="messages.length === 0" class="empty-state">
              Nenhuma mensagem encontrada.
            </div>
            <div v-else v-for="msg in messages" :key="msg.id" :class="['message-bubble', msg.remetente === 'lead' ? 'msg-lead' : 'msg-vendedor']">
              <div class="msg-content">{{ msg.conteudo }}</div>
              <div class="msg-time">{{ formatTime(msg.criado_em) }}</div>
            </div>
          </div>
        </div>

        <!-- Notas do Vendedor -->
        <div class="section-notes">
          <h4 class="section-title">Notas do Vendedor</h4>
          <div class="notes-container">
            <textarea 
              v-model="noteText" 
              placeholder="Escreva algo importante sobre o lead..." 
              class="note-textarea"
            ></textarea>
            <div class="flex justify-end mt-2">
              <button 
                @click="saveNote" 
                class="save-note-btn"
                :disabled="savingNote"
              >
                {{ savingNote ? 'Salvando...' : 'Salvar Nota' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useLeads } from '../../composables/useLeads';
import { useNotification } from '../../composables/useNotification';
import BaseModal from '../BaseModal.vue';

const { selectedLeadId, showDetailsModal, allLeads, fetchLeads } = useLeads();
const { notifySuccess, notifyError } = useNotification();
const { checkIsAdmin } = useAuth();
const supabase = useSupabaseClient();

const isOpen = computed({
  get: () => showDetailsModal.value,
  set: (val: boolean) => showDetailsModal.value = val
});

const isAdmin = ref(true); // Default to true to avoid flashing, then verify

onMounted(async () => {
  isAdmin.value = await checkIsAdmin();
});

const lead = computed(() => {
  if (!selectedLeadId.value) return null;
  return allLeads.value.find((l: any) => String(l.id) === String(selectedLeadId.value));
});

const messages = ref<any[]>([]);
const loadingMessages = ref(false);
const noteText = ref('');
const savingNote = ref(false);

interface EditableLeadData {
  nome: string;
  telefone: string;
  email: string;
  score: number;
  origem: string;
}

const isEditing = ref(false);
const updatingLead = ref(false);
const editableLead = ref<EditableLeadData>({
  nome: '',
  telefone: '',
  email: '',
  score: 0,
  origem: ''
});

const user = useSupabaseUser();
const profissionalId = ref<number | null>(null);

function startEditing() {
  if (lead.value) {
    editableLead.value = {
      nome: lead.value.nome || lead.value.leadName || '',
      telefone: lead.value.telefone || lead.value.phone || '',
      email: lead.value.email || '',
      score: lead.value.score || 0,
      origem: lead.value.origem || ''
    };
    isEditing.value = true;
  }
}

function cancelEdit() {
  isEditing.value = false;
  editableLead.value = {
    nome: '',
    telefone: '',
    email: '',
    score: 0,
    origem: ''
  };
}

async function updateLead() {
  if (!selectedLeadId.value) return;
  updatingLead.value = true;
  try {
    const { error } = await (supabase
      .from('ag_leads') as any)
      .update({
        nome: editableLead.value.nome,
        telefone: editableLead.value.telefone,
        email: editableLead.value.email,
        score: editableLead.value.score,
        origem: editableLead.value.origem
      })
      .eq('id', selectedLeadId.value);

    if (error) throw error;

    notifySuccess('Lead atualizado com sucesso!');
    isEditing.value = false;
    await fetchLeads(); // Atualiza a lista global
  } catch (err: any) {
    notifyError('Falha ao atualizar lead: ' + err.message);
  } finally {
    updatingLead.value = false;
  }
}

watch(() => isEditing.value, (val) => {
  if (val) startEditing();
});

// Busca mensagens e notas quando o modal abre ou o lead muda
watch(() => selectedLeadId.value, async (newId: string | null) => {
  if (newId && isOpen.value) {
    loadMessages(newId);
    loadLatestNote(newId);
    fetchProfissionalId();
  }
}, { immediate: true });

watch(() => isOpen.value, (val: boolean) => {
  if (val && selectedLeadId.value) {
    loadMessages(selectedLeadId.value);
    loadLatestNote(selectedLeadId.value);
    fetchProfissionalId();
  }
});

async function fetchProfissionalId() {
  if (!user.value) return;
  try {
    const { data: profile } = await supabase
      .from('ag_profiles')
      .select('id')
      .eq('user_id', user.value.id)
      .single();
    
    if (profile) {
      const { data: profissional } = await (supabase.from('ag_profissionais') as any)
        .select('id')
        .eq('profile_id', (profile as any).id)
        .single();
      
      if (profissional) {
        profissionalId.value = (profissional as any).id;
      }
    }
  } catch (err) {
    console.error('Erro ao buscar profissionalId:', err);
  }
}

async function loadLatestNote(leadId: string) {
  if (!leadId || leadId === 'undefined') return;
  noteText.value = '';
  try {
    const { data, error } = await (supabase.from('ag_notas_internas') as any)
      .select('conteudo')
      .eq('lead_id', leadId)
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    if (data) {
      noteText.value = (data as any).conteudo;
    } else {
      // Fallback para o campo notas da tabela ag_leads se não houver nota interna
      noteText.value = (lead.value as any)?.notas || '';
    }
  } catch (err) {
    console.warn('Tabela ag_notas_internas não encontrada ou erro ao carregar:', err);
    noteText.value = (lead.value as any)?.notas || '';
  }
}

async function loadMessages(leadId: string) {
  if (!leadId || leadId === 'undefined') return;
  loadingMessages.value = true;
  messages.value = [];
  try {
    const { data, error } = await supabase
      .from('ag_mensagens')
      .select('*')
      .eq('lead_id', leadId)
      .order('criado_em', { ascending: true });

    if (error) throw error;
    messages.value = data || [];
  } catch (err: any) {
    console.error('Erro ao carregar mensagens:', err.message);
  } finally {
    loadingMessages.value = false;
  }
}

async function saveNote() {
  if (!selectedLeadId.value) return;
  savingNote.value = true;
  try {
    // 1. Tenta salvar na tabela dedicada de notas internas
    const { error: noteError } = await (supabase.from('ag_notas_internas') as any)
      .insert({
        lead_id: selectedLeadId.value,
        profissional_id: profissionalId.value,
        conteudo: noteText.value
      });

    // 2. Sempre atualiza o campo 'notas' no lead para compatibilidade/visão rápida
    const { error: leadError } = await (supabase.from('ag_leads') as any)
      .update({ notas: noteText.value })
      .eq('id', selectedLeadId.value);

    if (leadError && !noteError) {
      // Se apenas o update do lead falhar mas a nota interna salvou, consideramos sucesso
    } else if (noteError && noteError.code !== '42P01') { // 42P01 é "table does not exist"
      throw noteError;
    }
    
    notifySuccess('Nota salva com sucesso!');
    // Atualiza o lead localmente
    const localLead = allLeads.value.find((l: any) => String(l.id) === String(selectedLeadId.value));
    if (localLead) localLead.notas = noteText.value;
    
  } catch (err: any) {
    notifyError('Falha ao salvar nota: ' + err.message);
  } finally {
    savingNote.value = false;
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function formatTime(dateStr?: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function getScoreColor(score: number) {
  if (score >= 80) return '#10B981'; // Verde
  if (score >= 50) return '#F59E0B'; // Amarelo
  return '#EF4444'; // Vermelho
}

function getStatusColor(statusId: string) {
  const statusColors: Record<string, string> = {
    'leads_novos': '#3B82F6',
    'contato_feito': '#F59E0B',
    'necessidades': '#EC4899',
    'em_atendimento': '#6366f1',
    'qualificado': '#8B5CF6',
    'em_negociacao': '#06B6D4',
    'proposta': '#f97316',
    'ganho': '#10B981',
    'perdido': '#EF4444'
  };
  return statusColors[statusId] || '#64748b';
}
</script>

<style scoped>
.header-details {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-badge-header {
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.lead-details-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 75vh;
  overflow: hidden;
  padding: 0 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  background: #f8fafc;
  padding: 0.85rem 1.25rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.edit-input-title {
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: all 0.2s;
}

.edit-input-title:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.edit-input-field {
  width: 100%;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
  transition: all 0.2s;
}

.edit-input-field:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.edit-mode-btn {
  display: flex;
  align-items: center;
  background: white;
  color: #475569;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.edit-mode-btn:hover {
  background: #f8fafc;
  color: #1e293b;
  border-color: #cbd5e1;
}

.update-lead-btn {
  display: flex;
  align-items: center;
  background-color: #eef2ff;
  color: #4f46e5;
  padding: 0.6rem 1.5rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  border: none;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.1);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.update-lead-btn:hover:not(:disabled) {
  background-color: #e0e7ff;
  box-shadow: 0 4px 8px rgba(79, 70, 229, 0.15);
  transform: translateY(-1px);
}

.update-lead-btn:active:not(:disabled) {
  transform: translateY(0);
}

.cancel-edit-btn {
  background: transparent;
  color: #64748b;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;
}

.cancel-edit-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

 .score-badge {
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 800;
  font-size: 0.75rem;
}

.origin-tag {
  background: #e2e8f0;
  color: #475569;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: capitalize;
}

.info-item label {
  display: block;
  font-size: 0.65rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 0.1rem;
}

.info-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.2;
}

.wa-link {
  color: #22c55e;
  transition: opacity 0.2s;
}
.wa-link:hover {
  opacity: 0.7;
}

.sections-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  flex-grow: 1;
  min-height: 0;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eef2ff;
}

.section-messages, .section-notes {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.messages-list {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1rem;
  flex-grow: 1; /* Ocupa o espaço disponível na coluna */
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.message-bubble {
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  position: relative;
}

.msg-lead {
  align-self: flex-start;
  background: white;
  color: #1e293b;
  border-bottom-left-radius: 2px;
}

.msg-vendedor {
  align-self: flex-end;
  background: #eef2ff;
  color: #4f46e5;
  border-bottom-right-radius: 2px;
}

.msg-time {
  font-size: 0.65rem;
  margin-top: 0.25rem;
  opacity: 0.7;
  text-align: right;
}

.notes-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.note-textarea {
  flex-grow: 1;
  width: 100%;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 1rem;
  font-size: 0.95rem;
  resize: none;
  transition: border-color 0.2s;
}

.note-textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.save-note-btn {
  background-color: #eef2ff;
  color: #4f46e5;
  padding: 0 1.25rem;
  height: 34px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.save-note-btn:hover:not(:disabled) {
  background-color: #e0e7ff;
}

.save-note-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state, .empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  font-style: italic;
  font-size: 0.9rem;
}
</style>
