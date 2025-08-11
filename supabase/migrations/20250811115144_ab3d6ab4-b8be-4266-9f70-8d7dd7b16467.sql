
-- Permitir que administradores visualizem e atualizem qualquer perfil
-- Mantém a política atual de "usuários só veem o próprio perfil" intacta

-- Política para permitir SELECT por administradores
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('clinic_admin'::user_role, 'system_admin'::user_role)
    )
  );

-- Política para permitir UPDATE por administradores (necessário para suspender/reativar usuários pelo painel)
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('clinic_admin'::user_role, 'system_admin'::user_role)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('clinic_admin'::user_role, 'system_admin'::user_role)
    )
  );
