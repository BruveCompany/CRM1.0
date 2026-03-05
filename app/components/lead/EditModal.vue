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
        <EditModalTabContato v-show="activeTab === 'contato'" :form="form" />

        <!-- ── TAB 2: NEGÓCIO ── -->
        <EditModalTabNegocio v-show="activeTab === 'negocio'" :form="form" />

        <!-- ── TAB 3: AGENDA & PERFIS ── -->
        <EditModalTabAgenda 
          v-show="activeTab === 'agenda'" 
          :form="form" 
          @open-schedule-modal="$emit('open-schedule-modal', form)" 
        />

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
    const index = clean.indexOf(prefix);
    if (index !== -1) {
      return clean.substring(index + prefix.length).replace(/\/$/, '');
    }
  }
  
  // 3. Para website ou se o prefixo não foi encontrado, retorna o que sobrou
  return clean.replace(/\/$/, '');
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

const toTagArray = (str: string) =>
  String(str || '').split(',').map(t => t.trim()).filter(Boolean);

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

<style src="./EditModal.css"></style>
