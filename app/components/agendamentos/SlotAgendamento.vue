<template>
  <!-- Slot de agendamento individual -->
  <div 
    :style="{ 
      top: `${posicaoTop}px`, 
      height: `${altura}px`,
      backgroundColor: paleta.background,
      zIndex: isHovered ? 10 : 1
    }"
    :title="`Título: ${agendamento.titulo}\nStatus: ${nomeStatus}\nContato: ${agendamento.nome_contato || 'N/A'}\nResponsável: ${agendamento.profissional_nome || 'N/A'}\nAgendado por: ${vendedorNome || 'Sistema'}\nHorário: ${horarioFormatado}\nCategoria: ${agendamento.categoria || 'N/A'}${agendamento.descricao ? '\nDescrição: ' + agendamento.descricao : ''}`"
    class="absolute left-0 right-0 rounded px-2 py-1.5 cursor-pointer transition-all duration-200 overflow-hidden hover:shadow-lg flex flex-col"
    @click="emit('click', agendamento)"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
      <!-- 1. Cabeçalho: Categoria + Status e Horário -->
    <div class="flex items-center justify-between gap-1 mb-1.5">
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
        {{ horarioFormatado }}
      </div>
    </div>

    <!-- 2. Nome do Contato -->
    <div v-if="agendamento.nome_contato" class="text-[10px] font-black truncate leading-none uppercase" :style="{ color: paleta.text }">
      {{ agendamento.nome_contato }}
    </div>
    
    <!-- 3. Título (Apenas se houver espaço) -->
    <div v-if="altura > 50" class="text-[9px] font-bold truncate leading-tight mt-1 opacity-80" :style="{ color: paleta.text }">
      {{ agendamento.titulo }}
    </div>

    <!-- 4. Rodapé: Profissional -->
    <div v-if="altura > 80 && agendamento.profissional_nome" class="mt-auto pt-1 flex items-center gap-1" :style="{ borderTop: `1px solid ${paleta.accent}30` }">
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

const emit = defineEmits(['click'])

const isHovered = ref(false)

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
  
  // Adiciona 4px (pt-1) para alinhar com o padding da régua
  return (horasDesdeInicio + minutosEmHoras) * ALTURA_HORA + 4
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
