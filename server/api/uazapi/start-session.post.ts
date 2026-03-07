import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Não autorizado' })
    }

    const { uazapiApiKey, uazapiBaseUrl, uazapiInstanceId } = useRuntimeConfig()

    try {
        // 1. Busca config atual para pegar a instance_key (se existir)
        const { data: config } = await (supabase
            .from('ag_automation_config') as any)
            .select('whatsapp_instance_key')
            .single()

        const configData = config as any
        // Usa a instanceId do config (global) ou carimbada no registro do usuário
        const instanceKey = configData?.whatsapp_instance_key || uazapiInstanceId

        if (!instanceKey) {
            throw createError({ statusCode: 400, message: 'ID da Instância não configurado' })
        }

        /**
         * CHAMADA REAL À UAZAPI
         * Endpoint: /instance/connect (ou conforme doc da Uazapi)
         */
        const response: any = await $fetch(`${uazapiBaseUrl}/instance/connect/${instanceKey}`, {
            method: 'GET',
            headers: {
                'apikey': uazapiApiKey || ''
            }
        })

        // O response da Uazapi geralmente contém o QR em base64 ou uma string para gerar
        const qrCode = response.base64 || response.qrcode || response.qr

        // Atualiza status no banco
        const { error: updateError } = await (supabase
            .from('ag_automation_config') as any)
            .upsert({
                user_id: user.id,
                whatsapp_instance_key: instanceKey,
                whatsapp_status: 'pending_qr',
                whatsapp_qr_code_base64: qrCode,
                updated_at: new Date().toISOString()
            })

        if (updateError) throw updateError

        return {
            success: true,
            instanceKey,
            qrCode
        }
    } catch (error: any) {
        console.error('❌ [Uazapi Server Error]:', error)
        throw createError({
            statusCode: 500,
            message: error.message || 'Erro ao iniciar sessão WhatsApp'
        })
    }
})
