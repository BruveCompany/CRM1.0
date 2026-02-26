<template>
  <BaseModal v-model="showModal" size="2xl" hideHeader noBodyScroll>
    <div class="modal-form-scroll-container">
      
      <!-- Cabeçalho -->
      <div class="modal-premium-header">
        <div class="header-titles">
          <div class="header-badge">TAREFA</div>
          <h3>Nova Tarefa</h3>
          <p>Crie uma tarefa interna associada ao lead <strong>{{ leadName }}</strong>.</p>
        </div>
        <button @click="close" class="close-btn" type="button">
          <Icon name="lucide:x" class="w-5 h-5" />
        </button>
      </div>

      <form @submit.prevent="handleSave" class="task-form-content">
        <div class="form-body">
          <div class="form-grid">
            
            <!-- Título da Tarefa -->
            <div class="form-field col-span-2">
              <label>Título da Tarefa <span class="required">*</span></label>
              <div class="input-container">
                <Icon name="lucide:check-square" class="field-icon" />
                <input 
                  v-model="form.title" 
                  type="text" 
                  placeholder="Ex: Enviar e-mail de follow-up" 
                  required 
                  class="field-input" 
                />
              </div>
            </div>

            <!-- Lead (Readonly) -->
            <div class="form-field">
              <label>Lead</label>
              <div class="input-container bg-slate-50 opacity-80">
                <Icon name="lucide:user" class="field-icon text-slate-400" />
                <input 
                  :value="leadName" 
                  type="text" 
                  readonly 
                  class="field-input cursor-not-allowed text-slate-500" 
                />
              </div>
            </div>

            <!-- Responsável -->
            <div class="form-field">
              <label>Responsável</label>
              <div class="input-container">
                <Icon name="lucide:users" class="field-icon" />
                <select v-model="form.assigneeId" class="field-select">
                  <option v-for="member in teamMembers" :key="member.profissional_id" :value="member.profissional_id">
                    {{ member.nome }}
                  </option>
                </select>
                <Icon name="lucide:chevron-down" class="select-arrow" />
              </div>
            </div>

            <!-- Data de Vencimento -->
            <div class="form-field">
              <label>Data de Vencimento <span class="required">*</span></label>
              <div class="input-container">
                <Icon name="lucide:calendar" class="field-icon" />
                <input 
                  v-model="form.dueDate" 
                  type="date" 
                  required 
                  class="field-input" 
                />
              </div>
            </div>

            <!-- Descrição -->
            <div class="form-field col-span-2">
              <label>Descrição Opcional</label>
              <div class="input-container textarea-wrap">
                <textarea 
                  v-model="form.description" 
                  placeholder="Detalhes adicionais sobre o que precisa ser feito..." 
                  class="field-textarea"
                ></textarea>
              </div>
            </div>

          </div>
        </div>

        <!-- Rodapé -->
        <div class="modal-footer-actions">
          <button type="button" @click="close" class="btn-cancel">Cancelar</button>
          <button type="submit" class="btn-submit" :disabled="loading">
            <Icon v-if="loading" name="lucide:loader-2" class="animate-spin mr-2" />
            <span>{{ loading ? 'Criando...' : 'Salvar Tarefa' }}</span>
          </button>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

interface TeamMember {
  profissional_id: number;
  nome: string;
  profile_id?: string; // Algumas views podem incluir o ID do perfil original
}

interface CurrentUser {
  id: string | number;
  name: string;
}

const props = defineProps<{
  modelValue: boolean;
  leadName: string;
  currentUser: CurrentUser;
  teamMembers: TeamMember[];
}>();

const emit = defineEmits(['update:modelValue', 'close', 'save']);

// --- ESTADO ---
const loading = ref(false);
const showModal = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const form = reactive({
  title: '',
  dueDate: '',
  description: '',
  assigneeId: '' as string | number
});

// --- LÓGICA ---
const close = () => {
  emit('close');
  showModal.value = false;
};

