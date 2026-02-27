<template>
  <div class="flex flex-col gap-3">
    <div v-if="atividades.length === 0" class="flex flex-col items-center justify-center py-10 opacity-40">
      <Icon name="heroicons:clock" class="w-10 h-10 mb-2" />
      <p class="text-xs font-medium">Nenhuma atividade recente.</p>
    </div>

    <div 
      v-for="item in atividades" 
      :key="item.unique_id"
      class="group relative"
    >
      <NuxtLink 
        :to="`/leads/${item.lead_id}`"
        class="flex items-start gap-3 p-3 bg-white border border-neutral-100 rounded-xl hover:border-primary-200 hover:shadow-soft transition-all duration-300"
      >
        <!-- Ícone Dinâmico -->
        <div 
          class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          :class="{
            'bg-amber-50 text-amber-600': item.tipo_atividade === 'nota',
            'bg-indigo-50 text-indigo-600': item.tipo_atividade === 'agendamento'
          }"
        >
          <Icon 
            :name="item.tipo_atividade === 'nota' ? 'heroicons:chat-bubble-bottom-center-text' : 'heroicons:calendar-days'" 
            class="w-5 h-5"
          />
        </div>

        <!-- Conteúdo -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-0.5">
            <span class="text-[9px] font-semibold uppercase tracking-wider text-neutral-400">
              {{ item.tipo_atividade === 'nota' ? 'Nota Interna' : 'Agendamento' }}
            </span>
            <span class="text-[10px] font-medium text-neutral-400">
              {{ formatRelativeTime(item.data_criacao) }}
            </span>
          </div>
          <h4 class="text-sm font-semibold text-neutral-800 truncate mb-1 leading-tight">
             {{ item.descricao || 'Sem descrição' }}
          </h4>
          <p class="text-[11px] text-neutral-500 font-medium">
            Lead: <span class="text-primary-600 font-semibold">{{ item.lead_nome }}</span>
          </p>
        </div>

        <Icon name="heroicons:chevron-right" class="w-4 h-4 text-neutral-200 group-hover:text-primary-400 self-center" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
interface AtividadeRecente {
  unique_id: string
  tipo_atividade: 'nota' | 'agendamento'
  descricao: string
  data_criacao: string
  lead_id: string | number
  lead_nome: string
}

const props = defineProps<{
  atividades: AtividadeRecente[]
}>()

/**
 * Função simples para formatar tempo relativo sem dependências externas
 */
function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'agora mesmo'
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `há ${diffInMinutes} min`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `há ${diffInHours} h`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) return `há ${diffInDays} d`
  
  return date.toLocaleDateString()
}
</script>
