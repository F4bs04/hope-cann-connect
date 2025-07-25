-- Primeiro, aprovar todos os médicos existentes
UPDATE doctors 
SET is_approved = true, 
    approved_at = now(),
    is_available = true
WHERE is_approved = false;

-- Atualizar os dados dos médicos existentes para ter informações mais completas
UPDATE doctors 
SET 
  specialty = CASE 
    WHEN specialty = 'Especialista em cannabis medicinal' THEN 'Medicina Canábica'
    ELSE specialty
  END,
  biography = 'Especialista em medicina canábica com ampla experiência em tratamentos personalizados e acompanhamento de pacientes.',
  consultation_fee = 200.00
WHERE biography IS NULL OR biography = '';

-- Atualizar os perfis existentes dos médicos com informações mais completas
UPDATE profiles 
SET 
  full_name = CASE 
    WHEN full_name IS NULL OR full_name = '' THEN 'Dr. Ricardo Silva'
    ELSE full_name
  END,
  avatar_url = CASE 
    WHEN avatar_url IS NULL OR avatar_url = '' THEN '/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png'
    ELSE avatar_url
  END,
  role = 'doctor'
WHERE id IN (SELECT user_id FROM doctors);