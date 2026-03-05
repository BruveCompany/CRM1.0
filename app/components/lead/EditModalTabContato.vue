<template>
  <!-- 
    EditModalTabContato.vue
    -----------------------
    Aba de "Contato" do EditModal.
    Contém campos básicos como Nome, E-mail, Telefone, Empresa, Score e Notas.
  -->
  <div class="tab-panel">
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
</template>

<script setup lang="ts">
/**
 * Propriedades:
 * - form: Objeto reativo contendo todos os dados do formulário preenchido. As modificações
 *   são feitas diretamente nas chaves deste objeto, refletindo no pai.
 */
defineProps<{
  form: any;
}>();
</script>
