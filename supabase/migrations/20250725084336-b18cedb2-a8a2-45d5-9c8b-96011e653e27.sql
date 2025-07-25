-- ===================================================
-- REESTRUTURAÇÃO COMPLETA DO BANCO DE DADOS
-- Mantendo compatibilidade com o frontend existente
-- ===================================================

-- 1. REMOVER TODAS AS TABELAS E POLICIES EXISTENTES
-- ===================================================

-- Drop all existing policies first
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables in public schema
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename;
    END LOOP;
END $$;

-- Drop all existing tables (except auth-related ones managed by Supabase)
DROP TABLE IF EXISTS public.acompanhamento CASCADE;
DROP TABLE IF EXISTS public.admins CASCADE;
DROP TABLE IF EXISTS public.admins_clinica CASCADE;
DROP TABLE IF EXISTS public.atestados CASCADE;
DROP TABLE IF EXISTS public.chat_ativo CASCADE;
DROP TABLE IF EXISTS public.clinic_users CASCADE;
DROP TABLE IF EXISTS public.clinicas CASCADE;
DROP TABLE IF EXISTS public.consultas CASCADE;
DROP TABLE IF EXISTS public.documentos CASCADE;
DROP TABLE IF EXISTS public.historico_medico CASCADE;
DROP TABLE IF EXISTS public.horarios_disponiveis CASCADE;
DROP TABLE IF EXISTS public.laudos CASCADE;
DROP TABLE IF EXISTS public.log_atividades CASCADE;
DROP TABLE IF EXISTS public.medicos CASCADE;
DROP TABLE IF EXISTS public.mensagens_chat CASCADE;
DROP TABLE IF EXISTS public.notificacoes CASCADE;
DROP TABLE IF EXISTS public.pacientes CASCADE;
DROP TABLE IF EXISTS public.pacientes_app_backup CASCADE;
DROP TABLE IF EXISTS public.pacientes_backup CASCADE;
DROP TABLE IF EXISTS public.pedidos_exame CASCADE;
DROP TABLE IF EXISTS public.permissoes CASCADE;
DROP TABLE IF EXISTS public.prescricoes CASCADE;
DROP TABLE IF EXISTS public.produtos_cannabis CASCADE;
DROP TABLE IF EXISTS public.prontuarios CASCADE;
DROP TABLE IF EXISTS public.receitas_app CASCADE;
DROP TABLE IF EXISTS public.renovacoes_prescricao CASCADE;
DROP TABLE IF EXISTS public.saldo_medicos CASCADE;
DROP TABLE IF EXISTS public.saldo_pacientes CASCADE;
DROP TABLE IF EXISTS public.templates_exame CASCADE;
DROP TABLE IF EXISTS public.transacoes_medicos CASCADE;
DROP TABLE IF EXISTS public.usuario_permissoes CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;

-- Drop all existing sequences
DROP SEQUENCE IF EXISTS atestados_id_seq CASCADE;
DROP SEQUENCE IF EXISTS chat_ativo_id_seq CASCADE;
DROP SEQUENCE IF EXISTS horarios_disponiveis_id_seq CASCADE;
DROP SEQUENCE IF EXISTS laudos_id_seq CASCADE;
DROP SEQUENCE IF EXISTS mensagens_chat_id_seq CASCADE;
DROP SEQUENCE IF EXISTS pacientes_app_id_seq CASCADE;
DROP SEQUENCE IF EXISTS pacientes_unified_id_seq CASCADE;
DROP SEQUENCE IF EXISTS pedidos_exame_id_seq CASCADE;
DROP SEQUENCE IF EXISTS prontuarios_id_seq CASCADE;
DROP SEQUENCE IF EXISTS receitas_app_id_seq CASCADE;
DROP SEQUENCE IF EXISTS saldo_medicos_id_seq CASCADE;
DROP SEQUENCE IF EXISTS saldo_pacientes_id_seq CASCADE;
DROP SEQUENCE IF EXISTS templates_exame_id_seq CASCADE;
DROP SEQUENCE IF EXISTS transacoes_medicos_id_seq CASCADE;

