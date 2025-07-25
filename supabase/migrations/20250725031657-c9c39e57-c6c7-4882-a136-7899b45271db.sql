-- Fix storage policies and data type issues

-- Remove RLS from storage.objects for profiles bucket
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

-- Fix id_usuario type issue in medicos table
-- The auth.users has UUID but medicos.id_usuario is bigint, let's change it to UUID
ALTER TABLE public.medicos ALTER COLUMN id_usuario TYPE UUID USING id_usuario::text::uuid;
ALTER TABLE public.pacientes ALTER COLUMN id_usuario TYPE UUID USING id_usuario::text::uuid;
ALTER TABLE public.admins ALTER COLUMN id_usuario TYPE UUID USING id_usuario::text::uuid;
ALTER TABLE public.admins_clinica ALTER COLUMN id_usuario TYPE UUID USING id_usuario::text::uuid;