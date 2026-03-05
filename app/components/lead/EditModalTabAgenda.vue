<template>
  <!-- 
    EditModalTabAgenda.vue
    -----------------------
    Aba de "Agenda & Perfis" do EditModal.
    Gerencia agendamentos (Próximo contato) e redes sociais do Lead.
  -->
  <div class="tab-panel">
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
</template>

<script setup lang="ts">
const props = defineProps<{
  form: any;
}>();

defineEmits(['open-schedule-modal']);

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
};
</script>
