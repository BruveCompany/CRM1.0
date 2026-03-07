<template>
  <BaseModal 
    v-model="showModal" 
    size="5xl"
  >
    <!-- Header Ultra Compacto -->
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
          <Icon name="lucide:zap" class="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 class="text-sm font-black text-slate-800 uppercase tracking-tight leading-none">
            {{ isEditing ? 'Editar Automação' : 'Nova Automação' }}
          </h3>
          <p class="text-[8px] text-indigo-500 font-bold uppercase tracking-widest mt-0.5">Bruve Hub Engine</p>
        </div>
      </div>
    </template>

    <div class="p-6 px-8">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        
        <!-- GRID SUPERIOR (CRÍTICO: ABSTRAÇÃO PARA LEIGOS) -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
          <!-- Nome da Regra -->
          <div class="md:col-span-4">
            <div class="flex items-center gap-1.5 mb-1.5 ml-1">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome da Regra</label>
              <Icon name="lucide:help-circle" class="w-3 h-3 text-slate-300 cursor-help" title="Um nome fácil de entender para esta automação (ex: 'Confirmação de Agendamento por WhatsApp')." />
            </div>
            <input 
              v-model="automationRule.nome_integracao" 
              type="text" 
              placeholder="Ex: Confirmação de Agendamento" 
              required 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-medium" 
            />
          </div>

          <!-- Gatilho Principal -->
          <div class="md:col-span-4">
            <div class="flex items-center gap-1.5 mb-1.5 ml-1">
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Gatilho Principal</label>
              <Icon name="lucide:help-circle" class="w-3 h-3 text-slate-300 cursor-help" title="O evento que irá iniciar esta automação (ex: 'Status do Lead Alterado')." />
            </div>
            <select 
              v-model="automationRule.tipo_gatilho_bruve" 
              required 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-black text-indigo-600 cursor-pointer"
            >
              <option value="lead_created">Novo Lead Criado</option>
              <option value="lead_status_changed">Status Lead Alterado</option>
              <option value="appointment_created">Novo Agendamento</option>
              <option value="appointment_status_changed">Status Agenda Alterado</option>
              <option value="appointment_moved">Agenda Movida</option>
              <option value="client_created">Novo Cliente</option>
            </select>
          </div>

          <!-- Enviar Pelo WhatsApp -->
          <div class="md:col-span-3">
             <div class="flex items-center gap-1.5 mb-1.5 ml-1">
               <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Enviar Pelo WhatsApp:</label>
               <Icon name="lucide:help-circle" class="w-3 h-3 text-slate-300 cursor-help" title="Selecione qual das suas contas WhatsApp será usada para enviar mensagens." />
             </div>
             <select 
               v-model="automationRule.whatsapp_account_id" 
               class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-medium cursor-pointer"
             >
               <option :value="null">Não Enviar por WhatsApp</option>
               <option v-for="acc in whatsappAccounts" :key="acc.id" :value="acc.id">
                 {{ acc.name }} ({{ acc.number }})
               </option>
             </select>
          </div>

          <!-- Ativa -->
          <div class="md:col-span-1 pb-1">
            <div class="flex items-center gap-2">
              <label class="relative inline-flex items-center cursor-pointer scale-75 origin-left">
                <input type="checkbox" v-model="automationRule.ativa" class="sr-only peer">
                <div class="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 shadow-sm"></div>
              </label>
              <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ativa</span>
            </div>
          </div>
        </div>

        <!-- Descrição -->
        <div>
           <div class="flex items-center gap-1.5 mb-1.5 ml-1">
             <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</label>
             <Icon name="lucide:help-circle" class="w-3 h-3 text-slate-300 cursor-help" title="Explique brevemente o que esta automação faz." />
           </div>
           <input 
             v-model="automationRule.descricao" 
             type="text"
             placeholder="Explique o que esta automação faz..." 
             class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
           />
        </div>

        <!-- SEÇÃO: REGRAS E CONTEÚDO (Horizontal) -->
        <div class="border-t border-slate-100 pt-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <!-- Esquerda: Filtros do Gatilho -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                   <h4 class="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                      <Icon name="lucide:filter" class="w-3.5 h-3.5 text-indigo-500" />
                      Filtros do Gatilho
                   </h4>
                   <Icon name="lucide:help-circle" class="w-3 h-3 text-slate-300 cursor-help" title="Condições adicionais para que a automação seja ativada." />
                </div>
                <!-- Botão Expert com Aviso -->
                <button 
                  v-if="supportsGuidedMode" 
                  type="button" 
                  @click="toggleAdvancedMode" 
                  class="text-[8px] font-black text-indigo-600 hover:underline uppercase bg-indigo-50 px-2 py-0.5 rounded transition-all"
                >
                  {{ useAdvancedConditions ? 'Voltar para Modo Simples' : 'Configurações Avançadas (JSON)' }}
                </button>
              </div>

              <!-- Interface Guiada (Compacta) -->
              <div v-if="!useAdvancedConditions && supportsGuidedMode" class="grid grid-cols-2 gap-3 p-4 bg-indigo-50/20 rounded-xl border border-indigo-100 shadow-inner">
                <div class="space-y-1.5">
                  <span class="text-[8px] font-black text-indigo-400 uppercase ml-1">Status Anterior</span>
                  <select v-model="guidedConditions.from_status_id" class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none shadow-sm">
                    <option value="">Qualquer status</option>
                    <template v-if="automationRule.tipo_gatilho_bruve === 'lead_status_changed'">
                      <option v-for="s in leadStatuses" :key="s.id" :value="s.id">{{ s.display_name }}</option>
                    </template>
                    <template v-else>
                      <option v-for="s in appointmentStatuses" :key="s.id" :value="s.id">{{ s.nome }}</option>
                    </template>
                  </select>
                </div>
                <div class="space-y-1.5">
                  <span class="text-[8px] font-black text-indigo-400 uppercase ml-1">Para Novo Status</span>
                  <select v-model="guidedConditions.to_status_id" class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-indigo-700 outline-none shadow-sm">
                    <option value="">Selecione...</option>
                    <template v-if="automationRule.tipo_gatilho_bruve === 'lead_status_changed'">
                      <option v-for="s in leadStatuses" :key="s.id" :value="s.id">{{ s.display_name }}</option>
                    </template>
                    <template v-else>
                      <option v-for="s in appointmentStatuses" :key="s.id" :value="s.id">{{ s.nome }}</option>
                    </template>
                  </select>
                </div>
              </div>

              <textarea v-else v-model="detalhesJsonStr" rows="7" class="w-full px-3 py-2 bg-slate-900 text-indigo-300 font-mono text-[10px] rounded-xl border border-slate-800 outline-none leading-relaxed shadow-lg"></textarea>
            </div>

            <!-- Direita: Conteúdo/Ação da Automação (Refined for Leigos) -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                   <Icon name="lucide:file-json" class="w-3.5 h-3.5 text-emerald-500" />
                   Conteúdo/Ação da Automação
                </h4>
                <button type="button" @click="showPlaceholders = !showPlaceholders" class="text-[8px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 uppercase tracking-widest">
                  <Icon name="lucide:info" class="w-3 h-3" />
                  Biblioteca de Variáveis
                </button>
              </div>
              
              <div class="relative group">
                <textarea 
                  v-model="payloadJsonStr" 
                  rows="7" 
                  :placeholder="PAYLOAD_PLACEHOLDER" 
                  class="w-full px-3 py-2 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-xl border border-slate-800 outline-none leading-relaxed shadow-lg focus:ring-1 focus:ring-emerald-500/50"
                ></textarea>
                <div class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button @click="formatJson('payload')" type="button" class="p-1 px-2 bg-slate-800 text-[8px] text-emerald-400 rounded border border-white/10 hover:bg-slate-700">Formatar JSON</button>
                </div>
              </div>

              <p class="text-[9px] text-slate-400 italic">
                Defina a mensagem ou ação que o N8N irá executar. Use as variáveis disponíveis (como <code v-pre class="text-indigo-400">{{leadName}}</code> ou <code v-pre class="text-emerald-400">{{companyPhone}}</code>) para personalizar o conteúdo.
              </p>
            </div>
          </div>
        </div>

        <!-- Painel de Variáveis (Incluindo Empresa) -->
        <Transition name="fade">
          <div v-if="showPlaceholders" class="bg-indigo-950 rounded-2xl p-4 border border-white/10 shadow-xl text-white">
             <div class="grid grid-cols-4 gap-4 text-[9px]" v-pre>
                <!-- Categoria Leads -->
                <div class="space-y-2 border-r border-white/5 pr-4">
                   <p class="font-black text-indigo-400 uppercase border-b border-white/5 pb-1 flex items-center justify-between">
                     Leads <Icon name="lucide:users" class="w-2.5 h-2.5" />
                   </p>
                   <div class="flex flex-wrap gap-1.5">
                     <code class="bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-100 whitespace-nowrap">{{ leadName }}</code>
                     <code class="bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-100 whitespace-nowrap">{{ phone }}</code>
                     <code class="bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-100 whitespace-nowrap">{{ status }}</code>
                   </div>
                </div>
                <!-- Categoria Agenda -->
                <div class="space-y-2 border-r border-white/5 pr-4">
                   <p class="font-black text-emerald-400 uppercase border-b border-white/5 pb-1 flex items-center justify-between">
                     Agenda <Icon name="lucide:calendar" class="w-2.5 h-2.5" />
                   </p>
                   <div class="flex flex-wrap gap-1.5">
                     <code class="bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-50 whitespace-nowrap">{{ data }}</code>
                     <code class="bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-50 whitespace-nowrap">{{ hora_inicio }}</code>
                     <code class="bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-50 whitespace-nowrap">{{ titulo }}</code>
                   </div>
                </div>
                <!-- Categoria Meta -->
                <div class="space-y-2 border-r border-white/5 pr-4">
                   <p class="font-black text-amber-500 uppercase border-b border-white/5 pb-1 flex items-center justify-between">
                     Meta <Icon name="lucide:database" class="w-2.5 h-2.5" />
                   </p>
                   <div class="flex flex-wrap gap-1.5">
                     <code class="bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-50 whitespace-nowrap">{{ old_data.status }}</code>
                     <code class="bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-100 whitespace-nowrap">{{ action }}</code>
                   </div>
                </div>
                <!-- Categoria Empresa -->
                <div class="space-y-2">
                   <p class="font-black text-pink-400 uppercase border-b border-white/5 pb-1 flex items-center justify-between">
                     Empresa <Icon name="lucide:building" class="w-2.5 h-2.5" />
                   </p>
                   <div class="flex flex-wrap gap-1.5">
                     <code class="bg-pink-500/20 px-1.5 py-0.5 rounded text-pink-100 whitespace-nowrap">{{ companyAddress }}</code>
                     <code class="bg-pink-500/20 px-1.5 py-0.5 rounded text-pink-100 whitespace-nowrap">{{ companyPhone }}</code>
                     <code class="bg-pink-500/20 px-1.5 py-0.5 rounded text-pink-100 whitespace-nowrap">{{ instagramLink }}</code>
                   </div>
                </div>
             </div>
          </div>
        </Transition>

        <!-- Footer Sem Margens -->
        <div class="flex justify-end items-center gap-3 pt-4 border-t border-slate-100">
          <button type="button" @click="showModal = false" class="px-6 py-2 text-[10px] font-black text-slate-400 hover:text-slate-800 uppercase tracking-widest">Sair</button>
          <button 
            type="submit" 
            :disabled="loading" 
            class="px-10 py-2.5 bg-indigo-600 hover:bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 flex items-center"
          >
            <Icon v-if="loading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
            {{ isEditing ? 'SALVAR E ATIVAR' : 'SALVAR E ATIVAR' }}
          </button>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useN8N, type N8NIntegration } from '~/composables/useN8N'
