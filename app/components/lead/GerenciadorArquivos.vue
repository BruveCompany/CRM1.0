<template>
  <div class="file-manager">
    <!-- ── Header ── -->
    <div class="manager-header">
      <div class="header-left">
        <div class="icon-bg">
          <Icon name="lucide:files" class="header-icon" />
        </div>
        <h3 class="header-title">Arquivos e Documentos</h3>
      </div>
      <div v-if="files.length > 0" class="header-right">
        <span class="file-count">{{ files.length }} {{ files.length === 1 ? 'Arquivo' : 'Arquivos' }}</span>
      </div>
    </div>

    <!-- ── Upload Area (Empty State or Top Action) ── -->
    <div 
      class="upload-zone"
      :class="{ 'is-dragging': isDragging, 'upload-zone--compact': files.length > 0 }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input 
        type="file" 
        ref="fileInput" 
        class="hidden-input" 
        multiple 
        @change="handleFileSelect"
      />
      
      <div class="upload-content">
        <div class="upload-icon-wrap">
          <Icon name="lucide:upload-cloud" class="upload-icon" />
        </div>
        <div class="upload-text-wrap">
          <p class="upload-main-text">
            {{ files.length === 0 ? 'Arraste e solte ou clique para enviar' : 'Clique ou arraste para adicionar mais' }}
          </p>
          <p class="upload-sub-text">PDF, DOCX, Imagens (Máx. 10MB)</p>
        </div>
      </div>
    </div>

    <!-- ── File List ── -->
    <div v-if="files.length > 0" class="file-list-container custom-scrollbar">
      <LeadGerenciadorArquivosItem 
        v-for="file in files" 
        :key="file.id" 
        :file="file" 
        @download="$emit('download-file', file)" 
        @delete="$emit('delete-file', file)" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

/**
 * GerenciadorArquivos.vue
 * ─────────────────────────────────────────────────────────────────
 * Componente para listagem e upload de documentos do lead.
 * Suporta Drag-and-drop e fornece indicadores visuais de estado.
 */

interface FileItem {
  id: string;
  name: string;
  size: number;
  uploadDate: string | Date;
  uploadedBy: string;
  type?: string;
}

const props = defineProps<{
  files: FileItem[];
}>();

const emit = defineEmits<{
  (e: 'files-selected', files: FileList | File[]): void;
  (e: 'download-file', file: FileItem): void;
  (e: 'delete-file', file: FileItem): void;
}>();

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// --- HANDLERS ---

function triggerFileInput() {
  fileInput.value?.click();
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    emit('files-selected', target.files);
    target.value = ''; // Reset para permitir selecionar o mesmo arquivo novamente
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false;
  const droppedFiles = event.dataTransfer?.files;
  if (droppedFiles && droppedFiles.length > 0) {
    emit('files-selected', droppedFiles);
  }
}
</script>

<style src="./GerenciadorArquivos.css"></style>
