<template>
  <div class="min-h-screen bg-slate-50/50">
    <!-- Banner Superior Principal (Destaque e Status) -->
    <div class="bg-gradient-to-r from-[#4338CA] via-[#4338CA]/90 to-slate-900 py-8 px-6 md:px-10 text-white shadow-2xl relative overflow-hidden border-b border-white/5">
       <div class="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2">
             <div class="flex items-center gap-3">
                <div class="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                   <Icon name="lucide:layout-grid" class="w-7 h-7 text-white" />
                </div>
                <h1 class="text-3xl font-black tracking-tight uppercase">Hub de Automação</h1>
             </div>
             <p class="text-indigo-100 text-sm max-w-xl font-medium leading-relaxed">
                Gerencie integrações, conecte seu WhatsApp e configure seu Agente de IA para escalar seu atendimento e automatizar processos repetitivos.
             </p>
          </div>

          <!-- Grupo de Indicadores de Status (Dinâmicos) -->
          <div class="flex flex-wrap gap-2 md:gap-3">
             <!-- Status WhatsApp -->
             <span :class="[whatsappIntegrationStatus.color, 'px-3 py-1.5 rounded-full text-[9px] font-black tracking-widest flex items-center gap-2 shadow-lg shadow-black/20 transition-all duration-500 border border-white/10']">
                <Icon :name="whatsappIntegrationStatus.icon" class="w-3.5 h-3.5" />
                {{ whatsappIntegrationStatus.text }}
             </span>

             <!-- Status N8N -->
             <span :class="[dispatchCenterStatus.colorClass, 'px-3 py-1.5 rounded-full text-[9px] font-black tracking-widest flex items-center gap-2 shadow-lg shadow-black/20 transition-all duration-500 border border-white/10']">
                <Icon :name="dispatchCenterStatus.icon" class="w-3.5 h-3.5" />
                {{ dispatchCenterStatus.text }}
             </span>

             <!-- Status IA -->
             <span :class="[iaIntegrationStatus.colorClass, 'px-3 py-1.5 rounded-full text-[9px] font-black tracking-widest flex items-center gap-2 shadow-lg shadow-black/20 transition-all duration-500 border border-white/10']">
                <Icon :name="iaIntegrationStatus.icon" class="w-3.5 h-3.5" />
                {{ iaIntegrationStatus.text }}
             </span>
          </div>
       </div>
       
       <!-- Elementos Decorativos -->
       <Icon name="lucide:cpu" class="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12 pointer-events-none" />
    </div>

    <div class="max-w-6xl mx-auto p-6 md:p-8 space-y-8 pb-20">

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Coluna Esquerda: WhatsApp e IA -->
        <div class="lg:col-span-1 space-y-8">
          <!-- SEÇÃO B: WHATSAPP (Uazapi) -->
          <section class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 class="font-black text-slate-800 flex items-center gap-2 text-sm uppercase">
                <Icon name="lucide:message-square" class="w-4 h-4 text-emerald-500" />
                Conectar WhatsApp
              </h3>
              <div 
                v-if="globalConfig?.whatsapp_status === 'connected'"
                class="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 animate-pulse"
              >
                Conectado
              </div>
            </div>

            <div class="p-6 space-y-6">
              <!-- Status: Desconectado -->
              <div v-if="globalConfig?.whatsapp_status === 'disconnected'" class="text-center py-4 space-y-4">
                <div class="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 inline-block">
                  <Icon name="lucide:unplug" class="w-10 h-10 text-slate-300" />
                </div>
                <div class="space-y-1">
                  <p class="text-sm font-bold text-slate-700">Seu WhatsApp não está conectado</p>
                  <p class="text-xs text-slate-400">Conecte via Uazapi.dev para disparar mensagens automáticas via IA.</p>
                </div>
                <button 
                  @click="startWhatsAppSession"
                  :disabled="actionLoading"
                  class="w-full py-3 bg-indigo-600 hover:bg-slate-900 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  <Icon v-if="actionLoading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                  Conectar Agora
                </button>
              </div>

              <!-- Status: Pending QR -->
              <div v-else-if="globalConfig?.whatsapp_status === 'pending_qr'" class="text-center py-4 space-y-4">
                <div class="bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-xl inline-block">
                  <img 
                    :src="`data:image/png;base64,${globalConfig.whatsapp_qr_code_base64}`" 
                    alt="QR Code WhatsApp"
                    class="w-48 h-48"
                  />
                  <div class="mt-2 text-[10px] font-black uppercase text-indigo-600 animate-pulse">
                    Aguardando leitura...
                  </div>
                </div>
                <div class="space-y-1">
                  <p class="text-xs text-slate-500">Abra o WhatsApp no seu celular > Configurações > Aparelhos conectados.</p>
                </div>
                <button 
                   @click="() => resetWhatsApp()"
                   class="text-[10px] text-slate-400 hover:text-rose-500 font-bold uppercase transition-colors"
                >
                  Cancelar e Tentar Novamente
                </button>
              </div>

              <!-- Status: Connected -->
              <div v-else-if="globalConfig?.whatsapp_status === 'connected'" class="space-y-4">
                <div class="flex items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-x-4">
                  <div class="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <Icon name="lucide:check-circle-2" class="w-6 h-6" />
                  </div>
                  <div>
                    <p class="text-sm font-black text-emerald-900">{{ globalConfig.whatsapp_phone_number || 'Conectado' }}</p>
                    <p class="text-[10px] text-emerald-600 uppercase font-bold">Instância Ativa (Uazapi)</p>
                  </div>
                </div>
                <button 
                  @click="() => logoutWhatsApp()"
                  class="w-full py-3 text-rose-500 hover:bg-rose-50 font-bold border border-rose-100 rounded-xl transition-all"
                >
                   Desconectar WhatsApp
                </button>
              </div>

              <!-- Status: Error -->
              <div v-else class="text-center py-4 space-y-4">
                <Icon name="lucide:alert-circle" class="w-10 h-10 text-rose-500 mx-auto" />
                <p class="text-sm text-slate-700">Ocorreu um erro na conexão.</p>
                <button @click="() => resetWhatsApp()" class="w-full py-2 bg-slate-800 text-white rounded-lg">Recomeçar</button>
              </div>
            </div>
          </section>

          <!-- SEÇÃO C: CONFIGURAÇÕES DE IA -->
          <section class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 class="font-black text-slate-800 flex items-center gap-2 text-sm uppercase">
                <Icon name="lucide:sparkles" class="w-4 h-4 text-indigo-500" />
                Diretrizes do Agente IA
              </h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Prompt SDR / Personalidade</label>
                <textarea 
                  v-model="aiForm.ia_prompt_sdr"
                  rows="8"
                  placeholder="Defina as regras de comportamento da IA..."
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all resize-none"
                ></textarea>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Configurações do Modelo (JSON)</label>
                <textarea 
                  v-model="aiModelConfigStr"
                  rows="4"
                  placeholder='{ "model": "gpt-4", "temperature": 0.7 }'
                  class="w-full px-4 py-3 bg-slate-900 text-indigo-300 font-mono text-xs rounded-2xl border border-slate-800 focus:border-indigo-500 outline-none transition-all resize-none"
                ></textarea>
              </div>
              <button 
                @click="saveAIConfig"
                :disabled="actionLoading"
                class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center"
              >
                <Icon v-if="actionLoading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
                Salvar Configurações de IA
              </button>
            </div>
          </section>
        </div>

        <!-- Coluna Direita: Integrações N8N (Webhooks) -->
        <div class="lg:col-span-2 space-y-6">
          <div class="flex items-center justify-between">
             <h2 class="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
               <Icon name="lucide:webhook" class="w-4 h-4 text-indigo-500" />
               Integrações de Fluxo N8N
             </h2>
             <button 
                @click="openNewModal" 
                class="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold rounded-lg text-xs transition-all flex items-center gap-1"
             >
                <Icon name="lucide:plus" class="w-3 h-3" />
                Regra de Webhook
             </button>
          </div>

          <!-- Componente de Carregamento -->
          <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="i in 4" :key="i" class="h-40 bg-white rounded-3xl animate-pulse border border-slate-100"></div>
          </div>

          <!-- Empty State -->
          <div v-else-if="integrations.length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 space-y-4">
             <div class="p-6 bg-slate-50 rounded-full">
               <Icon name="lucide:zap-off" class="w-12 h-12 text-slate-300" />
             </div>
             <div class="text-center">
                <h3 class="text-lg font-bold text-slate-700">Nenhuma regra ativa</h3>
                <p class="text-slate-400 text-xs">Crie webhooks para conectar eventos do Bruve Prime ao seu N8N.</p>
             </div>
          </div>

          <!-- Grid de Regras N8N -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="item in integrations" 
              :key="item.id"
              class="group bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col"
            >
              <div class="flex items-center justify-between mb-3">
                <span 
                  :class="[
                    'px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border',
                    item.ativa ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                  ]"
                >
                  {{ item.ativa ? 'Ativa' : 'Pausada' }}
                </span>
                <div class="flex items-center space-x-1">
                  <button @click="openEditModal(item)" class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all">
                    <Icon name="lucide:edit-3" class="w-3.5 h-3.5" />
                  </button>
                  <button @click="confirmDelete(item)" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all">
                    <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div class="space-y-1 mb-4 flex-1">
                <h4 class="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-sm truncate">{{ item.nome_integracao }}</h4>
                <p class="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{{ item.descricao || 'Sem descrição' }}</p>
              </div>

              <div class="mt-2 space-y-2">
                 <div class="flex items-center text-[10px] font-bold text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                   <Icon name="lucide:activity" class="w-3 h-3 mr-2 text-indigo-400" />
                   {{ formatTrigger(item.tipo_gatilho_bruve) }}
                 </div>
                 <div class="text-[9px] font-mono truncate bg-slate-900 text-indigo-300 p-2 rounded border border-slate-800">
                   {{ item.n8n_webhook_url }}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modais -->
    <AutomationRuleModal 
      v-model="modalOpen"
      :integration="selectedIntegration"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useN8N, type N8NIntegration } from '~/composables/useN8N'
