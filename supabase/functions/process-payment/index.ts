import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentData {
  amount: number;
  cardData: {
    number: string;
    holder_name: string;
    exp_month: string;
    exp_year: string;
    cvv: string;
  };
  appointmentData: any;
  description: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== INICIANDO PROCESSAMENTO DE PAGAMENTO ===');
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    // Create Supabase client for user operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get authenticated user
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }

    console.log('User authenticated:', userData.user.email);

    // Parse request body
    const paymentData: PaymentData = await req.json();
    console.log('Payment data received:', {
      amount: paymentData.amount,
      description: paymentData.description,
      cardNumber: paymentData.cardData.number.substring(0, 4) + '****'
    });

    // Simulate Pagar.me payment processing
    // In production, this would make actual API calls to Pagar.me
    const pagarmeResponse = await simulatePagarmePayment(paymentData);
    
    console.log('Pagar.me response:', pagarmeResponse);

    // Create Supabase client with service role for database operations
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    if (pagarmeResponse.success) {
      console.log('Payment approved, creating appointment...');
      
      // Create appointment first
      const { data: appointmentData, error: appointmentError } = await supabaseService
        .from('appointments')
        .insert([{
          ...paymentData.appointmentData,
          payment_status: 'paid',
          fee: paymentData.amount / 100 // Convert back from cents to reais
        }])
        .select()
        .single();

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError);
        throw new Error('Failed to create appointment');
      }

      console.log('Appointment created:', appointmentData);

      // Create payment record
      const { data: paymentRecord, error: paymentError } = await supabaseService
        .from('payments')
        .insert([{
          appointment_id: appointmentData.id,
          amount: paymentData.amount / 100,
          currency: 'BRL',
          payment_method: 'credit_card',
          pagarme_transaction_id: pagarmeResponse.transaction_id,
          status: 'paid',
          payment_data: pagarmeResponse
        }])
        .select()
        .single();

      if (paymentError) {
        console.error('Error creating payment record:', paymentError);
        // Don't fail the payment if this fails, just log it
      }

      console.log('Payment record created:', paymentRecord);

      return new Response(JSON.stringify({
        success: true,
        message: 'Payment processed successfully',
        transaction_id: pagarmeResponse.transaction_id,
        appointment_id: appointmentData.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } else {
      console.log('Payment declined');
      
      return new Response(JSON.stringify({
        success: false,
        error: pagarmeResponse.error || 'Payment was declined'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

  } catch (error: any) {
    console.error('Error processing payment:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Simulate Pagar.me API response for testing
async function simulatePagarmePayment(paymentData: PaymentData) {
  console.log('Simulating Pagar.me payment...');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const cardNumber = paymentData.cardData.number;
  
  // Test cards logic
  if (cardNumber === '4111111111111111') {
    // Approved card
    return {
      success: true,
      transaction_id: 'tran_' + Date.now(),
      status: 'paid',
      amount: paymentData.amount,
      card: {
        last_four_digits: cardNumber.slice(-4),
        brand: 'visa'
      },
      created_at: new Date().toISOString()
    };
  } else if (cardNumber === '4000000000000002') {
    // Declined card
    return {
      success: false,
      error: 'Cartão recusado pelo banco emissor',
      decline_code: 'generic_decline'
    };
  } else {
    // For any other card, approve for testing
    return {
      success: true,
      transaction_id: 'tran_' + Date.now(),
      status: 'paid',
      amount: paymentData.amount,
      card: {
        last_four_digits: cardNumber.slice(-4),
        brand: 'unknown'
      },
      created_at: new Date().toISOString()
    };
  }
}