-- Corrigir as políticas RLS para funcionar corretamente com a tabela doctors
-- Primeiro, vamos limpar as políticas existentes e criar políticas corretas

-- Remover políticas de debug
DROP POLICY IF EXISTS "Debug doctors can create patients" ON public.patients;
DROP POLICY IF EXISTS "Debug doctors can view patients" ON public.patients;

-- Criar políticas corretas para médicos gerenciarem pacientes
CREATE POLICY "Approved doctors can create patients" ON public.patients
FOR INSERT 
WITH CHECK (
  user_id IS NULL AND 
  EXISTS (
    SELECT 1 FROM doctors d 
    WHERE d.user_id = auth.uid() 
    AND d.is_approved = true 
    AND (d.is_suspended = false OR d.is_suspended IS NULL)
  )
);

CREATE POLICY "Approved doctors can view their patients" ON public.patients
FOR SELECT 
USING (
  -- Pacientes que o médico criou (user_id = null)
  (user_id IS NULL AND EXISTS (
    SELECT 1 FROM doctor_patients dp
    JOIN doctors d ON d.id = dp.doctor_id
    WHERE dp.patient_id = patients.id 
    AND d.user_id = auth.uid()
    AND d.is_approved = true 
    AND (d.is_suspended = false OR d.is_suspended IS NULL)
  ))
  OR
  -- Pacientes com conta própria podem ver seus dados
  (user_id = auth.uid())
);

CREATE POLICY "Approved doctors can update their patients" ON public.patients
FOR UPDATE 
USING (
  user_id IS NULL AND EXISTS (
    SELECT 1 FROM doctor_patients dp
    JOIN doctors d ON d.id = dp.doctor_id
    WHERE dp.patient_id = patients.id 
    AND d.user_id = auth.uid()
    AND d.is_approved = true 
    AND (d.is_suspended = false OR d.is_suspended IS NULL)
  )
)
WITH CHECK (
  user_id IS NULL AND EXISTS (
    SELECT 1 FROM doctor_patients dp
    JOIN doctors d ON d.id = dp.doctor_id
    WHERE dp.patient_id = patients.id 
    AND d.user_id = auth.uid()
    AND d.is_approved = true 
    AND (d.is_suspended = false OR d.is_suspended IS NULL)
  )
);