<template>
  <header class="relative bg-white rounded-3xl p-5 shadow-sm border border-slate-100 overflow-hidden">
    <!-- Efeito Decorativo -->
    <div class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-50 -z-0"></div>
    
    <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="relative flex items-center justify-center">
          <!-- Anel de Progresso SVG (Compacto) -->
          <svg class="absolute w-[58px] h-[58px] -rotate-90 transform" viewBox="0 0 60 60">
            <!-- Fundo do Anel -->
            <circle
              cx="30"
              cy="30"
              r="27"
              stroke="currentColor"
              stroke-width="1.5"
              fill="transparent"
              class="text-slate-100"
            />
            <!-- Progresso do Score -->
            <circle
              cx="30"
              cy="30"
              r="27"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              fill="transparent"
              class="text-primary-500 transition-all duration-1000 ease-out"
              :stroke-dasharray="2 * Math.PI * 27"
              :stroke-dashoffset="2 * Math.PI * 27 * (1 - (lead.score || 0) / 100)"
            />
          </svg>

          <!-- Avatar (Reduzido) -->
          <div 
            class="relative w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-black shadow-inner z-10 transition-all duration-300 group-hover:scale-95"
            :style="{ backgroundColor: getAvatarColor(lead.nome), opacity: 0.85 }"
          >
            {{ lead.nome?.split(' ')[0]?.substring(0, 2).toUpperCase() || 'LD' }}

            <!-- Score Badge Minimalista Overlay -->
            <div 
              class="absolute -bottom-0.5 -right-0.5 px-1 py-0 rounded-md text-[8px] font-black border-2 border-white shadow-sm z-20"
              :style="{ backgroundColor: getScoreColor(lead.score || 0), color: 'white' }"
            >
              {{ lead.score || 0 }}
            </div>
          </div>
        </div>
        
        <div>
          <div class="flex items-center gap-2.5 mb-0.5">
            <h1 class="text-base font-bold text-gray-900 tracking-tight capitalize">{{ lead.nome?.toLowerCase() }}</h1>
            <UiStatusPill :status="lead.status" dot />
          </div>
          <div class="flex items-center gap-3 text-[12px] text-gray-400 font-normal mt-1">
            <span class="flex items-center gap-1.5 hover:text-primary-500 transition-colors cursor-default">
              <Icon name="heroicons:envelope" class="w-3.5 h-3.5 opacity-70" />
              {{ lead.email || 'Sem e-mail' }}
            </span>
            <span class="flex items-center gap-1.5">
              <Icon name="heroicons:user" class="w-3.5 h-3.5 opacity-70" />
              Responsável: <span class="text-gray-500 font-medium">{{ lead.vendedor_nome || 'Livre' }}</span>
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <UiActionButton variant="outline" size="sm" icon="heroicons:pencil-square" @click="$emit('edit')">
          Editar
        </UiActionButton>
        <UiActionButton variant="outline" size="sm" icon="heroicons:clipboard-document-list" @click="$emit('add-task')">
          Tarefa
        </UiActionButton>
        <UiActionButton variant="success" size="sm" icon="simple-icons:whatsapp" @click="$emit('whatsapp')">
          WhatsApp
        </UiActionButton>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  lead: any;
}>();

defineEmits(['edit', 'add-task', 'schedule', 'whatsapp']);

const getScoreColor = (score: number) => {
  if (score >= 80) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
};

const getAvatarColor = (name?: string) => {
  if (!name) return '#64748b';
  const colors = [
    '#4285F4', // Google Blue
    '#DB4437', // Google Red
    '#F4B400', // Google Yellow
    '#0F9D58', // Google Green
    '#673AB7', // Deep Purple
    '#3F51B5', // Indigo
    '#00BCD4', // Cyan
    '#009688', // Teal
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
</script>

<style scoped>
@keyframes pulse-subtle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(0.98); }
}

.animate-pulse-subtle {
  animation: pulse-subtle 3s ease-in-out infinite;
}
</style>
