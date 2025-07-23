-- FASE 3: CORREÇÃO ESPECÍFICA PARA HORÁRIOS DISPONÍVEIS E DADOS DE TESTE

-- 1. Remover todas as políticas conflitantes da tabela horarios_disponiveis
DROP POLICY IF EXISTS "Public can view schedules" ON public.horarios_disponiveis;
DROP POLICY IF EXISTS "Authenticated can manage schedules" ON public.horarios_disponiveis;
DROP POLICY IF EXISTS "Allow authenticated users to delete schedules" ON public.horarios_disponiveis;
DROP POLICY IF EXISTS "Allow authenticated users to insert schedules" ON public.horarios_disponiveis;
DROP POLICY IF EXISTS "Allow authenticated users to update schedules" ON public.horarios_disponiveis;
DROP POLICY IF EXISTS "Allow public to view schedules" ON public.horarios_disponiveis;
DROP POLICY IF EXISTS "Anyone can view schedules" ON public.horarios_disponiveis;
DROP POLICY IF EXISTS "Authenticated can delete schedules" ON public.horarios_disponiveis;
DROP POLICY IF EXISTS "Authenticated can insert schedules" ON public.horarios_disponiveis;
DROP POLICY IF EXISTS "Authenticated can update schedules" ON public.horarios_disponiveis;

-- 2. Criar políticas muito simples para horarios_disponiveis
CREATE POLICY "Allow all operations on schedules" 
ON public.horarios_disponiveis 
FOR ALL 
TO public 
USING (true)
WITH CHECK (true);

-- 3. Criar dados de teste básicos

-- Inserir usuário de teste para médico
INSERT INTO public.usuarios (id, email, tipo_usuario, senha_hash, status) 
VALUES (1, 'medico1@teste.com', 'medico', crypt('123456', gen_salt('bf')), true)
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  tipo_usuario = EXCLUDED.tipo_usuario,
  senha_hash = EXCLUDED.senha_hash,
  status = EXCLUDED.status;

-- Inserir usuário de teste para paciente
INSERT INTO public.usuarios (id, email, tipo_usuario, senha_hash, status) 
VALUES (2, 'paciente1@teste.com', 'paciente', crypt('123456', gen_salt('bf')), true)
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  tipo_usuario = EXCLUDED.tipo_usuario,
  senha_hash = EXCLUDED.senha_hash,
  status = EXCLUDED.status;

-- Inserir médico de teste
INSERT INTO public.medicos (id, id_usuario, nome, crm, especialidade, telefone, cpf, aprovado, status_disponibilidade, valor_por_consulta)
VALUES (1, 1, 'Dr. João Silva', '12345-SP', 'Cannabis Medicinal', '(11) 99999-9999', '123.456.789-00', true, true, 200.00)
ON CONFLICT (id) DO UPDATE SET 
  id_usuario = EXCLUDED.id_usuario,
  nome = EXCLUDED.nome,
  crm = EXCLUDED.crm,
  especialidade = EXCLUDED.especialidade,
  telefone = EXCLUDED.telefone,
  cpf = EXCLUDED.cpf,
  aprovado = EXCLUDED.aprovado,
  status_disponibilidade = EXCLUDED.status_disponibilidade,
  valor_por_consulta = EXCLUDED.valor_por_consulta;

-- Inserir paciente de teste
INSERT INTO public.pacientes (id, id_usuario, nome, email, telefone, data_nascimento, genero, endereco)
VALUES (1, 2, 'Maria Santos', 'paciente1@teste.com', '(11) 88888-8888', '1990-01-01', 'feminino', 'Rua das Flores, 123')
ON CONFLICT (id) DO UPDATE SET 
  id_usuario = EXCLUDED.id_usuario,
  nome = EXCLUDED.nome,
  email = EXCLUDED.email,
  telefone = EXCLUDED.telefone,
  data_nascimento = EXCLUDED.data_nascimento,
  genero = EXCLUDED.genero,
  endereco = EXCLUDED.endereco;

-- 4. Corrigir políticas para consultas também
DROP POLICY IF EXISTS "Allow authenticated users to manage consultas" ON public.consultas;

CREATE POLICY "Allow all operations on consultas" 
ON public.consultas 
FOR ALL 
TO public 
USING (true)
WITH CHECK (true);

-- 5. Corrigir políticas para pacientes
DROP POLICY IF EXISTS "Allow authenticated users to manage pacientes" ON public.pacientes;

CREATE POLICY "Allow all operations on pacientes" 
ON public.pacientes 
FOR ALL 
TO public 
USING (true)
WITH CHECK (true);

-- 6. Corrigir políticas para medicos
DROP POLICY IF EXISTS "Allow public to view doctors" ON public.medicos;
DROP POLICY IF EXISTS "Allow authenticated users to manage medicos" ON public.medicos;

CREATE POLICY "Allow all operations on medicos" 
ON public.medicos 
FOR ALL 
TO public 
USING (true)
WITH CHECK (true);