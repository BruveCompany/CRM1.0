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
      <div v-for="file in files" :key="file.id" class="file-item group">
        <!-- File Icon based on type -->
        <div class="file-icon-type" :class="getFileIconColor(file.name)">
          <Icon :name="getFileIcon(file.name)" class="item-icon" />
        </div>

        <!-- File Info -->
        <div class="file-info">
          <div class="file-name-row">
            <span class="file-name" :title="file.name">{{ file.name }}</span>
          </div>
          <div class="file-meta">
            <span>{{ formatSize(file.size) }}</span>
            <span class="meta-dot">•</span>
            <span>{{ formatDate(file.uploadDate) }}</span>
            <span class="meta-dot hidden sm:inline">•</span>
            <span class="hidden sm:inline">Por: {{ file.uploadedBy }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="file-actions">
          <button 
            class="action-btn action-btn--download" 
            title="Baixar"
            @click.stop="$emit('download-file', file)"
          >
            <Icon name="lucide:download" />
          </button>
          <button 
            class="action-btn action-btn--delete" 
            title="Excluir"
            @click.stop="$emit('delete-file', file)"
          >
            <Icon name="lucide:trash-2" />
          </button>
        </div>
      </div>
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

// --- UTILS ---

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(date: string | Date): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: '2-digit' 
  }).format(d);
}

function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'lucide:file-text';
    case 'doc':
    case 'docx': return 'lucide:file-edit';
    case 'xls':
    case 'xlsx': return 'lucide:file-spreadsheet';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'svg': return 'lucide:file-image';
    default: return 'lucide:file';
  }
}

function getFileIconColor(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'icon-red';
    case 'doc':
    case 'docx': return 'icon-blue';
    case 'xls':
    case 'xlsx': return 'icon-green';
    case 'jpg':
    case 'jpeg':
    case 'png': return 'icon-purple';
    default: return 'icon-slate';
  }
}
</script>

<style scoped>
.file-manager {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Header ── */
.manager-header {
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f8fafc;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon-bg {
  width: 32px;
  height: 32px;
  background: #f0f3ff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon {
  width: 16px;
  height: 16px;
  color: #4f46e5;
}

.header-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.file-count {
  font-size: 0.65rem;
  font-weight: 700;
  color: #94a3b8;
  background: #f8fafc;
  padding: 0.25rem 0.6rem;
  border-radius: 8px;
}

/* ── Upload Zone ── */
.upload-zone {
  margin: 1.25rem;
  padding: 2.5rem 1.5rem;
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
  background: #fcfdfe;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  justify-content: center;
  text-align: center;
}

.upload-zone:hover, .upload-zone.is-dragging {
  border-color: #4f46e5;
  background: #f5f3ff;
}

.upload-zone.is-dragging {
  transform: scale(1.01);
  box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.1);
}

.upload-zone--compact {
  padding: 1.25rem;
  margin-bottom: 0.75rem;
}

.hidden-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.upload-zone--compact .upload-content {
  flex-direction: row;
  text-align: left;
}

.upload-icon-wrap {
  width: 44px;
  height: 44px;
  background: #ffffff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.03);
  color: #6366f1;
}

.upload-zone--compact .upload-icon-wrap {
  width: 32px;
  height: 32px;
}

.upload-icon {
  width: 22px;
  height: 22px;
}

.upload-main-text {
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 0.2rem;
}

.upload-sub-text {
  font-size: 0.7rem;
  color: #94a3b8;
}

/* ── File List ── */
.file-list-container {
  padding: 0 1.25rem 1.25rem;
  max-height: 400px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #f8fafc;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
}

.file-item:hover {
  background: #fcfdff;
  border-color: #eef2ff;
  transform: translateX(4px);
}

.file-icon-type {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 0.85rem;
}

.item-icon {
  width: 18px;
  height: 18px;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.65rem;
  color: #94a3b8;
  font-weight: 500;
}

.meta-dot {
  opacity: 0.5;
}

/* Action Buttons */
.file-actions {
  display: flex;
  gap: 0.35rem;
  opacity: 0.4;
  transition: opacity 0.2s ease;
}

.file-item:hover .file-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  background: transparent;
  transition: all 0.2s;
}

.action-btn i, .action-btn svg {
  width: 15px;
  height: 15px;
}

.action-btn--download { color: #64748b; }
.action-btn--download:hover { background: #f1f5f9; color: #1e293b; }

.action-btn--delete { color: #f87171; }
.action-btn--delete:hover { background: #fef2f2; color: #ef4444; }

/* Icon Colors */
.icon-red { background: #fef2f2; color: #ef4444; }
.icon-blue { background: #eff6ff; color: #3b82f6; }
.icon-green { background: #f0fdf4; color: #22c55e; }
.icon-purple { background: #faf5ff; color: #a855f7; }
.icon-slate { background: #f8fafc; color: #64748b; }

/* Scrollbar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
