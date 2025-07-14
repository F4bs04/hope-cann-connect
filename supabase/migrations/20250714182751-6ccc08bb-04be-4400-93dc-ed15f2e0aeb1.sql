-- Inserir algumas consultas de teste
INSERT INTO consultas (id_medico, id_paciente, data_hora, motivo, status, tipo_consulta)
VALUES 
  (1, 2, '2025-01-16 10:00:00', 'Consulta de rotina', 'agendada', 'presencial'),
  (1, 3, '2025-01-17 14:00:00', 'Acompanhamento', 'agendada', 'online'),
  (2, 4, '2025-01-18 09:00:00', 'Primeira consulta', 'agendada', 'presencial'),
  (1, 2, '2025-01-10 15:00:00', 'Consulta realizada', 'realizada', 'presencial'),
  (2, 3, '2025-01-12 11:00:00', 'Acompanhamento concluído', 'realizada', 'online')
ON CONFLICT DO NOTHING;