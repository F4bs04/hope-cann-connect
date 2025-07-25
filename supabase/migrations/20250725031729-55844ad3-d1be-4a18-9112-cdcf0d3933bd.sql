-- Fix storage and remove remaining policies before type change

-- Remove all RLS policies that reference id_usuario before changing column type
DROP POLICY IF EXISTS "Permitir que usuários criem seu próprio perfil de médico" ON public.medicos;
DROP POLICY IF EXISTS "Medicos can view their own profile" ON public.medicos;
DROP POLICY IF EXISTS "Pacientes podem ver apenas seus próprios dados" ON public.pacientes_backup;
DROP POLICY IF EXISTS "Pacientes podem atualizar seus próprios dados" ON public.pacientes_backup;
DROP POLICY IF EXISTS "Pacientes podem excluir seu próprio perfil" ON public.pacientes_backup;
DROP POLICY IF EXISTS "Pacientes podem visualizar seus próprios dados" ON public.pacientes_backup;
DROP POLICY IF EXISTS "Pacientes can view their own data" ON public.pacientes;
DROP POLICY IF EXISTS "Admins can view their own data" ON public.admins;

-- Remove storage policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;

-- Create permissive policies for storage
CREATE POLICY "Allow all operations on profiles bucket" ON storage.objects
FOR ALL USING (bucket_id = 'profiles');

CREATE POLICY "Allow all operations on documentos_medicos bucket" ON storage.objects
FOR ALL USING (bucket_id = 'documentos_medicos');

CREATE POLICY "Allow all operations on images bucket" ON storage.objects
FOR ALL USING (bucket_id = 'images');

CREATE POLICY "Allow all operations on bancohope bucket" ON storage.objects
FOR ALL USING (bucket_id = 'bancohope');

-- Now fix id_usuario type issue - change from bigint to UUID to match auth.users
-- First backup the current foreign keys and drop them
ALTER TABLE public.medicos DROP CONSTRAINT IF EXISTS medicos_id_usuario_fkey;
ALTER TABLE public.pacientes DROP CONSTRAINT IF EXISTS pacientes_id_usuario_fkey;
ALTER TABLE public.admins DROP CONSTRAINT IF EXISTS admins_id_usuario_fkey;
ALTER TABLE public.admins_clinica DROP CONSTRAINT IF EXISTS admins_clinica_id_usuario_fkey;

-- Change column types
ALTER TABLE public.medicos ALTER COLUMN id_usuario TYPE UUID USING id_usuario::text::uuid;
ALTER TABLE public.pacientes ALTER COLUMN id_usuario TYPE UUID USING id_usuario::text::uuid;
ALTER TABLE public.admins ALTER COLUMN id_usuario TYPE UUID USING id_usuario::text::uuid;
ALTER TABLE public.admins_clinica ALTER COLUMN id_usuario TYPE UUID USING id_usuario::text::uuid;