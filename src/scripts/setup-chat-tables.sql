-- Criar tabela de vínculo entre médico e paciente
CREATE TABLE IF NOT EXISTS public.vinculo_medico_paciente (
    id SERIAL PRIMARY KEY,
    medico_id INTEGER NOT NULL,
    paciente_id INTEGER NOT NULL,
    data_vinculo TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ativo',
    UNIQUE (medico_id, paciente_id)
);

-- Criar tabela de mensagens
CREATE TABLE IF NOT EXISTS public.mensagens (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT false
);

-- Índices para melhorar a performance das consultas
CREATE INDEX IF NOT EXISTS idx_vinculo_medico ON public.vinculo_medico_paciente (medico_id);
CREATE INDEX IF NOT EXISTS idx_vinculo_paciente ON public.vinculo_medico_paciente (paciente_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_sender ON public.mensagens (sender_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_receiver ON public.mensagens (receiver_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_created_at ON public.mensagens (created_at);

-- Configurar as políticas RLS (Row Level Security) para as tabelas
ALTER TABLE public.vinculo_medico_paciente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Criar políticas para vinculo_medico_paciente
CREATE POLICY "Médicos podem ver seus vínculos" ON public.vinculo_medico_paciente
    FOR SELECT USING (
        medico_id IN (
            SELECT id FROM public.medicos WHERE email = auth.email()
        )
    );

CREATE POLICY "Pacientes podem ver seus vínculos" ON public.vinculo_medico_paciente
    FOR SELECT USING (
        paciente_id IN (
            SELECT id FROM public.pacientes_app WHERE email = auth.email()
        )
    );

-- Criar políticas para mensagens
CREATE POLICY "Usuários podem ver mensagens enviadas por eles" ON public.mensagens
    FOR SELECT USING (
        sender_id IN (
            SELECT id FROM public.medicos WHERE email = auth.email()
            UNION
            SELECT id FROM public.pacientes_app WHERE email = auth.email()
        )
    );

CREATE POLICY "Usuários podem ver mensagens recebidas por eles" ON public.mensagens
    FOR SELECT USING (
        receiver_id IN (
            SELECT id FROM public.medicos WHERE email = auth.email()
            UNION
            SELECT id FROM public.pacientes_app WHERE email = auth.email()
        )
    );

CREATE POLICY "Usuários podem enviar mensagens" ON public.mensagens
    FOR INSERT WITH CHECK (
        sender_id IN (
            SELECT id FROM public.medicos WHERE email = auth.email()
            UNION
            SELECT id FROM public.pacientes_app WHERE email = auth.email()
        )
    );

CREATE POLICY "Usuários podem marcar mensagens recebidas como lidas" ON public.mensagens
    FOR UPDATE USING (
        receiver_id IN (
            SELECT id FROM public.medicos WHERE email = auth.email()
            UNION
            SELECT id FROM public.pacientes_app WHERE email = auth.email()
        )
    );

-- Habilitar notificações em tempo real para as tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE public.mensagens;