import type { AgAutomationConfig } from '../../../shared/types/database'
import AutomationRuleModal from '~/components/configuracoes/AutomationRuleModal.vue'

definePageMeta({ layout: 'default' })

const { fetchIntegrations, deleteIntegration, fetchGlobalConfig, saveGlobalConfig } = useN8N()
const { notifyError } = useNotification()

// Estados
const integrations = ref<N8NIntegration[]>([])
const globalConfig = ref<AgAutomationConfig | null>(null)
const loading = ref(true)
const actionLoading = ref(false)
const modalOpen = ref(false)
const selectedIntegration = ref<N8NIntegration | null>(null)

// Estados IA
const aiForm = ref({
  ia_prompt_sdr: '',
  ia_model_config_json: {}
})
const aiModelConfigStr = ref('')

// Polling WhatsApp
let pollingTimer: any = null

// Status Dinâmicos do Banner Superior
const whatsappIntegrationStatus = computed(() => {
  const status = globalConfig.value?.whatsapp_status || 'disconnected'
  const map = {
    connected: { text: 'WHATSAPP CONECTADO', color: 'bg-emerald-500 text-white', icon: 'lucide:check-circle' },
    pending_qr: { text: 'AGUARDANDO CONEXÃO', color: 'bg-amber-500 text-white', icon: 'lucide:qr-code' },
    disconnected: { text: 'WHATSAPP DESCONECTADO', color: 'bg-slate-400 text-white', icon: 'lucide:unplug' },
    error: { text: 'ERRO NA CONEXÃO', color: 'bg-rose-500 text-white', icon: 'lucide:alert-circle' }
  }
  return map[status as keyof typeof map] || map.disconnected
})

