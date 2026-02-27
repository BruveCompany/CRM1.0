
-- Função para buscar dados agregados do funil de vendas (leads por status)
CREATE OR REPLACE FUNCTION get_funil_vendas_dashboard(user_id_param uuid)
RETURNS json AS $$
DECLARE
    user_role text;
    user_p_id bigint;
    target_prof_id bigint;
    results json;
BEGIN
    -- 1. Buscar o perfil e o papel do usuário
    SELECT role, id INTO user_role, user_p_id 
    FROM ag_profiles 
    WHERE user_id = user_id_param;

    IF user_role = 'admin' THEN
        -- Administrador: Vê dados de toda a empresa
        SELECT json_agg(t) INTO results
        FROM (
            SELECT 
                s.display_name as status_nome,
                COUNT(l.id) as lead_count,
                COALESCE(s.color_bg, '#4f46e5') as cor
            FROM ag_lead_statuses s
            LEFT JOIN ag_leads l ON l.status = s.id
            GROUP BY s.id, s.display_name, s.color_bg, s.order_index
            ORDER BY s.order_index ASC
        ) t;
    ELSE
        -- Vendedor: Vê apenas seus próprios leads
        -- Conforme o prompt, buscamos o ID do profissional primeiro
        SELECT id INTO target_prof_id 
        FROM ag_profissionais 
        WHERE profile_id = user_p_id;

        SELECT json_agg(t) INTO results
        FROM (
            SELECT 
                s.display_name as status_nome,
                COUNT(l.id) as lead_count,
                COALESCE(s.color_bg, '#4f46e5') as cor
            FROM ag_lead_statuses s
            -- Filtramos por profissional_id (ou vendedor_id conforme a regra de negócio local)
            -- Usaremos vendedor_id que é o ID do ag_profiles conforme visto no código do dashboard/leads
            LEFT JOIN ag_leads l ON (l.status = s.id AND l.vendedor_id = user_p_id)
            GROUP BY s.id, s.display_name, s.color_bg, s.order_index
            ORDER BY s.order_index ASC
        ) t;
    END IF;

    RETURN COALESCE(results, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
