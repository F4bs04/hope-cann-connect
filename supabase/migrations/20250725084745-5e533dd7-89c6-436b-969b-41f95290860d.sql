-- ===================================================
-- CORREÇÃO DE AVISOS DE SEGURANÇA RESTANTES
-- ===================================================

-- Corrigir search_path das funções antigas que não foram recriadas
CREATE OR REPLACE FUNCTION public.verify_clinic_password(p_email text, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  clinic_record RECORD;
BEGIN
  -- Buscar registro da clínica
  SELECT * INTO clinic_record FROM public.clinics WHERE email = p_email;
  
  -- Se não encontrar a clínica, retorna falso
  IF clinic_record IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar senha usando pgcrypto (comparando com o hash)
  RETURN clinic_record.password_hash = crypt(p_password, clinic_record.password_hash);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_authenticated_email()
RETURNS text
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.delete_all_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
    user_record RECORD;
    deleted_count INTEGER := 0;
BEGIN
    -- Registrar início da operação
    RAISE NOTICE 'Iniciando remoção de todos os usuários...';
    
    -- Iterar sobre todos os usuários e removê-los
    FOR user_record IN SELECT id FROM auth.users
    LOOP
        -- Usar a função oficial do Supabase para remover usuários
        PERFORM auth.admin_delete_user(user_record.id);
        deleted_count := deleted_count + 1;
        
        -- Log para cada 100 usuários removidos
        IF deleted_count % 100 = 0 THEN
            RAISE NOTICE '% usuários removidos até agora', deleted_count;
        END IF;
    END LOOP;
    
    -- Registrar conclusão
    RAISE NOTICE 'Remoção concluída. Total de % usuários removidos.', deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.verificar_chats_expirados()
RETURNS void
LANGUAGE plpgsql
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  UPDATE public.active_chats
  SET is_active = FALSE
  WHERE ends_at < now() AND is_active = TRUE;
END;
$$;

-- Nota: A proteção contra vazamento de senhas é uma configuração do Supabase Auth
-- que deve ser ativada no dashboard do Supabase, não através de SQL