<template>
  <div class="w-full h-full min-h-[300px] flex items-center justify-center pt-2">
    <Bar 
      v-if="chartData && chartData.datasets && chartData.datasets[0] && chartData.datasets[0].data.length > 0"
      :data="chartData" 
      :options="chartOptions" 
    />
    <div v-else class="text-center text-neutral-400">
      <Icon name="heroicons:chart-bar" class="w-12 h-12 mx-auto mb-2 opacity-20" />
      <p class="text-xs font-medium">Nenhum dado de funil disponível.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { 
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  BarElement, 
  CategoryScale, 
  LinearScale 
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

// Registro obrigatório do Chart.js + Plugin de Labels
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ChartDataLabels)

const props = defineProps<{
  chartData: {
    labels: string[]
    datasets: {
      data: number[]
      backgroundColor: string[]
      borderWidth?: number | any
      borderRadius?: any
      barThickness?: number
    }[]
  } | null
}>()

// Configurações do gráfico
const chartOptions = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 2200,
    easing: 'easeOutQuart' as const,
    x: {
      from: -500, // Começa fora da tela à esquerda
      type: 'number'
    }
  },
  plugins: {
    legend: { display: false },
    datalabels: {
      anchor: 'center' as const,
      align: 'center' as const,
      color: '#ffffff', // Números agora em branco para melhor contraste
      font: {
        size: 11,
        weight: 600
      },
      formatter: (value: number) => value > 0 ? value : ''
    },
    tooltip: {
      backgroundColor: '#1e293b',
      padding: 12,
      displayColors: false,
      callbacks: {
        label: (context: any) => ` Total: ${context.raw} leads`
      }
    }
  },
  scales: {
    x: { display: false, grid: { display: false } },
    y: {
      grid: { display: false },
      ticks: {
        font: { size: 11, weight: 600 },
        color: '#64748b',
        padding: 12
      }
    }
  },
  elements: {
    bar: {
      borderRadius: {
        topRight: 20,
        bottomRight: 20,
        topLeft: 0,
        bottomLeft: 0
      }, // Lado esquerdo reto, lado direito redondo
      borderSkipped: 'left' as const
    }
  }
}
</script>
