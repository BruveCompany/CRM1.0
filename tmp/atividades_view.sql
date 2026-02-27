
-- View para consolidar atividades recentes de diferentes fontes (Notas e Agendamentos)
CREATE OR REPLACE VIEW view_atividades_recentes AS
SELECT 
    n.id::text || '-nota' as unique_id,
    'nota' as tipo_atividade, 
    n.conteudo as descricao, 
    n.criado_em as data_criacao, 
    n.lead_id, 
    n.profissional_id as user_id_autor,
    l.nome as lead_nome
FROM ag_notas_internas n
JOIN ag_leads l ON n.lead_id = l.id

UNION ALL

SELECT 
    a.id::text || '-agendamento' as unique_id,
    'agendamento' as tipo_atividade, 
    a.titulo as descricao, 
    a.created_at as data_criacao, 
    a.lead_id as lead_id, 
    a.profissional_id as user_id_autor,
    l.nome as lead_nome
FROM ag_agendamentos a
JOIN ag_leads l ON a.lead_id = l.id;
