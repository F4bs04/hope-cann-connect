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

    // 1) Lock slot by creating an appointment in awaiting_payment before charging
    // Create Supabase client with service role for database operations
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Resolve doctor_id (prefer direct id, fallback by user_id)
    let doctorId = paymentData.appointmentData.doctor_id;
    let resolvedDoctorId = doctorId;

    // Try to confirm the doctor exists by id
    const { data: doctorById } = await supabaseService
      .from('doctors')
      .select('id')
      .eq('id', doctorId)
      .maybeSingle();

    if (!doctorById) {
      // Fallback: older flows might send user_id
      const { data: doctorByUser } = await supabaseService
        .from('doctors')
        .select('id')
        .eq('user_id', doctorId)
        .maybeSingle();
      if (!doctorByUser) {
        throw new Error('Doctor not found');
      }
      resolvedDoctorId = doctorByUser.id;
    }

    // Resolve patient_id from authenticated user
    const { data: patientRow } = await supabaseService
      .from('patients')
      .select('id')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    const patientId = patientRow?.id;
    if (!patientId) {
      console.warn('Patient profile not found for user, cannot proceed with payment booking');
      return new Response(JSON.stringify({
        success: false,
        error_code: 'patient_profile_missing',
        error: 'Perfil de paciente não encontrado. Complete seu cadastro.'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    const durationMin = paymentData.appointmentData?.duration_min ?? 30;
    const reason = paymentData.appointmentData?.reason || 'Consulta agendada via plataforma';
    const consultationType = paymentData.appointmentData?.consultation_type || 'in_person';
    const scheduledAt = paymentData.appointmentData?.scheduled_at;

    if (!scheduledAt) {
      return new Response(JSON.stringify({
        success: false,
        error_code: 'invalid_payload',
        error: 'Horário da consulta ausente'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    // Try to insert a provisional appointment to hold the slot
    const { data: provisional, error: provisionalError } = await supabaseService
      .from('appointments')
      .insert([{
        doctor_id: resolvedDoctorId,
        patient_id: patientId,
        scheduled_at: scheduledAt,
        reason,
        consultation_type: consultationType,
        status: 'awaiting_payment',
        payment_status: 'pending',
        duration_min: durationMin,
        price_cents: paymentData.amount
      }])
      .select()
      .single();

    if (provisionalError) {
      console.error('Error creating provisional appointment:', provisionalError);
      const msg = (provisionalError as any)?.message?.toString() || '';
      const isOverlap = msg.includes('appointments_no_overlapping') || msg.toLowerCase().includes('overlap') || msg.toLowerCase().includes('conflict');
      if (isOverlap) {
        return new Response(JSON.stringify({
          success: false,
          error_code: 'slot_unavailable',
          error: 'Esse horário acabou de ficar indisponível. Por favor, escolha outro.'
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 });
      }
      return new Response(JSON.stringify({
        success: false,
        error_code: 'appointment_creation_failed',
        error: 'Falha ao reservar o horário'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }

    let appointmentId = provisional.id;

    // 2) Process payment only after holding the slot
    const pagarmeResponse = await processPagarmePayment(paymentData);
    console.log('Pagar.me response:', pagarmeResponse);

    if (pagarmeResponse.success) {
      console.log('Payment approved, confirming appointment...');

      // Update appointment to scheduled/paid
      const { error: updateApptError } = await supabaseService
        .from('appointments')
        .update({
          status: 'scheduled',
          payment_status: 'paid',
          fee: paymentData.amount / 100
        })
        .eq('id', appointmentId);

      if (updateApptError) {
        console.error('Error updating appointment to scheduled:', updateApptError);
        // Try to cancel the appointment to avoid locking slot
        await supabaseService.from('appointments').update({ status: 'cancelled', payment_status: 'failed' }).eq('id', appointmentId);
        return new Response(JSON.stringify({
          success: false,
          error_code: 'appointment_update_failed',
          error: 'Pagamento aprovado, mas falha ao confirmar o agendamento. Tente novamente.'
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
      }

      // Create payment record (best-effort)
      const { error: paymentError } = await supabaseService
        .from('payments')
        .insert([{
          appointment_id: appointmentId,
          amount: paymentData.amount / 100,
          currency: 'BRL',
          payment_method: 'credit_card',
          pagarme_transaction_id: pagarmeResponse.transaction_id,
          status: 'paid',
          payment_data: pagarmeResponse
        }]);
      if (paymentError) {
        console.error('Error creating payment record:', paymentError);
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Payment processed successfully',
        transaction_id: pagarmeResponse.transaction_id,
        appointment_id: appointmentId
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });

    } else {
      console.log('Payment declined, releasing slot...');
      // Mark appointment as cancelled/failed
      await supabaseService
        .from('appointments')
        .update({ status: 'cancelled', payment_status: 'failed' })
        .eq('id', appointmentId);

      return new Response(JSON.stringify({
        success: false,
        error_code: 'payment_failed',
        error: pagarmeResponse.error || 'Payment was declined'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
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

// Process payment with Pagar.me API
async function processPagarmePayment(paymentData: PaymentData) {
  console.log('Processing payment with Pagar.me API...');
  
  const apiKey = Deno.env.get('PAGARME_API_KEY_TEST');
  console.log('API Key available:', !!apiKey);
  console.log('API Key type:', apiKey?.substring(0, 3));
  
  // Always use simulation for now until correct secret key is provided
  console.log('Using simulation mode (API key is public key, need secret key)...');
  return await simulatePagarmePayment(paymentData);

  /* Uncomment this section when you have the correct secret key (sk_test_...)
  if (!apiKey || !apiKey.startsWith('sk_test_')) {
    console.log('No valid secret key found, using simulation...');
    return await simulatePagarmePayment(paymentData);
  }

  try {
    // Create transaction with Pagar.me
    const transactionData = {
      amount: paymentData.amount, // Amount in cents
      payment_method: 'credit_card',
      card: {
        number: paymentData.cardData.number.replace(/\s/g, ''),
        holder_name: paymentData.cardData.holder_name,
        exp_month: parseInt(paymentData.cardData.exp_month),
        exp_year: parseInt(paymentData.cardData.exp_year),
        cvv: paymentData.cardData.cvv
      },
      customer: {
        external_id: Date.now().toString(),
        name: paymentData.cardData.holder_name,
        type: 'individual',
        country: 'br',
        documents: [
          {
            type: 'cpf',
            number: '00000000000' // In production, collect actual CPF
          }
        ]
      }
    };

    console.log('Sending transaction to Pagar.me...');
    
    const response = await fetch('https://api.pagar.me/core/v5/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(apiKey + ':')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transactionData)
    });

    const responseData = await response.json();
    console.log('Pagar.me response status:', response.status);
    console.log('Pagar.me response:', responseData);

    if (response.ok && responseData.status === 'paid') {
      return {
        success: true,
        transaction_id: responseData.id,
        status: responseData.status,
        amount: responseData.amount,
        card: responseData.charges?.[0]?.last_transaction?.card || {},
        created_at: responseData.created_at,
        gateway_response: responseData
      };
    } else {
      // Handle different error scenarios
      let errorMessage = 'Pagamento recusado';
      
      if (responseData.errors) {
        const firstError = responseData.errors[0];
        errorMessage = firstError.message || errorMessage;
      } else if (responseData.charges && responseData.charges[0]) {
        const charge = responseData.charges[0];
        if (charge.last_transaction && charge.last_transaction.gateway_response) {
          errorMessage = charge.last_transaction.gateway_response.reason || errorMessage;
        }
      }

      return {
        success: false,
        error: errorMessage,
        gateway_response: responseData
      };
    }

  } catch (error: any) {
    console.error('Error calling Pagar.me API:', error);
    
    // Fallback to test simulation if API fails
    console.log('Falling back to test simulation...');
    return await simulatePagarmePayment(paymentData);
  }
  */
}

// Keep simulation for fallback and development
async function simulatePagarmePayment(paymentData: PaymentData) {
  console.log('Simulating Pagar.me payment...');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const cardNumber = paymentData.cardData.number.replace(/\s/g, '');
  
  // Test cards logic
  if (cardNumber === '4111111111111111') {
    // Approved card
    return {
      success: true,
      transaction_id: 'tran_test_' + Date.now(),
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
      transaction_id: 'tran_test_' + Date.now(),
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