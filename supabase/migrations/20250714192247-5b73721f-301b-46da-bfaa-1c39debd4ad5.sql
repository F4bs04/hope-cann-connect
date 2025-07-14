-- ========================================
-- ROADMAP DE MELHORIAS - BACKEND/DATABASE
-- ========================================

-- 1. UNIFICAÇÃO DAS TABELAS DE PACIENTES
-- Consolidar pacientes e pacientes_app em uma única tabela

-- Primeiro, criar nova tabela unificada de pacientes
DROP TABLE IF EXISTS public.pacientes_unified CASCADE;

CREATE TABLE public.pacientes_unified (
  id SERIAL PRIMARY KEY,
  id_usuario BIGINT REFERENCES public.usuarios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  telefone TEXT,
  data_nascimento DATE NOT NULL,
  idade INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(data_nascimento))) STORED,
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
  COALESCE(email, nome || '@temp.email') as email,
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
  WHERE pu.email = p.email OR pu.cpf = p.cpf
);

-- 2. ÍNDICES PARA PERFORMANCE
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pacientes_unified_email ON public.pacientes_unified(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pacientes_unified_cpf ON public.pacientes_unified(cpf);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pacientes_unified_id_usuario ON public.pacientes_unified(id_usuario);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pacientes_unified_data_cadastro ON public.pacientes_unified(data_cadastro);

-- Índices para tabelas relacionadas
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consultas_data_hora ON public.consultas(data_hora);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consultas_id_medico_data ON public.consultas(id_medico, data_hora);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consultas_status ON public.consultas(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medicos_especialidade ON public.medicos(especialidade);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medicos_aprovado ON public.medicos(aprovado);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_horarios_disponiveis_medico_dia ON public.horarios_disponiveis(id_medico, dia_semana);

-- 3. TRIGGER PARA UPDATED_AT
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pacientes_unified_updated_at
  BEFORE UPDATE ON public.pacientes_unified
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. MELHORAR POLÍTICAS RLS
ALTER TABLE public.pacientes_unified ENABLE ROW LEVEL SECURITY;

-- Políticas mais específicas e seguras
CREATE POLICY "Pacientes podem ver apenas seus próprios dados"
  ON public.pacientes_unified
  FOR ALL
  USING (
    id_usuario = (
      SELECT u.id FROM public.usuarios u 
      WHERE u.email = auth.email()
    )
  );

CREATE POLICY "Médicos podem ver pacientes de suas consultas"
  ON public.pacientes_unified
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.consultas c
      JOIN public.medicos m ON c.id_medico = m.id
      JOIN public.usuarios u ON m.id_usuario = u.id
      WHERE c.id_paciente = pacientes_unified.id
        AND u.email = auth.email()
    )
  );

CREATE POLICY "Admins podem ver todos os pacientes"
  ON public.pacientes_unified
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.email = auth.email()
        AND u.tipo_usuario = 'administrador'
    )
  );

-- 5. ATUALIZAR POLÍTICAS DE CONSULTAS
DROP POLICY IF EXISTS "Médicos podem ver apenas suas próprias consultas" ON public.consultas;
DROP POLICY IF EXISTS "Médicos podem atualizar suas próprias consultas" ON public.consultas;
DROP POLICY IF EXISTS "Médicos podem deletar suas próprias consultas" ON public.consultas;
DROP POLICY IF EXISTS "Médicos podem inserir consultas" ON public.consultas;

CREATE POLICY "Médicos podem gerenciar suas consultas"
  ON public.consultas
  FOR ALL
  USING (
    id_medico IN (
      SELECT m.id FROM public.medicos m
      JOIN public.usuarios u ON m.id_usuario = u.id
      WHERE u.email = auth.email()
        AND m.aprovado = true
    )
  );

CREATE POLICY "Pacientes podem ver suas consultas"
  ON public.consultas
  FOR SELECT
  USING (
    id_paciente IN (
      SELECT p.id FROM public.pacientes_unified p
      JOIN public.usuarios u ON p.id_usuario = u.id
      WHERE u.email = auth.email()
    )
  );

