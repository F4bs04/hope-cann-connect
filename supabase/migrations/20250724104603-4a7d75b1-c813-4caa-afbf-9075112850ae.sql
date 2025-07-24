-- Corrigir usuário médico órfão com CPF temporário
INSERT INTO medicos (
  id_usuario, 
  nome, 
  crm, 
  especialidade, 
  telefone, 
  cpf,
  aprovado, 
  status_disponibilidade
) 
SELECT 
  u.id,
  'Médico Pendente', 
  'CRM-PENDENTE-' || u.id::text, 
  'Medicina Canábica', 
  '(00) 00000-0000', 
  '000.000.000-' || LPAD(u.id::text, 2, '0'), -- CPF temporário baseado no ID
  false, 
  false 
FROM usuarios u 
WHERE u.tipo_usuario = 'medico' 
  AND u.id NOT IN (SELECT id_usuario FROM medicos WHERE id_usuario IS NOT NULL);