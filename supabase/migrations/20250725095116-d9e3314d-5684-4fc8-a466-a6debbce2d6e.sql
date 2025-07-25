-- Vamos verificar e atualizar as políticas RLS para doctors
-- Primeiro, vamos garantir que qualquer pessoa possa ver médicos aprovados

-- Dropar política existente se houver conflito
DROP POLICY IF EXISTS "Anyone can view approved doctors" ON doctors;

-- Criar nova política que permite a qualquer pessoa ver médicos aprovados
CREATE POLICY "Anyone can view approved doctors" 
ON doctors 
FOR SELECT 
USING (is_approved = true AND is_available = true);

-- Verificar se a política para profiles também está correta
DROP POLICY IF EXISTS "Anyone can view doctor profiles" ON profiles;

-- Criar política para permitir visualização de perfis de médicos
CREATE POLICY "Anyone can view doctor profiles" 
ON profiles 
FOR SELECT 
USING (role = 'doctor');

-- Verificar se RLS está habilitado nas tabelas
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('doctors', 'profiles');