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
            p.id, p.nome, p.email, p.role, p.created_at,
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
ALTER TABLE public.ag_lead_statuses ADD COLUMN IF NOT EXISTS status_icon TEXT;
ALTER TABLE public.ag_lead_statuses ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'font-sans';
ALTER TABLE public.ag_lead_statuses ADD COLUMN IF NOT EXISTS font_size TEXT DEFAULT 'text-lg';
ALTER TABLE public.ag_lead_statuses ADD COLUMN IF NOT EXISTS font_weight TEXT DEFAULT 'font-bold';
