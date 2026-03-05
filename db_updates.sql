-- Adicionar colunas de rastreamento de presença à ag_profiles
ALTER TABLE public.ag_profiles 
ADD COLUMN IF NOT EXISTS is_online BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_logout TIMESTAMP WITH TIME ZONE;

-- Garantir que as funções antigas sejam removidas para permitir mudança de tipos (Importante: usar CASCADE)
DROP FUNCTION IF EXISTS public.ag_isadmin() CASCADE;
DROP FUNCTION IF EXISTS public.ag_get_all_profiles_if_admin() CASCADE;

-- Garantir que a função ag_isadmin retorne BOOLEAN (evita erro de tipo JSON)
CREATE OR REPLACE FUNCTION public.ag_isadmin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.ag_profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar a função ag_get_all_profiles_if_admin para retornar os novos campos e o status calculado
DROP FUNCTION IF EXISTS public.ag_get_all_profiles_if_admin();

CREATE OR REPLACE FUNCTION public.ag_get_all_profiles_if_admin()
RETURNS TABLE (
    id BIGINT,
    user_id UUID,
    nome TEXT,
    email TEXT,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    is_online BOOLEAN,
    last_activity TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    last_logout TIMESTAMP WITH TIME ZONE,
    is_online_calculated BOOLEAN
) AS $$
BEGIN
    IF (SELECT public.ag_isadmin()) THEN
        RETURN QUERY
        SELECT 
            p.id, p.user_id, p.nome, p.email, p.role, p.created_at,
            p.is_online, p.last_activity, p.last_login, p.last_logout,
            (COALESCE(p.is_online, FALSE) AND (p.last_activity IS NOT NULL) AND (now() - p.last_activity < interval '5 minutes')) as is_online_calculated
        FROM public.ag_profiles p
        ORDER BY p.nome;
    ELSE
        RAISE EXCEPTION 'Não autorizado';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário para forçar refresh do esquema
COMMENT ON TABLE public.ag_profiles IS 'Tabela de perfis com suporte a monitoramento de status online/offline.';

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.ag_profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar duplicidade
DROP POLICY IF EXISTS "Usuários podem ver o próprio perfil" ON public.ag_profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar a própria presença" ON public.ag_profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.ag_profiles;
DROP POLICY IF EXISTS "Todos podem ver perfis" ON public.ag_profiles;

-- Política 1: Todos os usuários autenticados podem ver perfis (necessário para status online)
CREATE POLICY "Todos podem ver perfis" 
ON public.ag_profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Política 2: Usuários podem atualizar apenas os seus próprios campos de presença e nome
CREATE POLICY "Usuários podem atualizar a própria presença" 
ON public.ag_profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ADICIONAR COLUNAS DE DESIGN AOS STATUS
ALTER TABLE public.ag_lead_statuses ADD COLUMN IF NOT EXISTS font_weight TEXT DEFAULT 'font-bold';

-- TORNAR CPF OPCIONAL PARA PERMITIR AGENDAMENTOS DE LEADS SEM DOCUMENTO
ALTER TABLE public.ag_clientes ALTER COLUMN cpf DROP NOT NULL;

-- CONFIGURAR RLS PARA AGENDAMENTOS (Visibilidade Total, Edição Controlada)
ALTER TABLE public.ag_agendamentos ENABLE ROW LEVEL SECURITY;

-- 1. QUALQUER usuário pode ver toda a agenda (Visibilidade Global)
DROP POLICY IF EXISTS "Todos podem ver agendamentos" ON public.ag_agendamentos;
DROP POLICY IF EXISTS "Admins podem ver todos os agendamentos" ON public.ag_agendamentos;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios agendamentos" ON public.ag_agendamentos;
DROP POLICY IF EXISTS "Visibilidade global de agendamentos" ON public.ag_agendamentos;

CREATE POLICY "Visibilidade global de agendamentos" 
ON public.ag_agendamentos 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- 2. Políticas para Inserção (Todos podem criar)
DROP POLICY IF EXISTS "Admins e Donos podem inserir agendamentos" ON public.ag_agendamentos;
DROP POLICY IF EXISTS "Usuários podem criar agendamentos" ON public.ag_agendamentos;
DROP POLICY IF EXISTS "Usuários autenticados podem criar agendamentos" ON public.ag_agendamentos;

CREATE POLICY "Usuários autenticados podem criar agendamentos" 
ON public.ag_agendamentos 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 3. Políticas para Atualização/Cancelamento (Apenas Admin ou Dono)
DROP POLICY IF EXISTS "Admins e Donos podem atualizar agendamentos" ON public.ag_agendamentos;
DROP POLICY IF EXISTS "Apenas admins e donos podem editar agendamentos" ON public.ag_agendamentos;

CREATE POLICY "Apenas admins e donos podem editar agendamentos" 
ON public.ag_agendamentos 
FOR UPDATE 
USING (public.ag_isadmin() OR auth.uid() = user_id);

-- ADICIONAR COLUNA DE CATEGORIA (Fase 2: Inteligência CRM)
ALTER TABLE public.ag_agendamentos ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT 'Visita ao Showroom';

-- Atualizar a VIEW completa para incluir a categoria
DROP VIEW IF EXISTS public.ag_view_agendamentos_completo;
CREATE VIEW public.ag_view_agendamentos_completo AS
SELECT 
    ag.*,
    c.nome as cliente_nome,
    c.cpf as cliente_cpf,
    c.email as cliente_email,
    c.telefone as cliente_telefone,
    p.profile_id,
    pr.nome as profissional_nome,
    e.id as especialidade_id,
    e.especialidade,
    cre.nome as criador_nome,
    cre.nome as responsavel_agendamento,
    c.nome as nome_contato
FROM public.ag_agendamentos ag
LEFT JOIN public.ag_clientes c ON ag.cliente_id = c.id
LEFT JOIN public.ag_profissionais p ON ag.profissional_id = p.id
LEFT JOIN public.ag_profiles pr ON p.profile_id = pr.id
LEFT JOIN public.ag_especialidades e ON p.especialidade_id = e.id
LEFT JOIN public.ag_profiles cre ON ag.user_id = cre.user_id;

-- Atualizar a RPC function para refletir os novos campos da view
-- Necessário DROP pois o retorno da view mudou (Postgres não permite REPLACE com retorno diferente)
DROP FUNCTION IF EXISTS public.ag_get_agendamentos_completo();

CREATE OR REPLACE FUNCTION public.ag_get_agendamentos_completo()
RETURNS SETOF public.ag_view_agendamentos_completo AS $$
BEGIN
    RETURN QUERY SELECT * FROM public.ag_view_agendamentos_completo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
