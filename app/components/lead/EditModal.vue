<template>
  <BaseModal v-model="showModal" size="4xl" hideHeader noBodyScroll>
    <div class="modal-form-scroll-container">

      <!-- Cabeçalho -->
      <div class="modal-premium-header">
        <div class="header-titles">
          <h3>{{ isEditing ? 'Editar Lead' : 'Criar Novo Lead' }}</h3>
          <p>{{ isEditing ? 'Atualize as informações do contato.' : 'Preencha os dados para cadastrar um novo lead.' }}</p>
        </div>
        <button @click="showModal = false" class="close-btn" type="button">
          <Icon name="lucide:x" class="w-5 h-5" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="tab-bar">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          :class="['tab-btn', activeTab === tab.id && 'tab-btn--active']"
          @click="activeTab = tab.id"
        >
          <Icon :name="tab.icon" class="tab-icon" />
          {{ tab.label }}
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="lead-form-content">

        <!-- ── TAB 1: CONTATO ── -->
        <div v-show="activeTab === 'contato'" class="tab-panel">
          <div class="form-grid">

            <!-- Nome -->
            <div class="form-field col-3">
              <label>Nome do Lead <span class="required">*</span></label>
              <div class="input-container">
                <Icon name="lucide:user" class="field-icon" />
                <input v-model="form.nome" type="text" placeholder="Nome completo" required class="field-input" />
              </div>
            </div>

            <!-- Email -->
            <div class="form-field">
              <label>E-mail</label>
              <div class="input-container">
                <Icon name="lucide:mail" class="field-icon" />
                <input v-model="form.email" type="email" placeholder="email@exemplo.com" class="field-input" />
              </div>
            </div>

            <!-- Telefone -->
            <div class="form-field">
              <label>Telefone / WhatsApp</label>
              <div class="input-container">
                <Icon name="lucide:phone" class="field-icon" />
                <input v-model="form.telefone" type="text" placeholder="(11) 99999-9999" class="field-input" />
              </div>
            </div>

            <!-- Temperatura -->
            <div class="form-field">
              <label>Temperatura</label>
              <div class="input-container">
                <Icon name="lucide:flame" class="field-icon" />
                <select v-model="form.temperatura" class="field-select">
                  <option value="">Selecionar...</option>
                  <option value="frio">❄️ Frio</option>
                  <option value="morno">🌤️ Morno</option>
                  <option value="quente">🔥 Quente</option>
                </select>
                <Icon name="lucide:chevron-down" class="select-arrow" />
              </div>
            </div>

            <!-- Empresa -->
            <div class="form-field">
              <label>Nome da Empresa</label>
              <div class="input-container">
                <Icon name="lucide:building-2" class="field-icon" />
                <input v-model="form.empresa" type="text" placeholder="Ex: Acme Corp" class="field-input" />
              </div>
            </div>

            <!-- Cargo -->
            <div class="form-field">
              <label>Cargo / Função</label>
              <div class="input-container">
                <Icon name="lucide:briefcase" class="field-icon" />
                <input v-model="form.cargo" type="text" placeholder="Ex: CEO, Gerente" class="field-input" />
              </div>
            </div>

            <!-- Origem -->
            <div class="form-field">
              <label>Origem do Lead</label>
              <div class="input-container">
                <Icon name="lucide:map-pin" class="field-icon" />
                <input v-model="form.origem" type="text" placeholder="Ex: Website, Indicação" class="field-input" />
              </div>
            </div>

            <!-- Score -->
            <div class="form-field">
              <label>Score (0–100)</label>
              <div class="input-container">
                <Icon name="lucide:star" class="field-icon" />
                <input v-model.number="form.score" type="number" min="0" max="100" placeholder="0" class="field-input" />
              </div>
            </div>

          </div>

          <!-- Notas — fora do grid para crescer livremente -->
          <div class="form-field textarea-field">
            <label>Notas / Observações</label>
            <div class="input-container text-area-container" style="flex:1">
              <textarea v-model="form.notas" placeholder="Observações internas sobre este lead..." class="field-textarea" />
            </div>
          </div>
        </div>

        <!-- ── TAB 2: NEGÓCIO ── -->
        <div v-show="activeTab === 'negocio'" class="tab-panel">
          <div class="form-grid">

            <!-- Interesse -->
            <div class="form-field">
              <label>Interesse / Produto</label>
              <div class="input-container">
                <Icon name="lucide:tag" class="field-icon" />
                <input v-model="form.interesse" type="text" placeholder="O que este lead busca?" class="field-input" />
              </div>
            </div>

            <!-- Valor Estimado -->
            <div class="form-field">
              <label>Valor Estimado (R$)</label>
              <div class="input-container">
                <span class="currency-prefix">R$</span>
                <input v-model="form.valor_estimado" type="number" min="0" step="0.01" placeholder="0,00" class="field-input field-input-currency" />
              </div>
            </div>

            <!-- Setor -->
            <div class="form-field">
              <label>Setor de Atuação</label>
              <div class="input-container">
                <Icon name="lucide:layers" class="field-icon" />
                <select v-model="form.setor_atuacao" class="field-select">
                  <option value="">Selecionar...</option>
                  <option>Tecnologia</option>
                  <option>Varejo</option>
                  <option>Saúde</option>
                  <option>Educação</option>
                  <option>Serviços</option>
                  <option>Imobiliário</option>
                  <option>Logística</option>
                  <option>Financeiro</option>
                  <option>Indústria</option>
                  <option>Agronegócio</option>
                  <option>Beleza & Estética</option>
                  <option>Fitness & Bem-estar</option>
                  <option>Outro</option>
                </select>
                <Icon name="lucide:chevron-down" class="select-arrow" />
              </div>
            </div>

            <!-- Produtos de Interesse -->
            <div class="form-field col-3">
              <label>Produtos de Interesse <span class="field-hint">(separe por vírgula)</span></label>
              <div class="input-container">
                <Icon name="lucide:package" class="field-icon" />
                <input v-model="form.produtos_interesse" type="text" placeholder="Ex: Plano Premium, Consultoria, Suporte" class="field-input" />
              </div>
              <div v-if="produtosTags.length" class="tags-preview">
                <span v-for="tag in produtosTags" :key="tag" class="tag-chip tag-chip--indigo">{{ tag }}</span>
              </div>
            </div>

            <!-- Tags do Lead -->
            <div class="form-field col-3">
              <label>Tags do Lead <span class="field-hint">(separe por vírgula)</span></label>
              <div class="input-container">
                <Icon name="lucide:bookmark" class="field-icon" />
                <input v-model="form.tags" type="text" placeholder="Ex: VIP, Agendou Avaliação, Pediu Desconto" class="field-input" />
              </div>
              <div v-if="leadTags.length" class="tags-preview">
                <span v-for="tag in leadTags" :key="tag" class="tag-chip tag-chip--violet">{{ tag }}</span>
              </div>
            </div>

          </div>

          <!-- Principal Desafio — fora do grid para crescer livremente -->
          <div class="form-field textarea-field">
            <label>Principal Desafio / Dor do Cliente</label>
            <div class="input-container text-area-container" style="flex:1">
              <textarea v-model="form.principal_desafio" placeholder="Descreva o maior desafio ou necessidade deste lead..." class="field-textarea" />
            </div>
          </div>
        </div>

        <!-- ── TAB 3: AGENDA & PERFIS ── -->
        <div v-show="activeTab === 'agenda'" class="tab-panel">
          <div class="form-grid grid-2-cols">

            <!-- Próximo Contato -->
            <div class="form-field col-2">
              <label>Próximo Contato Agendado</label>
              
              <div class="schedule-action-wrapper">
                <button 
                  type="button" 
                  class="btn-manage-schedule"
                  @click="$emit('open-schedule-modal', form)"
                >
                  <Icon name="lucide:calendar-plus" class="w-5 h-5 mr-3" />
                  Gerenciar Agendamento
                </button>
                
                <div v-if="form.proximo_contato_em" class="current-schedule-info">
                  <div class="info-dot"></div>
                  <Icon name="lucide:info" class="w-3.5 h-3.5 text-indigo-400" />
                  <span>Agendado: {{ formatDate(form.proximo_contato_em) }}</span>
                </div>
              </div>
            </div>

            <!-- LinkedIn -->
            <div class="form-field">
              <label>LinkedIn</label>
              <div class="prefix-input-wrap">
                <div class="prefix-label">linkedin.com/in/</div>
                <input v-model="form.linkedin_slug" type="text" placeholder="usuario" class="prefix-field" />
              </div>
            </div>

            <!-- Facebook -->
            <div class="form-field">
              <label>Facebook</label>
              <div class="prefix-input-wrap">
                <div class="prefix-label">facebook.com/</div>
                <input v-model="form.facebook_slug" type="text" placeholder="usuario" class="prefix-field" />
              </div>
            </div>

            <!-- Instagram -->
            <div class="form-field">
              <label>Instagram</label>
              <div class="prefix-input-wrap">
                <div class="prefix-label">instagram.com/</div>
                <input v-model="form.instagram_slug" type="text" placeholder="usuario" class="prefix-field" />
              </div>
            </div>

            <!-- Website -->
            <div class="form-field">
              <label>Website</label>
              <div class="prefix-input-wrap">
                <div class="prefix-label">https://www.</div>
                <input v-model="form.website_slug" type="text" placeholder="seusite.com.br" class="prefix-field" />
              </div>
            </div>

          </div>

          <!-- Comentário — fora do grid para crescer livremente -->
          <div class="form-field textarea-field">
            <label>Comentário sobre Perfis Online</label>
            <div class="input-container text-area-container" style="flex:1">
              <textarea v-model="form.notas_perfil" placeholder="Observações sobre os perfis online, comportamento nas redes..." class="field-textarea" />
            </div>
          </div>
        </div>

        <!-- Rodapé -->
        <div class="modal-footer-actions">
          <button type="button" @click="showModal = false" class="btn-cancel" :disabled="loading">Cancelar</button>
          <button type="submit" class="btn-submit" :disabled="loading">
            <Icon v-if="loading" name="lucide:loader-2" class="animate-spin mr-2" />
            <span>{{ loading ? 'Salvando...' : (isEditing ? 'Atualizar Lead' : 'Criar Lead') }}</span>
          </button>
        </div>

      </form>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  lead: any;
  isEditing?: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'save', 'close', 'open-schedule-modal']);