const dispatchCenterStatus = computed(() => {
  const hasActive = integrations.value.some(i => i.ativa)
  return {
    text: hasActive ? 'N8N CONECTADO' : 'N8N DESCONECTADO',
    colorClass: hasActive ? 'bg-indigo-600 text-white' : 'bg-slate-400 text-white',
    icon: hasActive ? 'lucide:webhook' : 'lucide:zap-off'
  }
})

const iaIntegrationStatus = computed(() => {
  const isFilled = !!globalConfig.value?.ia_prompt_sdr?.trim()
  return {
    text: isFilled ? 'IA CONFIGURADA' : 'IA NÃO CONFIGURADA',
    colorClass: isFilled ? 'bg-emerald-600 text-white' : 'bg-slate-400 text-white',
    icon: isFilled ? 'lucide:sparkles' : 'lucide:brain-circuit'
  }
})

async function loadData() {
  loading.value = true
  const [rules, config] = await Promise.all([
    fetchIntegrations(),
    fetchGlobalConfig()
  ])
  integrations.value = rules
  globalConfig.value = config

  if (config) {
    aiForm.value.ia_prompt_sdr = config.ia_prompt_sdr || ''
    aiForm.value.ia_model_config_json = config.ia_model_config_json || {}
    aiModelConfigStr.value = JSON.stringify(config.ia_model_config_json, null, 2)
    
    // Inicia polling se estiver aguardando QR
    if (config.whatsapp_status === 'pending_qr') {
      startStatusPolling()
    }
  }
  loading.value = false
}

