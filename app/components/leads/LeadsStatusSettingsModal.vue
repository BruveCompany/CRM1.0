<template>
  <BaseModal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" size="xl">
    <template #header>
      <div class="modal-header-content">
        <div class="header-icon-badge">
          <Icon name="lucide:settings-2" class="header-icon" />
        </div>
        <div class="header-texts">
          <h3 class="modal-title">Personalizar Status</h3>
          <p class="modal-subtitle">Ajuste o visual da coluna no seu Kanban</p>
        </div>
      </div>
    </template>

    <div class="status-config-container" v-if="localStatus">
      <!-- COLUNA ESQUERDA: IDENTIDADE -->
      <div class="config-column main-setup">
        <!-- NOME -->
        <div class="form-group">
          <label class="group-label">Identificação do Status</label>
          <div class="input-with-icon">
            <Icon name="lucide:tag" class="field-icon" />
            <input 
              v-model="localStatus.display_name" 
              placeholder="Ex: Novo Lead..."
              class="prime-input"
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
              :class="{ active: localStatus.status_icon === icon }"
              @click="localStatus.status_icon = icon"
              type="button"
            >
              <Icon :name="icon" />
            </button>
            <button 
              class="icon-choice-btn clear"
              @click="localStatus.status_icon = null"
              title="Remover Ícone"
            >
              <Icon name="lucide:x" />
            </button>
          </div>
        </div>

        <!-- ZONA DE PERIGO -->
        <div class="danger-zone-compact">
          <div class="danger-info">
            <h4 class="danger-title">Excluir Status</h4>
            <p class="danger-desc">Ação irreversível.</p>
          </div>
          <button class="btn-delete-minimal" @click="handleDeleteRequest">
            <Icon name="lucide:trash-2" />
          </button>
        </div>
      </div>

      <!-- COLUNA DIREITA: ESTILO & PREVIEW -->
      <div class="config-column style-preview">
        <!-- PREVIEW EM TEMPO REAL -->
        <div class="preview-box">
          <label class="small-label">
            <Icon name="lucide:eye" /> Preview em Tempo Real
          </label>
          <div class="preview-render" :style="{ borderTop: `3px solid ${localStatus.color_bg}` }">
            <div 
              class="mini-icon-circle" 
              :style="{ background: localStatus.color_bg + '15', color: localStatus.color_bg }"
              v-if="localStatus.status_icon"
            >
              <Icon :name="localStatus.status_icon" />
            </div>
            <span 
              class="mini-title" 
              :class="[localStatus.font_size, localStatus.font_family, localStatus.font_weight]"
              :style="{ color: localStatus.color_text }"
            >
              {{ localStatus.display_name || 'Status' }}
            </span>
            <span class="mini-badge" :style="{ backgroundColor: localStatus.color_bg + '15', color: localStatus.color_bg, borderColor: localStatus.color_bg + '30' }">
              3
            </span>
          </div>
        </div>

        <div class="style-controls">
          <div class="style-group">
            <label class="group-label">Paleta de Cores</label>
            <div class="colors-row-compact">
              <!-- SELEÇÃO DE CORES UNIFICADA -->
              <div class="color-presets-unified">
                <span class="tiny-label">Cor Principal do Status</span>
                <div class="presets-grid">
                  <!-- BOTAO CUSTOMIZADO (ABRE O PICKER) -->
                  <div class="custom-color-wrapper">
                    <input type="color" v-model="localStatus.color_bg" id="bg-color-picker" class="hidden-picker" />
                    <button 
                      type="button" 
                      class="preset-btn custom-trigger" 
                      @click="$el.querySelector('#bg-color-picker').click()"
                      title="Cor Personalizada"
                    >
                      <Icon name="lucide:plus" />
                    </button>
                  </div>

                  <!-- PRESETS -->
                  <button 
                    v-for="color in themePresets" 
                    :key="color"
                    class="preset-btn"
                    :style="{ background: color }"
                    :class="{ active: localStatus.color_bg === color }"
                    @click="localStatus.color_bg = color"
                    type="button"
                  ></button>
                </div>
              </div>

              <div class="divider-h"></div>

              <!-- SELEÇÃO DE COR DO TEXTO UNIFICADA -->
              <div class="color-presets-unified">
                <span class="tiny-label">Cor do Texto (Título)</span>
                <div class="presets-grid">
                  <!-- BOTAO RESET (PRIMEIRO) -->
                  <button 
                    type="button" 
                    class="preset-btn reset-trigger" 
                    @click="localStatus.color_text = '#1e293b'"
                    title="Voltar para o Padrão (Preto)"
                  >
                    <Icon name="lucide:rotate-ccw" />
                  </button>

                  <!-- BOTAO CUSTOMIZADO -->
                  <div class="custom-color-wrapper">
                    <input type="color" v-model="localStatus.color_text" id="text-color-picker" class="hidden-picker" />
                    <button 
                      type="button" 
                      class="preset-btn custom-trigger" 
                      @click="$el.querySelector('#text-color-picker').click()"
                      title="Cor de Texto Personalizada"
                    >
                      <Icon name="lucide:plus" />
                    </button>
                  </div>

                  <!-- PRESETS DE TEXTO -->
                  <button 
                    v-for="color in textPresets" 
                    :key="color"
                    class="preset-btn"
                    :style="{ background: color }"
                    :class="{ active: localStatus.color_text === color }"
                    @click="localStatus.color_text = color"
                    type="button"
                  ></button>
                </div>
              </div>
            </div>
          </div>

          <div class="style-group">
            <label class="group-label">Tipografia & Estilo</label>
            <div class="typo-box-compact">
              <select v-model="localStatus.font_family" class="mini-select">
                <option value="font-sans">Moderna (Sans)</option>
                <option value="font-outfit">Premium (Outfit)</option>
                <option value="font-lexend">Geométrica (Lexend)</option>
                <option value="font-montserrat">Impactiva (Monts)</option>
                <option value="font-playfair">Elegante (Playfair)</option>
                <option value="font-caveat">Informal (Caveat)</option>
              </select>
              <div class="font-actions">
                <select v-model="localStatus.font_size" class="mini-select size">
                  <option value="text-base">Pequeno</option>
                  <option value="text-lg">Normal</option>
                  <option value="text-2xl">Grande</option>
                </select>
                <button 
                  class="mini-btn-bold" 
                  :class="{ active: localStatus.font_weight === 'font-bold' }"
                  @click="localStatus.font_weight = localStatus.font_weight === 'font-bold' ? 'font-normal' : 'font-bold'"
                >
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
        <button class="btn-save" @click="handleSave">
          <Icon name="lucide:save" />
          Salvar Configurações
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  status: any;
}>();

