-- Limpar todos os dados de usuários para permitir novo registro
-- CUIDADO: Isso irá apagar TODOS os dados do sistema

-- Desabilitar triggers temporariamente para evitar erros de referência
SET session_replication_role = replica;

-- Deletar dados das tabelas relacionadas primeiro (ordem de dependência)
DELETE FROM consultas;
DELETE FROM horarios_disponiveis;
DELETE FROM receitas;
DELETE FROM atestados;
DELETE FROM laudos;
DELETE FROM prontuarios;
DELETE FROM mensagens;
DELETE FROM saldo_pacientes;

-- Deletar dados das tabelas principais
DELETE FROM medicos;
DELETE FROM pacientes;
DELETE FROM clinicas;
DELETE FROM usuarios;

-- Reabilitar triggers
SET session_replication_role = DEFAULT;

-- Resetar sequências para começar do ID 1
ALTER SEQUENCE usuarios_id_seq RESTART WITH 1;
ALTER SEQUENCE medicos_id_seq RESTART WITH 1;
ALTER SEQUENCE pacientes_id_seq RESTART WITH 1;
ALTER SEQUENCE clinicas_id_seq RESTART WITH 1;
ALTER SEQUENCE consultas_id_seq RESTART WITH 1;
ALTER SEQUENCE horarios_disponiveis_id_seq RESTART WITH 1;
ALTER SEQUENCE receitas_id_seq RESTART WITH 1;
ALTER SEQUENCE atestados_id_seq RESTART WITH 1;
ALTER SEQUENCE laudos_id_seq RESTART WITH 1;
ALTER SEQUENCE prontuarios_id_seq RESTART WITH 1;
ALTER SEQUENCE mensagens_id_seq RESTART WITH 1;
ALTER SEQUENCE saldo_pacientes_id_seq RESTART WITH 1;