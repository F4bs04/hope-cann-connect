-- Atualizar uma consulta para status 'realizada' para ativar o chat
UPDATE consultas 
SET status = 'realizada' 
WHERE id = 11 AND id_paciente = 4;