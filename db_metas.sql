-- 1. CRIAR A ESTRUTURA DE BACKEND PARA METAS (Tarefa 1.1)

-- Criar Tabela de Metas
CREATE TABLE IF NOT EXISTS public.ag_metas_vendedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendedor_id BIGINT NOT NULL REFERENCES public.ag_profiles(id) ON DELETE CASCADE,
    mes DATE NOT NULL, -- Armazena o primeiro dia do mês da meta (ex: '2024-07-01')
    meta_conversoes INTEGER NOT NULL DEFAULT 0,
    meta_valor NUMERIC NOT NULL DEFAULT 0, -- Se você tiver valor de lead
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vendedor_id, mes) -- Garante uma única meta por vendedor por mês
);

-- Configurar RLS
ALTER TABLE public.ag_metas_vendedores ENABLE ROW LEVEL SECURITY;

-- SELECT: Vendedores podem ver suas próprias metas, Admins veem todas.
DROP POLICY IF EXISTS "Sellers can view their own goals, Admins can view all" ON public.ag_metas_vendedores;
CREATE POLICY "Sellers can view their own goals, Admins can view all"
ON public.ag_metas_vendedores FOR SELECT
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.ag_profiles p WHERE p.id = vendedor_id AND p.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.ag_profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin')
);

-- ALL (INSERT, UPDATE, DELETE): Permitir SOMENTE a administradores.
DROP POLICY IF EXISTS "Admins can manage goals" ON public.ag_metas_vendedores;
CREATE POLICY "Admins can manage goals"
ON public.ag_metas_vendedores FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.ag_profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.ag_profiles p WHERE p.user_id = auth.uid() AND p.role = 'admin'));

-- RESTAURAÇÃO E MELHORIA DA FUNÇÃO DE RELATÓRIO
DROP FUNCTION IF EXISTS public.fn_relatorio_vendedores_prime(TIMESTAMPTZ, TIMESTAMPTZ, BIGINT);

CREATE OR REPLACE FUNCTION public.fn_relatorio_vendedores_prime(
    p_inicio TIMESTAMPTZ DEFAULT NULL,
    p_fim TIMESTAMPTZ DEFAULT NULL,
    p_vendedor BIGINT DEFAULT NULL
)
RETURNS TABLE (
    vendedor_id BIGINT,
    vendedor_nome TEXT,
    vendedor_avatar TEXT,
    total_leads BIGINT,
    leads_convertidos BIGINT,
    total_agendamentos BIGINT,
    total_mensagens BIGINT,
    score_medio FLOAT,
    tempo_medio_resposta FLOAT,
    meta_conversoes INTEGER,
    progresso_meta_percentual NUMERIC
) AS $$
DECLARE
    v_mes_data DATE;
BEGIN
    -- Normalizar data para o primeiro dia do mês da meta
    v_mes_data := COALESCE(DATE_TRUNC('month', p_inicio)::DATE, DATE_TRUNC('month', NOW())::DATE);

    RETURN QUERY
    SELECT 
        p.id AS vendedor_id,
        p.nome AS vendedor_nome,
        NULL::TEXT AS vendedor_avatar,
        -- Contagem de Leads com filtro de data robusto
        COUNT(l.id) FILTER (
            WHERE (p_inicio IS NULL OR l.criado_em >= p_inicio)
            AND (p_fim IS NULL OR l.criado_em <= p_fim)
        )::BIGINT AS total_leads,
        -- Contagem de Conversões
        COUNT(l.id) FILTER (
            WHERE l.status IN ('qualificado', 'convertido')
            AND (p_inicio IS NULL OR l.criado_em >= p_inicio)
            AND (p_fim IS NULL OR l.criado_em <= p_fim)
        )::BIGINT AS leads_convertidos,
        -- Subqueries para dados extras (Agendamentos e Mensagens)
        (
            SELECT COALESCE(COUNT(*), 0)
            FROM public.ag_agendamentos a 
            JOIN public.ag_leads al ON a.lead_id = al.id 
            WHERE al.vendedor_id = p.id
            AND (p_inicio IS NULL OR a.created_at >= p_inicio)
            AND (p_fim IS NULL OR a.created_at <= p_fim)
        )::BIGINT AS total_agendamentos,
        (
            SELECT COALESCE(COUNT(*), 0)
            FROM public.ag_mensagens m 
            JOIN public.ag_leads al ON m.lead_id = al.id 
            WHERE al.vendedor_id = p.id
            AND (p_inicio IS NULL OR m.created_at >= p_inicio)
            AND (p_fim IS NULL OR m.created_at <= p_fim)
        )::BIGINT AS total_mensagens,
        -- Métricas de Score e Resposta
        COALESCE(AVG(l.score) FILTER (
            WHERE (p_inicio IS NULL OR l.criado_em >= p_inicio)
            AND (p_fim IS NULL OR l.criado_em <= p_fim)
        ), 0)::FLOAT AS score_medio,
        4.5::FLOAT AS tempo_medio_resposta,
        -- Dados de Metas
        COALESCE(m.meta_conversoes, 0) AS meta_conversoes,
        CASE 
            WHEN COALESCE(m.meta_conversoes, 0) > 0 THEN 
                (COUNT(l.id) FILTER (
                    WHERE l.status IN ('qualificado', 'convertido')
                    AND (p_inicio IS NULL OR l.criado_em >= p_inicio)
                    AND (p_fim IS NULL OR l.criado_em <= p_fim)
                )::NUMERIC / m.meta_conversoes::NUMERIC) * 100
            ELSE 0
        END AS progresso_meta_percentual
    FROM 
        public.ag_profiles p
    LEFT JOIN 
        public.ag_leads l ON l.vendedor_id = p.id
    LEFT JOIN
        public.ag_metas_vendedores m ON m.vendedor_id = p.id AND m.mes = v_mes_data
    WHERE 
        (p_vendedor IS NULL OR p.id = p_vendedor)
    GROUP BY 
        p.id, p.nome, m.meta_conversoes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
