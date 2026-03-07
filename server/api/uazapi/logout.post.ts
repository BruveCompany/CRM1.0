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
            .select('whatsapp_instance_key')
            .single()

        const configData = config as any
        if (configData?.whatsapp_instance_key) {
            /**
             * CHAMADA REAL À UAZAPI
             * Endpoint: /instance/logout (ou conforme doc da Uazapi)
             */
            await $fetch(`${uazapiBaseUrl}/instance/logout/${configData.whatsapp_instance_key}`, {
                method: 'DELETE', // Alguns usam POST, outros DELETE para logout
                headers: {
                    'apikey': uazapiApiKey || ''
                }
            })
        }

        await (supabase
            .from('ag_automation_config') as any)
            .update({
                whatsapp_status: 'disconnected',
                whatsapp_qr_code_base64: null,
                whatsapp_phone_number: null
            })
            .eq('user_id', user.id)

        return { success: true }
    } catch (error: any) {
        throw createError({ statusCode: 500, message: 'Erro ao desconectar WhatsApp' })
    }
})
