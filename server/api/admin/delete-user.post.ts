import { serverSupabaseServiceRole } from '#supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../../shared/types/database'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { userId } = body

    if (!userId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID do usuário (UUID) é obrigatório'
        })
    }

    // Cliente Supabase com privilégios de administrador (serviço) para deletar do Auth
    const client = serverSupabaseServiceRole(event) as SupabaseClient<Database>

    try {
        // 1. Deletar da tabela public.ag_profiles (usando user_id que é o UUID do Auth)
        // OBS: Geralmente há uma FK com ON DELETE CASCADE, mas vamos garantir a limpeza manual do perfil
        const { error: profileError } = await (client
            .from('ag_profiles' as any) as any)
            .delete()
            .eq('user_id', userId)

        if (profileError) {
            console.error('Erro ao deletar perfil:', profileError)
            // Não barramos a deleção do auth se o perfil falhar, mas avisamos
        }

        // 2. Deletar o usuário no Supabase Auth usando as APIs de admin
        const { error: authError } = await client.auth.admin.deleteUser(userId)

        if (authError) {
            throw createError({
                statusCode: 400,
                statusMessage: `Erro ao deletar usuário do sistema: ${authError.message}`
            })
        }

        return {
            success: true,
            message: 'Usuário e perfil removidos com sucesso'
        }
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Erro interno ao processar a deleção'
        })
    }
})
