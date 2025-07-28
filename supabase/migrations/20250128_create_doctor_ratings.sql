-- Create doctor_ratings table for patient reviews
CREATE TABLE IF NOT EXISTS doctor_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one rating per patient per doctor
  UNIQUE(doctor_id, patient_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctor_ratings_doctor_id ON doctor_ratings(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_ratings_patient_id ON doctor_ratings(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctor_ratings_created_at ON doctor_ratings(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE doctor_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view doctor ratings" ON doctor_ratings
  FOR SELECT USING (true);

CREATE POLICY "Patients can create their own ratings" ON doctor_ratings
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM patients WHERE id = patient_id
    )
  );

CREATE POLICY "Patients can update their own ratings" ON doctor_ratings
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM patients WHERE id = patient_id
    )
  );

CREATE POLICY "Patients can delete their own ratings" ON doctor_ratings
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM patients WHERE id = patient_id
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_doctor_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_doctor_ratings_updated_at
  BEFORE UPDATE ON doctor_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_doctor_ratings_updated_at();

-- Add consultation_fee column to doctors table if it doesn't exist
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS consultation_fee DECIMAL(10,2) DEFAULT 150.00;

-- Create comment for documentation
COMMENT ON TABLE doctor_ratings IS 'Patient ratings and reviews for doctors';
COMMENT ON COLUMN doctor_ratings.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN doctor_ratings.comment IS 'Optional written review';
COMMENT ON COLUMN doctors.consultation_fee IS 'Consultation fee in BRL, increments of 50';
