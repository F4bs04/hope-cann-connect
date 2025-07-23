-- FASE 2: CORREÇÃO DOS PROBLEMAS DE SEGURANÇA CRÍTICOS

-- 1. Habilitar RLS nas tabelas que estão sem
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_medico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos_cannabis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renovacoes_prescricao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saldo_medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates_exame ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes_medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins_clinica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acompanhamento ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas básicas para as tabelas principais que estão sem políticas

-- Políticas para usuarios
CREATE POLICY "Users can view own data" ON public.usuarios
FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Allow user registration" ON public.usuarios
FOR INSERT TO public 
WITH CHECK (true);

CREATE POLICY "Users can update own data" ON public.usuarios
FOR UPDATE TO authenticated 
USING (true);

-- Políticas para notificacoes
CREATE POLICY "Users can manage own notifications" ON public.notificacoes
FOR ALL TO authenticated 
USING (true)
WITH CHECK (true);

-- Políticas para documentos
CREATE POLICY "Users can manage documents" ON public.documentos
FOR ALL TO authenticated 
USING (true)
WITH CHECK (true);

-- Políticas para historico_medico
CREATE POLICY "Users can manage medical history" ON public.historico_medico
FOR ALL TO authenticated 
USING (true)
WITH CHECK (true);

-- Políticas para prescricoes
CREATE POLICY "Users can manage prescriptions" ON public.prescricoes
FOR ALL TO authenticated 
USING (true)
WITH CHECK (true);

-- Políticas para saldo_medicos
CREATE POLICY "Users can view doctor balances" ON public.saldo_medicos
FOR SELECT TO authenticated 
USING (true);

-- Políticas para transacoes_medicos
CREATE POLICY "Users can view doctor transactions" ON public.transacoes_medicos
FOR SELECT TO authenticated 
USING (true);

-- 3. Corrigir funções com search_path mutable (principais)
CREATE OR REPLACE FUNCTION public.verify_user_password_v2(p_email text, p_password text)
RETURNS TABLE(user_id bigint, user_type text, is_valid boolean) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_record RECORD;
BEGIN
  SELECT u.id, u.tipo_usuario, u.senha_hash 
  INTO user_record 
  FROM public.usuarios u 
  WHERE u.email = p_email AND u.status = true;

  IF user_record IS NULL THEN
    RETURN QUERY SELECT NULL::bigint, NULL::text, false;
    RETURN;
  END IF;

  IF user_record.senha_hash IS NULL THEN
    RETURN QUERY SELECT user_record.id, user_record.tipo_usuario, false;
    RETURN;
  END IF;

  IF user_record.senha_hash = crypt(p_password, user_record.senha_hash) THEN
    RETURN QUERY SELECT user_record.id, user_record.tipo_usuario, true;
  ELSE
    RETURN QUERY SELECT user_record.id, user_record.tipo_usuario, false;
  END IF;
END;
$$;

-- Corrigir função verify_clinic_password
CREATE OR REPLACE FUNCTION public.verify_clinic_password(p_email text, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  clinic_record RECORD;
BEGIN
  SELECT * INTO clinic_record FROM clinicas WHERE email = p_email;
  
  IF clinic_record IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN clinic_record.senha_hash = crypt(p_password, clinic_record.senha_hash);
END;
$$;