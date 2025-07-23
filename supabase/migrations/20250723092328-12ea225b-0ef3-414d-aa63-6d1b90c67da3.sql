-- Corrigir foreign key constraint da tabela consultas
-- Primeiro remover o constraint antigo que aponta para pacientes_backup
ALTER TABLE public.consultas DROP CONSTRAINT IF EXISTS consultas_id_paciente_fkey;

-- Adicionar novo constraint apontando para a tabela pacientes correta
ALTER TABLE public.consultas 
ADD CONSTRAINT consultas_id_paciente_fkey 
FOREIGN KEY (id_paciente) 
REFERENCES public.pacientes(id);