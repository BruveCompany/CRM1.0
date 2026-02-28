import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '../../../shared/types/database'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { email, password, nome, role = 'user' } = body

    if (!email || !password || !nome) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Email, senha e nome são obrigatórios'
        })
    }

    // Cliente Supabase com privilégios de administrador (serviço)
    const client = serverSupabaseServiceRole<Database>(event)

    // 1. Criar o usuário no Supabase Auth usando as APIs de admin
    const { data: authData, error: authError } = await client.auth.admin.createUser({
        email,
        password,
        email_confirm: true // Já confirma o email automaticamente
    })

    if (authError) {
        throw createError({
            statusCode: 400,
            statusMessage: `Erro ao criar usuário: ${authError.message}`
        })
    }

    const user = authData.user

    if (!user) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao obter dados do usuário criado'
        })
    }

    // 2. Inserir os dados na tabela public.ag_profiles
    const { data: profileData, error: profileError } = await client
        .from('ag_profiles')
        .insert({
            user_id: user.id,
            email: user.email,
            nome: nome,
            role: role
        })
        .select()
        .single()

    if (profileError) {
        // Caso ocorra erro no perfil, remove o usuário criado do Auth para evitar inconsistência
        await client.auth.admin.deleteUser(user.id)

        throw createError({
            statusCode: 400,
            statusMessage: `Erro ao criar perfil: ${profileError.message}`
        })
    }

    return {
        success: true,
        user: user,
        profile: profileData
    }
})
