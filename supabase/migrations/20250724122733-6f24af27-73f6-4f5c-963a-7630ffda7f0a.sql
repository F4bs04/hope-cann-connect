-- CRITICAL SECURITY FIXES - Phase 1: RLS and Access Control

-- Enable RLS on tables that have policies but RLS disabled
ALTER TABLE public.clinic_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Drop overly permissive policies and replace with secure ones
DROP POLICY IF EXISTS "Allow all operations on consultas" ON public.consultas;
DROP POLICY IF EXISTS "Allow all operations on medicos" ON public.medicos;
DROP POLICY IF EXISTS "Allow all operations on pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Allow all operations on schedules" ON public.horarios_disponiveis;

-- Secure consultas table - users can only see their own consultations
CREATE POLICY "Medicos can view their consultations" ON public.consultas
FOR SELECT USING (
  id_medico IN (
    SELECT id FROM public.medicos 
    WHERE id_usuario = (
      SELECT id FROM public.usuarios 
      WHERE email = auth.email()
    )
  )
);

CREATE POLICY "Pacientes can view their consultations" ON public.consultas
FOR SELECT USING (
  id_paciente IN (
    SELECT id FROM public.pacientes 
    WHERE id_usuario = (
      SELECT id FROM public.usuarios 
      WHERE email = auth.email()
    )
  )
);

CREATE POLICY "Admins can view all consultations" ON public.consultas
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.admins a
    JOIN public.usuarios u ON a.id_usuario = u.id
    WHERE u.email = auth.email()
  )
);

CREATE POLICY "Medicos can insert consultations" ON public.consultas
FOR INSERT WITH CHECK (
  id_medico IN (
    SELECT id FROM public.medicos 
    WHERE id_usuario = (
      SELECT id FROM public.usuarios 
      WHERE email = auth.email()
    )
    AND aprovado = true
  )
);

CREATE POLICY "Medicos can update their consultations" ON public.consultas
FOR UPDATE USING (
  id_medico IN (
    SELECT id FROM public.medicos 
    WHERE id_usuario = (
      SELECT id FROM public.usuarios 
      WHERE email = auth.email()
    )
  )
);

-- Secure medicos table - restrict access to approved doctors
CREATE POLICY "Anyone can view approved medicos" ON public.medicos
FOR SELECT USING (aprovado = true);

CREATE POLICY "Medicos can view their own profile" ON public.medicos
FOR SELECT USING (
  id_usuario = (
    SELECT id FROM public.usuarios 
    WHERE email = auth.email()
  )
);

CREATE POLICY "Admins can view all medicos" ON public.medicos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.admins a
    JOIN public.usuarios u ON a.id_usuario = u.id
    WHERE u.email = auth.email()
  )
);

CREATE POLICY "Medicos can update their own profile" ON public.medicos
FOR UPDATE USING (
  id_usuario = (
    SELECT id FROM public.usuarios 
    WHERE email = auth.email()
  )
) WITH CHECK (
  id_usuario = (
    SELECT id FROM public.usuarios 
    WHERE email = auth.email()
  )
);

CREATE POLICY "Admins can update medico approval" ON public.medicos
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.admins a
    JOIN public.usuarios u ON a.id_usuario = u.id
    WHERE u.email = auth.email()
  )
);

-- Secure pacientes table
CREATE POLICY "Pacientes can view their own data" ON public.pacientes
FOR SELECT USING (
  id_usuario = (
    SELECT id FROM public.usuarios 
    WHERE email = auth.email()
  )
);

CREATE POLICY "Medicos can view their patients data" ON public.pacientes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.consultas c
    JOIN public.medicos m ON c.id_medico = m.id
    JOIN public.usuarios u ON m.id_usuario = u.id
    WHERE c.id_paciente = pacientes.id
    AND u.email = auth.email()
    AND m.aprovado = true
  )
);