import { useAgendamentoStatuses } from '~/composables/useAgendamentoStatuses'
import { useLeadStatuses } from '~/composables/useLeadStatuses'

/**
 * ================= MOCK STORES (Conforme Instruções) =================
 * Em um cenário real, estes seriam importados de ~/stores/...
 * =====================================================================
 */
const useCompanyStore = () => {
  const companyData = ref({
    address: 'Av. Paulista, 1000 - São Paulo, SP',
    phone: '(11) 99999-8888',
    socialMedia: {
      facebook: 'facebook.com/bruvehub',
      instagram: 'instagram.com/bruvehub'
    }
  })
  return { companyData }
}

const useWhatsAppStore = () => {
  const whatsappAccounts = ref([
    { id: 'wa1', name: 'Atendimento Principal', number: '5511999998888' },
    { id: 'wa2', name: 'Setor de Vendas', number: '5511988887777' },
    { id: 'wa3', name: 'Suporte Prime', number: '5511977776666' }
  ])
  return { whatsappAccounts }
}

const props = defineProps<{
  modelValue: boolean
  integration?: N8NIntegration | null
}>()

const emit = defineEmits(['update:modelValue', 'success'])

// Composables & Stores
const { saveIntegration } = useN8N()
const { notifyError, notifySuccess } = useNotification()
const { companyData } = useCompanyStore()
const { whatsappAccounts } = useWhatsAppStore()