-- 6. FUNÇÃO PARA VALIDAÇÃO DE CONFLITOS MELHORADA
CREATE OR REPLACE FUNCTION public.check_advanced_consulta_conflict()
RETURNS TRIGGER AS $$
DECLARE
  conflict_count INTEGER;
  medico_disponivel BOOLEAN;
BEGIN
  -- Verificar se o médico está disponível no dia/horário
  SELECT COUNT(*) > 0 INTO medico_disponivel
  FROM public.horarios_disponiveis hd
  WHERE hd.id_medico = NEW.id_medico
    AND hd.dia_semana = LOWER(TO_CHAR(NEW.data_hora, 'Day'))
    AND NEW.data_hora::TIME BETWEEN hd.hora_inicio::TIME AND hd.hora_fim::TIME;

  IF NOT medico_disponivel THEN
    RAISE EXCEPTION 'Médico não disponível neste horário';
  END IF;

  -- Verificar conflitos com margem de 30 minutos
  SELECT COUNT(*) INTO conflict_count
  FROM public.consultas
  WHERE id_medico = NEW.id_medico
    AND status NOT IN ('cancelada', 'finalizada')
    AND id != COALESCE(NEW.id, -1)
    AND (
      (NEW.data_hora BETWEEN data_hora - INTERVAL '30 minutes' AND data_hora + INTERVAL '30 minutes')
      OR (data_hora BETWEEN NEW.data_hora - INTERVAL '30 minutes' AND NEW.data_hora + INTERVAL '30 minutes')
    );

  IF conflict_count > 0 THEN
    RAISE EXCEPTION 'Conflito de horário detectado - existe outra consulta próxima a este horário';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger antigo e criar novo
DROP TRIGGER IF EXISTS check_consulta_conflict_trigger ON public.consultas;
CREATE TRIGGER check_advanced_consulta_conflict_trigger
  BEFORE INSERT OR UPDATE ON public.consultas
  FOR EACH ROW
  EXECUTE FUNCTION public.check_advanced_consulta_conflict();

-- 7. FUNÇÃO PARA ESTATÍSTICAS DE CONSULTAS
CREATE OR REPLACE FUNCTION public.get_consulta_stats(medico_id INTEGER DEFAULT NULL)
RETURNS TABLE(
  total_consultas BIGINT,
  consultas_realizadas BIGINT,
  consultas_canceladas BIGINT,
  consultas_agendadas BIGINT,
  receita_total NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_consultas,
    COUNT(*) FILTER (WHERE status = 'realizada') as consultas_realizadas,
    COUNT(*) FILTER (WHERE status = 'cancelada') as consultas_canceladas,
    COUNT(*) FILTER (WHERE status = 'agendada') as consultas_agendadas,
    COALESCE(SUM(valor_consulta) FILTER (WHERE status = 'realizada'), 0) as receita_total
  FROM public.consultas c
  WHERE (medico_id IS NULL OR c.id_medico = medico_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. ATUALIZAR REFERÊNCIAS PARA A NOVA TABELA
-- Backup das tabelas antigas (renomear ao invés de dropar)
ALTER TABLE public.pacientes RENAME TO pacientes_backup;
ALTER TABLE public.pacientes_app RENAME TO pacientes_app_backup;

-- Renomear a nova tabela
ALTER TABLE public.pacientes_unified RENAME TO pacientes;

-- Atualizar sequence
ALTER SEQUENCE pacientes_app_id_seq RENAME TO pacientes_id_seq;
ALTER TABLE public.pacientes ALTER COLUMN id SET DEFAULT nextval('pacientes_id_seq');

-- 9. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE public.pacientes IS 'Tabela unificada de pacientes - consolidação de pacientes e pacientes_app';
COMMENT ON COLUMN public.pacientes.idade IS 'Idade calculada automaticamente baseada na data de nascimento';
COMMENT ON COLUMN public.pacientes.condicao_medica IS 'Condição médica principal do paciente';
COMMENT ON FUNCTION public.check_advanced_consulta_conflict() IS 'Validação avançada de conflitos de consultas com verificação de disponibilidade';
COMMENT ON FUNCTION public.get_consulta_stats(INTEGER) IS 'Função para obter estatísticas de consultas por médico';