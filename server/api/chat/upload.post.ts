import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    try {
        const supabase = await serverSupabaseServiceRole(event)
        const formData = await readMultipartFormData(event)

        if (!formData || formData.length === 0) {
            throw createError({ statusCode: 400, statusMessage: 'Nenhum arquivo enviado.' })
        }

        const fileField = formData.find(f => f.name === 'file')
        const pathField = formData.find(f => f.name === 'path')

        if (!fileField || !pathField) {
            throw createError({ statusCode: 400, statusMessage: 'Parâmetros file ou path ausentes.' })
        }

        const filePath = pathField.data.toString()

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('chat_anexos')
            .upload(filePath, fileField.data, {
                contentType: fileField.type
            })

        if (uploadError) {
            throw createError({ statusCode: 500, statusMessage: uploadError.message })
        }

        const { data: pubUrlData } = supabase.storage
            .from('chat_anexos')
            .getPublicUrl(filePath)

        return { publicUrl: pubUrlData.publicUrl }
    } catch (err: any) {
        console.error('Erro no upload API:', err)
        throw createError({ statusCode: 500, statusMessage: err.message || 'Erro interno no servidor' })
    }
})
