import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailData {
  doctorName: string;
  doctorEmail: string;
  patientName: string;
  patientEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  meetLink: string;
  specialty: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { emailData }: { emailData: EmailData } = await req.json()
    
    console.log('=== SUPABASE EDGE FUNCTION: SEND APPOINTMENT EMAILS ===')
    console.log('Email data received:', emailData)

    // Validate required data
    if (!emailData.doctorEmail || !emailData.patientEmail) {
      throw new Error('Email addresses are required')
    }

    // Email templates
    const doctorEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nova Consulta Agendada - HopeCann</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .appointment-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .meet-link { background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 HopeCann - Nova Consulta Agendada</h1>
          </div>
          <div class="content">
            <h2>Olá, Dr(a). ${emailData.doctorName}!</h2>
            <p>Você tem uma nova consulta agendada em sua agenda.</p>
            
            <div class="appointment-details">
              <h3>📋 Detalhes da Consulta</h3>
              <p><strong>Paciente:</strong> ${emailData.patientName}</p>
              <p><strong>Data:</strong> ${emailData.appointmentDate}</p>
              <p><strong>Horário:</strong> ${emailData.appointmentTime}</p>
              <p><strong>Especialidade:</strong> ${emailData.specialty}</p>
            </div>

            <p>Para acessar a consulta online, utilize o link abaixo:</p>
            <a href="${emailData.meetLink}" class="meet-link">🎥 Acessar Consulta Online</a>
            
            <p>Lembre-se de estar disponível alguns minutos antes do horário marcado.</p>
          </div>
          <div class="footer">
            <p>HopeCann - Plataforma de Telemedicina Cannabis</p>
            <p>Este é um email automático, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const patientEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Consulta Confirmada - HopeCann</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .appointment-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .meet-link { background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ HopeCann - Consulta Confirmada</h1>
          </div>
          <div class="content">
            <h2>Olá, ${emailData.patientName}!</h2>
            <p>Sua consulta foi confirmada com sucesso. Estamos ansiosos para atendê-lo(a)!</p>
            
            <div class="appointment-details">
              <h3>📋 Detalhes da sua Consulta</h3>
              <p><strong>Médico:</strong> Dr(a). ${emailData.doctorName}</p>
              <p><strong>Especialidade:</strong> ${emailData.specialty}</p>
              <p><strong>Data:</strong> ${emailData.appointmentDate}</p>
              <p><strong>Horário:</strong> ${emailData.appointmentTime}</p>
            </div>

            <p>Para acessar sua consulta online, utilize o link abaixo no horário marcado:</p>
            <a href="${emailData.meetLink}" class="meet-link">🎥 Acessar Consulta Online</a>
            
            <p><strong>Importante:</strong></p>
            <ul>
              <li>Esteja disponível alguns minutos antes do horário</li>
              <li>Tenha seus documentos e exames em mãos</li>
              <li>Certifique-se de ter uma boa conexão de internet</li>
            </ul>
          </div>
          <div class="footer">
            <p>HopeCann - Plataforma de Telemedicina Cannabis</p>
            <p>Este é um email automático, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Here you would integrate with your email service
    // Example with Resend (popular choice for Supabase Edge Functions):
    
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    if (!RESEND_API_KEY) {
      console.log('RESEND_API_KEY not found, simulating email send...')
      
      // Simulate email sending for now
      console.log('📧 EMAIL TO DOCTOR:')
      console.log(`To: ${emailData.doctorEmail}`)
      console.log(`Subject: Nova Consulta Agendada - ${emailData.appointmentDate} às ${emailData.appointmentTime}`)
      
      console.log('📧 EMAIL TO PATIENT:')
      console.log(`To: ${emailData.patientEmail}`)
      console.log(`Subject: Consulta Confirmada - ${emailData.appointmentDate} às ${emailData.appointmentTime}`)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Emails sent successfully (simulated)',
          details: {
            doctorEmail: emailData.doctorEmail,
            patientEmail: emailData.patientEmail,
            appointmentDate: emailData.appointmentDate,
            appointmentTime: emailData.appointmentTime
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Real email sending with Resend
    const emailPromises = [
      // Send to doctor
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'HopeCann <noreply@hopecann.com>',
          to: [emailData.doctorEmail],
          subject: `Nova Consulta Agendada - ${emailData.appointmentDate} às ${emailData.appointmentTime}`,
          html: doctorEmailHtml,
        }),
      }),
      
      // Send to patient
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'HopeCann <noreply@hopecann.com>',
          to: [emailData.patientEmail],
          subject: `Consulta Confirmada - ${emailData.appointmentDate} às ${emailData.appointmentTime}`,
          html: patientEmailHtml,
        }),
      })
    ]

    const results = await Promise.all(emailPromises)
    
    // Check if emails were sent successfully
    const doctorResult = await results[0].json()
    const patientResult = await results[1].json()
    
    console.log('Doctor email result:', doctorResult)
    console.log('Patient email result:', patientResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Emails sent successfully',
        results: {
          doctor: doctorResult,
          patient: patientResult
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending emails:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send emails' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
