-- ========================================
-- ETAPA 1: UNIFICAÇÃO DAS TABELAS DE PACIENTES (CORRIGIDA)
-- ========================================

-- Criar nova tabela unificada de pacientes (sem coluna computada problemática)
CREATE TABLE public.pacientes_unified (
  id SERIAL PRIMARY KEY,
  id_usuario BIGINT REFERENCES public.usuarios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  cpf TEXT UNIQUE,
  telefone TEXT,
  data_nascimento DATE NOT NULL,
  genero TEXT CHECK (genero IN ('masculino', 'feminino', 'outro')),
  endereco TEXT,
  condicao_medica TEXT,
  data_cadastro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ultima_consulta TIMESTAMP WITH TIME ZONE,
  status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Migrar dados da tabela pacientes_app (mais completa)
INSERT INTO public.pacientes_unified (
  nome, email, telefone, data_nascimento, genero, endereco, 
  condicao_medica, data_cadastro, ultima_consulta
)
SELECT 
  nome,
  COALESCE(email, nome || '@temp-' || id || '.email') as email,
  telefone,
  COALESCE(data_nascimento, CURRENT_DATE - INTERVAL '30 years') as data_nascimento,
  genero,
  endereco,
  condicao as condicao_medica,
  data_cadastro,
  ultima_consulta
FROM public.pacientes_app;

-- Migrar dados da tabela pacientes (se houver dados únicos)
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
WHERE NOT EXISTS (
  SELECT 1 FROM public.pacientes_unified pu 
  WHERE pu.email = p.email OR (pu.cpf IS NOT NULL AND pu.cpf = p.cpf)
)
ON CONFLICT (email) DO NOTHING;

-- Função para calcular idade
CREATE OR REPLACE FUNCTION public.calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql IMMUTABLE;