const loading = ref(false);

const showModal = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// Tabs
const tabs = [
  { id: 'contato', label: 'Contato',       icon: 'lucide:user' },
  { id: 'negocio', label: 'Negócio',       icon: 'lucide:trending-up' },
  { id: 'agenda',  label: 'Agenda & Perfis', icon: 'lucide:calendar' },
];
const activeTab = ref('contato');

// Helpers para converter array JSON ↔ string
const arrayToString = (val: any) => {
  if (!val) return '';
  if (Array.isArray(val)) return val.join(', ');
  return String(val);
};

const form = ref({
  // Contato
  nome: '',
  email: '',
  telefone: '',
  temperatura: '',
  empresa: '',
  cargo: '',
  origem: '',
  score: 0,
  notas: '',
  // Negócio
  interesse: '',
  valor_estimado: null as number | null,
  setor_atuacao: '',
  produtos_interesse: '',  // string local; convertido para array no save
  tags: '',                // string local; convertido para array no save
  principal_desafio: '',
  // Agenda & Perfis
  proximo_contato_em: '',
  linkedin_slug: '',
  facebook_slug: '',
  instagram_slug: '',
  website_slug: '',
  notas_perfil: '',
});

// Helper para extrair apenas o nome de usuário (slug) de uma URL
const getSlug = (url: string | null | undefined, prefix: string) => {
  if (!url) return '';
  
  // 1. Remove protocolos, www e espaços
  let clean = url.trim().replace(/^(https?:\/\/)?(www\.)?/, '');
  
  // 2. Se tiver um prefixo específico (ex: instagram.com/)
  if (prefix) {
    // Remove o prefixo da string 'clean' se ele existir no início
    // Ex: clean = 'instagram.com/usuario', prefix = 'instagram.com/' -> 'usuario'
    const index = clean.indexOf(prefix);
    if (index !== -1) {
      return clean.substring(index + prefix.length).replace(/\/$/, '');
    }
  }
  
  // 3. Para website ou se o prefixo não foi encontrado, retorna o que sobrou
  return clean.replace(/\/$/, '');
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
};

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.lead) {
      activeTab.value = 'contato';
      form.value = {
        nome:               props.lead.nome               || '',
        email:              props.lead.email              || '',
        telefone:           props.lead.telefone           || '',
        temperatura:        props.lead.temperatura        || '',
        empresa:            props.lead.empresa            || '',
        cargo:              props.lead.cargo              || '',
        origem:             props.lead.origem             || '',
        score:              props.lead.score              ?? 0,
        notas:              props.lead.notas              || '',
        interesse:          props.lead.interesse          || '',
        valor_estimado:     props.lead.valor_estimado     ?? null,
        setor_atuacao:      props.lead.setor_atuacao      || '',
        produtos_interesse: arrayToString(props.lead.produtos_interesse),
        tags:               arrayToString(props.lead.tags),
        principal_desafio:  props.lead.principal_desafio  || '',
        proximo_contato_em:  props.lead.proximo_contato_em
          ? props.lead.proximo_contato_em.slice(0, 16)
          : '',
        linkedin_slug:      getSlug(props.lead.linkedin_url, 'linkedin.com/in/'),
        facebook_slug:      getSlug(props.lead.facebook_url, 'facebook.com/'),
        instagram_slug:     getSlug(props.lead.instagram_url, 'instagram.com/'),
        website_slug:       getSlug(props.lead.website_url, ''), // Limpa apenas o protocolo
        notas_perfil:       props.lead.notas_perfil        || '',
      };
    }
  },
  { immediate: true }
);

