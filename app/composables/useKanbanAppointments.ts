import { ref } from 'vue';
import { useSupabaseClient } from '#imports';
import { useAuth } from '~/composables/useAuth';
import { useNotification } from '~/composables/useNotification';
import { useAgendamentoStore } from '~/stores/agendamento';
import { useProfissionais } from '~/composables/useProfissionais';
import type { Ref } from 'vue';

export function useKanbanAppointments(allLeads: Ref<any[]>, fetchNextAppointments: () => Promise<void>) {
    const supabase = useSupabaseClient();
    const { profile } = useAuth();
    const { notifyWarning, notifyError, notifySuccess } = useNotification();
    const agendamentoStore = useAgendamentoStore();
    const { fetchClientes, fetchProfissionais } = useProfissionais();

    const globalState = ref({
        clientes: [] as any[],
        profissionais: [] as any[]
    });

    const appointmentModals = ref({
        new: {
            show: false,
            clienteId: null as number | null,
            leadId: null as string | null,
            leadName: '',
            description: '',
            profissionalId: null as number | null,
            profissionalNome: '',
            profissionalEspecialidade: ''
        },
        view: {
            show: false,
            clienteId: null as number | null,
            agendamento: null as any | null,
            profissionalNome: '',
            profissionalEspecialidade: ''
        },
        list: {
            show: false,
            clienteId: null as number | null,
            leadId: null as string | null,
            leadName: ''
        }
    });

    const showLocalToast = (message: string, type: 'success' | 'error' = 'success') => {
        if (type === 'success') notifySuccess(message);
        else notifyError(message);
    };

    const loadDependencies = async () => {
        const [c, p] = await Promise.all([fetchClientes(), fetchProfissionais()]);
        globalState.value.clientes = c;
        globalState.value.profissionais = p;

        if (!agendamentoStore.agendamentos.length && agendamentoStore.profissionalId) {
            await agendamentoStore.carregarAgendamentos();
        }
    };

    const handleOpenAppointmentModal = async (leadId: string, type: 'new' | 'view') => {
        const lead = allLeads.value.find(l => String(l.id) === String(leadId));
        if (!lead) return;

        const logadoId = profile.value?.id;
        let profissional = null;

        if (logadoId && type === 'new') {
            profissional = globalState.value.profissionais.find(p =>
                String(p.profile_id) === String(logadoId)
            );
        }

        if (!profissional) {
            const vendedorId = lead.vendedor_id;
            if (vendedorId) {
                profissional = globalState.value.profissionais.find(p =>
                    String(p.profile_id) === String(vendedorId)
                );
            }

            if (!profissional && lead.vendedor_nome && lead.vendedor_nome !== 'Não Atribuído') {
                const searchName = lead.vendedor_nome.toLowerCase();
                profissional = globalState.value.profissionais.find(p =>
                    p.nome.toLowerCase().includes(searchName) || searchName.includes(p.nome.toLowerCase())
                );
            }
        }

        if (!profissional && type === 'new') {
            notifyWarning(`Aviso: Selecione o responsável pelo atendimento manualmente no modal.`);
        }

        if (!lead.cliente_id) {
            const rawDigits = String(lead.telefone || lead.phone || '').replace(/\D/g, '');
            const searchName = (lead.nome || lead.leadName || '').trim();

            let foundClient: any = null;

            if (rawDigits.length >= 8) {
                const { data } = await supabase
                    .from('ag_clientes')
                    .select('id, nome')
                    .or(`telefone.ilike.%${rawDigits}%,cpf.eq.${rawDigits}`)
                    .maybeSingle();
                foundClient = data;
            }

            if (!foundClient && searchName.length > 3) {
                const { data } = await supabase
                    .from('ag_clientes')
                    .select('id, nome')
                    .ilike('nome', `%${searchName}%`)
                    .maybeSingle();
                foundClient = data;
            }

            if (foundClient) {
                lead.cliente_id = foundClient.id;

                await (supabase.from('ag_leads') as any)
                    .update({ cliente_id: foundClient.id })
                    .eq('id', String(lead.id));

                const storeLead = allLeads.value.find(l => String(l.id) === String(lead.id));
                if (storeLead) storeLead.cliente_id = foundClient.id;
            }
        }

        if (type === 'new') {
            let finalClienteId = lead.cliente_id;
            if (!finalClienteId) {
                try {
                    const { data: newClient, error: clientErr } = await (supabase
                        .from('ag_clientes') as any)
                        .insert({
                            nome: (lead as any).nome || (lead as any).leadName,
                            telefone: (lead as any).telefone || (lead as any).phone,
                            email: (lead as any).email || null
                        })
                        .select()
                        .single();

                    if (clientErr) throw clientErr;

                    if (newClient) {
                        finalClienteId = newClient.id;
                        await (supabase.from('ag_leads') as any)
                            .update({ cliente_id: finalClienteId })
                            .eq('id', (lead as any).id);

                        (lead as any).cliente_id = finalClienteId;
                        globalState.value.clientes = await fetchClientes();
                    }
                } catch (err: any) {
                    showLocalToast(`Erro ao processar cliente: ${err?.message || 'Erro desconhecido'}`, 'error');
                    return;
                }
            }

            appointmentModals.value.new = {
                show: true,
                clienteId: finalClienteId,
                leadId: String(lead.id),
                leadName: (lead as any).nome || (lead as any).leadName || '',
                description: (lead as any).notas || (lead as any).description || '',
                profissionalId: profissional?.profissional_id || null,
                profissionalNome: profissional?.nome || (lead as any).vendedor_nome || '',
                profissionalEspecialidade: profissional?.especialidade || ''
            };

            if (profissional?.profissional_id) {
                agendamentoStore.profissionalId = profissional.profissional_id;
                await agendamentoStore.carregarAgendamentos();
            }
        } else {
            appointmentModals.value.list = {
                show: true,
                clienteId: lead.cliente_id || null,
                leadId: String(lead.id),
                leadName: (lead as any).nome || (lead as any).leadName || ''
            };
        }
    };

    const onEditFromList = async (ag: any) => {
        appointmentModals.value.list.show = false;

        const profissional = globalState.value.profissionais.find(p =>
            String(p.profissional_id) === String(ag.profissional_id)
        );

        appointmentModals.value.view = {
            show: true,
            clienteId: ag.cliente_id,
            agendamento: ag,
            profissionalNome: profissional?.nome || '',
            profissionalEspecialidade: profissional?.especialidade || ''
        };
    };

    const onNewFromList = () => {
        const leadId = appointmentModals.value.list.clienteId;
        const lead = allLeads.value.find(l => l.cliente_id === leadId || l.id === String(leadId));

        appointmentModals.value.list.show = false;
        if (lead) {
            handleOpenAppointmentModal(String(lead.id), 'new');
        }
    };

    const onAppointmentSaved = async () => {
        await fetchNextAppointments();
        agendamentoStore.cacheAgendamentos = {};
        await agendamentoStore.carregarAgendamentos(true);
    };

    return {
        globalState,
        appointmentModals,
        loadDependencies,
        handleOpenAppointmentModal,
        onEditFromList,
        onNewFromList,
        onAppointmentSaved
    };
}