const PAYLOAD_PLACEHOLDER = `Ex: { 
  "msg": "Olá {{leadName}}, sou da Bruve! Nosso endereço é {{companyAddress}} e nosso telefone é {{companyPhone}}.", 
  "action": "enviar_email_boas_vindas" 
}`

// State
const showModal = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEditing = computed(() => !!props.integration?.id)
const loading = ref(false)
const showPlaceholders = ref(false)
const useAdvancedConditions = ref(false)

// Variável reativa principal (Renomeada conforme prompt para automationRule)
const automationRule = ref<any>({
  nome_integracao: '',
  descricao: '',
  tipo_gatilho_bruve: 'lead_status_changed',
  n8n_webhook_url: 'AUTO_GENERATED', // Abstraído do usuário, gerenciado internamente
  whatsapp_account_id: null,
  ativa: true,
  gatilho_detalhes_json: {},
  payload_template_json: null
})

const detalhesJsonStr = ref('{}')
const payloadJsonStr = ref('')

const { statuses: appointmentStatuses, fetchStatuses: fetchAgStatuses } = useAgendamentoStatuses()
const { leadStatuses, fetchStatuses: fetchLeadStatuses } = useLeadStatuses()
const guidedConditions = ref({ from_status_id: '', to_status_id: '' })

