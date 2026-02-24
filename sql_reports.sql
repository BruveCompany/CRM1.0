-- 1. VIEW para relatórios de vendedores
-- Esta view fornece um resumo rápido do desempenho de cada vendedor
CREATE OR REPLACE VIEW public.view_relatorio_vendedores AS
SELECT 
    p.id AS vendedor_id,
    p.nome AS vendedor_nome,
    COUNT(l.id)::BIGINT AS total_leads,
    COUNT(l.id) FILTER (WHERE l.status IN ('qualificado', 'convertido'))::BIGINT AS leads_convertidos,
    CASE 
        WHEN COUNT(l.id) > 0 THEN (COUNT(l.id) FILTER (WHERE l.status IN ('qualificado', 'convertido'))::FLOAT / COUNT(l.id)) * 100
        ELSE 0::FLOAT 
    END AS taxa_conversao,
    COALESCE(AVG(l.score), 0)::FLOAT AS score_medio,
    (SELECT COUNT(*) FROM public.ag_agendamentos a JOIN public.ag_leads al ON a.lead_id = al.id WHERE al.vendedor_id = p.id)::BIGINT AS total_agendamentos,
    (SELECT COUNT(*) FROM public.ag_agendamentos a JOIN public.ag_leads al ON a.lead_id = al.id WHERE al.vendedor_id = p.id AND a.status = 'completed')::BIGINT AS agendamentos_concluidos,
    (SELECT COUNT(*) FROM public.ag_mensagens m JOIN public.ag_leads al ON m.lead_id = al.id WHERE al.vendedor_id = p.id)::BIGINT AS total_mensagens
FROM 
    public.ag_profiles p
LEFT JOIN 
    public.ag_leads l ON l.vendedor_id = p.id
GROUP BY 
    p.id, p.nome;

-- 2. FUNÇÃO RPC para relatórios com filtros dinâmicos
-- Permite filtrar por período de criação e por vendedor
CREATE OR REPLACE FUNCTION public.fn_relatorio_vendedores(
    periodo_inicio TIMESTAMPTZ DEFAULT NULL,
    periodo_fim TIMESTAMPTZ DEFAULT NULL,
    vendedor_filtro BIGINT DEFAULT NULL
)
RETURNS TABLE (
    vendedor_id BIGINT,
    vendedor_nome TEXT,
    total_leads BIGINT,
    leads_convertidos BIGINT,
    taxa_conversao FLOAT,
    score_medio FLOAT,
    total_agendamentos BIGINT,
    agendamentos_concluidos BIGINT,
    total_mensagens BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS vendedor_id,
        p.nome AS vendedor_nome,
        COUNT(l.id)::BIGINT AS total_leads,
        COUNT(l.id) FILTER (WHERE l.status IN ('qualificado', 'convertido'))::BIGINT AS leads_convertidos,
        CASE 
            WHEN COUNT(l.id) > 0 THEN (COUNT(l.id) FILTER (WHERE l.status IN ('qualificado', 'convertido'))::FLOAT / COUNT(l.id)) * 100
            ELSE 0::FLOAT
        END AS taxa_conversao,
        COALESCE(AVG(l.score), 0)::FLOAT AS score_medio,
        (
            SELECT COUNT(*) 
            FROM public.ag_agendamentos a 
            JOIN public.ag_leads al ON a.lead_id = al.id 
            WHERE al.vendedor_id = p.id
            AND (periodo_inicio IS NULL OR a.created_at >= periodo_inicio)
            AND (periodo_fim IS NULL OR a.created_at <= periodo_fim)
        )::BIGINT AS total_agendamentos,
        (
            SELECT COUNT(*) 
            FROM public.ag_agendamentos a 
            JOIN public.ag_leads al ON a.lead_id = al.id 
            WHERE al.vendedor_id = p.id 
            AND a.status = 'completed'
            AND (periodo_inicio IS NULL OR a.created_at >= periodo_inicio)
            AND (periodo_fim IS NULL OR a.created_at <= periodo_fim)
        )::BIGINT AS agendamentos_concluidos,
        (
            SELECT COUNT(*) 
            FROM public.ag_mensagens m 
            JOIN public.ag_leads al ON m.lead_id = al.id 
            WHERE al.vendedor_id = p.id
            AND (periodo_inicio IS NULL OR m.created_at >= periodo_inicio)
            AND (periodo_fim IS NULL OR m.created_at <= periodo_fim)
        )::BIGINT AS total_mensagens
    FROM 
        public.ag_profiles p
    LEFT JOIN 
        public.ag_leads l ON l.vendedor_id = p.id
    WHERE 
        (vendedor_filtro IS NULL OR p.id = vendedor_filtro)
        AND (periodo_inicio IS NULL OR l.criado_em >= periodo_inicio)
        AND (periodo_fim IS NULL OR l.criado_em <= periodo_fim)
    GROUP BY 
        p.id, p.nome;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
