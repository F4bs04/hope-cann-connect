-- Inserir algumas consultas de teste com tipos válidos
INSERT INTO consultas (id_medico, id_paciente, data_hora, motivo, status, tipo_consulta)
VALUES 
  (1, 2, '2025-01-16 10:00:00', 'Consulta de rotina', 'agendada', 'primeira_consulta'),
  (1, 3, '2025-01-17 14:00:00', 'Acompanhamento', 'agendada', 'retorno'),
  (2, 4, '2025-01-18 09:00:00', 'Primeira consulta', 'agendada', 'primeira_consulta'),
  (1, 2, '2025-01-10 15:00:00', 'Consulta realizada', 'realizada', 'retorno'),
  (2, 3, '2025-01-12 11:00:00', 'Acompanhamento concluído', 'realizada', 'acompanhamento')
ON CONFLICT DO NOTHING;