<template>
  <div class="flex flex-col h-full">
    <!-- Estado Vazio -->
    <div v-if="items.length === 0" class="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400 bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200">
      <div class="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
        <Icon name="heroicons:calendar-days" class="w-6 h-6 text-neutral-300" />
      </div>
      <p class="text-sm font-medium">Nenhuma ação pendente por enquanto.</p>
      <p class="text-xs mt-1">Sua agenda está limpa! Aproveite para prospectar novos leads.</p>
    </div>

    <!-- Lista de Itens -->
    <div v-else class="flex-1 space-y-2 pr-1 overflow-hidden">
      <NuxtLink 
        v-for="item in items" 
        :key="item.id" 
        to="/agenda"
        title="Ver na agenda completa"
        class="flex items-center gap-3 p-2.5 bg-white border border-neutral-100 rounded-xl hover:border-primary-200 hover:shadow-soft transition-all duration-300 group"
      >
        <!-- Ícone diferenciado por tipo -->
        <div :class="[
          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors',
          item.tipo === 'tarefa' ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-100' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
        ]">
          <Icon :name="item.tipo === 'tarefa' ? 'heroicons:check-circle' : 'heroicons:calendar-days'" class="w-5 h-5" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <h4 class="text-sm font-bold text-neutral-900 truncate tracking-tight group-hover:text-primary-600 transition-colors">
              {{ item.titulo }}
            </h4>
            <span class="text-[10px] font-bold uppercase py-0.5 px-2 rounded-full whitespace-nowrap" :class="[
              item.tipo === 'tarefa' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
            ]">
              {{ item.tipo }}
            </span>
          </div>
          
          <div class="flex items-center gap-3 mt-1">
            <div class="flex items-center gap-1.5 min-w-0">
              <Icon name="heroicons:user" class="w-3 h-3 text-neutral-400 shrink-0" />
              <p class="text-[11px] font-medium text-neutral-500 truncate">{{ item.lead_nome }}</p>
            </div>
            
            <div class="flex items-center gap-1.5 shrink-0">
              <Icon name="heroicons:clock" class="w-3 h-3 text-neutral-400" />
              <p class="text-[11px] font-bold" :class="isOverdue(item.data) ? 'text-rose-500' : 'text-neutral-500'">
                {{ formatDateTime(item.data, item.hora_fim) }}
              </p>
            </div>
          </div>
        </div>

        <div class="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Icon name="heroicons:chevron-right" class="w-4 h-4 text-primary-500" />
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Widget: Minha Agenda
 * Exibe agendamentos e tarefas unificados para o dashboard.
 */

interface DashboardAction {
  id: string | number
  id_original: string | number
  tipo: 'tarefa' | 'agendamento'
  titulo: string
  lead_id: string | number
  lead_nome: string
  data: string
  hora_fim?: string | null
}

defineProps<{
  items: DashboardAction[]
}>()

const formatDateTime = (dateStr: string, horaFimStr?: string | null) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  
  const today = new Date();
  const isToday = date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const formatTime = (d: Date) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  let timeDisplay = formatTime(date);
  
  // Se tiver hora final, formata o intervalo
  if (horaFimStr) {
    // A hora_fim geralmente vem como "HH:mm:ss", precisamos garantir que seja tratada
    const [h, m] = horaFimStr.split(':');
    timeDisplay += ` - ${h}:${m}`;
  }

  if (isToday) {
    return `Hoje às ${timeDisplay}`;
  }

  return `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${timeDisplay}`;
}

const isOverdue = (dateStr: string) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #f1f5f9 transparent;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #f1f5f9;
  border-radius: 10px;
}
</style>
