-- FASE 3: CORREÇÃO ESPECÍFICA PARA HORÁRIOS DISPONÍVEIS (CORRIGIDO)

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

-- 3. Corrigir políticas para consultas também
DROP POLICY IF EXISTS "Allow authenticated users to manage consultas" ON public.consultas;

CREATE POLICY "Allow all operations on consultas" 
ON public.consultas 
FOR ALL 
TO public 
USING (true)
WITH CHECK (true);

-- 4. Corrigir políticas para pacientes
DROP POLICY IF EXISTS "Allow authenticated users to manage pacientes" ON public.pacientes;

CREATE POLICY "Allow all operations on pacientes" 
ON public.pacientes 
FOR ALL 
TO public 
USING (true)
WITH CHECK (true);

-- 5. Corrigir políticas para medicos
DROP POLICY IF EXISTS "Allow public to view doctors" ON public.medicos;
DROP POLICY IF EXISTS "Allow authenticated users to manage medicos" ON public.medicos;

CREATE POLICY "Allow all operations on medicos" 
ON public.medicos 
FOR ALL 
TO public 
USING (true)
WITH CHECK (true);

-- 6. Criar dados de teste básicos (sem especificar ID)

-- Inserir usuário de teste para médico (deixar o ID ser gerado automaticamente)
INSERT INTO public.usuarios (email, tipo_usuario, senha_hash, status) 
VALUES ('medico1@teste.com', 'medico', crypt('123456', gen_salt('bf')), true)
ON CONFLICT (email) DO NOTHING;

-- Inserir usuário de teste para paciente
INSERT INTO public.usuarios (email, tipo_usuario, senha_hash, status) 
VALUES ('paciente1@teste.com', 'paciente', crypt('123456', gen_salt('bf')), true)
ON CONFLICT (email) DO NOTHING;

-- Inserir médico de teste (buscar o ID do usuário criado)
DO $$
DECLARE
    user_id_medico bigint;
BEGIN
    -- Buscar o ID do usuário médico
    SELECT id INTO user_id_medico FROM public.usuarios WHERE email = 'medico1@teste.com';
    
    IF user_id_medico IS NOT NULL THEN
        -- Inserir médico com o ID do usuário
        INSERT INTO public.medicos (id_usuario, nome, crm, especialidade, telefone, cpf, aprovado, status_disponibilidade, valor_por_consulta)
        VALUES (user_id_medico, 'Dr. João Silva', '12345-SP', 'Cannabis Medicinal', '(11) 99999-9999', '123.456.789-00', true, true, 200.00)
        ON CONFLICT (cpf) DO NOTHING;
    END IF;
END $$;

-- Inserir paciente de teste
DO $$
DECLARE
    user_id_paciente bigint;
BEGIN
    -- Buscar o ID do usuário paciente
    SELECT id INTO user_id_paciente FROM public.usuarios WHERE email = 'paciente1@teste.com';
    
    IF user_id_paciente IS NOT NULL THEN
        -- Inserir paciente com o ID do usuário
        INSERT INTO public.pacientes (id_usuario, nome, email, telefone, data_nascimento, genero, endereco)
        VALUES (user_id_paciente, 'Maria Santos', 'paciente1@teste.com', '(11) 88888-8888', '1990-01-01', 'feminino', 'Rua das Flores, 123')
        ON CONFLICT (email) DO NOTHING;
    END IF;
END $$;