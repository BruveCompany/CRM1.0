<template>
  <div class="w-full h-full min-h-[300px] flex items-center justify-center">
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

// Registro obrigatório do Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps<{
  chartData: {
    labels: string[]
    datasets: {
      data: number[]
      backgroundColor: string[]
      borderRadius?: number
      barThickness?: number
    }[]
  } | null
}>()

// Configurações do gráfico
const chartOptions = {
  indexAxis: 'y' as const, // Gráfico Horizontal
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // Remove a legenda conforme pedido
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          return ` ${context.raw} leads`; // Formato "X leads"
        }
      },
      backgroundColor: '#1e293b',
      padding: 12,
      titleFont: { size: 14, weight: 'bold' as const },
      bodyFont: { size: 13 },
      displayColors: false
    }
  },
  scales: {
    x: {
      display: false, // Remove o eixo X para um look clean
      grid: {
        display: false
      }
    },
    y: {
      grid: {
        display: false // Remove as linhas de grade do eixo Y
      },
      ticks: {
        font: {
          size: 12,
          weight: 'bold' as const
        },
        color: '#64748b'
      }
    }
  },
  // Arredondamento das barras
  elements: {
    bar: {
      borderRadius: 8,
      borderSkipped: false as const
    }
  }
}
</script>
