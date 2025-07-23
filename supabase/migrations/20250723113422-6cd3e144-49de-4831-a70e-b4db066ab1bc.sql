-- Corrigir constraint de tipo_consulta para permitir valores mais específicos
-- Primeiro, remover a constraint existente
ALTER TABLE public.consultas DROP CONSTRAINT IF EXISTS consultas_tipo_consulta_check;

-- Adicionar nova constraint com valores corretos
ALTER TABLE public.consultas 
ADD CONSTRAINT consultas_tipo_consulta_check 
CHECK (tipo_consulta = ANY (ARRAY[
  'primeira_consulta'::text, 
  'retorno'::text, 
  'acompanhamento'::text,
  'presencial'::text,
  'telemedicina'::text
]));