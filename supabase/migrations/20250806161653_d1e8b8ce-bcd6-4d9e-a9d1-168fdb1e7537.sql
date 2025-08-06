-- Limpar políticas RLS conflitantes e manter apenas as essenciais

-- Remover políticas duplicadas e conflitantes
DROP POLICY IF EXISTS "patients_own_data" ON public.patients;
DROP POLICY IF EXISTS "Users can update their own patient data" ON public.patients;
DROP POLICY IF EXISTS "Doctors can update patients they created" ON public.patients;

-- Manter apenas as políticas essenciais:
-- 1. Unified patient creation policy (já existe)
-- 2. Approved doctors can view their patients  
-- 3. Approved doctors can update their patients
-- 4. Users can view accessible patient data
-- 5. admins_manage_all_patients

-- Atualizar a política de visualização para incluir o próprio usuário
DROP POLICY IF EXISTS "Users can view accessible patient data" ON public.patients;

CREATE POLICY "Users and doctors can view accessible patient data" 
ON public.patients 
FOR SELECT 
USING (
  -- Usuário pode ver seus próprios dados
  (user_id = auth.uid())
  OR
  -- Médicos aprovados podem ver seus pacientes  
  (EXISTS (
    SELECT 1 FROM doctor_patients dp
    JOIN doctors d ON d.id = dp.doctor_id
    WHERE dp.patient_id = patients.id 
    AND d.user_id = auth.uid() 
    AND d.is_approved = true 
    AND (d.is_suspended = false OR d.is_suspended IS NULL)
  ))
);

-- Criar política de update unificada
CREATE POLICY "Unified patient update policy" 
ON public.patients 
FOR UPDATE 
USING (
  -- Usuário pode atualizar seus próprios dados
  (user_id = auth.uid())
  OR
  -- Médicos aprovados podem atualizar pacientes que criaram
  (user_id IS NULL AND EXISTS (
    SELECT 1 FROM doctor_patients dp
    JOIN doctors d ON d.id = dp.doctor_id
    WHERE dp.patient_id = patients.id 
    AND d.user_id = auth.uid() 
    AND d.is_approved = true 
    AND (d.is_suspended = false OR d.is_suspended IS NULL)
  ))
)
WITH CHECK (
  -- Usuário pode atualizar seus próprios dados
  (user_id = auth.uid())
  OR
  -- Médicos aprovados podem atualizar pacientes que criaram
  (user_id IS NULL AND EXISTS (
    SELECT 1 FROM doctor_patients dp
    JOIN doctors d ON d.id = dp.doctor_id
    WHERE dp.patient_id = patients.id 
    AND d.user_id = auth.uid() 
    AND d.is_approved = true 
    AND (d.is_suspended = false OR d.is_suspended IS NULL)
  ))
);