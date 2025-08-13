-- Fix RLS policies on doctor_slots to allow doctors (users) to manage their own slots via the doctors table linkage

-- Ensure RLS is enabled (safe if already enabled)
ALTER TABLE public.doctor_slots ENABLE ROW LEVEL SECURITY;

-- Drop incorrect policy comparing doctor_id directly to auth.uid()
DROP POLICY IF EXISTS "Doctors can edit their own slots" ON public.doctor_slots;

-- Keep/ensure read policy (anyone can view) - if it already exists, do nothing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'doctor_slots' AND policyname = 'Anyone can view doctor slots'
  ) THEN
    CREATE POLICY "Anyone can view doctor slots"
    ON public.doctor_slots
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- Create precise policies tying doctor_slots.doctor_id to doctors.user_id = auth.uid()
CREATE POLICY "Doctors can insert their own slots"
ON public.doctor_slots
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.doctors d
    WHERE d.id = doctor_id
      AND d.user_id = auth.uid()
  )
);

CREATE POLICY "Doctors can update their own slots"
ON public.doctor_slots
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.doctors d
    WHERE d.id = doctor_id
      AND d.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.doctors d
    WHERE d.id = doctor_id
      AND d.user_id = auth.uid()
  )
);

CREATE POLICY "Doctors can delete their own slots"
ON public.doctor_slots
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.doctors d
    WHERE d.id = doctor_id
      AND d.user_id = auth.uid()
  )
);