const supportsGuidedMode = computed(() => automationRule.value.tipo_gatilho_bruve?.includes('status_changed'))

// Lifecycle
onMounted(() => {
  fetchAgStatuses()
  fetchLeadStatuses()

  if (import.meta.env.DEV) {
    console.log('[AutomationRuleModal] Dados da Empresa Carregados:', companyData.value)
    console.log('[AutomationRuleModal] Contas WhatsApp Carregadas:', whatsappAccounts.value)
  }
})

/**
 * Alterna para o modo Expert JSON com confirmação para segurança do usuário leigo.
 */
function toggleAdvancedMode() {
  if (!useAdvancedConditions.value) {
    const confirms = confirm(
      "Atenção: Modo de Edição Avançada!\n\n" +
      "Este modo permite editar a lógica da automação diretamente em código JSON. " +
      "É recomendado apenas para usuários com conhecimento técnico.\n\n" +
      "Alterações incorretas podem fazer sua automação parar de funcionar. Deseja continuar?"
    )
    if (!confirms) return
  }
  
  // Se estiver saindo do guiado, garante que o JSON reflete as seleções atuais
  if (!useAdvancedConditions.value) {
     detalhesJsonStr.value = JSON.stringify(automationRule.value.gatilho_detalhes_json || {}, null, 2)
  }
  
  useAdvancedConditions.value = !useAdvancedConditions.value
}

// Watchers
watch(() => automationRule.value.tipo_gatilho_bruve, (newVal) => {
  if (newVal?.includes('status_changed')) useAdvancedConditions.value = false
  else useAdvancedConditions.value = true
  
  if (import.meta.env.DEV) {
    console.log('[AutomationRuleModal] Gatilho alterado para:', newVal)
  }
})

watch(guidedConditions, (newVal) => {
  if (!useAdvancedConditions.value && supportsGuidedMode.value) {
    const json: any = {}
    if (newVal.from_status_id) json.from_status_id = newVal.from_status_id
    if (newVal.to_status_id) json.to_status_id = newVal.to_status_id
    detalhesJsonStr.value = JSON.stringify(json, null, 2)
    automationRule.value.gatilho_detalhes_json = json
  }
}, { deep: true })