-- 2. CRIAR ENUMS E TIPOS
-- ===================================================

-- User roles enum
CREATE TYPE public.user_role AS ENUM ('patient', 'doctor', 'clinic_admin', 'system_admin');

-- Document types
CREATE TYPE public.document_type AS ENUM ('prescription', 'certificate', 'medical_report', 'exam_request', 'medical_record');

-- Appointment status
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');

-- Consultation types
CREATE TYPE public.consultation_type AS ENUM ('in_person', 'telemedicine', 'follow_up', 'emergency');

-- Days of week
CREATE TYPE public.day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- Transaction types
CREATE TYPE public.transaction_type AS ENUM ('credit', 'debit', 'fee', 'refund');

-- 3. TABELA DE PROFILES (baseada em auth.users)
-- ===================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'patient',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. TABELAS PRINCIPAIS
-- ===================================================

-- Clínicas
CREATE TABLE public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pacientes
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  birth_date DATE NOT NULL,
  gender TEXT,
  cpf TEXT UNIQUE,
  address TEXT,
  medical_condition TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Médicos
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinics(id),
  crm TEXT UNIQUE NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  specialty TEXT NOT NULL,
  biography TEXT,
  consultation_fee DECIMAL(10,2) DEFAULT 0.00,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Produtos Cannabis
CREATE TABLE public.cannabis_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  product_type TEXT NOT NULL,
  thc_concentration DECIMAL(5,2),
  cbd_concentration DECIMAL(5,2),
  default_dosage TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Horários Disponíveis dos Médicos
CREATE TABLE public.doctor_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  day_of_week day_of_week NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(doctor_id, day_of_week, start_time)
);

-- Consultas
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id),
  clinic_id UUID REFERENCES public.clinics(id),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  consultation_type consultation_type NOT NULL DEFAULT 'in_person',
  status appointment_status NOT NULL DEFAULT 'scheduled',
  reason TEXT NOT NULL,
  notes TEXT,
  fee DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Prontuários Médicos
CREATE TABLE public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id),
  appointment_id UUID REFERENCES public.appointments(id),
  chief_complaint TEXT,
  history_present_illness TEXT,
  past_medical_history TEXT,
  family_history TEXT,
  lifestyle_habits TEXT,
  current_medications TEXT,
  physical_examination TEXT,
  assessment TEXT,
  plan TEXT,
  symptoms TEXT,
  diagnosis TEXT,
  treatment TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Documentos
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  doctor_id UUID REFERENCES public.doctors(id),
  document_type document_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  file_path TEXT,
  file_bucket TEXT DEFAULT 'documentos_medicos',
  is_signed BOOLEAN NOT NULL DEFAULT false,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Prescrições/Receitas
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id),
  appointment_id UUID REFERENCES public.appointments(id),
  product_id UUID REFERENCES public.cannabis_products(id),
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructions TEXT,
  notes TEXT,
  verification_code TEXT UNIQUE NOT NULL,
  file_path TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Templates de Exames
CREATE TABLE public.exam_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id),
  name TEXT NOT NULL,
  exam_name TEXT NOT NULL,
  justification TEXT,
  priority TEXT DEFAULT 'routine',
  instructions TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Chats Ativos
CREATE TABLE public.active_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  appointment_id UUID REFERENCES public.appointments(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(doctor_id, patient_id, appointment_id)
);

-- Mensagens do Chat
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.active_chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Transações Financeiras
CREATE TABLE public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES public.doctors(id),
  patient_id UUID REFERENCES public.patients(id),
  appointment_id UUID REFERENCES public.appointments(id),
  transaction_type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Saldos (view materializada atualizada por triggers)
CREATE TABLE public.account_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Notificações
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Log de Atividades
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  activity_type TEXT NOT NULL,
  description TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. CRIAR ÍNDICES PARA PERFORMANCE
-- ===================================================

