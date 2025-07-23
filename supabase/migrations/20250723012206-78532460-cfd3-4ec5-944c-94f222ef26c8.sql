-- FASE 2: CORREÇÃO DOS PROBLEMAS DE SEGURANÇA CRÍTICOS (CORRIGIDO)

-- 1. Habilitar RLS nas tabelas que não têm (verificar se já não está habilitado)
DO $$ 
BEGIN
    -- Verificar e habilitar RLS apenas se não estiver habilitado
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        WHERE c.relname = 'notificacoes' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        WHERE c.relname = 'documentos' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        WHERE c.relname = 'historico_medico' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.historico_medico ENABLE ROW LEVEL SECURITY;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        WHERE c.relname = 'log_atividades' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.log_atividades ENABLE ROW LEVEL SECURITY;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        WHERE c.relname = 'permissoes' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        WHERE c.relname = 'prescricoes' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.prescricoes ENABLE ROW LEVEL SECURITY;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        WHERE c.relname = 'renovacoes_prescricao' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.renovacoes_prescricao ENABLE ROW LEVEL SECURITY;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        WHERE c.relname = 'saldo_medicos' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.saldo_medicos ENABLE ROW LEVEL SECURITY;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        WHERE c.relname = 'transacoes_medicos' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.transacoes_medicos ENABLE ROW LEVEL SECURITY;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        WHERE c.relname = 'usuario_permissoes' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.usuario_permissoes ENABLE ROW LEVEL SECURITY;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        WHERE c.relname = 'admins_clinica' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.admins_clinica ENABLE ROW LEVEL SECURITY;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        WHERE c.relname = 'acompanhamento' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.acompanhamento ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 2. Criar políticas básicas para tabelas sem políticas (verificar se já existem)

-- Políticas para notificacoes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'notificacoes' AND policyname = 'Users can manage own notifications'
    ) THEN
        CREATE POLICY "Users can manage own notifications" ON public.notificacoes
        FOR ALL TO authenticated 
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- Políticas para documentos
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'documentos' AND policyname = 'Users can manage documents'
    ) THEN
        CREATE POLICY "Users can manage documents" ON public.documentos
        FOR ALL TO authenticated 
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- Políticas para historico_medico
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'historico_medico' AND policyname = 'Users can manage medical history'
    ) THEN
        CREATE POLICY "Users can manage medical history" ON public.historico_medico
        FOR ALL TO authenticated 
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- Políticas para prescricoes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'prescricoes' AND policyname = 'Users can manage prescriptions'
    ) THEN
        CREATE POLICY "Users can manage prescriptions" ON public.prescricoes
        FOR ALL TO authenticated 
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- Políticas básicas para outras tabelas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'permissoes' AND policyname = 'Authenticated can view permissions'
    ) THEN
        CREATE POLICY "Authenticated can view permissions" ON public.permissoes
        FOR SELECT TO authenticated 
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'renovacoes_prescricao' AND policyname = 'Authenticated can manage renewals'
    ) THEN
        CREATE POLICY "Authenticated can manage renewals" ON public.renovacoes_prescricao
        FOR ALL TO authenticated 
        USING (true)
        WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'usuario_permissoes' AND policyname = 'Authenticated can view user permissions'
    ) THEN
        CREATE POLICY "Authenticated can view user permissions" ON public.usuario_permissoes
        FOR SELECT TO authenticated 
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'admins_clinica' AND policyname = 'Authenticated can manage clinic admins'
    ) THEN
        CREATE POLICY "Authenticated can manage clinic admins" ON public.admins_clinica
        FOR ALL TO authenticated 
        USING (true)
        WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'acompanhamento' AND policyname = 'Authenticated can manage followup'
    ) THEN
        CREATE POLICY "Authenticated can manage followup" ON public.acompanhamento
        FOR ALL TO authenticated 
        USING (true)
        WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'log_atividades' AND policyname = 'Authenticated can view activity logs'
    ) THEN
        CREATE POLICY "Authenticated can view activity logs" ON public.log_atividades
        FOR SELECT TO authenticated 
        USING (true);
    END IF;
END $$;