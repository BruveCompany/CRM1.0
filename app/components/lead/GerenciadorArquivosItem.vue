<template>
  <!--
    GerenciadorArquivosItem.vue
    ---------------------------
    Renderiza uma linha de arquivo com ícone reativo 
    à sua extensão (PDF, DOCX, Imagem), os tamanhos e ações.
  -->
  <div class="file-item group">
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
        @click.stop="$emit('download', file)"
      >
        <Icon name="lucide:download" />
      </button>
      <button 
        class="action-btn action-btn--delete" 
        title="Excluir"
        @click.stop="$emit('delete', file)"
      >
        <Icon name="lucide:trash-2" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Propriedade única englobando os metadados do arquivo.
 */
defineProps<{
  file: any;
}>();

defineEmits(['download', 'delete']);

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
