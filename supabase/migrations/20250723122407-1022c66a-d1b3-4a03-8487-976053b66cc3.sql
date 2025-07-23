-- Atualizar permissões RLS para mensagens_chat
DROP POLICY IF EXISTS "Visualização de mensagens" ON mensagens_chat;

CREATE POLICY "Médicos e pacientes podem ver suas mensagens" 
ON mensagens_chat 
FOR SELECT 
USING (true);

CREATE POLICY "Médicos e pacientes podem enviar mensagens" 
ON mensagens_chat 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Médicos e pacientes podem atualizar mensagens" 
ON mensagens_chat 
FOR UPDATE 
USING (true);

-- Atualizar permissões RLS para chat_ativo
DROP POLICY IF EXISTS "Visualização de chat ativo" ON chat_ativo;

CREATE POLICY "Médicos e pacientes podem ver chats ativos" 
ON chat_ativo 
FOR SELECT 
USING (true);

CREATE POLICY "Sistema pode inserir chats ativos" 
ON chat_ativo 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Sistema pode atualizar chats ativos" 
ON chat_ativo 
FOR UPDATE 
USING (true);