onMounted(loadData)
onUnmounted(() => stopStatusPolling())

// --- WhatsApp Actions ---
async function startWhatsAppSession() {
  actionLoading.value = true
  try {
    const res = await $fetch('/api/uazapi/start-session', { method: 'POST' })
    await loadData() // Recarrega para pegar o QR
    startStatusPolling()
  } catch (err: any) {
    notifyError('Falha ao iniciar sessão WhatsApp')
  } finally {
    actionLoading.value = false
  }
}

async function logoutWhatsApp(skipConfirm = false) {
  if (!skipConfirm && !confirm('Deseja realmente desconectar o WhatsApp?')) return
  actionLoading.value = true
  try {
    await $fetch('/api/uazapi/logout', { method: 'POST' })
    await loadData()
    stopStatusPolling()
  } catch (err) {
    notifyError('Erro ao desconectar')
  } finally {
    actionLoading.value = false
  }
}

function startStatusPolling() {
  stopStatusPolling()
  pollingTimer = setInterval(async () => {
    try {
      const res: any = await $fetch('/api/uazapi/check-status')
      if (res.status === 'connected') {
        stopStatusPolling()
        loadData()
      } else if (res.status === 'error' || res.status === 'disconnected') {
        stopStatusPolling()
        loadData()
      }
    } catch (e) {
      console.warn('Erro no polling de status')
    }
  }, 5000)
}

function stopStatusPolling() {
  if (pollingTimer) clearInterval(pollingTimer)
}

function resetWhatsApp() {
  logoutWhatsApp(true)
}

// --- AI Actions ---
async function saveAIConfig() {
  actionLoading.value = true
  try {
    let jsonConfig = {}
    if (aiModelConfigStr.value) {
      jsonConfig = JSON.parse(aiModelConfigStr.value)
    }
    
    await saveGlobalConfig({
      id: globalConfig.value?.id,
      ia_prompt_sdr: aiForm.value.ia_prompt_sdr,
      ia_model_config_json: jsonConfig
    })
    await loadData()
  } catch (err) {
    notifyError('JSON de configuração inválido')
  } finally {
    actionLoading.value = false
  }
}

// --- Modal Handlers ---
function openNewModal() {
  selectedIntegration.value = null
  modalOpen.value = true
}

function openEditModal(item: N8NIntegration) {
  selectedIntegration.value = item
  modalOpen.value = true
}

async function confirmDelete(item: N8NIntegration) {
  if (confirm(`Deseja excluir a regra "${item.nome_integracao}"?`)) {
    if (await deleteIntegration(item.id)) loadData()
  }
}

function handleSuccess() {
  loadData()
}

function formatTrigger(type: string) {
  const map: Record<string, string> = {
    'lead_created': '🌱 Novo Lead',
    'lead_status_changed': '🔄 Status Lead',
    'appointment_created': '📅 Agendamento',
    'appointment_status_changed': '✅ Status Agenda',
    'appointment_moved': '↔️ Agenda Movida',
    'appointment_resized': '↕️ Agenda Redimensionada',
    'client_created': '🤝 Novo Cliente'
  }
  return map[type] || type
}
</script>
