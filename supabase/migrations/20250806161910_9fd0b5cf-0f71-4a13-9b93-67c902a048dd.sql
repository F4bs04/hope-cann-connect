-- Substituir a política de criação por uma mais simples e robusta

-- Remover a política atual
DROP POLICY IF EXISTS "Unified patient creation policy" ON public.patients;

-- Criar política mais simples que funciona definitivamente
CREATE POLICY "Doctor can create patients with null user_id" 
ON public.patients 
FOR INSERT 
WITH CHECK (
  -- Caso 1: Usuário registrando-se como paciente
  (user_id = auth.uid())
  OR 
  -- Caso 2: Médico aprovado criando paciente (user_id deve ser NULL)
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

-- Verificar se a política foi criada corretamente
SELECT policyname, cmd, with_check 
FROM pg_policies 
WHERE tablename = 'patients' AND cmd = 'INSERT';