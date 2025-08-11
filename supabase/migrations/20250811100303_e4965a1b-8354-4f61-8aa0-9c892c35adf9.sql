-- Secure payments table by removing overly permissive policy and enforcing least-privilege access

-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Drop the permissive policy that allowed anyone to SELECT/INSERT/UPDATE/DELETE on payments
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'payments' 
      AND policyname = 'System can manage payments'
  ) THEN
    EXECUTE 'DROP POLICY "System can manage payments" ON public.payments';
  END IF;
END $$;

-- Ensure patient SELECT policy exists (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'payments' 
      AND policyname = 'Patients can view their payments'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Patients can view their payments"
      ON public.payments
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.appointments a
          JOIN public.patients p ON p.id = a.patient_id
          WHERE a.id = payments.appointment_id AND p.user_id = auth.uid()
        )
      );
    $$;
  END IF;
END $$;

-- Ensure doctor SELECT policy exists (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'payments' 
      AND policyname = 'Doctors can view payments for their appointments'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Doctors can view payments for their appointments"
      ON public.payments
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.appointments a
          JOIN public.doctors d ON d.id = a.doctor_id
          WHERE a.id = payments.appointment_id AND d.user_id = auth.uid()
        )
      );
    $$;
  END IF;
END $$;

-- Do NOT add INSERT/UPDATE/DELETE policies so only Edge Functions using the Service Role key can write
-- (Service role bypasses RLS by design).