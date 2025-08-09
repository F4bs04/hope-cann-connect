
-- Permitir que administradores visualizem todas as transações financeiras
CREATE POLICY "Admins can view all financial transactions"
ON public.financial_transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = ANY (ARRAY['clinic_admin'::user_role, 'system_admin'::user_role])
  )
);