-- Índices para consultas frequentes
CREATE INDEX idx_patients_user_id ON public.patients(user_id);
CREATE INDEX idx_doctors_user_id ON public.doctors(user_id);
CREATE INDEX idx_doctors_clinic_id ON public.doctors(clinic_id);
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX idx_documents_patient_id ON public.documents(patient_id);
CREATE INDEX idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX idx_chat_messages_chat_id ON public.chat_messages(chat_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- 6. CRIAR FUNÇÕES AUXILIARES
-- ===================================================

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Função para verificar disponibilidade do médico
CREATE OR REPLACE FUNCTION public.is_doctor_available(
  p_doctor_id UUID,
  p_scheduled_at TIMESTAMP WITH TIME ZONE,
  p_appointment_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_day_of_week day_of_week;
  v_time TIME;
  v_has_schedule BOOLEAN := FALSE;
  v_has_conflict BOOLEAN := FALSE;
BEGIN
  -- Mapear dia da semana
  v_day_of_week := CASE EXTRACT(DOW FROM p_scheduled_at)
    WHEN 1 THEN 'monday'::day_of_week
    WHEN 2 THEN 'tuesday'::day_of_week
    WHEN 3 THEN 'wednesday'::day_of_week
    WHEN 4 THEN 'thursday'::day_of_week
    WHEN 5 THEN 'friday'::day_of_week
    WHEN 6 THEN 'saturday'::day_of_week
    WHEN 0 THEN 'sunday'::day_of_week
  END;
  
  v_time := p_scheduled_at::TIME;
  
  -- Verificar se há horário disponível
  SELECT EXISTS(
    SELECT 1 FROM public.doctor_schedules
    WHERE doctor_id = p_doctor_id
      AND day_of_week = v_day_of_week
      AND start_time <= v_time
      AND end_time >= v_time
      AND is_active = true
  ) INTO v_has_schedule;
  
  -- Verificar conflitos
  SELECT EXISTS(
    SELECT 1 FROM public.appointments
    WHERE doctor_id = p_doctor_id
      AND status NOT IN ('cancelled', 'completed')
      AND (p_appointment_id IS NULL OR id != p_appointment_id)
      AND ABS(EXTRACT(EPOCH FROM (scheduled_at - p_scheduled_at))) < 1800 -- 30 min
  ) INTO v_has_conflict;
  
  RETURN v_has_schedule AND NOT v_has_conflict;
END;
$$;

-- Função para atualizar saldo após consulta
CREATE OR REPLACE FUNCTION public.update_balance_after_appointment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  v_doctor_user_id UUID;
  v_fee DECIMAL(10,2);
BEGIN
  -- Quando consulta é concluída
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Obter user_id do médico e taxa
    SELECT d.user_id, COALESCE(NEW.fee, d.consultation_fee)
    INTO v_doctor_user_id, v_fee
    FROM public.doctors d
    WHERE d.id = NEW.doctor_id;
    
    IF v_fee > 0 THEN
      -- Inserir transação
      INSERT INTO public.financial_transactions (
        doctor_id, appointment_id, transaction_type, amount, description
      ) VALUES (
        NEW.doctor_id, NEW.id, 'credit', v_fee, 
        'Payment for consultation #' || NEW.id
      );
      
      -- Atualizar saldo
      INSERT INTO public.account_balances (user_id, balance)
      VALUES (v_doctor_user_id, v_fee)
      ON CONFLICT (user_id) DO UPDATE
      SET balance = account_balances.balance + v_fee,
          last_updated = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Função para criar chat após consulta
CREATE OR REPLACE FUNCTION public.create_chat_after_appointment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Quando consulta é concluída, criar chat por 14 dias
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    INSERT INTO public.active_chats (
      doctor_id, patient_id, appointment_id, ends_at
    ) VALUES (
      NEW.doctor_id, NEW.patient_id, NEW.id, 
      now() + INTERVAL '14 days'
    )
    ON CONFLICT (doctor_id, patient_id, appointment_id) DO NOTHING;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- 7. CRIAR TRIGGERS
-- ===================================================

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Triggers de negócio
CREATE TRIGGER update_balance_after_appointment_trigger
  AFTER UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_balance_after_appointment();

CREATE TRIGGER create_chat_after_appointment_trigger
  AFTER UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.create_chat_after_appointment();

-- 8. HABILITAR RLS EM TODAS AS TABELAS
-- ===================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cannabis_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;