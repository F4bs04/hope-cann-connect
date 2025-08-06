-- Primeiro, vamos verificar os dados do médico atual e criar uma política de debug
-- Remover a política problemática
DROP POLICY IF EXISTS "Doctors can create patients without user_id" ON public.patients;

-- Criar uma política temporária mais permissiva para testar
CREATE POLICY "Debug doctors can create patients" ON public.patients
FOR INSERT 
WITH CHECK (
  user_id IS NULL AND 
  EXISTS (
    SELECT 1 FROM doctors d 
    WHERE d.user_id = auth.uid()
  )
);

-- Vamos também verificar se precisa de uma política de SELECT mais básica
DROP POLICY IF EXISTS "Doctors can view patients they created" ON public.patients;

CREATE POLICY "Debug doctors can view patients" ON public.patients
FOR SELECT 
USING (
  user_id IS NULL AND 
  EXISTS (
    SELECT 1 FROM doctors d 
    WHERE d.user_id = auth.uid()
  )
);