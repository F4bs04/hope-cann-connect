-- Create doctor_patients relationship table
CREATE TABLE public.doctor_patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(doctor_id, patient_id)
);

-- Enable RLS
ALTER TABLE public.doctor_patients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for doctor_patients
CREATE POLICY "Doctors can view their patients" 
ON public.doctor_patients 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM doctors d 
  WHERE d.id = doctor_patients.doctor_id 
  AND d.user_id = auth.uid()
));

CREATE POLICY "Doctors can add patients" 
ON public.doctor_patients 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM doctors d 
  WHERE d.id = doctor_patients.doctor_id 
  AND d.user_id = auth.uid()
));

CREATE POLICY "Doctors can update their patient relationships" 
ON public.doctor_patients 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM doctors d 
  WHERE d.id = doctor_patients.doctor_id 
  AND d.user_id = auth.uid()
));

-- Create trigger for updated_at
CREATE TRIGGER update_doctor_patients_updated_at
  BEFORE UPDATE ON public.doctor_patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing relationships from appointments
INSERT INTO public.doctor_patients (doctor_id, patient_id, notes)
SELECT DISTINCT a.doctor_id, a.patient_id, 'Migrated from existing appointments'
FROM appointments a
WHERE NOT EXISTS (
  SELECT 1 FROM doctor_patients dp 
  WHERE dp.doctor_id = a.doctor_id 
  AND dp.patient_id = a.patient_id
)
ON CONFLICT (doctor_id, patient_id) DO NOTHING;