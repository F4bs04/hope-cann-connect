-- Migration: Create doctor_schedules table for storing doctor availability
-- Created: 2025-01-28
-- Purpose: Store doctor weekly schedules to replace localStorage implementation

-- Create doctor_schedules table
CREATE TABLE IF NOT EXISTS doctor_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure end_time is after start_time
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    
    -- Prevent overlapping time slots for the same doctor on the same day
    EXCLUDE USING gist (
        doctor_id WITH =,
        day_of_week WITH =,
        tsrange(
            (CURRENT_DATE + start_time)::timestamp,
            (CURRENT_DATE + end_time)::timestamp,
            '[)'
        ) WITH &&
    ) WHERE (is_active = true)
);

-- Create indexes for better performance
CREATE INDEX idx_doctor_schedules_doctor_id ON doctor_schedules(doctor_id);
CREATE INDEX idx_doctor_schedules_day_of_week ON doctor_schedules(day_of_week);
CREATE INDEX idx_doctor_schedules_active ON doctor_schedules(is_active) WHERE is_active = true;
CREATE INDEX idx_doctor_schedules_doctor_day ON doctor_schedules(doctor_id, day_of_week) WHERE is_active = true;

-- Enable Row Level Security (RLS)
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Doctors can view and manage their own schedules
CREATE POLICY "Doctors can manage their own schedules" ON doctor_schedules
    FOR ALL USING (
        doctor_id = auth.uid() OR 
        doctor_id IN (
            SELECT user_id FROM doctors WHERE user_id = auth.uid()
        )
    );

-- Policy: Anyone can view active schedules (for patient booking)
CREATE POLICY "Anyone can view active schedules" ON doctor_schedules
    FOR SELECT USING (is_active = true);

-- Policy: Authenticated users can view all schedules (for admin purposes)
CREATE POLICY "Authenticated users can view schedules" ON doctor_schedules
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_doctor_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_doctor_schedules_updated_at
    BEFORE UPDATE ON doctor_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_doctor_schedules_updated_at();

-- Insert some sample data for testing (optional)
-- This can be removed in production
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_active) 
SELECT 
    p.id as doctor_id,
    'monday' as day_of_week,
    '09:00'::time as start_time,
    '12:00'::time as end_time,
    true as is_active
FROM profiles p 
WHERE p.role = 'doctor' 
AND NOT EXISTS (
    SELECT 1 FROM doctor_schedules ds 
    WHERE ds.doctor_id = p.id 
    AND ds.day_of_week = 'monday'
)
LIMIT 3; -- Only add for first 3 doctors as sample

-- Comments for documentation
COMMENT ON TABLE doctor_schedules IS 'Stores doctor weekly availability schedules for appointment booking';
COMMENT ON COLUMN doctor_schedules.doctor_id IS 'Reference to the doctor profile';
COMMENT ON COLUMN doctor_schedules.day_of_week IS 'Day of the week (monday, tuesday, etc.)';
COMMENT ON COLUMN doctor_schedules.start_time IS 'Start time of availability slot';
COMMENT ON COLUMN doctor_schedules.end_time IS 'End time of availability slot';
COMMENT ON COLUMN doctor_schedules.is_active IS 'Whether this time slot is currently active/available';

-- Grant necessary permissions
GRANT ALL ON doctor_schedules TO authenticated;
GRANT USAGE ON SEQUENCE doctor_schedules_id_seq TO authenticated;
