<template>
  <header class="relative bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden">
    <!-- Efeito Decorativo -->
    <div class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-50 -z-0"></div>
    
    <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="flex items-center gap-5">
        <div class="relative group">
          <div 
            class="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:brightness-110"
            style="background-color: #818CF8"
          >
            {{ lead.nome?.split(' ')[0]?.substring(0, 2).toUpperCase() || 'LD' }}
          </div>
          <div 
            class="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[8px] font-bold border border-white shadow-md backdrop-blur-md uppercase tracking-widest bg-white/95"
            :style="{ color: getScoreColor(lead.score || 0) }"
          >
            {{ lead.score || 0 }}
          </div>
        </div>
        
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-lg font-semibold text-gray-900 tracking-tight capitalize">{{ lead.nome?.toLowerCase() }}</h1>
            <UiStatusPill :status="lead.status" dot />
          </div>
          <div class="flex items-center gap-4 text-[13px] text-gray-400 font-normal mt-1.5">
            <span class="flex items-center gap-1.5">
              <Icon name="heroicons:envelope" class="w-4 h-4 opacity-70" />
              {{ lead.email || 'Sem e-mail' }}
            </span>
            <span class="flex items-center gap-1.5">
              <Icon name="heroicons:user" class="w-4 h-4 opacity-70" />
              Responsável: <span class="text-gray-500">{{ lead.vendedor_nome || 'Livre' }}</span>
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <UiActionButton variant="outline" icon="heroicons:pencil-square" @click="$emit('edit')">
          Editar
        </UiActionButton>
        <UiActionButton variant="outline" icon="heroicons:calendar-days" @click="$emit('schedule')">
          Nova Tarefa
        </UiActionButton>
        <UiActionButton variant="success" icon="simple-icons:whatsapp" @click="$emit('whatsapp')">
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

defineEmits(['edit', 'schedule', 'whatsapp']);

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
