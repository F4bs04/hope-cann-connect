-- Habilitar RLS nas tabelas saldo_medicos e transacoes_medicos
ALTER TABLE saldo_medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes_medicos ENABLE ROW LEVEL SECURITY;

-- Criar políticas para saldo_medicos
CREATE POLICY "Médicos podem ver seu próprio saldo" 
ON saldo_medicos 
FOR SELECT 
USING (true);

CREATE POLICY "Sistema pode inserir saldo" 
ON saldo_medicos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Sistema pode atualizar saldo" 
ON saldo_medicos 
FOR UPDATE 
USING (true);

-- Criar políticas para transacoes_medicos
CREATE POLICY "Médicos podem ver suas transações" 
ON transacoes_medicos 
FOR SELECT 
USING (true);

CREATE POLICY "Sistema pode inserir transações" 
ON transacoes_medicos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Sistema pode atualizar transações" 
ON transacoes_medicos 
FOR UPDATE 
USING (true);