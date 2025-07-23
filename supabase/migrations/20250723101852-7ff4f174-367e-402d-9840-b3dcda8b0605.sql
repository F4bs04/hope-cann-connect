-- Remover horários e consultas dos médicos de teste primeiro
DELETE FROM horarios_disponiveis WHERE id_medico IN (1, 2, 4, 5);
DELETE FROM consultas WHERE id_medico IN (1, 2, 4, 5);

-- Agora remover os médicos
DELETE FROM medicos WHERE id IN (1, 2, 4, 5);

-- Remover usuários médicos de teste
DELETE FROM usuarios WHERE tipo_usuario = 'medico';

-- Criar o usuário Dr. Exemplo
INSERT INTO usuarios (email, tipo_usuario, senha_hash, status) 
VALUES ('drexemplo@gmail.com', 'medico', 'Teste07@', true);

-- Criar o perfil do médico Dr. Exemplo
INSERT INTO medicos (
  id_usuario, 
  nome, 
  cpf, 
  crm, 
  especialidade, 
  telefone, 
  biografia, 
  valor_por_consulta, 
  aprovado, 
  status_disponibilidade
) VALUES (
  (SELECT id FROM usuarios WHERE email = 'drexemplo@gmail.com'),
  'Dr. Exemplo',
  '12345678901',
  'CRM-12345-SP',
  'Cannabis Medicinal',
  '(11) 99999-8888',
  'Médico especialista em Cannabis Medicinal com mais de 10 anos de experiência no tratamento de diversas condições médicas.',
  250.00,
  true,
  true
);

-- Criar horários disponíveis para o Dr. Exemplo
INSERT INTO horarios_disponiveis (id_medico, dia_semana, hora_inicio, hora_fim) VALUES
((SELECT id FROM medicos WHERE nome = 'Dr. Exemplo'), 'segunda-feira', '08:00', '17:00'),
((SELECT id FROM medicos WHERE nome = 'Dr. Exemplo'), 'terça-feira', '08:00', '17:00'),
((SELECT id FROM medicos WHERE nome = 'Dr. Exemplo'), 'quarta-feira', '08:00', '17:00'),
((SELECT id FROM medicos WHERE nome = 'Dr. Exemplo'), 'quinta-feira', '08:00', '17:00'),
((SELECT id FROM medicos WHERE nome = 'Dr. Exemplo'), 'sexta-feira', '08:00', '17:00');