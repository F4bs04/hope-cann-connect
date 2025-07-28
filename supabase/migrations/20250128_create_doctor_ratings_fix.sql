-- Migration: Create doctor_ratings table to fix relationship errors
-- Created: 2025-01-28
-- Purpose: Fix "Could not find a relationship between 'doctor_ratings' and 'patients'" error

-- Create doctor_ratings table
CREATE TABLE IF NOT EXISTS doctor_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Prevent duplicate ratings from same patient to same doctor
    UNIQUE(doctor_id, patient_id)
);

-- Create indexes for better performance
CREATE INDEX idx_doctor_ratings_doctor_id ON doctor_ratings(doctor_id);
CREATE INDEX idx_doctor_ratings_patient_id ON doctor_ratings(patient_id);
CREATE INDEX idx_doctor_ratings_rating ON doctor_ratings(rating);
CREATE INDEX idx_doctor_ratings_created_at ON doctor_ratings(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE doctor_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Users can view all ratings (public information)
CREATE POLICY "Anyone can view ratings" ON doctor_ratings
    FOR SELECT USING (true);

-- Policy: Authenticated patients can create ratings for their appointments
CREATE POLICY "Patients can create ratings" ON doctor_ratings
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

-- Policy: Patients can update their own ratings
CREATE POLICY "Patients can update own ratings" ON doctor_ratings
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

-- Policy: Patients can delete their own ratings
CREATE POLICY "Patients can delete own ratings" ON doctor_ratings
    FOR DELETE USING (
        patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_doctor_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_doctor_ratings_updated_at
    BEFORE UPDATE ON doctor_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_doctor_ratings_updated_at();

-- Insert some sample ratings for testing (optional)
-- This can be removed in production
INSERT INTO doctor_ratings (doctor_id, patient_id, rating, comment) 
SELECT 
    d.id as doctor_id,
    p.id as patient_id,
    4 as rating,
    'Excelente atendimento e profissionalismo.' as comment
FROM doctors d
CROSS JOIN patients p
WHERE NOT EXISTS (
    SELECT 1 FROM doctor_ratings dr 
    WHERE dr.doctor_id = d.id 
    AND dr.patient_id = p.id
)
LIMIT 3; -- Only add for first 3 combinations as sample

-- Comments for documentation
COMMENT ON TABLE doctor_ratings IS 'Stores patient ratings and reviews for doctors';
COMMENT ON COLUMN doctor_ratings.doctor_id IS 'Reference to the doctor being rated';
COMMENT ON COLUMN doctor_ratings.patient_id IS 'Reference to the patient giving the rating';
COMMENT ON COLUMN doctor_ratings.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN doctor_ratings.comment IS 'Optional text review from patient';

-- Grant necessary permissions
GRANT ALL ON doctor_ratings TO authenticated;
GRANT USAGE ON SEQUENCE doctor_ratings_id_seq TO authenticated;
