-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Allow admins to view all profiles (incl. email/phone)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' 
      AND policyname = 'Admins can view all profiles'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Admins can view all profiles"
      ON public.profiles
      FOR SELECT
      USING (public.get_current_user_role() IN ('system_admin'::user_role, 'clinic_admin'::user_role));
    $$;
  END IF;
END $$;

-- Update the safe public view to include non-sensitive fields used by UI
CREATE OR REPLACE VIEW public.public_doctors AS
SELECT 
  d.id as doctor_id,
  p.full_name as doctor_name,
  p.avatar_url,
  d.specialty,
  d.biography,
  d.crm,
  d.consultation_fee,
  d.is_available,
  d.is_approved
FROM public.doctors d
JOIN public.profiles p ON p.id = d.user_id
WHERE d.is_approved = true AND COALESCE(d.is_suspended, false) = false;

GRANT SELECT ON public.public_doctors TO anon, authenticated;