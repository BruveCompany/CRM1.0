<template>
  <BaseModal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" size="xl">
    <template #header>
      <div class="modal-header-content">
        <div class="header-icon-badge create">
          <Icon name="lucide:plus-circle" class="header-icon" />
        </div>
        <div class="header-texts">
          <h3 class="modal-title">Novo Status</h3>
          <p class="modal-subtitle">Crie uma nova etapa para o seu funil de leads</p>
        </div>
      </div>
    </template>

    <div class="status-config-container">
      <!-- COLUNA ESQUERDA: IDENTIDADE -->
      <div class="config-column main-setup">
        <!-- NOME -->
        <div class="form-group">
          <label class="group-label">Nome do Status</label>
          <div class="input-with-icon">
            <Icon name="lucide:tag" class="field-icon" />
            <input 
              v-model="newStatus.display_name" 
              placeholder="Ex: Qualificação, Reunião Agendada..."
              class="prime-input"
              ref="nameInput"
            />
          </div>
        </div>

        <!-- SELEÇÃO DE ÍCONE -->
        <div class="form-group">
          <label class="group-label">Ícone Representativo</label>
          <div class="icon-grid">
            <button 
              v-for="icon in availableIcons" 
              :key="icon"
              class="icon-choice-btn"
              :class="{ active: newStatus.status_icon === icon }"
              @click="newStatus.status_icon = icon"
              type="button"
            >
              <Icon :name="icon" />
            </button>
            <button 
              class="icon-choice-btn clear"
              @click="newStatus.status_icon = ''"
              title="Sem Ícone"
            >
              <Icon name="lucide:ban" />
            </button>
          </div>
        </div>

        <div class="info-alert">
          <Icon name="lucide:info" />
          <span>O novo status será adicionado ao final do seu Kanban.</span>
        </div>
      </div>

      <!-- COLUNA DIREITA: ESTILO & PREVIEW -->
      <div class="config-column style-preview">
        <!-- PREVIEW EM TEMPO REAL -->
        <div class="preview-box">
          <label class="small-label">
            <Icon name="lucide:eye" /> Visualização no Kanban
          </label>
          <div class="preview-render" :style="{ borderTop: `3px solid ${newStatus.color_bg}` }">
            <div 
              class="mini-icon-circle" 
              :style="{ background: newStatus.color_bg + '15', color: newStatus.color_bg }"
              v-if="newStatus.status_icon"
            >
              <Icon :name="newStatus.status_icon" />
            </div>
            <span 
              class="mini-title" 
              :class="[newStatus.font_size, newStatus.font_family, newStatus.font_weight]"
              :style="{ color: newStatus.color_text }"
            >
              {{ newStatus.display_name || 'Novo Status' }}
            </span>
            <span class="mini-badge" :style="{ backgroundColor: newStatus.color_bg + '15', color: newStatus.color_bg, borderColor: newStatus.color_bg + '30' }">
              0
            </span>
          </div>
        </div>

        <div class="style-controls">
          <div class="style-group">
            <label class="group-label">Definição de Cores</label>
            <div class="colors-row-compact">
              <div class="color-presets-unified">
                <span class="tiny-label">Cor do Tema</span>
                <div class="presets-grid">
                  <div class="custom-color-wrapper">
                    <input type="color" v-model="newStatus.color_bg" id="new-bg-picker" class="hidden-picker" />
                    <button type="button" class="preset-btn custom-trigger" @click="$el.querySelector('#new-bg-picker').click()">
                      <Icon name="lucide:plus" />
                    </button>
                  </div>
                  <button v-for="color in themePresets" :key="color" class="preset-btn" :style="{ background: color }" :class="{ active: newStatus.color_bg === color }" @click="newStatus.color_bg = color"></button>
                </div>
              </div>

              <div class="divider-h"></div>

              <div class="color-presets-unified">
                <span class="tiny-label">Cor do Texto</span>
                <div class="presets-grid">
                  <button type="button" class="preset-btn reset-trigger" @click="newStatus.color_text = '#1e293b'">
                    <Icon name="lucide:rotate-ccw" />
                  </button>
                  <div class="custom-color-wrapper">
                    <input type="color" v-model="newStatus.color_text" id="new-text-picker" class="hidden-picker" />
                    <button type="button" class="preset-btn custom-trigger" @click="$el.querySelector('#new-text-picker').click()">
                      <Icon name="lucide:plus" />
                    </button>
                  </div>
                  <button v-for="color in textPresets" :key="color" class="preset-btn" :style="{ background: color }" :class="{ active: newStatus.color_text === color }" @click="newStatus.color_text = color"></button>
                </div>
              </div>
            </div>
          </div>

          <div class="style-group">
            <label class="group-label">Tipografia Padrão</label>
            <div class="typo-box-compact">
              <select v-model="newStatus.font_family" class="mini-select">
                <option value="font-sans">Moderna (Sans)</option>
                <option value="font-outfit">Premium (Outfit)</option>
                <option value="font-lexend">Geométrica (Lexend)</option>
                <option value="font-montserrat">Impactiva (Monts)</option>
                <option value="font-playfair">Elegante (Playfair)</option>
                <option value="font-caveat">Informal (Caveat)</option>
              </select>
              <div class="font-actions">
                <select v-model="newStatus.font_size" class="mini-select size">
                  <option value="text-base">Pequeno</option>
                  <option value="text-lg" selected>Normal</option>
                  <option value="text-2xl">Grande</option>
                </select>
                <button class="mini-btn-bold" :class="{ active: newStatus.font_weight === 'font-bold' }" @click="newStatus.font_weight = newStatus.font_weight === 'font-bold' ? 'font-normal' : 'font-bold'">
                  <Icon name="lucide:bold" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer-actions">
        <button class="btn-cancel" @click="$emit('update:modelValue', false)">Cancelar</button>
        <button class="btn-save create" @click="handleCreate" :disabled="!newStatus.display_name || isSaving">
          <Icon v-if="isSaving" name="lucide:loader-2" class="animate-spin" />
          <Icon v-else name="lucide:check-circle" />
          Criar Novo Status
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'create']);

