-- Create payments table to track payment transactions
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  payment_method VARCHAR(50),
  pagarme_transaction_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, paid, failed, refunded
  payment_data JSONB, -- complete transaction data from Pagar.me
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add payment status to appointments table
ALTER TABLE public.appointments 
ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending';

-- Enable RLS for payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies for payments table
CREATE POLICY "Patients can view their payments" 
ON public.payments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM appointments a 
  JOIN patients p ON p.id = a.patient_id 
  WHERE a.id = payments.appointment_id AND p.user_id = auth.uid()
));

CREATE POLICY "Doctors can view payments for their appointments" 
ON public.payments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM appointments a 
  JOIN doctors d ON d.id = a.doctor_id 
  WHERE a.id = payments.appointment_id AND d.user_id = auth.uid()
));

CREATE POLICY "System can manage payments" 
ON public.payments 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add updated_at trigger for payments
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_payments_appointment_id ON public.payments(appointment_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_pagarme_transaction_id ON public.payments(pagarme_transaction_id);