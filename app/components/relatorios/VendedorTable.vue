<template>
  <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all">
    <div class="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
      <h3 class="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">Desempenho por especialista</h3>
      <span class="text-[10px] font-bold text-slate-300">{{ data.length }} profissionais ativos</span>
    </div>
    
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50/50">
            <th class="px-3 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Consultor</th>
            <th class="px-2 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leads</th>
            <th class="px-2 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conv.</th>
            <th class="px-3 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider w-32">Taxa %</th>
            <th class="px-2 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</th>
            <th class="px-2 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">T. Resp.</th>
            <th class="px-2 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agend.</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr 
            v-for="(item, index) in data" 
            :key="item.vendedor_id" 
            @click="$emit('select-vendedor', item)"
            class="group hover:bg-indigo-50/30 cursor-pointer transition-colors"
          >
            <!-- Coluna Consultor com Avatar -->
            <td class="px-3 py-3 whitespace-nowrap">
              <div class="flex items-center gap-1.5 leading-none">
                <!-- Troféus Modernos e Longos (Parecido com a imagem) -->
                <div v-if="index < 3" class="shrink-0 transition-transform group-hover:scale-125 group-hover:-translate-y-1">
                  <img src="https://img.icons8.com/color/96/trophy.png" 
                    :alt="index === 0 ? 'Ouro' : index === 1 ? 'Prata' : 'Bronze'" 
                    class="w-7 h-8 object-contain scale-y-110"
                    :class="{
                      'brightness-110 contrast-110': index === 0,
                      'grayscale brightness-110 contrast-[1.5]': index === 1,
                      'sepia saturate-[1.8] hue-rotate-[-15deg] brightness-[0.8]': index === 2
                    }" 
                  />
                </div>
              <div class="relative flex-shrink-0">
                  <img 
                    v-if="item.vendedor_avatar" 
                    :src="item.vendedor_avatar" 
                    class="w-7 h-7 rounded-full object-cover border border-slate-100 shadow-sm"
                  />
                  <div v-else class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-[9px] font-bold border border-slate-100">
                    {{ item.vendedor_nome ? item.vendedor_nome.substring(0,2).toUpperCase() : '??' }}
                  </div>
                </div>
              <span class="text-xs font-semibold text-slate-700 group-hover:text-primary-600 transition-colors truncate max-w-[100px]">{{ item.vendedor_nome }}</span>
            </div>
            </td>

            <td class="px-2 py-3 text-center text-xs font-bold text-slate-600">{{ item.total_leads }}</td>
            <td class="px-2 py-3 text-center text-xs font-bold text-slate-600">{{ item.leads_convertidos }}</td>

            <!-- Coluna Taxa % com Barra de Progresso Inteligente -->
            <td class="px-3 py-3">
              <div class="flex flex-col gap-1 min-w-[80px]">
                <div class="w-full h-1 bg-slate-100 rounded-full overflow-hidden relative">
                  <div 
                    class="h-full rounded-full transition-all duration-700 ease-out" 
                    :class="getBarColor(item.taxa_conversao || 0)"
                    :style="{ width: `${Math.min(item.taxa_conversao || 0, 100)}%` }"
                  ></div>
                </div>
                <span class="text-[9px] font-extrabold" :class="getTextColor(item.taxa_conversao || 0)">
                  {{ (item.taxa_conversao || 0).toFixed(1) }}%
                </span>
              </div>
            </td>

            <td class="px-2 py-3 text-center text-xs font-bold text-slate-400">{{ (item.score_medio || 0).toFixed(1) }}</td>
            <td class="px-2 py-3 text-center text-[10px] font-bold text-slate-400">{{ (Number(item.tempo_medio_resposta) || 0).toFixed(1) }}h</td>
            <td class="px-2 py-3 text-center text-xs font-bold text-slate-600">{{ item.total_agendamentos }}</td>
          </tr>
          
          <tr v-if="data.length === 0">
            <td colspan="7" class="px-6 py-20 text-center">
              <div class="flex flex-col items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                  <Icon name="heroicons:outline:face-frown" class="w-6 h-6 text-slate-200" />
                </div>
                <p class="text-[11px] font-medium text-slate-400">Nenhum dado encontrado para este período</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  data: any[];
}>();

defineEmits(['select-vendedor']);

// Lógica de Cores Condicionais (Inteligente)
const getBarColor = (taxa: number) => {
  if (taxa >= 25) return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]';
  if (taxa >= 10) return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.2)]';
  return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.2)]';
};

const getTextColor = (taxa: number) => {
  if (taxa >= 25) return 'text-emerald-600';
  if (taxa >= 10) return 'text-amber-600';
  return 'text-rose-600';
};
</script>
