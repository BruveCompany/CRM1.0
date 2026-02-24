<template>
  <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[400px] flex flex-col">
    <div class="mb-6">
      <h4 class="text-[15px] font-bold text-slate-800 tracking-tight">Distribuição por Origem</h4>
      <p class="text-[11px] text-slate-400 font-medium">Performance de canais de aquisição</p>
    </div>
    
    <div class="relative flex-1 flex items-center justify-center min-h-[250px]">
      <canvas ref="chartRef"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Chart, type ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

const props = defineProps<{ data: any[] }>();
const chartRef = ref<HTMLCanvasElement | null>(null);
let instance: Chart | null = null;

const init = () => {
  if (!chartRef.value || !props.data) return;
  if (instance) instance.destroy();

  const config: ChartConfiguration = {
    type: 'doughnut',
    data: {
      labels: props.data.map(d => d.origem || 'Direto'),
      datasets: [{
        data: props.data.map(d => Number(d.total_leads) || 0),
        backgroundColor: [
          '#4f46e5', // Primary
          '#10b981', // Success
          '#f59e0b', // Warning
          '#6366f1', // Indigo
          '#ec4899', // Pink
          '#94a3b8'  // Slate
        ],
        borderWidth: 2,
        borderRadius: 4,
        spacing: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'bottom',
          labels: { 
            boxWidth: 8, 
            usePointStyle: true,
            padding: 20,
            font: { size: 11, weight: 'bold' } 
          } 
        },
        tooltip: {
          backgroundColor: '#1e293b',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (item: any) => ` Leads: ${item.formattedValue}`
          }
        }
      }
    }
  };
  instance = new Chart(chartRef.value, config);
};

onMounted(() => {
  setTimeout(init, 100);
});

watch(() => props.data, init, { deep: true });
</script>
