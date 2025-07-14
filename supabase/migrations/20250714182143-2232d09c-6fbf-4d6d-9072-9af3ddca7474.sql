-- Ativar disponibilidade dos médicos aprovados
UPDATE medicos SET status_disponibilidade = true WHERE aprovado = true;

-- Inserir alguns horários padrão para os médicos aprovados
INSERT INTO horarios_disponiveis (id_medico, dia_semana, hora_inicio, hora_fim)
SELECT 
  id,
  unnest(ARRAY['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira']),
  '08:00',
  '12:00'
FROM medicos WHERE aprovado = true
ON CONFLICT DO NOTHING;

INSERT INTO horarios_disponiveis (id_medico, dia_semana, hora_inicio, hora_fim)
SELECT 
  id,
  unnest(ARRAY['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira']),
  '13:00',
  '17:00'
FROM medicos WHERE aprovado = true
ON CONFLICT DO NOTHING;