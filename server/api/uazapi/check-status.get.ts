import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Não autorizado' })
    }

    const { uazapiApiKey, uazapiBaseUrl } = useRuntimeConfig()

    try {
        const { data: config } = await (supabase
            .from('ag_automation_config') as any)
            .select('whatsapp_instance_key, whatsapp_status')
            .single()

        const configData = config as any
        if (!configData?.whatsapp_instance_key) {
            return { status: 'disconnected' }
        }

        /**
         * CHAMADA REAL À UAZAPI
         * Endpoint: /instance/status (ou conforme doc da Uazapi)
         */
        const response: any = await $fetch(`${uazapiBaseUrl}/instance/status/${configData.whatsapp_instance_key}`, {
            method: 'GET',
            headers: {
                'apikey': uazapiApiKey || ''
            }
        })

        // A Uazapi retorna status como 'connected', 'connecting', 'disconnected' etc.
        const externalStatus = response.status || response.state
        const phoneNumber = response.number || response.phone

        let newStatus = configData.whatsapp_status

        // Mapeamento de status da Uazapi para o nosso banco
        if (externalStatus === 'connected') {
            newStatus = 'connected'
        } else if (externalStatus === 'disconnected' || externalStatus === 'close') {
            newStatus = 'disconnected'
        } else if (externalStatus === 'connecting') {
            newStatus = 'pending_qr'
        }

        if (newStatus !== configData.whatsapp_status) {
            await (supabase
                .from('ag_automation_config') as any)
                .update({
                    whatsapp_status: newStatus,
                    whatsapp_phone_number: phoneNumber || null,
                    whatsapp_qr_code_base64: newStatus === 'connected' ? null : configData.whatsapp_qr_code_base64
                })
                .eq('user_id', user.id)
        }

        return {
            status: newStatus,
            phoneNumber
        }
    } catch (error: any) {
        return { status: 'error', message: error.message }
    }
})
