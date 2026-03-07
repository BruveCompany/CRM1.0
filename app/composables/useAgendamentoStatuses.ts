import type { AgViewAgendamentoCompleto, Database } from '../../shared/types/database'

/**
 * ====== useAgendamentoStatuses.ts ======
 * Composable para gerenciar a tabela `ag_agendamento_statuses`.
 * ==========================================
 */

export interface AgendamentoStatus {
    id: string
    nome: string
    cor: string
    ordem: number
}

// Estado global reativo
const _statuses = useState<AgendamentoStatus[]>('ag-statuses', () => [])
const _loading = useState<boolean>('ag-statuses-loading', () => false)
const _loaded = useState<boolean>('ag-statuses-loaded', () => false)

export function useAgendamentoStatuses() {
    const supabase = useSupabaseClient<Database>()
    const { notifyError, notifySuccess } = useNotification()
    const { triggerN8NWebhook } = useN8N()

    async function fetchStatuses(force = false): Promise<AgendamentoStatus[]> {
        if (_loaded.value && !force) return _statuses.value

        _loading.value = true
        try {
            const { data, error } = await supabase
                .from('ag_agendamento_statuses')
                .select('id, nome, cor, ordem')
                .order('ordem', { ascending: true })

            if (error) {
                console.error('❌ Erro ao buscar statuses de agendamento:', error)
                return []
            }

            _statuses.value = (data || []) as AgendamentoStatus[]
            _loaded.value = true
            return _statuses.value
        } finally {
            _loading.value = false
        }
    }

    async function atualizarStatusAgendamento(
        agendamentoId: number,
        novoStatusId: string
    ): Promise<boolean> {
        try {
            console.log(`✏️ Atualizando status do agendamento #${agendamentoId} → ${novoStatusId}`)

            // BUSCA ESTADO ANTERIOR PARA O N8N
            const { data: oldAgendamento } = await supabase
                .from('ag_agendamentos')
                .select('*')
                .eq('id', agendamentoId)
                .single()

            const { data, error } = await supabase
                .from('ag_agendamentos')
                .update({ status_id: novoStatusId } as unknown as never)
                .eq('id', agendamentoId)
                .select('id, status_id')

            if (error) {
                console.error('❌ Erro do Supabase ao atualizar status:', error)
                notifyError(`Falha ao atualizar o status. (${error.code})`)
                return false
            }

            if (!data || data.length === 0) {
                notifyError('Sem permissão para alterar este agendamento.')
                return false
            }

            notifySuccess('Status atualizado com sucesso!')

            // Lógica de Notificação e triggers
            const statusObj = _statuses.value.find(s => s.id === novoStatusId)
            const statusName = statusObj?.nome.toLowerCase() || ''

            if (['pendente', 'confirmado'].includes(statusName)) {
                const { data: fullAg, error: viewError } = await supabase
                    .from('ag_view_agendamentos_completo')
                    .select('*')
                    .eq('id', agendamentoId)
                    .single()

                if (fullAg) {
                    triggerNotificationForAppointment(fullAg as AgViewAgendamentoCompleto, statusName)
                    triggerN8NWebhook('appointment_status_changed', fullAg, oldAgendamento)
                }
            } else {
                const { data: currentAg } = await supabase
                    .from('ag_agendamentos')
                    .select('*')
                    .eq('id', agendamentoId)
                    .single()

                triggerN8NWebhook('appointment_status_changed', currentAg, oldAgendamento)
            }

            return true
        } catch (err) {
            console.error('❌ Erro inesperado ao atualizar status:', err)
            notifyError('Erro inesperado ao atualizar status')
            return false
        }
    }

    function triggerNotificationForAppointment(agendamento: AgViewAgendamentoCompleto, statusName: string) {
        const isOpen = useState<boolean>('notification-modal-open')
        const notificationAg = useState<AgViewAgendamentoCompleto | null>('notification-agendamento')
        const notificationStatus = useState<string>('notification-status-name')

        notificationAg.value = agendamento
        notificationStatus.value = statusName
        isOpen.value = true
    }

    return {
        statuses: _statuses,
        loadingStatuses: _loading,
        fetchStatuses,
        atualizarStatusAgendamento
    }
}
