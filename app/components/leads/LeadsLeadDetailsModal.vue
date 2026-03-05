<template>
  <!-- O overlay que cobre a tela inteira -->
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    
    <!-- O único conteúdo do modal é o nosso painel reutilizável.
         Ele já tem seu próprio cabeçalho, corpo e botão de fechar. -->
    <LeadDetailPanel
      v-if="lead"
      :lead="lead"
      @close="closeModal"
      class="modal-content"
    />

  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useLeads } from '~/composables/useLeads';
import LeadDetailPanel from '~/components/leads/LeadDetailPanel.vue';

const { selectedLeadId, showDetailsModal, allLeads } = useLeads();

// Reestabelecemos o vínculo com o estado global para que o modal saiba quando abrir
const isOpen = computed({
  get: () => showDetailsModal.value,
  set: (val) => showDetailsModal.value = val
});

// Encontra o lead selecionado a partir do ID
const lead = computed(() => {
  if (!selectedLeadId.value) return null;
  return allLeads.value.find(l => String(l.id) === String(selectedLeadId.value));
});

function closeModal() {
  isOpen.value = false;
}
</script>

<style scoped>
/* O CSS agora é apenas para o posicionamento do modal, não para a aparência. */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6); /* Fundo semi-transparente */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40; /* O BaseModal padrão usa z-index: 50, então deixamos este menor para as sub-janelas abrirem por cima */
  padding: 20px; /* Adiciona um respiro para telas menores */
}

/* Aplicamos algumas restrições de tamanho ao painel quando ele está dentro do modal */
.modal-content {
  max-width: 420px; /* Define uma largura máxima para o painel no modal */
  width: 100%;
  max-height: 90vh; /* Define uma altura máxima para caber na tela */
  overflow: hidden; /* O scroll será interno ao painel */
  border-radius: 12px; /* Adiciona bordas arredondadas ao container */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
</style>