const handleSave = () => {
  if (!form.title || !form.dueDate) return;
  
  loading.value = true;
  
  // Emitimos os dados para o pai processar
  emit('save', {
    title: form.title,
    dueDate: form.dueDate,
    description: form.description,
    assigneeId: form.assigneeId
  });

  // Nota: O fechamento do modal e o reset do loading costumam ser controlados pelo pai
  // ou através de estados que o pai atualiza. Mas para este componente o emit('save') é o gatilho.
};

// Resetar formulário ao abrir (opcional, dependendo do comportamento desejado)
// Resetar formulário ao abrir e selecionar o usuário atual
onMounted(() => {
  if (props.teamMembers && props.teamMembers.length > 0) {
    // Tenta encontrar o profissional_id que corresponde ao usuário logado (pelo profile_id ou nome)
    const currentMember = props.teamMembers.find(m => 
      String(m.profile_id) === String(props.currentUser?.id) || 
      m.nome === props.currentUser?.name
    );
    
    if (currentMember) {
      form.assigneeId = currentMember.profissional_id;
    } else if (props.teamMembers[0]) {
      // Fallback: seleciona o primeiro se o atual não for encontrado (raro)
      form.assigneeId = props.teamMembers[0].profissional_id;
    }
  }
});
</script>

<style scoped>
.modal-form-scroll-container {
  display: flex;
  flex-direction: column;
  background: white;
  /* Removido max-height e overflow para evitar scroll */
}

/* Esconde a barra de rolagem para Chrome, Safari e Opera */
.modal-form-scroll-container::-webkit-scrollbar {
  display: none;
}

/* Esconde a barra de rolagem para IE, Edge e Firefox */
.modal-form-scroll-container {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* Header Re-styling for Premium look */
.modal-premium-header {
  padding: 1rem 1.5rem;
  background: linear-gradient(to right, #ffffff, #f8fafc);
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-badge {
  background: #eef2ff;
  color: #4f46e5;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
  width: fit-content;
  margin-bottom: 0.25rem;
  letter-spacing: 0.05em;
}

.header-titles h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.header-titles p {
  font-size: 0.82rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
}

.close-btn {
  color: #94a3b8;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
  cursor: pointer;
}
.close-btn:hover {
  background: #f1f5f9;
  color: #64748b;
}

/* Form Content */
.task-form-content {
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.col-span-2 {
  grid-column: span 2;
}

.form-field label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.required {
  color: #ef4444;
}

/* Inputs */
.input-container {
  position: relative;
  display: flex;
  align-items: center;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  transition: all 0.2s;
  background: #ffffff;
}

.input-container:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.08);
}

.field-icon {
  position: absolute;
  left: 0.85rem;
  width: 1.1rem;
  height: 1.1rem;
  color: #64748b;
  pointer-events: none;
}

.field-input, .field-select {
  width: 100%;
  padding: 0.6rem 0.85rem 0.6rem 2.6rem;
  border: none;
  background: transparent;
  font-size: 0.88rem;
  color: #1e293b;
  outline: none;
  border-radius: 10px;
}

.field-select {
  appearance: none;
  cursor: pointer;
}

.select-arrow {
  position: absolute;
  right: 0.85rem;
  width: 1rem;
  height: 1rem;
  color: #94a3b8;
  pointer-events: none;
}

.textarea-wrap {
  align-items: flex-start;
  padding: 0.5rem 0;
}

.field-textarea {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: none;
  background: transparent;
  font-size: 0.88rem;
  color: #1e293b;
  outline: none;
  min-height: 80px;
  resize: vertical;
}

/* Footer */
.modal-footer-actions {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel {
  padding: 0.6rem 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #64748b;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-submit {
  padding: 0.6rem 2rem;
  background: #4f46e5;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 0.88rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 6px 10px -1px rgba(79, 70, 229, 0.3);
}

.btn-submit:active {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
