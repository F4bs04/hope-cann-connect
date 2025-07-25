-- Corrigir recursão infinita nas políticas RLS da tabela patients
-- Primeiro, remover todas as políticas existentes que podem estar causando recursão

DROP POLICY IF EXISTS "Users can view their own patient data" ON patients;
DROP POLICY IF EXISTS "Users can update their own patient data" ON patients;  
DROP POLICY IF EXISTS "Users can insert their own patient data" ON patients;
DROP POLICY IF EXISTS "Doctors can view patient data" ON patients;

-- Criar função security definer para verificar se usuário pode acessar dados do paciente
CREATE OR REPLACE FUNCTION public.can_access_patient_data(patient_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = 'public', 'pg_temp'
AS $$
  -- Usuário pode acessar seus próprios dados de paciente
  SELECT patient_user_id = auth.uid()
  OR 
  -- Ou se for um médico que tem consultas com este paciente
  EXISTS (
    SELECT 1 FROM appointments a
    JOIN doctors d ON d.id = a.doctor_id
    WHERE d.user_id = auth.uid() 
    AND a.patient_id IN (
      SELECT id FROM patients WHERE user_id = patient_user_id
    )
  );
$$;

-- Criar novas políticas usando a função security definer
CREATE POLICY "Users can view accessible patient data" 
ON patients 
FOR SELECT 
USING (public.can_access_patient_data(user_id));

CREATE POLICY "Users can update their own patient data" 
ON patients 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert their own patient data" 
ON patients 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'patients';