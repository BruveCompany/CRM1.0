<template>
  <!-- 
    EditModalTabNegocio.vue
    -----------------------
    Aba de "Negócio" do EditModal.
    Contém campos de Produto, Valor Estimado, Setor, e Tags.
    As tags são separadas por vírgula e pré-visualizadas logo abaixo.
  -->
  <div class="tab-panel">
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
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  form: any;
}>();

/**
 * Utilitário local para exibir uma string separada por vírgulas
 * como chips estilizados logo abaixo do input.
 */
const toTagArray = (str: string) =>
  String(str || '').split(',').map(t => t.trim()).filter(Boolean);

const produtosTags = computed(() => toTagArray(props.form.produtos_interesse));
const leadTags     = computed(() => toTagArray(props.form.tags));
</script>
