-- Adicionar constraint única para evitar chats duplicados
-- Primeiro, desativar chats duplicados existentes, mantendo apenas o mais recente
UPDATE public.active_chats 
SET is_active = false 
WHERE id NOT IN (
  SELECT DISTINCT ON (doctor_id, patient_id) id
  FROM public.active_chats 
  WHERE is_active = true
  ORDER BY doctor_id, patient_id, created_at DESC
);

-- Criar constraint única para doctor_id, patient_id quando is_active = true
CREATE UNIQUE INDEX idx_unique_active_chat 
ON public.active_chats(doctor_id, patient_id) 
WHERE is_active = true;