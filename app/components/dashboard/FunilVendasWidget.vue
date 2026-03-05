<template>
  <div class="w-full h-full min-h-[300px] flex items-center justify-center pt-2">
    <Bar 
      v-if="chartData && chartData.datasets && chartData.datasets[0] && chartData.datasets[0].data.length > 0"
      :data="chartData" 
      :options="chartOptions"
      :plugins="[gradientPlugin]"
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

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ChartDataLabels)

const props = defineProps<{
  chartData: {
    labels: string[]
    datasets: {
      data: number[]
      backgroundColor: (string | CanvasGradient)[]
      borderColor?: string[]
      borderWidth?: number | any
      borderRadius?: any
      barThickness?: number
    }[]
  } | null
}>()

// Converte hex para rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return `rgba(99,102,241,${alpha})`
  return `rgba(${parseInt(result[1]!, 16)},${parseInt(result[2]!, 16)},${parseInt(result[3]!, 16)},${alpha})`
}

// Plugin: gradiente de cima para baixo em cada barra
const gradientPlugin = {
  id: 'barGradient',
  beforeDatasetDraw(chart: any, args: any) {
    const { ctx } = chart
    const dataset = chart.data.datasets[args.index]
    const meta = chart.getDatasetMeta(args.index)

    meta.data.forEach((bar: any, i: number) => {
      const baseColor = dataset.borderColor?.[i] ?? '#6366f1'
      const top = bar.y - bar.height / 2
      const bottom = bar.y + bar.height / 2

      const gradient = ctx.createLinearGradient(0, top, 0, bottom)
      gradient.addColorStop(0, hexToRgba(baseColor, 0.95)) // Topo: mais vivo
      gradient.addColorStop(1, hexToRgba(baseColor, 0.50)) // Base: mais suave

      dataset.backgroundColor[i] = gradient
    })
  }
}

const chartOptions = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 2200,
    easing: 'easeOutQuart' as const,
    x: {
      from: -500,
      type: 'number'
    }
  },
  plugins: {
    legend: { display: false },
    datalabels: {
      anchor: 'center' as const,
      align: 'center' as const,
      color: '#ffffff',
      font: { size: 11, weight: 600 },
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
  datasets: {
    bar: {
      barThickness: 22,
      borderRadius: {
        topRight: 12,
        bottomRight: 12,
        topLeft: 3,
        bottomLeft: 3,
      },
      borderSkipped: false as const
    }
  }
}
</script>
