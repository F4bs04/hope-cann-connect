-- ========================================
-- ETAPA 1: UNIFICAÇÃO DAS TABELAS (CORRIGIDA - SEM CONSTRAINTS)
-- ========================================

-- Remover tabela se já existe
DROP TABLE IF EXISTS public.pacientes_unified CASCADE;

-- Criar nova tabela unificada de pacientes (sem constraints que causam problemas)
CREATE TABLE public.pacientes_unified (
  id SERIAL PRIMARY KEY,
  id_usuario BIGINT REFERENCES public.usuarios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  cpf TEXT UNIQUE,
  telefone TEXT,
  data_nascimento DATE NOT NULL,
  genero TEXT,
  endereco TEXT,
  condicao_medica TEXT,
  data_cadastro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ultima_consulta TIMESTAMP WITH TIME ZONE,
  status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Migrar dados da tabela pacientes_app (mais completa) - tratando dados nulos/vazios
INSERT INTO public.pacientes_unified (
  nome, email, telefone, data_nascimento, genero, endereco, 
  condicao_medica, data_cadastro, ultima_consulta
)
SELECT 
  nome,
  CASE 
    WHEN email IS NULL OR email = '' THEN nome || '@temp-' || id || '.email'
    ELSE email
  END as email,
  telefone,
  COALESCE(data_nascimento, CURRENT_DATE - INTERVAL '30 years') as data_nascimento,
  CASE 
    WHEN genero IS NULL OR genero = '' THEN NULL
    ELSE genero
  END as genero,
  endereco,
  condicao as condicao_medica,
  data_cadastro,
  ultima_consulta
FROM public.pacientes_app;

-- Migrar dados únicos da tabela pacientes
INSERT INTO public.pacientes_unified (
  id_usuario, nome, email, cpf, telefone, data_nascimento, 
  genero, endereco, data_cadastro
)
SELECT 
  p.id_usuario,
  p.nome,
  p.email,
  p.cpf,
  p.telefone,
  p.data_nascimento,
  p.genero,
  p.endereco,
  p.data_cadastro
FROM public.pacientes p
WHERE p.email NOT IN (SELECT email FROM public.pacientes_unified)
  AND (p.cpf IS NULL OR p.cpf NOT IN (SELECT cpf FROM public.pacientes_unified WHERE cpf IS NOT NULL));