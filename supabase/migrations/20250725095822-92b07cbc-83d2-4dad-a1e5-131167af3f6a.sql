-- Corrigir função can_access_patient_data que está retornando null
DROP FUNCTION IF EXISTS public.can_access_patient_data(UUID);

CREATE OR REPLACE FUNCTION public.can_access_patient_data(patient_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = 'public', 'pg_temp'
AS $$
  -- Usuário pode acessar seus próprios dados de paciente
  SELECT CASE 
    WHEN patient_user_id = auth.uid() THEN true
    WHEN EXISTS (
      -- Ou se for um médico que tem consultas com este paciente
      SELECT 1 FROM appointments a
      JOIN doctors d ON d.id = a.doctor_id
      WHERE d.user_id = auth.uid() 
      AND a.patient_id IN (
        SELECT id FROM patients WHERE user_id = patient_user_id
      )
    ) THEN true
    ELSE false
  END;
$$;