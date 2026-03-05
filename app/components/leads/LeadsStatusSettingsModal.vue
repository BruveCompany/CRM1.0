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
// No Nuxt 4 e Vue 3.3+, imports como `ref`, `watch` ou `computed` são auto-importados.
// Não é necessário declará-los aqui, mantendo o código mais limpo.

interface Props {
  modelValue: boolean;
  status: any;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', status: any): void;
  (e: 'delete', status: any): void;
}>();

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

// O watch é auto-importado globalmente pelo Nuxt
watch(() => props.status, (newVal) => {
  if (newVal) {
    // Clona o objeto para não mutar a prop diretamente, evitando side-effects
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

<style src="./LeadsStatusSettingsModal.css" scoped></style>
