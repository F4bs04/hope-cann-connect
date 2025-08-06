-- Primeiro, vamos adicionar as foreign keys que estão faltando
ALTER TABLE public.doctor_patients 
ADD CONSTRAINT doctor_patients_doctor_id_fkey 
FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;

ALTER TABLE public.doctor_patients 
ADD CONSTRAINT doctor_patients_patient_id_fkey 
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- Corrigir a política RLS para usar o ID do médico corretamente
DROP POLICY IF EXISTS "Doctors can create patients without user_id" ON public.patients;

CREATE POLICY "Doctors can create patients without user_id" ON public.patients
FOR INSERT 
WITH CHECK (
  user_id IS NULL AND 
  EXISTS (
    SELECT 1 FROM doctors d 
    WHERE d.user_id = auth.uid() AND d.is_approved = true AND d.is_suspended = false
  )
);

-- Atualizar política de visualização para usar o ID correto do médico
DROP POLICY IF EXISTS "Doctors can view patients they created" ON public.patients;

CREATE POLICY "Doctors can view patients they created" ON public.patients
FOR SELECT 
USING (
  user_id IS NULL AND 
  EXISTS (
    SELECT 1 FROM doctor_patients dp
    JOIN doctors d ON d.id = dp.doctor_id
    WHERE dp.patient_id = patients.id AND d.user_id = auth.uid() AND d.is_approved = true
  )
);

-- Atualizar política de atualização
DROP POLICY IF EXISTS "Doctors can update patients they created" ON public.patients;

CREATE POLICY "Doctors can update patients they created" ON public.patients
FOR UPDATE 
USING (
  user_id IS NULL AND 
  EXISTS (
    SELECT 1 FROM doctor_patients dp
    JOIN doctors d ON d.id = dp.doctor_id
    WHERE dp.patient_id = patients.id AND d.user_id = auth.uid() AND d.is_approved = true
  )
) WITH CHECK (
  user_id IS NULL AND 
  EXISTS (
    SELECT 1 FROM doctor_patients dp
    JOIN doctors d ON d.id = dp.doctor_id
    WHERE dp.patient_id = patients.id AND d.user_id = auth.uid() AND d.is_approved = true
  )
);