const emit = defineEmits(['update:modelValue', 'save', 'delete']);

const localStatus = ref<any>(null);

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

watch(() => props.status, (newVal) => {
  if (newVal) {
    localStatus.value = JSON.parse(JSON.stringify(newVal));
  }
}, { immediate: true });

const handleSave = () => {
  emit('save', localStatus.value);
  emit('update:modelValue', false);
};

const handleDeleteRequest = () => {
  emit('delete', localStatus.value);
};
</script>

<style scoped>
.modal-header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon-badge {
  width: 38px;
  height: 38px;
  background: #eef2ff;
  color: #4f46e5;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

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
  display: block;
  font-size: 0.7rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin-bottom: 0.4rem;
}

/* COLUNA ESQUERDA */
.icon-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.3rem;
  background: #f8fafc;
  padding: 0.4rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.icon-choice-btn {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.icon-choice-btn:hover { background: #f1f5f9; transform: scale(1.05); }
.icon-choice-btn.active { background: #4f46e5; color: white; border-color: #4f46e5; }
.icon-choice-btn.clear { color: #ef4444; }

.danger-zone-compact {
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: #fff1f2;
  border-radius: 10px;
  border: 1px solid #fecdd3;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.danger-title { font-size: 0.8rem; font-weight: 800; color: #9f1239; margin: 0; }
.danger-desc { font-size: 0.7rem; color: #be123c; margin: 0; opacity: 0.8; }

.btn-delete-minimal {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: #ef4444; color: white;
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}

/* COLUNA DIREITA */
.preview-box {
  background: #f1f5f9;
  padding: 0.6rem 0.8rem;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
  margin-bottom: 0.75rem;
}

.small-label { font-size: 0.65rem; font-weight: 800; color: #64748b; display: flex; align-items: center; gap: 0.3rem; margin-bottom: 0.5rem; text-transform: uppercase; }

.preview-render {
  background: white;
  padding: 0 0.75rem;
  height: 42px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.mini-icon-circle { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; }
.mini-title { font-size: 0.85rem; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex-grow: 1; }
.mini-badge { font-size: 8px; font-weight: 800; padding: 1px 5px; border-radius: 8px; }

.style-group { margin-bottom: 1rem; }

.color-pick { flex: 1; display: flex; flex-direction: column; }
.tiny-label { font-size: 0.7rem; color: #94a3b8; font-weight: 600; display: block; margin-bottom: 0.25rem; }

.color-action-row {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}

.color-action-btn-wrapper { flex-grow: 1; position: relative; }
.hidden-picker { position: absolute; opacity: 0; pointer-events: none; width: 0; height: 0; }

.color-presets-unified {
  margin-bottom: 0.5rem;
}

.presets-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.preset-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 0 1px #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.preset-btn:hover {
  transform: scale(1.15);
  z-index: 10;
}

.preset-btn.active {
  box-shadow: 0 0 0 2px #4f46e5;
  transform: scale(1.1);
}

.preset-btn.custom-trigger {
  background: linear-gradient(135s, #f8fafc 0%, #f1f5f9 100%);
  border: 2px dashed #cbd5e1;
  color: #64748b;
  font-size: 0.8rem;
  box-shadow: none;
}

.preset-btn.custom-trigger:hover {
  border-color: #4f46e5;
  color: #4f46e5;
  background: #f5f3ff;
}

.preset-btn.reset-trigger {
  background: white;
  border: 1.5px solid #e2e8f0;
  color: #94a3b8;
  font-size: 0.8rem;
  box-shadow: none;
}

.preset-btn.reset-trigger:hover {
  background: #f1f5f9;
  color: #1e293b;
  border-color: #cbd5e1;
}

.divider-h {
  height: 1px;
  background: #f1f5f9;
  margin: 0.35rem 0;
}

.btn-change-color {
  width: 100%;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
}

.btn-reset-color {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset-color:hover {
  background: #f1f5f9;
  color: #1e293b;
  border-color: #cbd5e1;
}

.btn-change-color:hover {
  background: #f8fafc;
  transform: translateY(-1px);
}

.tiny-color-wrapper {
  position: relative;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.tiny-color-wrapper input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
.color-circle-small { width: 100%; height: 100%; }

.pipette-mini {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  color: white;
  font-size: 0.75rem;
  filter: drop-shadow(0 0 1px rgba(0,0,0,0.5));
  pointer-events: none;
}

.typo-box-compact { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.4rem; display: flex; flex-direction: column; gap: 0.4rem; }
.mini-select { width: 100%; padding: 0.4rem; border-radius: 6px; border: 1px solid #f1f5f9; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.font-actions { display: grid; grid-template-columns: 1fr 50px; gap: 0.4rem; }

.mini-btn-bold {
  height: 32px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}

.mini-btn-bold.active { background: #4f46e5; color: white; border-color: #4f46e5; }

/* INPUTS GERAIS */
.prime-input {
  width: 100%;
  padding: 0.7rem 0.8rem 0.7rem 2.4rem;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
}

.input-with-icon { position: relative; display: flex; align-items: center; }
.field-icon { position: absolute; left: 0.8rem; color: #94a3b8; font-size: 0.9rem; }

/* FOOTER */
.modal-footer-actions { display: flex; justify-content: flex-end; gap: 0.75rem; width: 100%; }
.btn-cancel { padding: 0.7rem 1.25rem; border-radius: 10px; font-weight: 700; color: #64748b; background: #f1f5f9; border: none; cursor: pointer; font-size: 0.85rem; }
.btn-save { padding: 0.7rem 1.5rem; border-radius: 10px; font-weight: 800; color: white; background: #4f46e5; border: none; display: flex; align-items: center; gap: 0.6rem; cursor: pointer; font-size: 0.85rem; }
</style>
