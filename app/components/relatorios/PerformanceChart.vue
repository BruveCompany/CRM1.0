<template>
  <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-[350px]">
    <!-- Header Alinhado com as Colunas -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h4 class="text-[15px] font-bold text-slate-800 tracking-tight">Atividade do funil</h4>
        <p class="text-[11px] text-slate-400 font-medium font-sans">Volume de novos leads por dia</p>
      </div>
    </div>

    <!-- Chart Area (Integrada com Chart.js) -->
    <div class="relative flex-1 w-full min-h-[200px]">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { Chart, type ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

const props = defineProps<{
  data: any[]
}>();

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const initChart = () => {
  if (!chartCanvas.value) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const labels = props.data.map(d => d.label);
  const values = props.data.map(d => d.value);

  const config: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Novos leads',
        data: values,
        backgroundColor: '#4f46e5',
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: '#4338ca',
        barThickness: 16,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e293b',
          padding: 12,
          titleFont: { size: 12, weight: 'bold' },
          bodyFont: { size: 12 },
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: (items: any[]) => items[0] ? `Dia: ${items[0].label}` : 'Minha Atividade',
            label: (item: any) => `Leads: ${item.formattedValue}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#94a3b8',
            font: { size: 10, weight: 600 }
          }
        },
        y: {
          display: false,
          grid: { display: false },
          beginAtZero: true,
          suggestedMax: Math.max(...values, 10) * 1.2
        }
      }
    }
  };

  chartInstance = new Chart(chartCanvas.value, config);
};

onMounted(() => {
  initChart();
});

watch(() => props.data, () => {
  initChart();
}, { deep: true });

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy();
});
</script>
