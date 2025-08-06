-- Corrigir políticas RLS conflitantes na tabela patients

-- 1. Remover políticas duplicadas e conflitantes
DROP POLICY IF EXISTS "Approved doctors can update their patients" ON public.patients;
DROP POLICY IF EXISTS "Approved doctors can view their patients" ON public.patients;

-- 2. Simplificar a política de UPDATE unificada para não depender de doctor_patients durante criação
DROP POLICY IF EXISTS "Unified patient update policy" ON public.patients;

CREATE POLICY "Simplified patient update policy" 
ON public.patients 
FOR UPDATE 
USING (
  -- Caso 1: Usuário pode atualizar seu próprio perfil de paciente
  (user_id = auth.uid())
  OR 
  -- Caso 2: Médico aprovado pode atualizar qualquer paciente com user_id NULL
  (
    user_id IS NULL 
    AND auth.uid() IN (
      SELECT d.user_id 
      FROM doctors d 
      WHERE d.is_approved = true 
      AND (d.is_suspended = false OR d.is_suspended IS NULL)
    )
  )
)
WITH CHECK (
  -- Mesmas condições para verificação
  (user_id = auth.uid())
  OR 
  (
    user_id IS NULL 
    AND auth.uid() IN (
      SELECT d.user_id 
      FROM doctors d 
      WHERE d.is_approved = true 
      AND (d.is_suspended = false OR d.is_suspended IS NULL)
    )
  )
);

-- 3. Simplificar a política de SELECT também
DROP POLICY IF EXISTS "Users and doctors can view accessible patient data" ON public.patients;

CREATE POLICY "Simplified patient view policy" 
ON public.patients 
FOR SELECT 
USING (
  -- Caso 1: Usuário pode ver seu próprio perfil
  (user_id = auth.uid())
  OR 
  -- Caso 2: Médico aprovado pode ver pacientes com user_id NULL
  (
    user_id IS NULL 
    AND auth.uid() IN (
      SELECT d.user_id 
      FROM doctors d 
      WHERE d.is_approved = true 
      AND (d.is_suspended = false OR d.is_suspended IS NULL)
    )
  )
  OR
  -- Caso 3: Médico pode ver pacientes através da relação doctor_patients
  (
    EXISTS (
      SELECT 1 
      FROM doctor_patients dp
      JOIN doctors d ON d.id = dp.doctor_id
      WHERE dp.patient_id = patients.id 
      AND d.user_id = auth.uid() 
      AND d.is_approved = true 
      AND (d.is_suspended = false OR d.is_suspended IS NULL)
    )
  )
);

-- 4. Verificar as políticas finais
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'patients' 
ORDER BY cmd, policyname;