// Sincroniza campos que podem ser alterados externamente (ex: via modal de agendamento)
watch(
  () => props.lead,
  (newLead) => {
    if (newLead && props.modelValue) {
      if (newLead.proximo_contato_em && newLead.proximo_contato_em !== form.value.proximo_contato_em) {
        form.value.proximo_contato_em = newLead.proximo_contato_em.slice(0, 16);
      }
      if (newLead.nome && !form.value.nome) {
        form.value.nome = newLead.nome;
      }
    }
  },
  { deep: true }
);

// Computed tags previews
const toTagArray = (str: string) =>
  str.split(',').map(t => t.trim()).filter(Boolean);

const produtosTags = computed(() => toTagArray(form.value.produtos_interesse));
const leadTags     = computed(() => toTagArray(form.value.tags));

async function handleSubmit() {
  if (!form.value.nome) return;
  loading.value = true;
  try {
    const payload = {
      ...form.value,
      produtos_interesse:  toTagArray(form.value.produtos_interesse),
      tags:                toTagArray(form.value.tags),
      proximo_contato_em:  form.value.proximo_contato_em || null,
      // Reconstroi URLs completas
      linkedin_url:        form.value.linkedin_slug ? `https://www.linkedin.com/in/${form.value.linkedin_slug}` : null,
      facebook_url:        form.value.facebook_slug ? `https://www.facebook.com/${form.value.facebook_slug}` : null,
      instagram_url:       form.value.instagram_slug ? `https://www.instagram.com/${form.value.instagram_slug}` : null,
      website_url:         form.value.website_slug ? `https://www.${form.value.website_slug}` : null,
    };
    emit('save', payload);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.modal-form-scroll-container {
  background-color: #ffffff;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  height: 92vh;
  max-height: 92vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── HEADER ── */
.modal-premium-header {
  padding: 0 0 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eef2f6;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}
.header-titles h3 { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; }
.header-titles p  { font-size: 0.72rem; color: #64748b; margin: 0; }
.close-btn { padding: 0.25rem; color: #94a3b8; border-radius: 50%; transition: all 0.2s; }
.close-btn:hover { color: #475569; background: #f1f5f9; }

/* ── TABS ── */
.tab-bar {
  display: flex;
  gap: 0.25rem;
  background: #f8fafc;
  border-radius: 10px;
  padding: 0.25rem;
  margin-bottom: 0.65rem;
  flex-shrink: 0;
}
.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.45rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  border-radius: 8px;
  transition: all 0.2s;
  border: none;
  background: transparent;
  cursor: pointer;
}
.tab-btn:hover { color: #4f46e5; background: #eef2ff; }
.tab-btn--active {
  color: #4f46e5;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.tab-icon { width: 0.8rem; height: 0.8rem; flex-shrink: 0; }

/* ── FORM ── */
.lead-form-content { padding: 0; flex: 1; display: flex; flex-direction: column; min-height: 0; }

.tab-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 0.15rem 0.25rem; /* Margem de segurança para não cortar bordas */
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)); /* minmax(0,...) evita que o conteúdo empurre a largura */
  gap: 1.1rem;
  align-content: start;
}

.grid-2-cols {
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
}

/* Textarea fora do grid: cresce para preencher o espaço restante da aba */
.textarea-field {
  margin-top: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 35vh;
}
.textarea-field .text-area-container { flex: 1; }
.textarea-field .field-textarea { height: 100%; min-height: 80px; max-height: 35vh; }

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.form-field.col-3 { grid-column: span 3; }
.form-field.col-2 { grid-column: span 2; }

.form-field label {
  font-size: 0.65rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}
.required { color: #ef4444; }
.field-hint {
  font-size: 0.6rem; font-weight: 400;
  color: #94a3b8; text-transform: none;
  letter-spacing: 0; margin-left: 0.2rem;
}

/* Novos Estilos de Prefix Input */
.prefix-input-wrap {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  height: 38px;
  overflow: hidden;
  transition: all 0.2s;
  box-sizing: border-box; /* Adicionado para evitar corte */
}
.prefix-input-wrap:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background: white;
}
.prefix-label {
  padding-left: 0.65rem;
  padding-right: 0.25rem;
  color: #94a3b8;
  font-size: 0.72rem;
  white-space: nowrap;
  user-select: none;
  font-weight: 500;
  border-right: 1px solid #f1f5f9;
  height: 100%;
  display: flex;
  align-items: center;
}
.prefix-field {
  flex: 1;
  border: none;
  background: transparent;
  height: 100%;
  padding: 0 0.65rem 0 0.5rem;
  font-size: 0.78rem;
  color: #1e293b;
  outline: none;
  font-weight: 500;
  box-sizing: border-box; /* Adicionado */
}
.prefix-field::placeholder { color: #cbd5e1; }

/* ── INPUTS ── */
.input-container { position: relative; display: flex; align-items: center; }

.field-icon {
  position: absolute; left: 0.65rem;
  width: 0.8rem; height: 0.8rem;
  color: #cbd5e1; pointer-events: none;
}

.currency-prefix {
  position: absolute; left: 0.65rem;
  font-size: 0.75rem; font-weight: 600;
  color: #94a3b8; pointer-events: none; z-index: 1;
}

.field-input,
.field-select,
.field-textarea {
  width: 100%;
  box-sizing: border-box; /* Garante que padding não estoure a largura */
  padding: 0.48rem 0.65rem 0.48rem 2rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  font-size: 0.8rem;
  color: #334155;
  transition: all 0.2s;
  outline: none;
}
.field-input-currency { padding-left: 2rem; }
.field-input::placeholder,
.field-textarea::placeholder { color: #94a3b8; font-size: 0.72rem; }
.field-input:focus,
.field-select:focus,
.field-textarea:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.08);
}

.field-textarea {
  padding-left: 0.65rem;
  resize: none;
  height: 100%;
  min-height: 80px;
}
.text-area-container { flex: 1; align-items: stretch; }
.text-area-container .field-textarea { height: 100%; }

.field-select { cursor: pointer; appearance: none; }
.select-arrow {
  position: absolute; right: 0.6rem;
  width: 0.85rem; height: 0.85rem;
  color: #94a3b8; pointer-events: none;
}

/* ── TAGS ── */
.tags-preview { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.3rem; }
.tag-chip {
  display: inline-flex; align-items: center;
  padding: 0.15rem 0.5rem;
  border-radius: 99px;
  font-size: 0.65rem; font-weight: 600;
}
.tag-chip--indigo { background: #eef2ff; color: #4f46e5; }
.tag-chip--violet { background: #f5f3ff; color: #7c3aed; }

/* ── FOOTER ── */
.modal-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.65rem;
  padding-top: 0.65rem;
  border-top: 1px solid #eef2f6;
  flex-shrink: 0;
}
.btn-submit {
  display: flex; align-items: center; justify-content: center;
  padding: 0.45rem 1.1rem;
  background-color: #eef2ff; color: #4f46e5;
  border: none; border-radius: 7px;
  font-weight: 700; font-size: 0.78rem;
  cursor: pointer; transition: all 0.2s;
}
.btn-submit:hover:not(:disabled) { background-color: #e0e7ff; }
.btn-cancel {
  padding: 0.45rem 0.9rem;
  background-color: #ffffff; color: #64748b;
  border: 1px solid #e2e8f0; border-radius: 7px;
  font-weight: 600; font-size: 0.78rem;
  cursor: pointer; transition: all 0.2s;
}
.btn-cancel:hover:not(:disabled) { background-color: #f8fafc; border-color: #cbd5e1; }
.btn-submit:disabled, .btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 768px) {
  .form-grid { grid-template-columns: 1fr; }
  .form-field.col-3, .form-field.col-2 { grid-column: span 1; }
}

.schedule-action-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-manage-schedule {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem;
  background: white;
  border: 2px dashed #e0e7ff;
  border-radius: 12px;
  color: #4f46e5;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-manage-schedule:hover {
  background: #f5f3ff;
  border-color: #6366f1;
  transform: translateY(-1px);
}

.btn-manage-schedule:active {
  transform: translateY(0);
}

.current-schedule-info {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: #6366f1;
  font-weight: 600;
  background: #f5f3ff;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  width: fit-content;
  border: 1px solid #e0e7ff;
  margin-top: 0.25rem;
}

.info-dot {
  width: 4px;
  height: 4px;
  background: #6366f1;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
}


</style>
