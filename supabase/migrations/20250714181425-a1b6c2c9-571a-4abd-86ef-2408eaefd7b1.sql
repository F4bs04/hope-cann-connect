-- Criar enum para tipos de usuário
CREATE TYPE public.user_type AS ENUM ('administrador', 'medico', 'paciente');