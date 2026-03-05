import { ref, type Ref } from 'vue';

export const useLeadDetailFiles = (currentLeadId: Ref<string>, lead: Ref<any>) => {
    const supabase = useSupabaseClient();
    const { notifySuccess, notifyError } = useNotification();

    const listaDeArquivos = ref<any[]>([]);

    const carregarArquivosDoLead = async (leadId: string, retryCount = 0) => {
        try {
            const { data, error } = await (supabase as any)
                .from('attachments')
                .select('*')
                .eq('lead_id', leadId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if ((!data || data.length === 0) && retryCount < 1) {
                setTimeout(() => carregarArquivosDoLead(leadId, retryCount + 1), 800);
                return;
            }

            listaDeArquivos.value = ((data as any[]) || []).map(f => ({
                id: f.id,
                name: f.file_name || f.name,
                size: f.file_size || f.size,
                uploadDate: f.created_at,
                uploadedBy: lead.value?.vendedor_nome || 'Consultor',
                file_path: f.file_path
            }));
        } catch (err: any) {
            console.error('[Arquivos] Erro ao carregar:', err.message);
        }
    };

    const processarUpload = async (receivedFiles: any) => {
        console.clear();
        console.log('--- INICIANDO PROCESSO DE UPLOAD ---');

        if (!receivedFiles) {
            console.error('Nenhum arquivo recebido no evento. O processo foi interrompido.');
            return;
        }

        const files = Array.isArray(receivedFiles)
            ? receivedFiles
            : (receivedFiles instanceof FileList ? Array.from(receivedFiles) : [receivedFiles]);

        console.log(`[PRE-CHECK] Quantidade de arquivos a processar: ${files.length}`);

        try {
            if (!lead.value || !currentLeadId.value) {
                throw new Error('ID do Lead não encontrado.');
            }

            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;
            if (!sessionData.session) throw new Error('Sessão do usuário não encontrada.');

            const accessToken = sessionData.session.access_token;
            const user = sessionData.session.user;

            console.log(`[CHECK 2] SUCESSO: Usuário autenticado com ID ${user.id}`);

            for (const file of files) {
                console.log(`--- Processando arquivo: ${file.name} ---`);

                const timestamp = Date.now();
                const fileName = file.name.replace(/[^\x00-\x7F]/g, "");
                const filePath = `lead_files/${currentLeadId.value}/${timestamp}-${fileName}`;

                console.log('[AÇÃO] Enviando arquivo para o Storage com Header de Autorização...');
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('lead-attachments')
                    .upload(filePath, file, {
                        headers: {
                            authorization: `Bearer ${accessToken}`,
                        },
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) throw uploadError;
                console.log('[CHECK 4] SUCESSO: Upload para Storage concluído.');

                console.log('[AÇÃO] Inserindo metadados na tabela "attachments"...');
                const { data: dbData, error: dbError } = await (supabase as any)
                    .from('attachments')
                    .insert({
                        lead_id: currentLeadId.value,
                        file_name: file.name,
                        file_path: filePath,
                        file_type: file.type,
                        file_size: file.size,
                        uploaded_by: user.id
                    })
                    .select()
                    .single();

                if (dbError) throw dbError;

                listaDeArquivos.value.unshift({
                    id: dbData.id,
                    name: dbData.file_name,
                    size: dbData.file_size,
                    uploadDate: dbData.created_at,
                    uploadedBy: lead.value?.vendedor_nome || 'Consultor',
                    file_path: dbData.file_path
                });
                console.log('--- UPLOAD DO ARQUIVO CONCLUÍDO COM SUCESSO ---');
            }

            notifySuccess('Upload concluído com sucesso!');

        } catch (error: any) {
            console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            console.error('!!! ERRO CAPTURADO NO PROCESSO DE UPLOAD !!!');
            console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            console.error('Objeto do erro:', error);
            notifyError('Erro no upload: ' + (error.message || 'Verifique o console'));
        }
    };

    const iniciarDownload = async (file: any) => {
        try {
            const { data } = supabase.storage
                .from('lead-attachments')
                .getPublicUrl(file.file_path);

            if (data?.publicUrl) {
                window.open(data.publicUrl, '_blank');
            }
        } catch (err: any) {
            notifyError('Não foi possível gerar o link de download.');
        }
    };

    const confirmarExclusao = async (file: any) => {
        if (!confirm(`Tem certeza que deseja excluir o arquivo "${file.name}"?`)) return;

        try {
            const { error: storageError } = await supabase.storage
                .from('lead-attachments')
                .remove([file.file_path]);

            if (storageError) throw storageError;

            const { error: dbError } = await (supabase as any)
                .from('attachments')
                .delete()
                .eq('id', file.id);

            if (dbError) throw dbError;

            listaDeArquivos.value = listaDeArquivos.value.filter(f => f.id !== file.id);
            notifySuccess('Arquivo excluído.');
        } catch (err: any) {
            notifyError('Erro ao excluir arquivo.');
        }
    };

    return {
        listaDeArquivos,
        carregarArquivosDoLead,
        processarUpload,
        iniciarDownload,
        confirmarExclusao
    };
};
