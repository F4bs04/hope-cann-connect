-- Criar tabela de admins
CREATE TABLE public.admins (
  id SERIAL PRIMARY KEY,
  id_usuario BIGINT REFERENCES public.usuarios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  cargo TEXT DEFAULT 'Administrador',
  permissoes JSONB DEFAULT '["gerenciar_medicos", "aprovar_medicos", "relatorios"]'::jsonb,
  ativo BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(id_usuario)
);

-- Habilitar RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Política para admins verem seus próprios dados
CREATE POLICY "Admins podem ver seus dados" 
ON public.admins 
FOR ALL 
USING (
  id_usuario = (
    SELECT u.id FROM usuarios u WHERE u.email = get_authenticated_email()
  )
);

-- Atualizar AuthStore para incluir admin
-- Primeiro, vamos criar um usuário admin de exemplo (pode ser removido depois)
INSERT INTO public.usuarios (email, tipo_usuario, status) 
VALUES ('admin@sistema.com', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Inserir admin correspondente
INSERT INTO public.admins (id_usuario, nome, email, telefone, cargo) 
SELECT 
  u.id,
  'Administrador Sistema',
  u.email,
  '(11) 99999-9999',
  'Administrador Geral'
FROM usuarios u 
WHERE u.email = 'admin@sistema.com' AND u.tipo_usuario = 'admin'
ON CONFLICT (id_usuario) DO NOTHING;