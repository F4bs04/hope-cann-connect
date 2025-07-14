-- Atualizar senha do usuário de teste
UPDATE public.usuarios 
SET senha_hash = 'Teste2#' 
WHERE email = 'teste2@gmail.com';