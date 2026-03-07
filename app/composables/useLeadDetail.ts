import { ref, computed, watch, onMounted, onUnmounted, type Ref } from 'vue';
import { useLeads } from '~/composables/useLeads';
import { useProfissionais } from '~/composables/useProfissionais';
import { useAuth } from '~/composables/useAuth';
import { useNotification } from '~/composables/useNotification';
import { useLeadDetailFiles } from '~/composables/useLeadDetailFiles';

export const useLeadDetail = (currentLeadId: Ref<string>) => {
    const supabase = useSupabaseClient();
    const { notifySuccess, notifyError } = useNotification();
    const { fetchProfissionais } = useProfissionais();

    const { profile, waitForProfile } = useAuth();
    const { allLeads, leadStatuses } = useLeads();
    const { triggerN8NWebhook } = useN8N();

    // state
    const lead = ref<any>(null);
    const loading = ref(true);
    const timelineActivities = ref<any[]>([]);
    const proximoAgendamento = ref<any>(null);
    const globalProfissionais = ref<any[]>([]);

    // modais state
    const isEditModalOpen = ref(false);
    const isScheduleModalOpen = ref(false);
    const isTaskModalOpen = ref(false);

    // arquivos
    const {
        listaDeArquivos,
        carregarArquivosDoLead,
        processarUpload,
        iniciarDownload,
        confirmarExclusao
    } = useLeadDetailFiles(currentLeadId, lead);

    // --- STATUS DO KANBAN ---
    const isCurrentStatus = (statusId: string): boolean => {
        if (!lead.value?.status) return false;
        const current = String(lead.value.status).toLowerCase().trim();
        const normalized = current.replace(/\s+/g, '_');
        return normalized === statusId.toLowerCase() || current === statusId.toLowerCase();
    };

    // --- STAGE MENU STATE ---
    const showStageMenu = ref(false);
    const stageMenuRef = ref<HTMLElement | null>(null);
    const stageBtnRef = ref<any>(null);
    const dropdownStyle = ref({ top: '0px', left: '0px', width: '0px' });

    const toggleStageMenu = () => {
        const el = stageMenuRef.value || (stageBtnRef.value ? stageBtnRef.value.$el : null);
        if (el) {
            const rect = el.getBoundingClientRect();
            dropdownStyle.value = {
                top: `${rect.bottom + 8}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
            };
        }
        showStageMenu.value = !showStageMenu.value;
    };

    const handleClickOutside = (event: MouseEvent) => {
        // try checking both refs
        const el = stageMenuRef.value || (stageBtnRef.value ? stageBtnRef.value.$el : null);
        if (el && !el.contains(event.target as Node)) {
            showStageMenu.value = false;
        }
    };

    onMounted(() => {
        if (typeof document !== 'undefined') {
            document.addEventListener('mousedown', handleClickOutside);
        }
    });

    onUnmounted(() => {
        if (typeof document !== 'undefined') {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    });

    // --- COMPUTED PROPERTIES ---
    const diasAberto = computed(() => {
        if (!lead.value?.criado_em) return 0;
        const dataCriacao = new Date(lead.value.criado_em);
        if (isNaN(dataCriacao.getTime())) return 0;
        return Math.floor((Date.now() - dataCriacao.getTime()) / (1000 * 3600 * 24));
    });

    const proximaAcao = computed(() => {
        if (proximoAgendamento.value) {
            const ag = proximoAgendamento.value;
            return {
                tipo: ag.categoria || lead.value?.tipo_proximo_contato || 'Contato',
                titulo: ag.titulo || `Contato com ${lead.value?.nome || 'Lead'}`,
                data: `${ag.data}T${(ag.hora_inicio || '00:00:00').substring(0, 5)}`,
                hora_fim: (ag.hora_fim || '').substring(0, 5),
                responsavel: lead.value?.vendedor_nome || 'Responsável não definido',
            };
        }

        if (!lead.value?.proximo_contato_em) return null;

        const dataAgendada = new Date(lead.value.proximo_contato_em);
        const agora = new Date();
        agora.setHours(0, 0, 0, 0);
        if (dataAgendada < agora) return null;

        return {
            tipo: lead.value.tipo_proximo_contato || 'Contato',
            titulo: lead.value.titulo_proximo_contato || `Contato com ${lead.value.nome || 'Lead'}`,
            data: lead.value.proximo_contato_em,
            hora_fim: '',
            responsavel: lead.value.vendedor_nome || 'Responsável não definido',
        };
    });

    // --- FETCH DATA ---
    const fetchData = async (silent = false) => {
        const leadId = currentLeadId.value;
        if (!leadId) return;

        if (!silent) {
            timelineActivities.value = [];
            listaDeArquivos.value = [];
            const cachedLead = allLeads.value?.find(l => String(l.id) === leadId);
            if (cachedLead) {
                lead.value = { ...cachedLead };
                loading.value = false;
            } else {
                loading.value = true;
                lead.value = null;
            }
        }

        const isValidId = leadId && leadId.length >= 10 && /^[0-9a-fA-Z-]{10,50}$/.test(leadId.replace(/[^0-9a-fA-Z-]/g, ''));
        if (!isValidId) {
            console.error('[ERRO] ID do lead inválido:', leadId);
            if (!silent) loading.value = false;
            return;
        }

        try {
            await waitForProfile();
            const today = new Date().toISOString().split('T')[0];

            const performFetch = async (retryCount = 0): Promise<any> => {
                try {
                    const safeFetch = async (promise: any) => {
                        try { return await promise; } catch (e) { return { error: e }; }
                    };

                    const [leadRes, agRes, timelineRes]: any = await Promise.all([
                        safeFetch(supabase.from('ag_leads').select('*, vendedor:vendedor_id(id, nome)').eq('id', leadId).maybeSingle()),
                        safeFetch(supabase.from('ag_agendamentos').select('data, hora_inicio, hora_fim, titulo, categoria').eq('lead_id', leadId).eq('cancelado', false).gte('data', today).order('data').order('hora_inicio').limit(1)),
                        safeFetch((supabase.rpc as any)('get_lead_timeline', { lead_id_param: leadId }))
                    ]);

                    const hasLead = !!leadRes.data;

                    if ((!hasLead || leadRes.error || timelineRes.error) && retryCount < 2) {
                        const errMsgLead = leadRes.error?.message?.toLowerCase() || '';
                        const errMsgTime = timelineRes.error?.message?.toLowerCase() || '';
                        const isNetworkError = errMsgLead.includes('fetch') || errMsgTime.includes('fetch') ||
                            errMsgLead.includes('network') || errMsgTime.includes('network') ||
                            errMsgLead.includes('abort') || errMsgTime.includes('abort');

                        if (!hasLead || isNetworkError) {
                            console.warn(`[360] Lead/Timeline falhou (Tentativa ${retryCount + 1}). Retentando...`);
                            await new Promise(resolve => setTimeout(resolve, 600));
                            return performFetch(retryCount + 1);
                        }
                    }

                    return { leadRes, agRes, timelineRes };
                } catch (err: any) {
                    if (retryCount < 2) {
                        console.warn(`[360] Exceção no fetch (Tentativa ${retryCount + 1}). Retentando...`);
                        await new Promise(resolve => setTimeout(resolve, 600));
                        return performFetch(retryCount + 1);
                    }
                    return { error: err };
                }
            };

            const { leadRes, agRes, timelineRes, error: fetchErr } = await performFetch();

            if (fetchErr) throw fetchErr;
            if (leadRes?.error) throw leadRes.error;
            if (timelineRes?.error) console.error('[Timeline Error]', timelineRes.error);

            const leadData = leadRes.data;
            if (leadData) {
                const vendedorInfo = Array.isArray(leadData.vendedor) ? leadData.vendedor[0] : leadData.vendedor;
                lead.value = {
                    ...leadData,
                    vendedor_nome: vendedorInfo?.nome || leadData.vendedor_nome || 'Livre'
                };

                timelineActivities.value = (timelineRes.data as any[]) || [];
                proximoAgendamento.value = (agRes.data as any[])?.[0] || null;

                if (timelineActivities.value.length === 0) {
                    setTimeout(async () => {
                        const { data } = await (supabase.rpc as any)('get_lead_timeline', { lead_id_param: leadId });
                        if (data && data.length > 0) {
                            console.log('🔄 Timeline resgatada via Smart Sync.');
                            timelineActivities.value = data;
                        }
                    }, 900);
                }

                carregarArquivosDoLead(leadId);
            } else {
                console.warn(`[360] Lead ${leadId} não encontrado após retentativas.`);
            }
        } catch (error: any) {
            console.error('[FALHA CRÍTICA] Erro no carregamento:', error.message);
        } finally {
            if (!silent) {
                loading.value = false;
            }
        }
    };

    // --- REALTIME ---
    let leadChannel: any = null;

    const subscribeToLeadChanges = () => {
        const leadId = currentLeadId.value;
        if (!leadId) return;

        if (leadChannel) {
            supabase.removeChannel(leadChannel);
            leadChannel = null;
        }

        console.log(`🔌 Realtime: Monitorando Lead ${leadId}...`);

        leadChannel = supabase
            .channel(`lead-detail-${leadId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ag_leads', filter: `id=eq.${leadId}` }, () => fetchData(true))
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ag_labels', filter: `lead_id=eq.${leadId}` }, () => fetchData(true))
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ag_notas_internas', filter: `lead_id=eq.${leadId}` }, () => fetchData(true))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ag_tarefas', filter: `lead_id=eq.${leadId}` }, () => fetchData(true))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'attachments', filter: `lead_id=eq.${leadId}` }, () => {
                carregarArquivosDoLead(leadId);
                fetchData(true);
            })
            .subscribe();
    };

    // --- ACTIONS ---
    const saveQuickNote = async (content: string) => {
        try {
            if (!profile.value?.id) {
                alert('Sessão expirada ou profissional não identificado.');
                return;
            }

            const { error } = await (supabase.from('ag_notas_internas') as any)
                .insert({ lead_id: currentLeadId.value, profissional_id: profile.value.id, conteudo: content });

            if (error) throw error;
            await fetchData();
        } catch (error: any) {
            console.error('[ERRO AO SALVAR NOTA]', error.message);
            alert('Não foi possível salvar a nota no banco de dados.');
        }
    };

    const handleSaveTask = async (taskData: any) => {
        try {
            if (!profile.value?.id) {
                notifyError('Sessão expirada. Faça login novamente.');
                return;
            }

            const { error } = await (supabase.from('ag_tarefas') as any)
                .insert({
                    lead_id: currentLeadId.value,
                    titulo: taskData.title,
                    descricao: taskData.description,
                    data_vencimento: taskData.dueDate,
                    profissional_id: taskData.assigneeId,
                    criado_por: profile.value.id
                });

            if (error) throw error;

            isTaskModalOpen.value = false;
            notifySuccess('Tarefa criada com sucesso!');
            await fetchData();
        } catch (err: any) {
            console.error('[ERRO AO SALVAR TAREFA]', err.message);
            notifyError('Erro ao criar tarefa. Verifique as permissões do banco de dados.');
        }
    };

    const syncSchedule = async (leadId: string, newDate: string | null) => {
        try {
            const today = new Date().toISOString().split('T')[0];

            const { data: existing, error: fetchError } = await (supabase
                .from('ag_agendamentos') as any)
                .select('id, data, hora_inicio')
                .eq('lead_id', leadId)
                .eq('status', 'pendente')
                .gte('data', today)
                .maybeSingle();

            if (fetchError) throw fetchError;

            if (newDate) {
                const dateObj = new Date(newDate);
                const yyyy = dateObj.getFullYear();
                const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
                const dd = String(dateObj.getDate()).padStart(2, '0');
                const dateStr = `${yyyy}-${mm}-${dd}`;

                const hh = String(dateObj.getHours()).padStart(2, '0');
                const min = String(dateObj.getMinutes()).padStart(2, '0');
                const ss = String(dateObj.getSeconds()).padStart(2, '0');
                const timeStr = `${hh}:${min}:${ss}`;

                if (existing) {
                    if (existing.data !== dateStr || existing.hora_inicio !== timeStr) {
                        await (supabase.from('ag_agendamentos') as any).update({ data: dateStr, hora_inicio: timeStr }).eq('id', existing.id);
                    }
                } else {
                    await (supabase.from('ag_agendamentos') as any).insert({
                        lead_id: leadId,
                        cliente_id: null,
                        profissional_id: profile.value?.id,
                        data: dateStr,
                        hora_inicio: timeStr,
                        titulo: `Contato: ${lead.value?.nome || 'Lead'}`,
                        descricao: `Agendamento sincronizado via edição de perfil.`,
                        categoria: 'contato'
                    });
                }
            } else if (existing) {
                await (supabase.from('ag_agendamentos') as any).delete().eq('id', existing.id);
            }
        } catch (err: any) {
            console.warn('[SYNC SCHEDULE] Erro ao sincronizar agendamento:', err.message);
        }
    };

    const handleSave = async (formData: Record<string, any>) => {
        try {
            const basePayload = {
                nome: formData.nome,
                email: formData.email,
                telefone: formData.telefone,
                temperatura: formData.temperatura,
                empresa: formData.empresa,
                origem: formData.origem,
                score: formData.score,
                notas: formData.notas || null,
                interesse: formData.interesse,
                valor_estimado: formData.valor_estimado ?? null,
                setor_atuacao: formData.setor_atuacao || null,
                principal_desafio: formData.principal_desafio || null,
                produtos_interesse: Array.isArray(formData.produtos_interesse)
                    ? formData.produtos_interesse
                    : (formData.produtos_interesse || '').split(',').map((t: string) => t.trim()).filter(Boolean),
            };

            const { error: baseError } = await (supabase.from('ag_leads') as any).update(basePayload).eq('id', currentLeadId.value);
            if (baseError) throw baseError;

            const newPayload = {
                cargo: formData.cargo || null,
                tags: Array.isArray(formData.tags) ? formData.tags : (formData.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
                proximo_contato_em: formData.proximo_contato_em || null,
                linkedin_url: formData.linkedin_url || null,
                facebook_url: formData.facebook_url || null,
                instagram_url: formData.instagram_url || null,
                website_url: formData.website_url || null,
                notas_perfil: formData.notas_perfil || null,
            };

            const { error: newError } = await (supabase.from('ag_leads') as any).update(newPayload).eq('id', currentLeadId.value);

            if (newError) {
                console.warn('[EDIT] Alguns campos extras não foram salvos:', newError.message);
            }

            notifySuccess('Lead atualizado com sucesso!');

            // DISPARADOR N8N: Lead Editado / Mudança de Status
            triggerN8NWebhook('lead_status_changed', formData, lead.value)

            isEditModalOpen.value = false;
            await syncSchedule(currentLeadId.value, formData.proximo_contato_em);
            await fetchData();
        } catch (err: any) {
            console.error('[ERRO AO SALVAR LEAD]', err.message);
            if (err.message?.includes('unique') || err.message?.includes('duplicate key')) {
                notifyError('Telefone ou e-mail já pertence a outro lead.');
            } else {
                notifyError(`Erro ao salvar: ${err.message}`);
            }
        }
    };

    const updateLeadStatus = async (statusId: string) => {
        try {
            // BUSCA ESTADO ANTERIOR PARA O N8N
            const { data: oldLead } = await supabase
                .from('ag_leads')
                .select('*')
                .eq('id', currentLeadId.value)
                .single()

            const { error } = await (supabase.from('ag_leads') as any).update({ status: statusId }).eq('id', currentLeadId.value);
            if (error) throw error;

            if (lead.value) lead.value.status = statusId;
            const label = leadStatuses.value.find(s => s.id === statusId)?.display_name || statusId;
            console.log(`[STATUS] Lead atualizado para: "${label}" (id: ${statusId})`);

            // DISPARADOR N8N: Status mudou
            // Buscamos o dado atualizado para enviar o payload completo
            const { data: currentLead } = await supabase
                .from('ag_leads')
                .select('*')
                .eq('id', currentLeadId.value)
                .single()

            triggerN8NWebhook('lead_status_changed', currentLead, oldLead)
        } catch (err: any) {
            console.error('[ERRO AO ATUALIZAR STATUS]', err.message);
            alert(`Não foi possível atualizar o estágio: ${err.message}`);
        } finally {
            showStageMenu.value = false;
        }
    };

    const handleScheduleSave = async (resultado: any) => {
        if (resultado) {
            if (resultado.data && resultado.hora_inicio) {
                const fullDateStr = `${resultado.data}T${resultado.hora_inicio.substring(0, 5)}`;

                const { error } = await (supabase.from('ag_leads') as any).update({ proximo_contato_em: fullDateStr }).eq('id', currentLeadId.value);

                if (!error && lead.value) {
                    lead.value.proximo_contato_em = fullDateStr;
                }

                proximoAgendamento.value = {
                    data: resultado.data,
                    hora_inicio: resultado.hora_inicio,
                    hora_fim: resultado.hora_fim || '',
                    titulo: resultado.titulo || `Contato com ${lead.value?.nome || 'Lead'}`,
                    categoria: resultado.categoria || 'contato',
                };
            }
            await fetchData();
        }
    };

    const openWhatsApp = () => {
        if (lead.value?.telefone) {
            const numeroLimpo = lead.value.telefone.replace(/\D/g, '');
            window.open(`https://wa.me/${numeroLimpo}`, '_blank');
        }
    };

    const loadGlobalProfissionais = async () => {
        const profs = await fetchProfissionais();
        if (profs) globalProfissionais.value = profs;
    };

    // Re-carrega dados ao mudar de lead
    watch(currentLeadId, () => {
        fetchData();
        subscribeToLeadChanges();
    });

    const cleanupRealtime = () => {
        if (leadChannel) {
            supabase.removeChannel(leadChannel);
        }
    }

    return {
        lead,
        loading,
        timelineActivities,
        listaDeArquivos,
        proximoAgendamento,
        globalProfissionais,
        diasAberto,
        proximaAcao,
        isCurrentStatus,
        showStageMenu,
        stageMenuRef,
        stageBtnRef,
        dropdownStyle,
        toggleStageMenu,
        handleClickOutside,
        processarUpload,
        iniciarDownload,
        confirmarExclusao,
        saveQuickNote,
        openWhatsApp,
        handleSaveTask,
        handleSave,
        handleScheduleSave,
        updateLeadStatus,
        fetchData,
        subscribeToLeadChanges,
        loadGlobalProfissionais,
        cleanupRealtime,
        isEditModalOpen,
        isScheduleModalOpen,
        isTaskModalOpen
    };

}
