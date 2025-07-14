-- Inserir usuário de teste
INSERT INTO public.usuarios (email, senha_hash, tipo_usuario, status)
VALUES ('teste2@gmail.com', 'teste', 'medico', true);

-- Inserir médico de teste
INSERT INTO public.medicos (
  nome, 
  cpf, 
  crm, 
  especialidade, 
  telefone, 
  id_usuario, 
  aprovado, 
  status_disponibilidade,
  valor_por_consulta
) 
VALUES (
  'Dr. Teste Silva',
  '12345678901', 
  'CRM12345', 
  'Medicina Geral', 
  '(11) 99999-9999',
  (SELECT id FROM public.usuarios WHERE email = 'teste2@gmail.com'),
  true,
  true,
  150.00
);