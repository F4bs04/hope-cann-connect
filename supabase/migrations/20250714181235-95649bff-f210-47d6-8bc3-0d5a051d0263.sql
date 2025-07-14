-- Adicionar tipo de usuário 'administrador'
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'administrador';

-- Se não houver enum ainda, criar:
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('administrador', 'medico', 'paciente');
    END IF;
END $$;

-- Atualizar coluna tipo_usuario para usar enum se necessário
ALTER TABLE public.usuarios 
ALTER COLUMN tipo_usuario TYPE text;