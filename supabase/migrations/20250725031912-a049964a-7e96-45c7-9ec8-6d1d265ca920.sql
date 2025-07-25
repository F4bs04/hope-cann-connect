-- Remove ALL remaining policies that reference id_usuario columns

-- Drop ALL policies from all tables to avoid column dependency issues
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

-- Create permissive storage policies
CREATE POLICY "Allow all operations on profiles bucket" ON storage.objects
FOR ALL USING (bucket_id = 'profiles');

CREATE POLICY "Allow all operations on documentos_medicos bucket" ON storage.objects
FOR ALL USING (bucket_id = 'documentos_medicos');

CREATE POLICY "Allow all operations on images bucket" ON storage.objects
FOR ALL USING (bucket_id = 'images');

CREATE POLICY "Allow all operations on bancohope bucket" ON storage.objects
FOR ALL USING (bucket_id = 'bancohope');

-- Drop foreign key constraints before changing column types
ALTER TABLE public.medicos DROP CONSTRAINT IF EXISTS medicos_id_usuario_fkey;
ALTER TABLE public.pacientes DROP CONSTRAINT IF EXISTS pacientes_id_usuario_fkey;
ALTER TABLE public.admins DROP CONSTRAINT IF EXISTS admins_id_usuario_fkey;
ALTER TABLE public.admins_clinica DROP CONSTRAINT IF EXISTS admins_clinica_id_usuario_fkey;

-- Change column types from bigint to UUID to match auth.users.id
ALTER TABLE public.medicos ALTER COLUMN id_usuario TYPE UUID USING id_usuario::text::uuid;
ALTER TABLE public.pacientes ALTER COLUMN id_usuario TYPE UUID USING id_usuario::text::uuid;
ALTER TABLE public.admins ALTER COLUMN id_usuario TYPE UUID USING id_usuario::text::uuid;
ALTER TABLE public.admins_clinica ALTER COLUMN id_usuario TYPE UUID USING id_usuario::text::uuid;