watch(() => props.integration, (newVal) => {
  if (newVal) {
    automationRule.value = { ...newVal }
    detalhesJsonStr.value = newVal.gatilho_detalhes_json ? JSON.stringify(newVal.gatilho_detalhes_json, null, 2) : '{}'
    payloadJsonStr.value = newVal.payload_template_json ? JSON.stringify(newVal.payload_template_json, null, 2) : ''
    
    // Sincroniza dropdowns WhatsApp (se houver no banco)
    // automationRule.value.whatsapp_account_id = ...
    
    if (newVal.tipo_gatilho_bruve?.includes('status_changed')) {
       guidedConditions.value.from_status_id = newVal.gatilho_detalhes_json?.from_status_id || ''
       guidedConditions.value.to_status_id = newVal.gatilho_detalhes_json?.to_status_id || ''
       useAdvancedConditions.value = false
    } else {
       useAdvancedConditions.value = true
    }
  } else {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  automationRule.value = { 
    nome_integracao: '', 
    descricao: '', 
    tipo_gatilho_bruve: 'lead_status_changed', 
    n8n_webhook_url: 'AUTO_GENERATED', 
    ativa: true, 
    whatsapp_account_id: null,
    gatilho_detalhes_json: {}, 
    payload_template_json: null 
  }
  detalhesJsonStr.value = '{}'
  payloadJsonStr.value = ''
  guidedConditions.value = { from_status_id: '', to_status_id: '' }
}

function formatJson(type: 'detalhes' | 'payload') {
  try {
    if (type === 'detalhes') detalhesJsonStr.value = JSON.stringify(JSON.parse(detalhesJsonStr.value), null, 2)
    else payloadJsonStr.value = JSON.stringify(JSON.parse(payloadJsonStr.value), null, 2)
  } catch (e) { notifyError('JSON Inválido') }
}

/**
 * Persiste a regra de automação após validações.
 */
async function handleSubmit() {
  loading.value = true
  
  if (import.meta.env.DEV) {
    console.log('[AutomationRuleModal] Iniciando Salvamento...', automationRule.value)
  }

  try {
    // 1. Prepara os detalhes do gatilho (Nesting WhatsApp e Metadata aqui dentro)
    let detalhes: any = {}
    
    if (!useAdvancedConditions.value && supportsGuidedMode.value) {
       detalhes = { 
         from_status_id: guidedConditions.value.from_status_id, 
         to_status_id: guidedConditions.value.to_status_id 
       }
    } else {
       detalhes = JSON.parse(detalhesJsonStr.value)
    }

    // Injeta whatsapp_account_id e metadata da empresa dentro do gatilho_detalhes_json
    // Isso evita o erro de 'coluna não encontrada' no Supabase
    detalhes.whatsapp_account_id = automationRule.value.whatsapp_account_id
    detalhes.company_metadata = {
       address: companyData.value.address,
       phone: companyData.value.phone
    }

    automationRule.value.gatilho_detalhes_json = detalhes

    // 2. Processa Payload Template
    automationRule.value.payload_template_json = payloadJsonStr.value ? JSON.parse(payloadJsonStr.value) : null
    
    // 3. Garante Webhook URL (mesmo que abstraído do usuário)
    if (!automationRule.value.n8n_webhook_url || automationRule.value.n8n_webhook_url === 'AUTO_GENERATED') {
      automationRule.value.n8n_webhook_url = 'https://n8n.bruve.io/webhook/auto' // URL padrão interna
    }

    // 4. Limpa propriedades que não existem na tabela para evitar erro de schema cache
    const finalData = { ...automationRule.value }
    delete finalData.metadata
    delete finalData.whatsapp_account_id // Remove do nível raiz, pois já está em detalhes_json

    // 5. Persistência
    const success = await saveIntegration(finalData)
    if (success) { 
      notifySuccess(`Automação '${automationRule.value.nome_integracao}' salva e ativada com sucesso!`)
      emit('success')
      showModal.value = false 
    }
  } catch (e: any) {
    const errorMsg = e.message || 'Configuração JSON inválida. Verifique os campos de código.'
    notifyError(`Erro ao salvar: ${errorMsg}`)
    console.error('[AutomationRuleModal] Erro:', e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }

/* Melhoria visual para campos de texto mono */
textarea {
  tab-size: 2;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}
</style>
