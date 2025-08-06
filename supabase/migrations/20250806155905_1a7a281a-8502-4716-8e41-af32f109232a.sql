-- Corrigir políticas RLS conflitantes na tabela patients

-- 1. Remover a política conflitante que exige user_id = auth.uid()
DROP POLICY IF EXISTS "Users can insert their own patient data" ON public.patients;

-- 2. Modificar a política existente para cobrir ambos os casos
DROP POLICY IF EXISTS "Approved doctors can create patients" ON public.patients;

-- 3. Criar nova política unificada que permite:
--    - Médicos aprovados criarem pacientes com user_id = NULL
--    - Usuários autônimos se registrarem com user_id = auth.uid()
CREATE POLICY "Unified patient creation policy" 
ON public.patients 
FOR INSERT 
WITH CHECK (
  -- Caso 1: Usuário criando seu próprio registro de paciente
  (user_id = auth.uid())
  OR 
  -- Caso 2: Médico aprovado criando paciente (sem user_id)
  (
    user_id IS NULL 
    AND EXISTS (
      SELECT 1 FROM doctors d
      WHERE d.user_id = auth.uid() 
      AND d.is_approved = true 
      AND (d.is_suspended = false OR d.is_suspended IS NULL)
    )
  )
);