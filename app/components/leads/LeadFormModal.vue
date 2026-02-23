<template>
  <BaseModal 
    v-model="showModal" 
    size="lg"
    hideHeader
  >
    <!-- Tudo dentro de uma única janela de rolagem -->
    <div class="modal-form-scroll-container">
      <!-- Cabeçalho -->
      <div class="modal-premium-header">
        <div class="header-titles">
          <h3>Criar Novo Lead</h3>
          <p>Preencha os dados básicos do seu novo contato.</p>
        </div>
        <button @click="showModal = false" class="close-btn">
          <Icon name="lucide:x" class="w-5 h-5" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="lead-form-content">
        <div class="form-grid-modal">
          <!-- Nome do Lead (Largura Total) -->
          <div class="form-field full-width">
            <label>Nome do Lead <span class="required">*</span></label>
            <div class="input-container">
              <Icon name="lucide:user" class="field-icon" />
              <input 
                v-model="formData.nome" 
                type="text" 
                placeholder="Ex: Banco Itau ou João Pereira" 
                required
                class="field-input"
              />
            </div>
          </div>

          <!-- Email -->
          <div class="form-field">
            <label>Email</label>
            <div class="input-container">
              <Icon name="lucide:mail" class="field-icon" />
              <input 
                v-model="formData.email" 
                type="email" 
                placeholder="email@exemplo.com"
                class="field-input"
              />
            </div>
          </div>

          <!-- Telefone -->
          <div class="form-field">
            <label>Telefone</label>
            <div class="input-container">
              <Icon name="lucide:phone" class="field-icon" />
              <input 
                v-model="formData.telefone" 
                type="text" 
                placeholder="(11) 99999-9999"
                class="field-input"
                @input="handlePhoneInput"
              />
            </div>
          </div>

          <!-- Origem do Lead -->
          <div class="form-field">
            <label>Origem do Lead</label>
            <div class="input-container">
              <Icon name="lucide:map-pin" class="field-icon" />
              <input 
                v-model="formData.origem" 
                type="text" 
                placeholder="Ex: Website, Indicação"
                class="field-input"
              />
            </div>
          </div>

          <!-- Vendedor Responsável -->
          <div class="form-field">
            <label>Vendedor Responsável</label>
            <div class="input-container" :class="{ 'disabled-field': !isAdmin }">
              <Icon name="lucide:user-check" class="field-icon" />
              <select 
                v-model="formData.vendedor_id" 
                class="field-select"
                :disabled="!isAdmin"
              >
                <option v-for="v in vendedores" :key="v.id" :value="v.id">
                  {{ v.nome }}
                </option>
              </select>
              <Icon v-if="isAdmin" name="lucide:chevron-down" class="select-arrow" />
            </div>
            <p v-if="!isAdmin" class="field-help">Apenas administradores podem alterar o vendedor.</p>
          </div>

          <!-- Status Inicial (Display Only) -->
          <div class="form-field full-width">
            <label>Status Inicial</label>
            <div class="input-container status-display">
              <Icon name="lucide:tag" class="field-icon" />
              <input 
                type="text" 
                value="Leads Novos" 
                disabled 
                class="field-input disabled-input"
              />
            </div>
          </div>

          <!-- Descrição / Notas -->
          <div class="form-field full-width">
            <label>Descrição / Notas</label>
            <div class="input-container text-area-container">
              <textarea 
                v-model="formData.description" 
                placeholder="Descreva as intenções do lead ou detalhes importantes..."
                class="field-textarea"
                rows="4"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Botões de Ação integrados ao scroll -->
        <div class="modal-footer-actions">
          <button 
            type="button" 
            @click="showModal = false" 
            class="btn-cancel"
            :disabled="loading"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn-submit"
            :disabled="loading"
          >
            <Icon v-if="loading" name="lucide:loader-2" class="animate-spin mr-2" />
            <span>{{ loading ? 'Criando...' : 'Criar Lead' }}</span>
          </button>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useLeads } from '~/composables/useLeads';
import { useAuth } from '~/composables/useAuth';
import { useNotification } from '~/composables/useNotification';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'success']);

const { vendedores, fetchVendedores, fetchLeads } = useLeads();
const { profile, checkIsAdmin } = useAuth();
const { notifySuccess, notifyError } = useNotification();
const supabase = useSupabaseClient();

const showModal = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const loading = ref(false);
const isAdmin = ref(false);

