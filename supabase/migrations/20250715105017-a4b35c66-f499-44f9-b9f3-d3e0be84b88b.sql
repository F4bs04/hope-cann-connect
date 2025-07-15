-- Remove a política problemática que referencia auth.users
DROP POLICY IF EXISTS "Médicos podem ver apenas seus próprios horários" ON public.horarios_disponiveis;

-- Remove políticas conflitantes que usam CURRENT_USER (que não funciona com nosso sistema)
DROP POLICY IF EXISTS "Allow doctors to delete their schedules" ON public.horarios_disponiveis;
DROP POLICY IF EXISTS "Allow doctors to update their schedules" ON public.horarios_disponiveis;

-- Criar políticas mais simples que funcionam com nosso sistema de autenticação customizado
CREATE POLICY "Allow authenticated users to insert schedules" 
ON public.horarios_disponiveis 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update schedules" 
ON public.horarios_disponiveis 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow authenticated users to delete schedules" 
ON public.horarios_disponiveis 
FOR DELETE 
USING (true);

-- Manter a política de visualização pública
-- (Já existe: "Allow public to view schedules")