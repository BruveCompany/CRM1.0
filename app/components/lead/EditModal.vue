<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="showModal"
        style="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);padding:1rem;"
        @click.self="showModal = false"
      >
        <div style="background:#fff;border-radius:12px;width:100%;max-width:860px;max-height:92vh;overflow-y:auto;padding:1.25rem;box-shadow:0 20px 60px rgba(0,0,0,0.2);">

          <!-- Cabeçalho -->
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eef2f6;padding-bottom:0.5rem;margin-bottom:0.75rem;">
            <div>
              <h3 style="font-size:1rem;font-weight:700;color:#1e293b;margin:0;">{{ isEditing ? 'Editar Lead' : 'Criar Novo Lead' }}</h3>
              <p style="font-size:0.72rem;color:#64748b;margin:0;">{{ isEditing ? 'Atualize as informações do contato.' : 'Preencha os dados para cadastrar um novo lead.' }}</p>
            </div>
            <button @click="showModal = false" style="padding:0.25rem;border-radius:50%;border:none;background:transparent;cursor:pointer;color:#94a3b8;" type="button">
              <Icon name="lucide:x" style="width:1.25rem;height:1.25rem;" />
            </button>
          </div>

          <!-- Tabs -->
          <div style="display:flex;gap:0.25rem;background:#f8fafc;border-radius:10px;padding:0.25rem;margin-bottom:1rem;">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              @click="activeTab = tab.id"
              :style="{
                flex:1, display:'flex', alignItems:'center', justifyContent:'center',
                gap:'0.4rem', padding:'0.45rem 0.5rem', fontSize:'0.75rem', fontWeight:600,
                borderRadius:'8px', border:'none', cursor:'pointer',
                color: activeTab === tab.id ? '#4f46e5' : '#64748b',
                background: activeTab === tab.id ? '#fff' : 'transparent',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }"
            >
              {{ tab.label }}
            </button>
          </div>

          <form @submit.prevent="handleSubmit">

            <!-- ── TAB 1: CONTATO ── -->
            <div v-if="activeTab === 'contato'">
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;">

                <!-- Nome -->
                <div style="grid-column:span 3;">
                  <label style="font-size:0.65rem;font-weight:600;color:#64748b;text-transform:uppercase;display:block;margin-bottom:0.25rem;">Nome do Lead *</label>
                  <input v-model="form.nome" type="text" placeholder="Nome completo" required style="width:100%;box-sizing:border-box;padding:0.5rem 0.65rem;border:1px solid #e2e8f0;border-radius:7px;font-size:0.8rem;color:#334155;outline:none;" />
                </div>

                <!-- Email -->
                <div>
                  <label style="font-size:0.65rem;font-weight:600;color:#64748b;text-transform:uppercase;display:block;margin-bottom:0.25rem;">E-mail</label>
                  <input v-model="form.email" type="email" placeholder="email@exemplo.com" style="width:100%;box-sizing:border-box;padding:0.5rem 0.65rem;border:1px solid #e2e8f0;border-radius:7px;font-size:0.8rem;color:#334155;outline:none;" />
                </div>

                <!-- Telefone -->
                <div>
                  <label style="font-size:0.65rem;font-weight:600;color:#64748b;text-transform:uppercase;display:block;margin-bottom:0.25rem;">Telefone / WhatsApp</label>
                  <input v-model="form.telefone" type="text" placeholder="(11) 99999-9999" style="width:100%;box-sizing:border-box;padding:0.5rem 0.65rem;border:1px solid #e2e8f0;border-radius:7px;font-size:0.8rem;color:#334155;outline:none;" />
                </div>

                <!-- Temperatura -->
                <div>
                  <label style="font-size:0.65rem;font-weight:600;color:#64748b;text-transform:uppercase;display:block;margin-bottom:0.25rem;">Temperatura</label>
                  <select v-model="form.temperatura" style="width:100%;box-sizing:border-box;padding:0.5rem 0.65rem;border:1px solid #e2e8f0;border-radius:7px;font-size:0.8rem;color:#334155;outline:none;background:#fff;">
                    <option value="">Selecionar...</option>
                    <option value="frio">❄️ Frio</option>
                    <option value="morno">🌤️ Morno</option>
                    <option value="quente">🔥 Quente</option>
                  </select>
                </div>

                <!-- Empresa -->
                <div>
                  <label style="font-size:0.65rem;font-weight:600;color:#64748b;text-transform:uppercase;display:block;margin-bottom:0.25rem;">Empresa</label>
                  <input v-model="form.empresa" type="text" placeholder="Ex: Acme Corp" style="width:100%;box-sizing:border-box;padding:0.5rem 0.65rem;border:1px solid #e2e8f0;border-radius:7px;font-size:0.8rem;color:#334155;outline:none;" />
                </div>

                <!-- Cargo -->
                <div>
                  <label style="font-size:0.65rem;font-weight:600;color:#64748b;text-transform:uppercase;display:block;margin-bottom:0.25rem;">Cargo / Função</label>
                  <input v-model="form.cargo" type="text" placeholder="Ex: CEO, Gerente" style="width:100%;box-sizing:border-box;padding:0.5rem 0.65rem;border:1px solid #e2e8f0;border-radius:7px;font-size:0.8rem;color:#334155;outline:none;" />
                </div>

                <!-- Origem -->
                <div>
                  <label style="font-size:0.65rem;font-weight:600;color:#64748b;text-transform:uppercase;display:block;margin-bottom:0.25rem;">Origem do Lead</label>
                  <input v-model="form.origem" type="text" placeholder="Ex: Website, Indicação" style="width:100%;box-sizing:border-box;padding:0.5rem 0.65rem;border:1px solid #e2e8f0;border-radius:7px;font-size:0.8rem;color:#334155;outline:none;" />
                </div>

                <!-- Score -->
                <div>
                  <label style="font-size:0.65rem;font-weight:600;color:#64748b;text-transform:uppercase;display:block;margin-bottom:0.25rem;">Score (0–100)</label>
                  <input v-model.number="form.score" type="number" min="0" max="100" placeholder="0" style="width:100%;box-sizing:border-box;padding:0.5rem 0.65rem;border:1px solid #e2e8f0;border-radius:7px;font-size:0.8rem;color:#334155;outline:none;" />
                </div>

              </div>

              <!-- Notas -->
              <div style="margin-top:1rem;">
                <label style="font-size:0.65rem;font-weight:600;color:#64748b;text-transform:uppercase;display:block;margin-bottom:0.25rem;">Notas / Observações</label>
                <textarea v-model="form.notas" placeholder="Observações internas..." rows="4" style="width:100%;box-sizing:border-box;padding:0.5rem 0.65rem;border:1px solid #e2e8f0;border-radius:7px;font-size:0.8rem;color:#334155;outline:none;resize:vertical;"></textarea>
              </div>
            </div>

            <!-- ── TAB 2: NEGÓCIO ── -->
            <div v-if="activeTab === 'negocio'">
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;">

                <div style="grid-column:span 3;">
                  <label style="font-size:0.65rem;font-weight:600;color:#64748b;text-transform:uppercase;display:block;margin-bottom:0.25rem;">Interesse / Objetivo</label>
                  <input v-model="form.interesse" type="text" placeholder="Ex: Consultoria, Produto X" style="width:100%;box-sizing:border-box;padding:0.5rem 0.65rem;border:1px solid #e2e8f0;border-radius:7px;font-size:0.8rem;color:#334155;outline:none;" />
                </div>

                <div>
                  <label style="font-size:0.65rem;font-weight:600;color:#64748b;text-transform:uppercase;display:block;margin-bottom:0.25rem;">Valor Estimado (R$)</label>
                  <input v-model.number="form.valor_estimado" type="number" min="0" step="0.01" placeholder="0,00" style="width:100%;box-sizing:border-box;padding:0.5rem 0.65rem;border:1px solid #e2e8f0;border-radius:7px;font-size:0.8rem;color:#334155;outline:none;" />
                </div>

                <div>
                  <label style="font-size:0.65rem;font-weight:600;color:#64748b;text-transform:uppercase;display:block;margin-bottom:0.25rem;">Setor de Atuação</label>
                  <input v-model="form.setor_atuacao" type="text" placeholder="Ex: Saúde, Tecnologia" style="width:100%;box-sizing:border-box;padding:0.5rem 0.65rem;border:1px solid #e2e8f0;border-radius:7px;font-size:0.8rem;color:#334155;outline:none;" />
                </div>

                <div>
                  <label style="font-size:0.65rem;font-weight:600;color:#64748b;text-transform:uppercase;display:block;margin-bottom:0.25rem;">Produtos de Interesse</label>
                  <input v-model="form.produtos_interesse" type="text" placeholder="Separados por vírgula" style="width:100%;box-sizing:border-box;padding:0.5rem 0.65rem;border:1px solid #e2e8f0;border-radius:7px;font-size:0.8rem;color:#334155;outline:none;" />
                </div>

                <div>
                  <label style="font-size:0.65rem;font-weight:600;color:#64748b;text-transform:uppercase;display:block;margin-bottom:0.25rem;">Tags</label>
                  <input v-model="form.tags" type="text" placeholder="Separadas por vírgula" style="width:100%;box-sizing:border-box;padding:0.5rem 0.65rem;border:1px solid #e2e8f0;border-radius:7px;font-size:0.8rem;color:#334155;outline:none;" />
                </div>

                <div style="grid-column:span 2;">
                  <label style="font-size:0.65rem;font-weight:600;color:#64748b;text-transform:uppercase;display:block;margin-bottom:0.25rem;">Principal Desafio</label>
                  <input v-model="form.principal_desafio" type="text" placeholder="Ex: Aumentar vendas online" style="width:100%;box-sizing:border-box;padding:0.5rem 0.65rem;border:1px solid #e2e8f0;border-radius:7px;font-size:0.8rem;color:#334155;outline:none;" />
                </div>

              </div>
            </div>

            <!-- ── TAB 3: AGENDA & PERFIS ── -->
            <div v-if="activeTab === 'agenda'">
              <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;">

                <div style="grid-column:span 2;">
                  <label style="font-size:0.65rem;font-weight:600;color:#64748b;text-transform:uppercase;display:block;margin-bottom:0.25rem;">Próximo Contato Em</label>
                  <input v-model="form.proximo_contato_em" type="datetime-local" style="width:100%;box-sizing:border-box;padding:0.5rem 0.65rem;border:1px solid #e2e8f0;border-radius:7px;font-size:0.8rem;color:#334155;outline:none;" />
                </div>

                <div>
                  <label style="font-size:0.65rem;font-weight:600;color:#64748b;text-transform:uppercase;display:block;margin-bottom:0.25rem;">LinkedIn</label>
                  <input v-model="form.linkedin_slug" type="text" placeholder="usuario" style="width:100%;box-sizing:border-box;padding:0.5rem 0.65rem;border:1px solid #e2e8f0;border-radius:7px;font-size:0.8rem;color:#334155;outline:none;" />
                </div>

                <div>
                  <label style="font-size:0.65rem;font-weight:600;color:#64748b;text-transform:uppercase;display:block;margin-bottom:0.25rem;">Instagram</label>
                  <input v-model="form.instagram_slug" type="text" placeholder="@usuario" style="width:100%;box-sizing:border-box;padding:0.5rem 0.65rem;border:1px solid #e2e8f0;border-radius:7px;font-size:0.8rem;color:#334155;outline:none;" />
                </div>

                <div>
                  <label style="font-size:0.65rem;font-weight:600;color:#64748b;text-transform:uppercase;display:block;margin-bottom:0.25rem;">Facebook</label>
                  <input v-model="form.facebook_slug" type="text" placeholder="usuario" style="width:100%;box-sizing:border-box;padding:0.5rem 0.65rem;border:1px solid #e2e8f0;border-radius:7px;font-size:0.8rem;color:#334155;outline:none;" />
                </div>

                <div>
                  <label style="font-size:0.65rem;font-weight:600;color:#64748b;text-transform:uppercase;display:block;margin-bottom:0.25rem;">Website</label>
                  <input v-model="form.website_slug" type="text" placeholder="seusite.com.br" style="width:100%;box-sizing:border-box;padding:0.5rem 0.65rem;border:1px solid #e2e8f0;border-radius:7px;font-size:0.8rem;color:#334155;outline:none;" />
                </div>

                <div style="grid-column:span 2;">
                  <label style="font-size:0.65rem;font-weight:600;color:#64748b;text-transform:uppercase;display:block;margin-bottom:0.25rem;">Notas de Perfil</label>
                  <textarea v-model="form.notas_perfil" placeholder="Informações adicionais do perfil..." rows="4" style="width:100%;box-sizing:border-box;padding:0.5rem 0.65rem;border:1px solid #e2e8f0;border-radius:7px;font-size:0.8rem;color:#334155;outline:none;resize:vertical;"></textarea>
                </div>

              </div>
            </div>

            <!-- Rodapé -->
            <div style="display:flex;justify-content:flex-end;gap:0.5rem;margin-top:1.25rem;padding-top:0.75rem;border-top:1px solid #eef2f6;">
              <button type="button" @click="showModal = false" :disabled="loading" style="padding:0.45rem 0.9rem;background:#fff;color:#64748b;border:1px solid #e2e8f0;border-radius:7px;font-weight:600;font-size:0.78rem;cursor:pointer;">Cancelar</button>
              <button type="submit" :disabled="loading" style="display:flex;align-items:center;padding:0.45rem 1.1rem;background:#eef2ff;color:#4f46e5;border:none;border-radius:7px;font-weight:700;font-size:0.78rem;cursor:pointer;">
                <span>{{ loading ? 'Salvando...' : (isEditing ? 'Atualizar Lead' : 'Criar Lead') }}</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
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

