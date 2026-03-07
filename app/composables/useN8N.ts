import type { Database, AgAutomationConfig } from '../../shared/types/database'

/**
 * ================= useN8N.ts =================
 * Composable para gerenciar integrações com N8N
 * 
 * Este composable transforma o Bruve Prime em um "Dispatch Center"
 * enviando webhooks para o N8N baseado em eventos do sistema.
 * =============================================
 */

export interface N8NIntegration {
    id: string
    nome_integracao: string
    descricao?: string | null
    tipo_gatilho_bruve:
    | 'lead_created'
    | 'lead_status_changed'
    | 'appointment_created'
    | 'appointment_status_changed'
    | 'appointment_moved'
    | 'appointment_resized'
    | 'client_created'
    gatilho_detalhes_json?: any
    n8n_webhook_url: string
    payload_template_json?: any
    ativa: boolean
    user_id: string
    created_at: string
}

export function useN8N() {
    const supabase = useSupabaseClient<Database>()
    const user = useSupabaseUser()
    const { notifyError, notifySuccess } = useNotification()

    /**
     * Busca as configurações globais de automação (WhatsApp/IA)
     */
    async function fetchGlobalConfig(): Promise<AgAutomationConfig | null> {
        try {
            const { data, error } = await (supabase
                .from('ag_automation_config') as any)
                .select('*')
                .single()

            if (error && error.code !== 'PGRST116') throw error // Ignorar erro de "não encontrado"
            return data as AgAutomationConfig | null
        } catch (err) {
            console.error('❌ Erro ao buscar config global:', err)
            return null
        }
    }

    /**
     * Salva as configurações globais (WhatsApp/IA)
     */
    async function saveGlobalConfig(config: Partial<AgAutomationConfig>): Promise<boolean> {
        try {
            // Tenta pegar o user do composable ou direto da sessão do supabase como fallback
            let currentUserId = user.value?.id
            if (!currentUserId) {
                const { data: { session } } = await supabase.auth.getSession()
                currentUserId = session?.user?.id
            }

            if (!currentUserId) throw new Error('Usuário não autenticado')

            const payload = {
                ...config,
                user_id: currentUserId
            }

            // Usamos onConflict para garantir que ele atualize baseado no user_id se não houver id no payload
            const { error } = await (supabase.from('ag_automation_config') as any)
                .upsert(payload, { onConflict: 'user_id' })

            if (error) throw error
            notifySuccess('Configurações salvas!')
            return true
        } catch (err: any) {
            console.error('❌ Erro ao salvar config global:', err)
            notifyError(`Erro ao salvar: ${err.message}`)
            return false
        }
    }

    /**
     * Busca todas as integrações de webhook cadastradas
     */
    async function fetchIntegrations(): Promise<N8NIntegration[]> {
        try {
            const { data, error } = await supabase
                .from('ag_n8n_integrations')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            return (data || []) as N8NIntegration[]
        } catch (err) {
            console.error('❌ Erro ao buscar integrações N8N:', err)
            return []
        }
    }

    /**
     * Adiciona ou atualiza uma integração (Regra de Webhook)
     */
    async function saveIntegration(integration: Partial<N8NIntegration>): Promise<boolean> {
        try {
            const payload = {
                ...integration,
                user_id: user.value?.id
            }

            const { error } = await (supabase.from('ag_n8n_integrations') as any).upsert(payload)

            if (error) throw error
            notifySuccess('Regra de integração salva!')
            return true
        } catch (err: any) {
            console.error('❌ Erro ao salvar integração N8N:', err)
            notifyError(`Erro ao salvar: ${err.message}`)
            return false
        }
    }

    /**
     * Exclui uma integração
     */
    async function deleteIntegration(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('ag_n8n_integrations')
                .delete()
                .eq('id', id)

            if (error) throw error
            notifySuccess('Integração excluída!')
            return true
        } catch (err: any) {
            console.error('❌ Erro ao excluir integração N8N:', err)
            notifyError('Erro ao excluir integração')
            return false
        }
    }

    /**
     * DISPARADOR CENTRAL DE WEBHOOKS
     * 
     * @param eventType - O tipo do evento (ex: 'lead_created')
     * @param currentData - Dados atuais do objeto
     * @param oldData - Dados anteriores (para comparar mudanças)
     */
    async function triggerN8NWebhook(
        eventType: N8NIntegration['tipo_gatilho_bruve'],
        currentData: any,
        oldData: any = null
    ) {
        console.log(`[N8N Dispatch] Evento detectado: ${eventType}`, { id: currentData?.id })

        try {
            // 1. Busca integrações ATIVAS para este evento
            const { data: activeIntegrations, error } = await supabase
                .from('ag_n8n_integrations')
                .select('*')
                .eq('tipo_gatilho_bruve', eventType)
                .eq('ativa', true)

            if (error || !activeIntegrations || activeIntegrations.length === 0) return

            // 2. Busca Configuração Global (WhatsApp/IA) para incluir no payload
            const { data: globalConfig } = await (supabase
                .from('ag_automation_config') as any)
                .select('whatsapp_phone_number, ia_prompt_sdr, ia_model_config_json')
                .single()

            // 3. Processa cada integração
            for (const integration of activeIntegrations as N8NIntegration[]) {
                // A. Verifica condições
                if (integration.gatilho_detalhes_json) {
                    const conditions = integration.gatilho_detalhes_json
                    if (eventType.includes('status_changed')) {
                        const currentStatus = currentData?.status_id || currentData?.status
                        const oldStatus = oldData?.status_id || oldData?.status

                        // Suporte a status_de / status_para (legado/nome amigável)
                        if (conditions.status_de && conditions.status_de !== oldStatus) continue
                        if (conditions.status_para && conditions.status_para !== currentStatus) continue

                        // Suporte a from_status_id / to_status_id (novo padrão guiado)
                        if (conditions.from_status_id && conditions.from_status_id !== oldStatus) continue
                        if (conditions.to_status_id && conditions.to_status_id !== currentStatus) continue
                    }
                }

                // B. Monta o Payload para o N8N (Incluindo Dados de IA/WhatsApp)
                const config: any = globalConfig || {}
                let finalPayload: any = {
                    event: eventType,
                    timestamp: new Date().toISOString(),
                    data: currentData,
                    old_data: oldData,
                    // METADADOS DE AUTOMAÇÃO
                    automation_config: {
                        whatsapp_phone: config.whatsapp_phone_number || null,
                        ia_prompt: config.ia_prompt_sdr || null,
                        ia_model: config.ia_model_config_json || {}
                    }
                }

                // Se houver um template customizado, processamos os placeholders
                if (integration.payload_template_json) {
                    try {
                        let templateStr = JSON.stringify(integration.payload_template_json)
                        // Substituição de placeholders no currentData
                        const placeholders = templateStr.match(/{{[a-zA-Z._0-9]+}}/g) || []
                        placeholders.forEach(p => {
                            const path = p.replace(/{{|}}/g, '')
                            // Tenta pegar do currentData ou do globalConfig
                            let value = path.split('.').reduce((obj, key) => obj?.[key], currentData)
                            if (value === undefined && path.startsWith('config.')) {
                                const configPath = path.replace('config.', '')
                                value = configPath.split('.').reduce((obj: any, key: string) => obj?.[key], globalConfig)
                            }
                            templateStr = templateStr.replace(p, value !== undefined ? String(value) : '')
                        })
                        finalPayload = JSON.parse(templateStr)
                    } catch (templateError) {
                        console.warn('⚠️ [N8N Dispatch] Falha ao processar template. Enviando padrão.', templateError)
                    }
                }

                // C. Disparo Assíncrono
                fetch(integration.n8n_webhook_url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(finalPayload)
                })
                    .then(r => r.ok && console.log(`✅ [N8N Success] ${integration.nome_integracao}`))
                    .catch(e => console.error(`❌ [N8N Error] ${integration.nome_integracao}:`, e.message))
            }
        } catch (globalErr) {
            console.error('❌ [N8N Critical Error]:', globalErr)
        }
    }

    return {
        fetchGlobalConfig,
        saveGlobalConfig,
        fetchIntegrations,
        saveIntegration,
        deleteIntegration,
        triggerN8NWebhook
    }
}
