-- Inserir algumas consultas de teste com tipos simples
INSERT INTO consultas (id_medico, id_paciente, data_hora, motivo, status, tipo_consulta)
VALUES 
  (1, 2, '2025-01-16 10:00:00', 'Consulta de rotina', 'agendada', 'consulta'),
  (1, 3, '2025-01-17 14:00:00', 'Acompanhamento', 'agendada', 'consulta'),
  (2, 4, '2025-01-18 09:00:00', 'Primeira consulta', 'agendada', 'consulta'),
  (1, 2, '2025-01-10 15:00:00', 'Consulta realizada', 'realizada', 'consulta'),
  (2, 3, '2025-01-12 11:00:00', 'Acompanhamento concluído', 'realizada', 'consulta')
ON CONFLICT DO NOTHING;