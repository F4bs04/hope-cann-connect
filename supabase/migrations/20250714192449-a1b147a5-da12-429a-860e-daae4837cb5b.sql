-- ========================================
-- ETAPA 2: ÍNDICES DE PERFORMANCE E OTIMIZAÇÕES
-- ========================================

-- Índices para a nova tabela de pacientes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pacientes_unified_email ON public.pacientes_unified(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pacientes_unified_cpf ON public.pacientes_unified(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pacientes_unified_id_usuario ON public.pacientes_unified(id_usuario) WHERE id_usuario IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pacientes_unified_data_cadastro ON public.pacientes_unified(data_cadastro);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pacientes_unified_nome ON public.pacientes_unified(nome);

-- Índices para consultas (performance crítica)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consultas_data_hora ON public.consultas(data_hora);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consultas_id_medico_data ON public.consultas(id_medico, data_hora);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consultas_id_paciente ON public.consultas(id_paciente);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consultas_status ON public.consultas(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consultas_composite ON public.consultas(id_medico, status, data_hora);

-- Índices para médicos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medicos_especialidade ON public.medicos(especialidade);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medicos_aprovado ON public.medicos(aprovado);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medicos_id_usuario ON public.medicos(id_usuario);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medicos_status_aprovado ON public.medicos(status_disponibilidade, aprovado);

-- Índices para horários disponíveis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_horarios_disponiveis_medico_dia ON public.horarios_disponiveis(id_medico, dia_semana);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_horarios_disponiveis_composite ON public.horarios_disponiveis(id_medico, dia_semana, hora_inicio, hora_fim);

-- Índices para usuários
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usuarios_tipo ON public.usuarios(tipo_usuario);

-- ========================================
-- ETAPA 3: TRIGGERS E FUNÇÕES ÚTEIS
-- ========================================

-- Trigger para updated_at
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

-- Função para calcular idade
CREATE OR REPLACE FUNCTION public.calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para verificar disponibilidade de médico
CREATE OR REPLACE FUNCTION public.is_doctor_available(
  p_medico_id INTEGER,
  p_data_hora TIMESTAMP,
  p_consulta_id INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_dia_semana TEXT;
  v_disponivel BOOLEAN := FALSE;
  v_conflito BOOLEAN := FALSE;
BEGIN
  -- Obter dia da semana em português
  v_dia_semana := CASE EXTRACT(DOW FROM p_data_hora)
    WHEN 0 THEN 'domingo'
    WHEN 1 THEN 'segunda-feira'
    WHEN 2 THEN 'terça-feira'
    WHEN 3 THEN 'quarta-feira'
    WHEN 4 THEN 'quinta-feira'
    WHEN 5 THEN 'sexta-feira'
    WHEN 6 THEN 'sábado'
  END;

  -- Verificar se médico tem horário disponível
  SELECT EXISTS (
    SELECT 1 FROM public.horarios_disponiveis hd
    WHERE hd.id_medico = p_medico_id
      AND LOWER(hd.dia_semana) = v_dia_semana
      AND p_data_hora::TIME BETWEEN hd.hora_inicio::TIME AND hd.hora_fim::TIME
  ) INTO v_disponivel;

  -- Verificar conflitos com outras consultas
  SELECT EXISTS (
    SELECT 1 FROM public.consultas c
    WHERE c.id_medico = p_medico_id
      AND c.status NOT IN ('cancelada', 'finalizada')
      AND (p_consulta_id IS NULL OR c.id != p_consulta_id)
      AND ABS(EXTRACT(EPOCH FROM (c.data_hora - p_data_hora))) < 1800 -- 30 minutos
  ) INTO v_conflito;

  RETURN v_disponivel AND NOT v_conflito;
END;
$$ LANGUAGE plpgsql;