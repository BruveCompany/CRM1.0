-- SCRIPT PARA POVOAR METAS E DADOS DE DESEMPENHO FICTÍCIOS
-- Este script cria metas aleatórias para todos os vendedores e simula leads convertidos

DO $$
DECLARE
    v_vendedor RECORD;
    v_mes_atual DATE := DATE_TRUNC('month', NOW())::DATE;
    v_meta INTEGER;
    v_valor NUMERIC;
BEGIN
    -- 1. Criar Metas para todos os vendedores existentes no mês atual
    FOR v_vendedor IN SELECT id FROM public.ag_profiles LOOP
        v_meta := floor(random() * (30 - 10 + 1) + 10); -- Meta entre 10 e 30 conversoes
        v_valor := floor(random() * (50000 - 10000 + 1) + 10000); -- Valor entre 10k e 50k
        
        INSERT INTO public.ag_metas_vendedores (vendedor_id, mes, meta_conversoes, meta_valor)
        VALUES (v_vendedor.id, v_mes_atual, v_meta, v_valor)
        ON CONFLICT (vendedor_id, mes) 
        DO UPDATE SET 
            meta_conversoes = EXCLUDED.meta_conversoes,
            meta_valor = EXCLUDED.meta_valor;
    END LOOP;

    -- 2. Simular Leads convertidos para preencher a barra de progresso
    -- Isso garante que tenhamos progresso real aparecendo no relatório
    -- Selecionamos alguns leads aleatórios e marcamos como convertido/qualificado
    UPDATE public.ag_leads
    SET status = 'convertido'
    WHERE id IN (
        SELECT id FROM public.ag_leads 
        ORDER BY random() 
        LIMIT (SELECT count(*) / 3 FROM public.ag_leads) -- Converte 1/3 dos leads totais
    );

    UPDATE public.ag_leads
    SET status = 'qualificado'
    WHERE id IN (
        SELECT id FROM public.ag_leads 
        WHERE status != 'convertido'
        ORDER BY random() 
        LIMIT (SELECT count(*) / 4 FROM public.ag_leads) -- Qualifica 1/4 dos restantes
    );

    RAISE NOTICE 'Dados fictícios de metas e leads gerados com sucesso para o mês de %', v_mes_atual;
END $$;