const formData = ref({
  nome: '',
  email: '',
  telefone: '',
  origem: '',
  vendedor_id: null as number | null,
  description: '',
  status: 'leads_novos'
});

onMounted(async () => {
  isAdmin.value = await checkIsAdmin();
  if (!vendedores.value.length) {
    await fetchVendedores();
  }
  syncInitialSeller();
});

watch(showModal, (val) => {
  if (val) {
    resetForm();
    syncInitialSeller();
  }
});

watch(profile, () => {
  if (!formData.value.vendedor_id) syncInitialSeller();
});

function syncInitialSeller() {
  if (profile.value) {
    formData.value.vendedor_id = profile.value.id;
  }
}

function handlePhoneInput(e: Event) {
  const input = e.target as HTMLInputElement;
  let val = input.value.replace(/\D/g, '');
  if (val.length > 11) val = val.substring(0, 11);
  
  if (val.length > 10) {
    val = val.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
  } else if (val.length > 6) {
    val = val.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  } else if (val.length > 2) {
    val = val.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
  } else if (val.length > 0) {
    val = val.replace(/^(\d*)/, '($1');
  }
  formData.value.telefone = val;
}

async function handleSubmit() {
  if (!formData.value.nome) return;
  
  loading.value = true;
  try {
    const { data, error } = await (supabase
      .from('ag_leads') as any)
      .insert({
        nome: formData.value.nome,
        email: formData.value.email,
        telefone: formData.value.telefone,
        origem: formData.value.origem,
        vendedor_id: formData.value.vendedor_id,
        status: formData.value.status,
        description: formData.value.description,
        score: 50
      })
      .select()
      .single();

    if (error) throw error;

    notifySuccess('Lead criado com sucesso!');
    await fetchLeads();
    emit('success', data);
    showModal.value = false;
    resetForm();
  } catch (err: any) {
    console.error('Erro ao criar lead:', err);
    notifyError(`Erro ao criar lead: ${err.message}`);
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  formData.value = {
    nome: '',
    email: '',
    telefone: '',
    origem: '',
    vendedor_id: profile.value?.id || null, // Garante que usamos o id BIGINT do ag_profiles
    description: '',
    status: 'leads_novos'
  };
}
</script>

<style scoped>
/* Estilos Ultra Compactos para Eliminar Rolagem */
.modal-form-scroll-container {
  background-color: #ffffff;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
}

.modal-premium-header {
  padding: 0 0 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eef2f6;
  margin-bottom: 0.75rem;
}

.header-titles h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-titles p {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
}

.lead-form-content {
  padding: 0; /* Removido padding extra */
}

.close-btn {
  padding: 0.25rem;
  color: #94a3b8;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  color: #475569;
  background: #f1f5f9;
}

.form-grid-modal {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.form-field.full-width {
  grid-column: span 2;
}

.form-field label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.required {
  color: #ef4444;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 0.75rem;
  width: 0.85rem;
  height: 0.85rem;
  color: #cbd5e1;
  pointer-events: none;
}

.field-input, .field-select, .field-textarea {
  width: 100%;
  padding: 0.45rem 0.75rem 0.45rem 2.15rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #334155;
  transition: all 0.2s;
  outline: none;
}

.field-input::placeholder {
  color: #94a3b8;
  font-size: 0.75rem;
}

.field-input:focus, .field-select:focus, .field-textarea:focus {
  background-color: #ffffff;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.08);
}

.field-textarea {
  padding-left: 0.75rem;
  min-height: 45px;
}

.field-select {
  cursor: pointer;
  appearance: none;
}

.select-arrow {
  position: absolute;
  right: 0.75rem;
  width: 0.9rem;
  height: 0.9rem;
  color: #94a3b8;
  pointer-events: none;
}

.status-display .disabled-input {
  background-color: #e2e8f0;
  color: #64748b;
  font-weight: 600;
  cursor: not-allowed;
}

.disabled-field {
  opacity: 0.8;
}

.field-help {
  font-size: 0.6rem;
  color: #94a3b8;
  margin-top: 0.05rem;
}

.modal-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #eef2f6;
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.25rem;
  background-color: #eef2ff;
  color: #4f46e5;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background-color: #e0e7ff;
}

.btn-cancel {
  padding: 0.5rem 1rem;
  background-color: #ffffff;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover:not(:disabled) {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

.btn-submit:disabled, .btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .form-grid-modal {
    grid-template-columns: 1fr;
  }
  .form-field.full-width {
    grid-column: span 1;
  }
}
</style>
