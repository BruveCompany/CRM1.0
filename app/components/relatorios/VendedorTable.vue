<template>
  <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all">
    <div class="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
      <h3 class="text-[12px] font-semibold text-slate-400">Desempenho por especialista</h3>
      <span class="text-[10px] font-medium text-slate-300">{{ data.length }} profissionais ativos</span>
    </div>
    
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-slate-50">
            <th class="px-6 py-4 text-left text-[11px] font-semibold text-slate-400">Consultor</th>
            <th class="px-6 py-3 text-center text-[11px] font-semibold text-slate-400">Leads</th>
            <th class="px-6 py-3 text-center text-[11px] font-semibold text-slate-400">Conversão</th>
            <th class="px-6 py-3 text-center text-[11px] font-semibold text-slate-400">Taxa %</th>
            <th class="px-6 py-3 text-center text-[11px] font-semibold text-slate-400">Score</th>
            <th class="px-6 py-3 text-center text-[11px] font-semibold text-slate-400">Tempo Resp. (h)</th>
            <th class="px-6 py-3 text-center text-[11px] font-semibold text-slate-400">Ciclo Venda (d)</th>
            <th class="px-6 py-3 text-center text-[11px] font-semibold text-slate-400">Agend.</th>
            <th class="px-6 py-3 text-center text-[11px] font-semibold text-slate-400">Msg</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr 
            v-for="item in data" 
            :key="item.vendedor_id" 
            @click="$emit('select-vendedor', item)"
            class="group hover:bg-primary-50/30 cursor-pointer transition-colors"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-3">
                <div class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-bold">
                  {{ item.vendedor_nome ? item.vendedor_nome.substring(0,2).toUpperCase() : '??' }}
                </div>
                <span class="text-sm font-medium text-slate-700 group-hover:text-primary-600 transition-colors">{{ item.vendedor_nome }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-center text-sm font-medium text-slate-600">{{ item.total_leads }}</td>
            <td class="px-6 py-4 text-center text-sm font-medium text-slate-600">{{ item.leads_convertidos }}</td>
            <td class="px-6 py-4 text-center">
              <span 
                class="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-semibold"
                :class="getTaxaClass(item.taxa_conversao || 0)"
              >
                {{ (item.taxa_conversao || 0).toFixed(1) }}%
              </span>
            </td>
            <td class="px-6 py-4 text-center text-sm font-medium text-slate-300 tracking-tight">{{ (item.score_medio || 0).toFixed(1) }}</td>
            <td class="px-6 py-4 text-center text-xs font-semibold text-slate-400">{{ (Number(item.tempo_medio_resposta) || 0).toFixed(1) }}h</td>
            <td class="px-6 py-4 text-center text-xs font-semibold text-slate-400">{{ (Number(item.tempo_medio_conversao) || 0).toFixed(1) }}d</td>
            <td class="px-6 py-4 text-center text-sm font-medium text-slate-600">{{ item.total_agendamentos }}</td>
            <td class="px-6 py-4 text-center text-sm font-medium text-slate-600">{{ item.total_mensagens || 0 }}</td>
          </tr>
          
          <tr v-if="data.length === 0">
            <td colspan="9" class="px-6 py-20 text-center">
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

const getTaxaClass = (taxa: number) => {
  if (taxa >= 25) return 'bg-success-50 text-success-700 border-success-100';
  if (taxa >= 10) return 'bg-warning-50 text-warning-700 border-warning-100';
  return 'bg-error-50 text-error-700 border-error-100';
};
</script>
