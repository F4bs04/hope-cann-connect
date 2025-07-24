-- Corrigir usuário médico órfão
-- Opção 1: Criar registro de médico para usuário existente
INSERT INTO medicos (
  id_usuario, 
  nome, 
  crm, 
  especialidade, 
  telefone, 
  aprovado, 
  status_disponibilidade
) 
SELECT 
  u.id,
  'Médico Pendente', -- Nome temporário
  'CRM-PENDENTE', -- CRM temporário 
  'Medicina Canábica', -- Especialidade padrão
  '(00) 00000-0000', -- Telefone temporário
  false, -- Não aprovado por padrão
  false -- Indisponível por padrão
FROM usuarios u 
WHERE u.tipo_usuario = 'medico' 
  AND u.id NOT IN (SELECT id_usuario FROM medicos WHERE id_usuario IS NOT NULL);