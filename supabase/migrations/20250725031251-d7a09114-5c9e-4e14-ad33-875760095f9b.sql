-- Remove all RLS policies and disable RLS for easier development
-- Clean all user data - handling foreign key constraints

-- Disable RLS on all tables first
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinicas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios_disponiveis DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins_clinica DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_medico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescricoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.renovacoes_prescricao DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.acompanhamento DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_atividades DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_permissoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos_cannabis DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes_backup DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes_app_backup DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prontuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.receitas_app DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.atestados DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.laudos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos_exame DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates_exame DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.saldo_medicos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.saldo_pacientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes_medicos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_ativo DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_chat DISABLE ROW LEVEL SECURITY;

-- Clear all user-related data in correct order (respecting foreign keys)
DELETE FROM public.horarios_disponiveis;
DELETE FROM public.consultas;
DELETE FROM public.chat_ativo;
DELETE FROM public.mensagens_chat;
DELETE FROM public.saldo_medicos;
DELETE FROM public.saldo_pacientes;
DELETE FROM public.transacoes_medicos;
DELETE FROM public.templates_exame;
DELETE FROM public.prontuarios;
DELETE FROM public.receitas_app;
DELETE FROM public.atestados;
DELETE FROM public.laudos;
DELETE FROM public.pedidos_exame;
DELETE FROM public.historico_medico;
DELETE FROM public.documentos;
DELETE FROM public.prescricoes;
DELETE FROM public.renovacoes_prescricao;
DELETE FROM public.acompanhamento;
DELETE FROM public.notificacoes;
DELETE FROM public.usuario_permissoes;
DELETE FROM public.log_atividades;
DELETE FROM public.admins;
DELETE FROM public.admins_clinica;
DELETE FROM public.clinic_users;
DELETE FROM public.pacientes_backup;
DELETE FROM public.pacientes_app_backup;
DELETE FROM public.medicos;
DELETE FROM public.pacientes;
DELETE FROM public.clinicas;
DELETE FROM public.usuarios;

-- Delete all auth users
SELECT delete_all_users();

-- Reset sequences
ALTER SEQUENCE IF EXISTS medicos_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS pacientes_unified_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS clinicas_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS usuarios_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS consultas_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS horarios_disponiveis_id_seq RESTART WITH 1;