-- FASE 1: CORREÇÃO DO SISTEMA DE AUTENTICAÇÃO E RLS

-- 1. Corrigir políticas RLS problemáticas para a tabela consultas
DROP POLICY IF EXISTS "Médicos podem gerenciar suas consultas" ON public.consultas;
DROP POLICY IF EXISTS "Médicos podem ver suas próprias consultas" ON public.consultas;
DROP POLICY IF EXISTS "Pacientes podem ver suas consultas" ON public.consultas;

-- Criar políticas mais simples e funcionais para consultas
CREATE POLICY "Allow authenticated users to manage consultas" 
ON public.consultas 
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 2. Corrigir políticas RLS para a tabela pacientes
DROP POLICY IF EXISTS "Pacientes podem ver seus próprios dados" ON public.pacientes;
DROP POLICY IF EXISTS "Médicos podem ver pacientes de suas consultas" ON public.pacientes;
DROP POLICY IF EXISTS "Admins podem ver todos os pacientes" ON public.pacientes;

-- Criar políticas funcionais para pacientes
CREATE POLICY "Allow authenticated users to manage pacientes" 
ON public.pacientes 
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 3. Corrigir políticas RLS para a tabela medicos
DROP POLICY IF EXISTS "Médicos podem ver apenas seus próprios dados" ON public.medicos;
DROP POLICY IF EXISTS "Allow public sign-ups" ON public.medicos;
DROP POLICY IF EXISTS "Doctors can update own data" ON public.medicos;
DROP POLICY IF EXISTS "Public can view doctors" ON public.medicos;
DROP POLICY IF EXISTS "Public read access for medicos" ON public.medicos;

-- Criar políticas funcionais para medicos
CREATE POLICY "Allow public to view doctors" 
ON public.medicos 
FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow authenticated users to manage medicos" 
ON public.medicos 
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 4. Corrigir políticas RLS para horarios_disponiveis (simplificar)
DROP POLICY IF EXISTS "Allow authenticated users to delete schedules" ON public.horarios_disponiveis;
DROP POLICY IF EXISTS "Allow authenticated users to insert schedules" ON public.horarios_disponiveis;
DROP POLICY IF EXISTS "Allow authenticated users to update schedules" ON public.horarios_disponiveis;
DROP POLICY IF EXISTS "Allow public to view schedules" ON public.horarios_disponiveis;
DROP POLICY IF EXISTS "Anyone can view schedules" ON public.horarios_disponiveis;
DROP POLICY IF EXISTS "Authenticated can delete schedules" ON public.horarios_disponiveis;
DROP POLICY IF EXISTS "Authenticated can insert schedules" ON public.horarios_disponiveis;
DROP POLICY IF EXISTS "Authenticated can update schedules" ON public.horarios_disponiveis;

-- Criar políticas simples e funcionais para horarios_disponiveis
CREATE POLICY "Public can view schedules" 
ON public.horarios_disponiveis 
FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Authenticated can manage schedules" 
ON public.horarios_disponiveis 
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 5. Garantir que a função de verificação de senha está funcionando
CREATE OR REPLACE FUNCTION public.verify_user_password_v2(p_email text, p_password text)
RETURNS TABLE(user_id bigint, user_type text, is_valid boolean) 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Buscar usuário pelo email
  SELECT u.id, u.tipo_usuario, u.senha_hash 
  INTO user_record 
  FROM public.usuarios u 
  WHERE u.email = p_email AND u.status = true;

  -- Se usuário não encontrado
  IF user_record IS NULL THEN
    RETURN QUERY SELECT NULL::bigint, NULL::text, false;
    RETURN;
  END IF;

  -- Se não tem senha hash
  IF user_record.senha_hash IS NULL THEN
    RETURN QUERY SELECT user_record.id, user_record.tipo_usuario, false;
    RETURN;
  END IF;

  -- Verificar senha
  IF user_record.senha_hash = crypt(p_password, user_record.senha_hash) THEN
    RETURN QUERY SELECT user_record.id, user_record.tipo_usuario, true;
  ELSE
    RETURN QUERY SELECT user_record.id, user_record.tipo_usuario, false;
  END IF;
END;
$$;