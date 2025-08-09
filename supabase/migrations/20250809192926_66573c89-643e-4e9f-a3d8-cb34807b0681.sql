
-- 1) Adicionar o novo valor no enum de status de consultas
ALTER TYPE public.appointment_status
  ADD VALUE IF NOT EXISTS 'awaiting_payment';

-- 2) Habilitar a extensão necessária para exclusão com UUID e ranges
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 3) Remover a constraint antiga (se existir)
ALTER TABLE public.appointments 
  DROP CONSTRAINT IF EXISTS appointments_no_overlapping;

-- 4) Criar a constraint de exclusão para impedir sobreposição
-- Observações:
-- - Usamos tstzrange porque scheduled_at é TIMESTAMPTZ
-- - Intervalo semiaberto [start, end) evita bloquear o slot seguinte colado
-- - Considera apenas status que de fato ocupam horário
ALTER TABLE public.appointments 
  ADD CONSTRAINT appointments_no_overlapping 
  EXCLUDE USING gist (
    doctor_id WITH =,
    tstzrange(
      scheduled_at,
      scheduled_at + make_interval(mins => COALESCE(duration_min, 30)),
      '[)'
    ) WITH &&
  )
  WHERE (status IN ('scheduled', 'confirmed', 'in_progress', 'awaiting_payment'));
