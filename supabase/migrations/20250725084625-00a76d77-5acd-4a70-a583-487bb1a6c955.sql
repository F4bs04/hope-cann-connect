-- ===================================================
-- CONTINUAÇÃO DA REESTRUTURAÇÃO - CRIANDO POLÍTICAS RLS
-- ===================================================

-- 9. CRIAR POLÍTICAS DE ROW LEVEL SECURITY
-- ===================================================

-- Profiles: usuários podem ver/editar seu próprio perfil
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Clinics: leitura pública, apenas admins podem modificar
CREATE POLICY "Anyone can view active clinics" ON public.clinics
  FOR SELECT USING (is_active = true);

CREATE POLICY "System admins can manage clinics" ON public.clinics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- Patients: pacientes veem seus dados, médicos veem pacientes de suas consultas
CREATE POLICY "Users can view their own patient data" ON public.patients
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.appointments a
      JOIN public.doctors d ON d.id = a.doctor_id
      WHERE a.patient_id = patients.id 
        AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own patient data" ON public.patients
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own patient data" ON public.patients
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Doctors: médicos veem seu perfil, pacientes veem médicos aprovados
CREATE POLICY "Anyone can view approved doctors" ON public.doctors
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Doctors can view their own profile" ON public.doctors
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Doctors can update their own profile" ON public.doctors
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Doctors can insert their own profile" ON public.doctors
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Cannabis Products: leitura pública para produtos ativos
CREATE POLICY "Anyone can view active cannabis products" ON public.cannabis_products
  FOR SELECT USING (is_active = true);

CREATE POLICY "System admins can manage cannabis products" ON public.cannabis_products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

-- Doctor Schedules: médicos gerenciam seus horários
CREATE POLICY "Doctors can manage their own schedules" ON public.doctor_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.doctors 
      WHERE id = doctor_schedules.doctor_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active doctor schedules" ON public.doctor_schedules
  FOR SELECT USING (is_active = true);

-- Appointments: pacientes/médicos veem suas consultas
CREATE POLICY "Patients can view their appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients 
      WHERE id = appointments.patient_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can view their appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.doctors 
      WHERE id = appointments.doctor_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients 
      WHERE id = appointments.patient_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update their appointments" ON public.appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.doctors 
      WHERE id = appointments.doctor_id AND user_id = auth.uid()
    )
  );

-- Medical Records: apenas médico e paciente envolvidos
CREATE POLICY "Patients can view their medical records" ON public.medical_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients 
      WHERE id = medical_records.patient_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can manage medical records for their patients" ON public.medical_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.doctors 
      WHERE id = medical_records.doctor_id AND user_id = auth.uid()
    )
  );

-- Documents: pacientes veem seus documentos, médicos veem documentos que criaram
CREATE POLICY "Patients can view their documents" ON public.documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients 
      WHERE id = documents.patient_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can manage documents for their patients" ON public.documents
  FOR ALL USING (
    doctor_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.doctors 
      WHERE id = documents.doctor_id AND user_id = auth.uid()
    )
  );

-- Prescriptions: similar aos documents
CREATE POLICY "Patients can view their prescriptions" ON public.prescriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients 
      WHERE id = prescriptions.patient_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can manage prescriptions" ON public.prescriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.doctors 
      WHERE id = prescriptions.doctor_id AND user_id = auth.uid()
    )
  );

-- Exam Templates: médicos gerenciam seus templates
CREATE POLICY "Doctors can manage their exam templates" ON public.exam_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.doctors 
      WHERE id = exam_templates.doctor_id AND user_id = auth.uid()
    )
  );

-- Active Chats: apenas participantes do chat
CREATE POLICY "Chat participants can view active chats" ON public.active_chats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients 
      WHERE id = active_chats.patient_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.doctors 
      WHERE id = active_chats.doctor_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage active chats" ON public.active_chats
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update active chats" ON public.active_chats
  FOR UPDATE USING (true);

-- Chat Messages: apenas participantes do chat
CREATE POLICY "Chat participants can view messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.active_chats ac
      JOIN public.patients p ON p.id = ac.patient_id
      WHERE ac.id = chat_messages.chat_id AND p.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.active_chats ac
      JOIN public.doctors d ON d.id = ac.doctor_id
      WHERE ac.id = chat_messages.chat_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Chat participants can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Chat participants can update their messages" ON public.chat_messages
  FOR UPDATE USING (sender_id = auth.uid());

-- Financial Transactions: usuários veem suas transações
CREATE POLICY "Doctors can view their transactions" ON public.financial_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.doctors 
      WHERE id = financial_transactions.doctor_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can view their transactions" ON public.financial_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients 
      WHERE id = financial_transactions.patient_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert transactions" ON public.financial_transactions
  FOR INSERT WITH CHECK (true);

-- Account Balances: usuários veem seu saldo
CREATE POLICY "Users can view their own balance" ON public.account_balances
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage balances" ON public.account_balances
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update balances" ON public.account_balances
  FOR UPDATE USING (true);

-- Notifications: usuários veem suas notificações
CREATE POLICY "Users can manage their notifications" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

-- Activity Logs: apenas admins veem logs
CREATE POLICY "System admins can view activity logs" ON public.activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'system_admin'
    )
  );

CREATE POLICY "System can insert activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (true);

-- 10. CRIAR FUNÇÃO PARA INSERIR PROFILE AUTOMÁTICO
-- ===================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')::user_role
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar profile automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. INSERIR DADOS INICIAIS DE EXEMPLO
-- ===================================================

-- Inserir alguns produtos cannabis de exemplo
INSERT INTO public.cannabis_products (name, manufacturer, product_type, thc_concentration, cbd_concentration, default_dosage, description) VALUES
('CBD Oil 10%', 'MedCannabis', 'Oil', 0.50, 10.00, '0.25ml 2x/day', 'High CBD oil for pain relief'),
('THC Oil 5%', 'MedCannabis', 'Oil', 5.00, 1.00, '0.1ml 1x/day', 'Low THC oil for appetite stimulation'),
('Balanced Oil 1:1', 'MedCannabis', 'Oil', 2.50, 2.50, '0.2ml 2x/day', 'Balanced THC:CBD ratio for general wellness');

-- 12. CONFIGURAR POLÍTICAS DE STORAGE
-- ===================================================

-- Remove políticas antigas de storage
DROP POLICY IF EXISTS "Allow all operations on profiles bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on documentos_medicos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on images bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on bancohope bucket" ON storage.objects;

-- Políticas seguras para storage
CREATE POLICY "Users can upload to profiles bucket" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profiles' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view profiles bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'profiles');

CREATE POLICY "Users can update their own files in profiles" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profiles' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Authenticated users can access medical documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documentos_medicos' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Doctors can upload medical documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documentos_medicos' AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('doctor', 'system_admin')
    )
  );

CREATE POLICY "Public access to images bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' AND 
    auth.role() = 'authenticated'
  );

-- Política para bancohope bucket (público)
CREATE POLICY "Public access to bancohope bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'bancohope');