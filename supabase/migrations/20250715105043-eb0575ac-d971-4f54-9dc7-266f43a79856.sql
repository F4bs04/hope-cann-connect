-- Remover políticas problemáticas que causam erro de permissão
DROP POLICY IF EXISTS "Médicos podem ver apenas seus próprios horários" ON public.horarios_disponiveis;
DROP POLICY IF EXISTS "Allow doctors to delete their schedules" ON public.horarios_disponiveis;
DROP POLICY IF EXISTS "Allow doctors to update their schedules" ON public.horarios_disponiveis;
DROP POLICY IF EXISTS "Allow authenticated to insert schedules" ON public.horarios_disponiveis;

-- Criar políticas mais simples que não dependem de auth.users
CREATE POLICY "Anyone can view schedules" 
ON public.horarios_disponiveis 
FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Authenticated can insert schedules" 
ON public.horarios_disponiveis 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated can update schedules" 
ON public.horarios_disponiveis 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated can delete schedules" 
ON public.horarios_disponiveis 
FOR DELETE 
TO authenticated 
USING (true);