-- ========================================
-- ETAPA 4: POLÍTICAS RLS MELHORADAS
-- ========================================

-- Habilitar RLS na nova tabela
ALTER TABLE public.pacientes_unified ENABLE ROW LEVEL SECURITY;

-- Políticas para pacientes unificados
CREATE POLICY "Pacientes podem ver seus próprios dados"
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

-- Atualizar políticas de consultas
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

-- ========================================
-- ETAPA 5: FINALIZAR MIGRAÇÃO
-- ========================================

-- Backup das tabelas antigas
ALTER TABLE public.pacientes RENAME TO pacientes_backup;
ALTER TABLE public.pacientes_app RENAME TO pacientes_app_backup;

-- Renomear a nova tabela
ALTER TABLE public.pacientes_unified RENAME TO pacientes;

-- Comentários para documentação
COMMENT ON TABLE public.pacientes IS 'Tabela unificada de pacientes - consolidação de pacientes e pacientes_app';
COMMENT ON FUNCTION public.is_doctor_available(INTEGER, TIMESTAMP, INTEGER) IS 'Verifica se médico está disponível em determinado horário';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger function para atualizar campo updated_at automaticamente';