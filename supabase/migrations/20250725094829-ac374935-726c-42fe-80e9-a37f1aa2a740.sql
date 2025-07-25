-- Aprovar médicos existentes
UPDATE doctors 
SET is_approved = true, 
    approved_at = now(),
    is_available = true
WHERE is_approved = false;

-- Verificar se temos perfis completos para os médicos
-- Se não, criar perfis de exemplo para demonstração
INSERT INTO profiles (id, email, full_name, role, avatar_url) 
SELECT 
  d.user_id,
  'medico' || d.user_id::text || '@hopecann.com.br',
  CASE 
    WHEN d.specialty LIKE '%neuro%' THEN 'Dr. Carlos Neuromed'
    WHEN d.specialty LIKE '%psiq%' THEN 'Dra. Ana Psiquiatra'
    WHEN d.specialty LIKE '%cannabis%' THEN 'Dr. Ricardo Cannabis'
    ELSE 'Dr. Especialista ' || d.id::text
  END,
  'doctor',
  CASE 
    WHEN d.specialty LIKE '%neuro%' THEN '/lovable-uploads/8e0e4c0d-f012-449c-9784-9be7170458f5.png'
    WHEN d.specialty LIKE '%psiq%' THEN '/lovable-uploads/735ca9f0-ba32-4b6d-857a-70a6d3f845f0.png'
    ELSE '/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png'
  END
FROM doctors d
WHERE d.user_id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  role = 'doctor';

-- Atualizar biografias dos médicos
UPDATE doctors 
SET biography = CASE 
  WHEN specialty LIKE '%neuro%' THEN 'Especialista em neurologia com foco em tratamentos canábicos para epilepsia e distúrbios neurológicos.'
  WHEN specialty LIKE '%psiq%' THEN 'Psiquiatra especializada em ansiedade, depressão e transtornos do humor, com abordagem integrativa incluindo cannabis medicinal.'
  WHEN specialty LIKE '%cannabis%' THEN 'Especialista em medicina canábica com ampla experiência em tratamentos personalizados e acompanhamento de pacientes.'
  ELSE 'Médico especializado em tratamentos canábicos com foco no bem-estar e qualidade de vida dos pacientes.'
END
WHERE biography IS NULL OR biography = '';

-- Criar alguns médicos adicionais se temos poucos
INSERT INTO profiles (id, email, full_name, role, avatar_url)
SELECT 
  gen_random_uuid(),
  'dra.ana.santos@hopecann.com.br',
  'Dra. Ana Santos',
  'doctor',
  '/lovable-uploads/735ca9f0-ba32-4b6d-857a-70a6d3f845f0.png'
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p 
  JOIN doctors d ON d.user_id = p.id 
  WHERE d.specialty LIKE '%psiq%'
);

INSERT INTO doctors (user_id, crm, cpf, specialty, biography, consultation_fee, is_approved, is_available, approved_at)
SELECT 
  p.id,
  '54321SP',
  '111.222.333-44',
  'Psiquiatria',
  'Psiquiatra especializada em ansiedade, depressão e transtornos do humor, com abordagem integrativa incluindo cannabis medicinal.',
  250.00,
  true,
  true,
  now()
FROM profiles p
WHERE p.email = 'dra.ana.santos@hopecann.com.br'
  AND NOT EXISTS (SELECT 1 FROM doctors d WHERE d.user_id = p.id);

INSERT INTO profiles (id, email, full_name, role, avatar_url)
SELECT 
  gen_random_uuid(),
  'dr.carlos.mendes@hopecann.com.br',
  'Dr. Carlos Mendes',
  'doctor',
  '/lovable-uploads/8e0e4c0d-f012-449c-9784-9be7170458f5.png'
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p 
  JOIN doctors d ON d.user_id = p.id 
  WHERE d.specialty LIKE '%neuro%'
);

INSERT INTO doctors (user_id, crm, cpf, specialty, biography, consultation_fee, is_approved, is_available, approved_at)
SELECT 
  p.id,
  '67890RJ',
  '555.666.777-88',
  'Neurologia',
  'Especialista em neurologia com foco em tratamentos canábicos para epilepsia e distúrbios neurológicos.',
  300.00,
  true,
  true,
  now()
FROM profiles p
WHERE p.email = 'dr.carlos.mendes@hopecann.com.br'
  AND NOT EXISTS (SELECT 1 FROM doctors d WHERE d.user_id = p.id);