-- 1) Drop overly permissive public profile policy
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' 
      AND policyname = 'Anyone can view doctor profiles'
  ) THEN
    EXECUTE 'DROP POLICY "Anyone can view doctor profiles" ON public.profiles';
  END IF;
END $$;

-- 2) Create a safe public view for doctor listing without email/phone
CREATE OR REPLACE VIEW public.public_doctors AS
SELECT 
  d.id as doctor_id,
  p.full_name as doctor_name,
  p.avatar_url,
  d.specialty,
  d.consultation_fee,
  d.is_available,
  d.is_approved
FROM public.doctors d
JOIN public.profiles p ON p.id = d.user_id
WHERE d.is_approved = true AND COALESCE(d.is_suspended, false) = false;

-- 3) Allow anon/authenticated to SELECT from the safe view only
GRANT SELECT ON public.public_doctors TO anon, authenticated;

-- 4) Comment: existing RLS on doctors already allows public select; profiles now protected.
-- No change to other profiles policies (users can view/update their own profile).