const isSaving = ref(false);
const nameInput = ref<HTMLInputElement | null>(null);

const newStatus = ref({
  display_name: '',
  status_icon: 'lucide:tag',
  color_bg: '#4f46e5',
  color_text: '#1e293b',
  font_family: 'font-sans',
  font_size: 'text-lg',
  font_weight: 'font-bold'
});

const availableIcons = [
  'lucide:flame', 'lucide:star', 'lucide:phone', 'lucide:message-circle', 
  'lucide:mail', 'lucide:calendar', 'lucide:clock', 'lucide:check-circle',
  'lucide:user-plus', 'lucide:shopping-cart', 'lucide:zap', 'lucide:target',
  'lucide:handshake', 'lucide:ban', 'lucide:alert-circle'
];

const themePresets = [
  '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', 
  '#ec4899', '#8b5cf6', '#6366f1', '#14b8a6', '#f97316'
];

const textPresets = [
  '#ffffff', '#475569', '#94a3b8', '#1e293b'
];

// Reseta o form ao abrir
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    newStatus.value = {
      display_name: '',
      status_icon: 'lucide:tag',
      color_bg: '#4f46e5',
      color_text: '#1e293b',
      font_family: 'font-sans',
      font_size: 'text-lg',
      font_weight: 'font-bold'
    };
    setTimeout(() => nameInput.value?.focus(), 100);
  }
});

