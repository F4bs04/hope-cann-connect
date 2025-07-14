-- Habilitar realtime para a tabela consultas
ALTER TABLE public.consultas REPLICA IDENTITY FULL;

-- Adicionar tabela à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultas;

-- Habilitar realtime para a tabela horarios_disponiveis
ALTER TABLE public.horarios_disponiveis REPLICA IDENTITY FULL;

-- Adicionar tabela à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.horarios_disponiveis;