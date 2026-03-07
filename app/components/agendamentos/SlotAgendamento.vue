<template>
  <!-- Slot de agendamento individual -->
  <div 
    :style="{ 
      top: `${isResizing ? localTop : posicaoTop}px`, 
      height: `${isResizing ? localAltura : altura}px`,
      backgroundColor: paleta.background,
      zIndex: isHovered || isResizing ? 50 : 1
    }"
    :title="`Título: ${agendamento.titulo}\nStatus: ${nomeStatus}\nContato: ${agendamento.nome_contato || 'N/A'}\nResponsável: ${agendamento.profissional_nome || 'N/A'}\nAgendado por: ${vendedorNome || 'Sistema'}\nHorário: ${horarioFormatado}\nCategoria: ${agendamento.categoria || 'N/A'}${agendamento.descricao ? '\nDescrição: ' + agendamento.descricao : ''}`"
    class="absolute left-0 right-0 rounded px-2 py-1.5 transition-all duration-200 overflow-hidden hover:shadow-lg flex flex-col active:scale-95 group/slot"
    :class="[
      isDragging ? 'opacity-50 grayscale-50' : '',
      isResizing ? 'ring-2 ring-indigo-400 z-50 shadow-2xl cursor-ns-resize shadow-indigo-100' : 'cursor-move'
    ]"
    @click="emit('click', agendamento)"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    :draggable="!isResizing"
    @dragstart="onDragStart"
    @dragend="isDragging = false"
  >
    <!-- Alças de Redimensionamento (Resizing Handles) -->
    <div 
      class="absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize z-30 opacity-0 group-hover/slot:opacity-100 bg-black/5 hover:bg-indigo-400/50 transition-colors"
      @mousedown.stop.prevent="startResize($event, 'top')"
    ></div>
    <div 
      class="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize z-30 flex items-center justify-center group-hover/slot:opacity-100 opacity-0 hover:bg-indigo-400/50 transition-colors"
      @mousedown.stop.prevent="startResize($event, 'bottom')"
    >
      <div class="w-6 h-1 rounded-full bg-black/10"></div>
    </div>

      <!-- 1. Cabeçalho: Categoria + Status e Horário -->
    <div class="flex items-center justify-between gap-1 mb-1.5 select-none pointer-events-none">
      <div class="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
        <div v-if="agendamento.categoria" class="flex items-center gap-1 px-1.5 py-0.5 rounded-sm max-w-[60%] flex-shrink-0" :style="{ backgroundColor: paleta.accent + '25' }">
          <component :is="iconeCategoria" class="w-2.5 h-2.5 shrink-0" :style="{ color: paleta.text }" />
          <span class="text-[7px] font-extrabold uppercase tracking-tight truncate" :style="{ color: paleta.text }">{{ agendamento.categoria.split(' / ')[0] }}</span>
        </div>
        <!-- Badge do status -->
        <div
          v-if="nomeStatus"
          class="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm"
          :style="{ backgroundColor: paleta.accent + '30', color: paleta.text }"
        >
          <span class="text-[7px] font-extrabold uppercase tracking-tight truncate">{{ nomeStatus }}</span>
        </div>
      </div>
      <div class="text-[8px] font-black tabular-nums shrink-0" :style="{ color: paleta.text }">
        {{ isResizing ? horarioFormatadoLocal : horarioFormatado }}
      </div>
    </div>

    <!-- 2. Nome do Contato -->
    <div v-if="agendamento.nome_contato" class="text-[10px] font-black truncate leading-none uppercase select-none pointer-events-none" :style="{ color: paleta.text }">
      {{ agendamento.nome_contato }}
    </div>
    
    <!-- 3. Título (Apenas se houver espaço) -->
    <div v-if="localAltura > 50" class="text-[9px] font-bold truncate leading-tight mt-1 opacity-80 select-none pointer-events-none" :style="{ color: paleta.text }">
      {{ agendamento.titulo }}
    </div>

    <!-- 4. Rodapé: Profissional -->
    <div v-if="localAltura > 80 && agendamento.profissional_nome" class="mt-auto pt-1 flex items-center gap-1 select-none pointer-events-none" :style="{ borderTop: `1px solid ${paleta.accent}30` }">
      <UserCircleIcon class="w-2.5 h-2.5 flex-shrink-0" :style="{ color: paleta.text + 'aa' }" />
      <span class="text-[8px] font-bold truncate italic" :style="{ color: paleta.text + 'bb' }">{{ agendamento.profissional_nome }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ================= SlotAgendamento.vue =================
 * Componente para exibir um slot de agendamento
 * 
 * Props:
 * @param {AgAgendamento} agendamento - Dados brutos do agendamento (formato banco)
 * 
 * Calcula posição e altura baseado no horário de início e fim
 * Cada hora tem 64px de altura (h-16 = 4rem = 64px)
 * 
 * Os campos hora_inicio e hora_fim vêm como strings do banco
 * no formato "HH:MM:SS-TZ" (ex: "08:00:00-03"). São parseados
 * para extrair horas e minutos.
 * ======================================================
 */

import type { AgViewAgendamentoCompleto, AgCliente, AgProfissional } from '../../../shared/types/database'
import { computed, ref } from 'vue'
import { UserCircleIcon } from '@heroicons/vue/24/solid'
import {
  BuildingStorefrontIcon,
  WrenchScrewdriverIcon,
  PresentationChartBarIcon,
  CheckBadgeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/vue/24/solid'
// useStatusPalette é auto-importado pelo Nuxt (app/composables)

interface Props {
  agendamento: AgViewAgendamentoCompleto
  clientes?: AgCliente[]
  profissionais?: AgProfissional[]
  vendedores?: any[]
  profissionalNome?: string
  profissionalEspecialidade?: string
}

const props = withDefaults(defineProps<Props>(), {
  clientes: () => [],
  profissionais: () => [],
  vendedores: () => [],
  profissionalNome: '',
  profissionalEspecialidade: ''
})

const emit = defineEmits(['click', 'reagendar'])

const isHovered = ref(false)
const isDragging = ref(false)
const isResizing = ref(false)

// Estados locais para feedback visual instantâneo durante o redimensionamento
const localTop = ref(0)
const localAltura = ref(0)
const resizeDirection = ref<'top' | 'bottom' | null>(null)
let startY = 0
let startTop = 0
let startHeight = 0

/**
 * Inicia o redimensionamento
 */
function startResize(event: MouseEvent, direction: 'top' | 'bottom') {
  isResizing.value = true
  resizeDirection.value = direction
  startY = event.clientY
  startTop = posicaoTop.value
  startHeight = altura.value
  
  localTop.value = startTop
  localAltura.value = startHeight

  // Adiciona listeners globais
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  
  // Muda o cursor globalmente para indicar redimensionamento
  document.body.style.cursor = 'ns-resize'
}

/**
 * Lida com o movimento do mouse durante o redimensionamento
 */
function handleMouseMove(event: MouseEvent) {
  if (!isResizing.value) return

  const dy = event.clientY - startY
  const SNAP_STEP = 16 // 15 minutos = 16px (baseado em ALTURA_HORA = 64)
  
  if (resizeDirection.value === 'bottom') {
    // Redimensionando por baixo: altera apenas a altura
    const newHeight = Math.max(SNAP_STEP, startHeight + dy)
    // Aplica o snap
    localAltura.value = Math.round(newHeight / SNAP_STEP) * SNAP_STEP
  } else if (resizeDirection.value === 'top') {
    // Redimensionando por cima: altera altura e posição top
    const newTop = startTop + dy
    const snappedTop = Math.round(newTop / SNAP_STEP) * SNAP_STEP
    
    // Diferença real aplicada pelo snap
    const actualDy = snappedTop - startTop
    const newHeight = startHeight - actualDy
    
    if (newHeight >= SNAP_STEP) {
      localTop.value = snappedTop
      localAltura.value = newHeight
    }
  }
}

/**
 * Finaliza o redimensionamento e emite a atualização
 */
async function handleMouseUp() {
  if (!isResizing.value) return
  
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.body.style.cursor = ''
  
  // Converte a nova posição/altura para horários
  const novaHoraInicio = pixelsParaHora(localTop.value)
  const novaHoraFim = pixelsParaHora(localTop.value + localAltura.value)
  
  // Emite o evento de reagendamento para o pai salvar no Supabase
  emit('reagendar', {
    id: props.agendamento.id,
    novaData: (props.agendamento.data as string).split('T')[0],
    novaHoraInicio: `${novaHoraInicio}:00`,
    novaHoraFim: `${novaHoraFim}:00`
  })
  
  isResizing.value = false
  resizeDirection.value = null
}

/**
 * Converte posição em pixels para string de hora (ex: 64px offset -> 09:00)
 */
function pixelsParaHora(px: number): string {
  // Ajusta o padding de 4px (pt-1)
  const pxSemPadding = Math.max(0, px - 4)
  const totalHorasDecimais = (pxSemPadding / ALTURA_HORA) + INICIO_DIA
  
  const horas = Math.floor(totalHorasDecimais)
  const minutos = Math.round((totalHorasDecimais - horas) * 60)
  
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`
}

/**
 * Formata o horário para exibição local (durante o resize)
 */
const horarioFormatadoLocal = computed(() => {
  return `${pixelsParaHora(localTop.value)} - ${pixelsParaHora(localTop.value + localAltura.value)}`
})

/**
 * Inicia o arraste do card
 */
function onDragStart(event: DragEvent) {
  if (isResizing.value) {
    event.preventDefault()
    return
  }
  isDragging.value = true
  if (event.dataTransfer) {
    const data = {
      id: props.agendamento.id,
      duracaoMinutos: totalDuracaoMinutos.value,
      horaInicioOriginal: props.agendamento.hora_inicio
    }
    
    event.dataTransfer.setData('application/json', JSON.stringify(data))
    event.dataTransfer.effectAllowed = 'move'
    
    // Feedback visual do fantasma do drag
    const target = event.target as HTMLElement
    if (target) {
      target.style.opacity = '0.5'
    }
  }
}

const totalDuracaoMinutos = computed(() => {
  const inicio = parseHora(props.agendamento.hora_inicio)
  const fim = parseHora(props.agendamento.hora_fim)
  return (fim.horas * 60 + fim.minutos) - (inicio.horas * 60 + inicio.minutos)
})

// ============================================================
// Paleta dinâmica via useStatusPalette (auto-importado pelo Nuxt)
// normalizarNome() remove acentos e aplica toLowerCase internamente
// ============================================================
const { getPaletteByName } = useStatusPalette()

/**
 * Resolve o nome do status em cadeia de prioridades:
 * 1. Campo plano da view: status_nome (vem do JOIN na view)
 * 2. Objeto relacional local (setado após mudança no modal)
 * 3. string vazia → paleta default
 */
const nomeStatus = computed<string>(() => {
  const ag = props.agendamento as any
  let nome = ''
  if (ag.status_nome) nome = ag.status_nome
  else if (ag.ag_agendamento_statuses?.nome) nome = ag.ag_agendamento_statuses.nome
  return nome ? nome.toLowerCase() : ''
})

/** Paleta completa. Ex: "Pendente" → "pendente" → #FFFBEB / #B45309 */
const paleta = computed(() => getPaletteByName(nomeStatus.value))

// Busca lista de vendedores da store global como fallback se a prop não estiver preenchida
const vendedoresGlobal = useState<any[]>('leads-vendedores', () => [])
const effectiveVendedores = computed(() => props.vendedores?.length ? props.vendedores : vendedoresGlobal.value)



/**
 * Resolve o nome do cliente a partir do cliente_id do agendamento
 */
const nomeCliente = computed(() => {
  if (!props.agendamento.cliente_id) return ''
  const cliente = props.clientes.find((c) => c.id === props.agendamento.cliente_id)
  return cliente?.nome || ''
})

/**
 * Resolve o ícone baseado na categoria (Fase 2)
 */
const iconeCategoria = computed(() => {
  const cat = props.agendamento.categoria
  if (cat?.includes('Showroom')) return BuildingStorefrontIcon
  if (cat?.includes('Técnica')) return WrenchScrewdriverIcon
  if (cat?.includes('Projeto')) return PresentationChartBarIcon
  if (cat?.includes('Entrega')) return CheckBadgeIcon
  if (cat?.includes('Pós-Venda')) return ChatBubbleLeftRightIcon
  return null
})

/**
 * Resolve o nome do vendedor (quem criou)
 */
const vendedorNome = computed(() => {
  // 1. Preferência total pelo campo vindo da VIEW (mais performático e confiável)
  if (props.agendamento.criador_nome) return props.agendamento.criador_nome
  if (props.agendamento.responsavel_agendamento) return props.agendamento.responsavel_agendamento

  // 2. Fallback: Procura no estado global de vendedores
  if (!props.agendamento.user_id) return null
  
  const searchId = String(props.agendamento.user_id).toLowerCase()
  const v = effectiveVendedores.value.find(v => 
    (v.user_id && String(v.user_id).toLowerCase() === searchId) || 
    (v.id && String(v.id) === searchId)
  )
  
  return v?.nome || null
})

// Altura de cada slot de hora em pixels (h-16 = 64px)
const ALTURA_HORA = 64
const INICIO_DIA = 8 // 8h

/**
 * Faz parse de uma string de hora do banco (ex: "08:30:00-03")
 * para extrair horas e minutos como números.
 * 
 * @param horaStr - String no formato "HH:MM:SS" ou "HH:MM:SS-TZ"
 * @returns Objeto com { horas, minutos }
 */
function parseHora(horaStr: string | null): { horas: number; minutos: number } {
  if (!horaStr) return { horas: 0, minutos: 0 }
  const partes = horaStr.split(':')
  return {
    horas: parseInt(partes[0] || '0', 10),
    minutos: parseInt(partes[1] || '0', 10)
  }
}

/**
 * Calcula a posição top do slot baseado no horário de início
 */
const posicaoTop = computed(() => {
  const { horas, minutos } = parseHora(props.agendamento.hora_inicio)
  
  // Calcula offset desde as 8h
  const horasDesdeInicio = horas - INICIO_DIA
  const minutosEmHoras = minutos / 60
  
  // Compensação refinada (offset de 1px) para alinhar perfeitamente com as linhas tracejadas do grid
  return (horasDesdeInicio + minutosEmHoras) * ALTURA_HORA + 1
})

/**
 * Calcula a altura do slot baseado na duração
 */
const altura = computed(() => {
  const inicio = parseHora(props.agendamento.hora_inicio)
  const fim = parseHora(props.agendamento.hora_fim)
  
  const totalMinutosInicio = inicio.horas * 60 + inicio.minutos
  const totalMinutosFim = fim.horas * 60 + fim.minutos
  const duracaoMinutos = totalMinutosFim - totalMinutosInicio
  const duracaoHoras = duracaoMinutos / 60
  
  return duracaoHoras * ALTURA_HORA
})

/**
 * Formata o horário para exibição
 */
const horarioFormatado = computed(() => {
  const inicio = parseHora(props.agendamento.hora_inicio)
  const fim = parseHora(props.agendamento.hora_fim)
  
  const horaInicio = inicio.horas.toString().padStart(2, '0')
  const minutoInicio = inicio.minutos.toString().padStart(2, '0')
  
  const horaFim = fim.horas.toString().padStart(2, '0')
  const minutoFim = fim.minutos.toString().padStart(2, '0')
  
  return `${horaInicio}:${minutoInicio} - ${horaFim}:${minutoFim}`
})
</script>