const handleCreate = async () => {
  if (!newStatus.value.display_name) return;
  isSaving.value = true;
  try {
    emit('create', { ...newStatus.value });
    emit('update:modelValue', false);
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
/* Reutilizando a estrutura visual do SettingsModal para manter consistência Prime */
.modal-header-content { display: flex; align-items: center; gap: 0.75rem; }
.header-icon-badge {
  width: 38px; height: 38px;
  background: #eef2ff; color: #4f46e5;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.header-icon-badge.create { background: #f0fdf4; color: #10b981; }

.header-texts { display: flex; flex-direction: column; }
.modal-title { font-size: 1.1rem; font-weight: 800; color: #1e293b; margin: 0; }
.modal-subtitle { font-size: 0.75rem; color: #64748b; margin: 0; }

.status-config-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 0;
}

.group-label {
  display: block; font-size: 0.7rem; font-weight: 800; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 0.4rem;
}

.icon-grid {
  display: grid; grid-template-columns: repeat(8, 1fr); gap: 0.3rem;
  background: #f8fafc; padding: 0.4rem; border-radius: 10px; border: 1px solid #e2e8f0;
}

.icon-choice-btn {
  height: 32px; display: flex; align-items: center; justify-content: center;
  background: white; border: 1px solid #e2e8f0; border-radius: 6px;
  color: #64748b; cursor: pointer; transition: all 0.2s; font-size: 1rem;
}
.icon-choice-btn:hover { background: #f1f5f9; transform: scale(1.05); }
.icon-choice-btn.active { background: #10b981; color: white; border-color: #10b981; }
.icon-choice-btn.clear { color: #94a3b8; }

.info-alert {
  margin-top: 1rem; padding: 0.75rem; background: #eff6ff;
  border-radius: 10px; color: #1e40af; font-size: 0.75rem;
  display: flex; align-items: center; gap: 0.5rem; font-weight: 600;
}

.preview-box {
  background: #f1f5f9; padding: 0.6rem 0.8rem; border-radius: 12px;
  border: 1px dashed #cbd5e1; margin-bottom: 0.75rem;
}
.small-label { font-size: 0.65rem; font-weight: 800; color: #64748b; display: flex; align-items: center; gap: 0.3rem; margin-bottom: 0.5rem; text-transform: uppercase; }

.preview-render {
  background: white; padding: 0 0.75rem; height: 42px; border-radius: 8px;
  display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.mini-icon-circle { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; }
.mini-title { font-size: 0.85rem; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex-grow: 1; }
.mini-badge { font-size: 8px; font-weight: 800; padding: 1px 5px; border-radius: 8px; }

.color-presets-unified { margin-bottom: 0.5rem; }
.presets-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.25rem; }
.preset-btn {
  width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;
  box-shadow: 0 0 0 1px #e2e8f0; cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center; padding: 0;
}
.preset-btn:hover { transform: scale(1.15); z-index: 10; }
.preset-btn.active { box-shadow: 0 0 0 2px #4f46e5; transform: scale(1.1); }

.preset-btn.custom-trigger { background: #f8fafc; border: 2px dashed #cbd5e1; color: #64748b; font-size: 0.8rem; }
.preset-btn.reset-trigger { background: white; border: 1.5px solid #e2e8f0; color: #94a3b8; font-size: 0.8rem; }

.divider-h { height: 1px; background: #f1f5f9; margin: 0.35rem 0; }

.hidden-picker { position: absolute; opacity: 0; pointer-events: none; width: 0; height: 0; }
.custom-color-wrapper { position: relative; }

.typo-box-compact { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.4rem; display: flex; flex-direction: column; gap: 0.4rem; }
.mini-select { width: 100%; padding: 0.4rem; border-radius: 6px; border: 1px solid #f1f5f9; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.font-actions { display: grid; grid-template-columns: 1fr 50px; gap: 0.4rem; }
.mini-btn-bold {
  height: 32px; border-radius: 6px; border: 1px solid #e2e8f0;
  background: #f8fafc; color: #64748b; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.mini-btn-bold.active { background: #4f46e5; color: white; border-color: #4f46e5; }

.prime-input {
  width: 100%; padding: 0.7rem 0.8rem 0.7rem 2.4rem; border-radius: 10px;
  border: 1.5px solid #e2e8f0; font-size: 0.9rem; font-weight: 600; color: #1e293b;
}
.input-with-icon { position: relative; display: flex; align-items: center; }
.field-icon { position: absolute; left: 0.8rem; color: #94a3b8; font-size: 0.9rem; }

.modal-footer-actions { display: flex; justify-content: flex-end; gap: 0.75rem; width: 100%; }
.btn-cancel { padding: 0.7rem 1.25rem; border-radius: 10px; font-weight: 700; color: #64748b; background: #f1f5f9; border: none; cursor: pointer; font-size: 0.85rem; }
.btn-save.create { padding: 0.7rem 1.5rem; border-radius: 10px; font-weight: 800; color: white; background: #10b981; border: none; display: flex; align-items: center; gap: 0.6rem; cursor: pointer; font-size: 0.85rem; }
.btn-save.create:hover { background: #059669; transform: translateY(-1px); }
.btn-save.create:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
</style>
