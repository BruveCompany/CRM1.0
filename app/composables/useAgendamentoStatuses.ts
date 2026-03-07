import type { AgViewAgendamentoCompleto, Database } from '../../shared/types/database'

/**
 * ====== useAgendamentoStatuses.ts ======
 * Composable para gerenciar a tabela `ag_agendamento_statuses`.
 * Fornece:
 *   - Lista de todos os statuses disponíveis (ordenados por `ordem`)
 *   - Função para atualizar o `status_id` de um agendamento
 * ==========================================
 */

export interface AgendamentoStatus {
    id: string
    nome: string
    cor: string
    ordem: number
}

// Estado global reativo (singleton por SSR context)
const _statuses = useState<AgendamentoStatus[]>('ag-statuses', () => [])
const _loading = useState<boolean>('ag-statuses-loading', () => false)
const _loaded = useState<boolean>('ag-statuses-loaded', () => false)

export function useAgendamentoStatuses() {
    const supabase = useSupabaseClient<Database>()
    const { notifyError, notifySuccess } = useNotification()

    /**
     * Busca todos os statuses da tabela `ag_agendamento_statuses`, ordenados por `ordem`.
     * O resultado é cacheado globalmente — só busca uma vez por sessão.
     */
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
            console.log('✅ Statuses carregados:', _statuses.value.length)
            return _statuses.value
        } finally {
            _loading.value = false
        }
    }

    /**
     * Atualiza o `status_id` de um agendamento específico.
     *
     * ⚠️ CAUSA PROVÁVEL DE FALHA SILENCIOSA:
     * A tabela `ag_agendamentos` pode ter uma política de RLS (Row Level Security)
     * que bloqueia o UPDATE silenciosamente (sem lançar exceção JS, apenas retornando
     * error.code === "PGRST116" ou data vazia). Veja as instruções de RLS no final
     * deste arquivo.
     *
     * Esta versão:
     * 1. Usa `.select()` para confirmar que a linha foi realmente modificada no banco
     * 2. Verifica `error` antes de qualquer lógica de sucesso
     * 3. Verifica se `data` retornou algum registro (prova de que a RLS permitiu)
     * 4. Só exibe "sucesso" se tudo confirmar
     *
     * @param agendamentoId - ID numérico do agendamento
     * @param novoStatusId  - UUID do novo status
     * @returns true se o banco confirmou a atualização, false se houve erro ou RLS bloqueio
     */
    async function atualizarStatusAgendamento(
        agendamentoId: number,
        novoStatusId: string
    ): Promise<boolean> {
        try {
            console.log(`✏️ Atualizando status do agendamento #${agendamentoId} → ${novoStatusId}`)

            // ─────────────────────────────────────────────────────────────
            // PASSO 1: Executa o UPDATE com .select() para confirmar no banco
            // .select() faz o Supabase retornar a linha atualizada.
            // Se a RLS bloquear, `data` virá vazio ([] ou null) mesmo sem `error`.
            // ─────────────────────────────────────────────────────────────
            const { data, error } = await supabase
                .from('ag_agendamentos')
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .update({ status_id: novoStatusId } as unknown as never)
                .eq('id', agendamentoId)
                .select('id, status_id') // Solicita retorno dos campos atualizados

            // ─────────────────────────────────────────────────────────────
            // PASSO 2: Verifica se o Supabase retornou um erro explícito
            // ─────────────────────────────────────────────────────────────
            if (error) {
                console.error('❌ Erro do Supabase ao atualizar status:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                })
                notifyError(`Falha ao atualizar o status. Verifique sua conexão ou permissões. (${error.code})`)
                return false
            }

            // ─────────────────────────────────────────────────────────────
            // PASSO 3: Verifica se a linha foi realmente modificada.
            // Se `data` vier vazio, a RLS silenciou a operação — bloqueio sem erro JS.
            // ─────────────────────────────────────────────────────────────
            if (!data || data.length === 0) {
                console.error(
                    '❌ Atualização bloqueada silenciosamente (provável RLS).',
                    'O banco não retornou a linha atualizada.',
                    { agendamentoId, novoStatusId }
                )
                notifyError('Sem permissão para alterar este agendamento. Verifique as políticas de acesso.')
                return false
            }

            // ─────────────────────────────────────────────────────────────
            // PASSO 4: Sucesso confirmado — a linha existe no retorno do banco
            // ─────────────────────────────────────────────────────────────
            console.log('✅ Status atualizado com sucesso no banco:', data[0])
            notifySuccess('Status atualizado com sucesso!')

            // ─────────────────────────────────────────────────────────────
            // PASSO 5: Lógica de Notificação Inteligente (WhatsApp/Email)
            // ─────────────────────────────────────────────────────────────
            const statusObj = _statuses.value.find(s => s.id === novoStatusId)
            const statusName = statusObj?.nome.toLowerCase() || ''

            if (['pendente', 'confirmado'].includes(statusName)) {
                console.log(`📣 Novo status convida a notificação: ${statusName}`)

                // Busca dados completos (Cliente + Profissional) para a notificação
                const { data: fullAg, error: viewError } = await supabase
                    .from('ag_view_agendamentos_completo')
                    .select('*')
                    .eq('id', agendamentoId)
                    .single()

                if (viewError) {
                    console.warn('⚠️ Falha ao buscar dados completos para notificação:', viewError.message)
                } else if (fullAg) {
                    triggerNotificationForAppointment(fullAg as AgViewAgendamentoCompleto, statusName)
                }
            }

            return true

        } catch (err) {
            console.error('❌ Erro inesperado ao atualizar status:', err)
            notifyError('Erro inesperado ao atualizar status')
            return false
        }
    }

    /**
     * Dispara o fluxo de notificação para um agendamento.
     * Ativa o modal reativo de confirmação.
     */
    function triggerNotificationForAppointment(agendamento: AgViewAgendamentoCompleto, statusName: string) {
        console.log('🔔 [Notificação] Preparando aviso para:', agendamento.cliente_nome)
        console.log(`💬 Sugestão de mensagem para status: ${statusName.toUpperCase()}`)

        // Ativa o modal reativo (compartilhado via confirm-notification-modal.vue)
        const isOpen = useState<boolean>('notification-modal-open')
        const notificationAg = useState<AgViewAgendamentoCompleto | null>('notification-agendamento')
        const notificationStatus = useState<string>('notification-status-name')

        notificationAg.value = agendamento
        notificationStatus.value = statusName
        isOpen.value = true
    }

    /*
     * ═══════════════════════════════════════════════════════════════════
     *  INSTRUÇÕES PARA CORRIGIR A POLÍTICA DE RLS NO SUPABASE
     * ═══════════════════════════════════════════════════════════════════
     *
     *  Se a atualização falhar silenciosamente (data vazio, sem error),
     *  a causa é uma política de RLS ausente ou incorreta para UPDATE.
     *
     *  Para corrigir, acesse o Supabase Dashboard e execute no SQL Editor:
     *
     *  -- 1. Permite que o usuário atualize apenas seus próprios agendamentos
     *  CREATE POLICY "Usuário pode atualizar seus agendamentos"
     *  ON ag_agendamentos
     *  FOR UPDATE
     *  TO authenticated
     *  USING (auth.uid() = user_id)        -- quais linhas o usuário PODE ver para atualizar
     *  WITH CHECK (auth.uid() = user_id);  -- quais linhas o usuário PODE escrever após o update
     *
     *  -- 2. Se administradores precisam atualizar qualquer agendamento:
     *  CREATE POLICY "Admin pode atualizar qualquer agendamento"
     *  ON ag_agendamentos
     *  FOR UPDATE
     *  TO authenticated
     *  USING (
     *    EXISTS (
     *      SELECT 1 FROM profiles
     *      WHERE profiles.user_id = auth.uid()
     *      AND profiles.role = 'admin'
     *    )
     *  )
     *  WITH CHECK (true);
     *
     *  -- 3. Verifique quais políticas existem atualmente:
     *  SELECT policyname, cmd, qual, with_check
     *  FROM pg_policies
     *  WHERE tablename = 'ag_agendamentos';
     * ═══════════════════════════════════════════════════════════════════
     */

    return {
        statuses: _statuses,
        loadingStatuses: _loading,
        fetchStatuses,
        atualizarStatusAgendamento
    }
}
