<template>
  <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
    <div class="mb-8">
      <h4 class="text-sm font-semibold text-slate-800">Funil de Conversão</h4>
      <p class="text-[11px] text-slate-400 font-medium">Fluxo de efetividade comercial</p>
    </div>

    <!-- Chart Area (Interactive with Chart.js) -->
    <div class="relative flex-1 min-h-[160px]">
      <canvas ref="funnelCanvas"></canvas>
    </div>

    <div class="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
      <div class="flex flex-col">
        <span class="text-[10px] font-bold text-slate-300 tracking-tight">Score de efetividade</span>
        <span class="text-2xl font-bold text-primary-600 tracking-tighter">{{ efficiency }}%</span>
      </div>
      <div class="w-10 h-10 rounded-full border-2 border-primary-50 flex items-center justify-center">
        <Icon name="heroicons:outline:bolt" class="w-5 h-5 text-primary-400" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue';
import { Chart, type ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

const props = defineProps<{
  total: number;
  converted: number;
  scheduled: number;
}>();

const funnelCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const efficiency = computed(() => props.total > 0 ? ((props.converted / props.total) * 100).toFixed(1) : 0);

const initChart = () => {
  if (!funnelCanvas.value) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const steps = [
    { label: 'Leads Captados', value: props.total },
    { label: 'Agendamentos', value: props.scheduled },
    { label: 'Vendas/Conversão', value: props.converted },
  ];

  const config: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: steps.map(s => s.label),
      datasets: [{
        data: steps.map(s => s.value),
        backgroundColor: [
          '#6366f1', // Indigo
          '#818cf8', 
          '#a5b4fc'
        ],
        borderRadius: 8,
        barPercentage: 0.6,
      }]
    },
    options: {
      indexAxis: 'y', // Horizontal funnel look
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e293b',
          padding: 12,
          callbacks: {
            label: (item: any) => {
              const val = item.raw || 0;
              const idx = item.dataIndex;
              const currentSteps = [
                { label: 'Leads Captados', value: props.total },
                { label: 'Agendamentos', value: props.scheduled },
                { label: 'Vendas/Conversão', value: props.converted },
              ];
              const prevStep = idx > 0 ? currentSteps[idx - 1] : null;
              const prevVal = prevStep ? prevStep.value : props.total;
              const rate = prevVal && prevVal > 0 ? ((val / prevVal) * 100).toFixed(1) : 0;
              return [
                `Total: ${val}`,
                `Retenção: ${rate}%`
              ];
            }
          }
        }
      },
      scales: {
        x: { display: false },
        y: {
          grid: { display: false },
          ticks: {
            color: '#64748b',
            font: { size: 11, weight: 600 }
          }
        }
      }
    }
  };

  chartInstance = new Chart(funnelCanvas.value, config);
};

onMounted(() => {
  initChart();
});

watch([() => props.total, () => props.converted, () => props.scheduled], () => {
  initChart();
});

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy();
});
</script>
