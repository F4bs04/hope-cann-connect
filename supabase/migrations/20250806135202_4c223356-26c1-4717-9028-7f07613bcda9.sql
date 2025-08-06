-- Permitir que a coluna user_id seja nullable temporariamente para pacientes criados pelo médico
-- E depois conectar quando o paciente criar sua conta

-- Primeiro, vamos alterar a tabela patients para permitir user_id null
ALTER TABLE public.patients ALTER COLUMN user_id DROP NOT NULL;

-- Criar política para admins/médicos criarem pacientes sem user_id
CREATE POLICY "Doctors can create patients without user_id" ON public.patients
FOR INSERT 
WITH CHECK (
  user_id IS NULL AND 
  EXISTS (
    SELECT 1 FROM doctors d 
    WHERE d.user_id = auth.uid() AND d.is_approved = true
  )
);

-- Política para permitir que médicos vejam pacientes que eles criaram
CREATE POLICY "Doctors can view patients they created" ON public.patients
FOR SELECT 
USING (
  user_id IS NULL AND 
  EXISTS (
    SELECT 1 FROM doctor_patients dp
    JOIN doctors d ON d.id = dp.doctor_id
    WHERE dp.patient_id = patients.id AND d.user_id = auth.uid()
  )
);

-- Política para permitir que médicos atualizem pacientes que eles criaram
CREATE POLICY "Doctors can update patients they created" ON public.patients
FOR UPDATE 
USING (
  user_id IS NULL AND 
  EXISTS (
    SELECT 1 FROM doctor_patients dp
    JOIN doctors d ON d.id = dp.doctor_id
    WHERE dp.patient_id = patients.id AND d.user_id = auth.uid()
  )
);