CREATE POLICY "Admins can view all pacientes" ON public.pacientes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.admins a
    JOIN public.usuarios u ON a.id_usuario = u.id
    WHERE u.email = auth.email()
  )
);

CREATE POLICY "Pacientes can update their own data" ON public.pacientes
FOR UPDATE USING (
  id_usuario = (
    SELECT id FROM public.usuarios 
    WHERE email = auth.email()
  )
) WITH CHECK (
  id_usuario = (
    SELECT id FROM public.usuarios 
    WHERE email = auth.email()
  )
);

CREATE POLICY "Allow paciente signup" ON public.pacientes
FOR INSERT WITH CHECK (
  id_usuario = (
    SELECT id FROM public.usuarios 
    WHERE email = auth.email()
  )
);

-- Secure horarios_disponiveis table
CREATE POLICY "Anyone can view approved doctor schedules" ON public.horarios_disponiveis
FOR SELECT USING (
  id_medico IN (
    SELECT id FROM public.medicos WHERE aprovado = true
  )
);

CREATE POLICY "Medicos can manage their own schedules" ON public.horarios_disponiveis
FOR ALL USING (
  id_medico IN (
    SELECT id FROM public.medicos 
    WHERE id_usuario = (
      SELECT id FROM public.usuarios 
      WHERE email = auth.email()
    )
  )
) WITH CHECK (
  id_medico IN (
    SELECT id FROM public.medicos 
    WHERE id_usuario = (
      SELECT id FROM public.usuarios 
      WHERE email = auth.email()
    )
    AND aprovado = true
  )
);

-- Secure usuarios table - remove overly permissive policies
DROP POLICY IF EXISTS "Allow public insert to usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Allow public sign-ups" ON public.usuarios;
DROP POLICY IF EXISTS "Authenticated users can select all records" ON public.usuarios;
DROP POLICY IF EXISTS "Users can view own data" ON public.usuarios;

CREATE POLICY "Users can view their own record" ON public.usuarios
FOR SELECT USING (email = auth.email());

CREATE POLICY "Users can update their own record" ON public.usuarios
FOR UPDATE USING (email = auth.email()) 
WITH CHECK (email = auth.email());

CREATE POLICY "Allow user registration" ON public.usuarios
FOR INSERT WITH CHECK (email = auth.email());

CREATE POLICY "Admins can view all users" ON public.usuarios
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.admins a
    WHERE a.id_usuario = usuarios.id
  ) OR
  EXISTS (
    SELECT 1 FROM public.admins a
    JOIN public.usuarios u ON a.id_usuario = u.id
    WHERE u.email = auth.email()
  )
);

-- Add search_path protection to security definer functions
CREATE OR REPLACE FUNCTION public.verify_clinic_password(p_email text, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  clinic_record RECORD;
BEGIN
  -- Buscar registro da clínica
  SELECT * INTO clinic_record FROM clinicas WHERE email = p_email;
  
  -- Se não encontrar a clínica, retorna falso
  IF clinic_record IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar senha usando pgcrypto (comparando com o hash)
  RETURN clinic_record.senha_hash = crypt(p_password, clinic_record.senha_hash);
END;
$function$;

CREATE OR REPLACE FUNCTION public.verify_user_password(p_email text, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  user_record RECORD;
BEGIN
  -- Encontrar o usuário pelo email
  SELECT email, senha_hash INTO user_record FROM public.usuarios WHERE email = p_email;

  -- Se o usuário não for encontrado ou não tiver senha_hash, retorna falso
  IF user_record IS NULL OR user_record.senha_hash IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Verifica a senha fornecida contra o hash armazenado
  RETURN user_record.senha_hash = crypt(p_password, user_record.senha_hash);
END;
$function$;

CREATE OR REPLACE FUNCTION public.verify_user_password_v2(p_email text, p_password text)
RETURNS TABLE(user_id bigint, user_type text, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
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
$function$;