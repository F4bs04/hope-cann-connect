-- Create storage policies for profiles bucket (for photos)
CREATE POLICY "Allow authenticated uploads to profiles" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profiles' AND auth.role() = 'authenticated');

CREATE POLICY "Allow public access to profile photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profiles');

CREATE POLICY "Allow authenticated users to update their profiles" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profiles' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete their profiles" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profiles' AND auth.role() = 'authenticated');

-- Create storage policies for documentos_medicos bucket (for certificates)
CREATE POLICY "Allow authenticated uploads to medical documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documentos_medicos' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated access to own medical documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documentos_medicos' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update their medical documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'documentos_medicos' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete their medical documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documentos_medicos' AND auth.role() = 'authenticated');