const tabs = [
  { id: 'contato', label: 'Contato' },
  { id: 'negocio', label: 'Negócio' },
  { id: 'agenda',  label: 'Agenda & Perfis' },
];
const activeTab = ref('contato');

const arrayToString = (val: any) => {
  if (!val) return '';
  if (Array.isArray(val)) return val.join(', ');
  return String(val);
};

const form = ref({
  nome: '', email: '', telefone: '', temperatura: '',
  empresa: '', cargo: '', origem: '', score: 0, notas: '',
  interesse: '', valor_estimado: null as number | null,
  setor_atuacao: '', produtos_interesse: '', tags: '',
  principal_desafio: '', proximo_contato_em: '',
  linkedin_slug: '', facebook_slug: '', instagram_slug: '',
  website_slug: '', notas_perfil: '',
});

const getSlug = (url: string | null | undefined, prefix: string) => {
  if (!url) return '';
  let clean = url.trim().replace(/^(https?:\/\/)?(www\.)?/, '');
  if (prefix) {
    const index = clean.indexOf(prefix);
    if (index !== -1) return clean.substring(index + prefix.length).replace(/\/$/, '');
  }
  return clean.replace(/\/$/, '');
};

const populateForm = () => {
  if (!props.lead) return;
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
    proximo_contato_em: props.lead.proximo_contato_em
      ? props.lead.proximo_contato_em.slice(0, 16) : '',
    linkedin_slug:      getSlug(props.lead.linkedin_url, 'linkedin.com/in/'),
    facebook_slug:      getSlug(props.lead.facebook_url, 'facebook.com/'),
    instagram_slug:     getSlug(props.lead.instagram_url, 'instagram.com/'),
    website_slug:       getSlug(props.lead.website_url, ''),
    notas_perfil:       props.lead.notas_perfil       || '',
  };
};

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) populateForm();
}, { immediate: true });

watch(() => props.lead, (newLead) => {
  if (newLead && props.modelValue) populateForm();
}, { deep: false });

const toTagArray = (str: string) =>
  String(str || '').split(',').map(t => t.trim()).filter(Boolean);

async function handleSubmit() {
  if (!form.value.nome) return;
  loading.value = true;
  try {
    const payload = {
      ...form.value,
      produtos_interesse: toTagArray(form.value.produtos_interesse),
      tags:               toTagArray(form.value.tags),
      proximo_contato_em: form.value.proximo_contato_em || null,
      linkedin_url:  form.value.linkedin_slug  ? `https://www.linkedin.com/in/${form.value.linkedin_slug}` : null,
      facebook_url:  form.value.facebook_slug  ? `https://www.facebook.com/${form.value.facebook_slug}` : null,
      instagram_url: form.value.instagram_slug ? `https://www.instagram.com/${form.value.instagram_slug}` : null,
      website_url:   form.value.website_slug   ? `https://www.${form.value.website_slug}` : null,
    };
    emit('save', payload);
  } finally {
    loading.value = false;
  }
}
</script>
