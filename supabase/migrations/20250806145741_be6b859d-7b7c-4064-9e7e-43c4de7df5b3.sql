-- Add full_name field to patients table
ALTER TABLE public.patients 
ADD COLUMN full_name TEXT;

-- Migrate existing data: move emergency_contact_name to full_name where user_id is NULL
UPDATE public.patients 
SET full_name = emergency_contact_name 
WHERE user_id IS NULL AND emergency_contact_name IS NOT NULL;

-- Clear emergency_contact_name where it was incorrectly used for patient names
UPDATE public.patients 
SET emergency_contact_name = NULL 
WHERE user_id IS NULL AND full_name IS NOT NULL;