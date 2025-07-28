# 🚀 Deploy Manual da Edge Function - HopeCann

## ✅ Informações do Seu Projeto

- **Project ID:** `nxiaxpgyqpmnkmebvvap`
- **Resend API Key:** `re_jPVhRiom_9jSDP2HUAQnf4WccCp4a6t4F`
- **Dashboard URL:** https://supabase.com/dashboard/project/nxiaxpgyqpmnkmebvvap

## 🎯 Deploy Manual via Dashboard (Método Alternativo)

Como o Supabase CLI apresentou problemas de instalação, vamos usar o método manual:

### 1️⃣ **Acessar o Dashboard**
1. Acesse: https://supabase.com/dashboard/project/nxiaxpgyqpmnkmebvvap
2. Faça login na sua conta Supabase

### 2️⃣ **Criar Edge Function via Dashboard**
1. No menu lateral, clique em **Edge Functions**
2. Clique em **Create a new function**
3. Nome da função: `send-appointment-emails`
4. Copie e cole o código abaixo:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { emailData }: { emailData: EmailData } = await req.json()
    
    console.log('=== SUPABASE EDGE FUNCTION: SEND APPOINTMENT EMAILS ===')
    console.log('Email data received:', emailData)

    if (!emailData.doctorEmail || !emailData.patientEmail) {
      throw new Error('Email addresses are required')
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    if (!RESEND_API_KEY) {
      console.log('RESEND_API_KEY not found, simulating email send...')
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Emails sent successfully (simulated - API Key not configured)',
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

    // Templates de email
    const doctorEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nova Consulta Agendada - HopeCann</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background: #f9f9f9; }
          .appointment-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #10b981; }
          .meet-link { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f0f0f0; border-radius: 0 0 8px 8px; }
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
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background: #f9f9f9; }
          .appointment-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #10b981; }
          .meet-link { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f0f0f0; border-radius: 0 0 8px 8px; }
          .tips { background: #e6f7ff; padding: 15px; border-radius: 5px; margin: 15px 0; }
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
            
            <div class="tips">
              <h4>💡 Dicas Importantes:</h4>
              <ul>
                <li>Esteja disponível alguns minutos antes do horário</li>
                <li>Tenha seus documentos e exames em mãos</li>
                <li>Certifique-se de ter uma boa conexão de internet</li>
                <li>Use um ambiente silencioso e bem iluminado</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>HopeCann - Plataforma de Telemedicina Cannabis</p>
            <p>Este é um email automático, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Enviar emails via Resend
    const emailPromises = [
      // Email para o médico
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'HopeCann <noreply@hopecann.com>',
          to: [emailData.doctorEmail],
          subject: `🏥 Nova Consulta Agendada - ${emailData.appointmentDate} às ${emailData.appointmentTime}`,
          html: doctorEmailHtml,
        }),
      }),
      
      // Email para o paciente
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'HopeCann <noreply@hopecann.com>',
          to: [emailData.patientEmail],
          subject: `✅ Consulta Confirmada - ${emailData.appointmentDate} às ${emailData.appointmentTime}`,
          html: patientEmailHtml,
        }),
      })
    ]

    const results = await Promise.all(emailPromises)
    
    const doctorResult = await results[0].json()
    const patientResult = await results[1].json()
    
    console.log('Doctor email result:', doctorResult)
    console.log('Patient email result:', patientResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Emails sent successfully via Resend',
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
```

### 3️⃣ **Configurar Variáveis de Ambiente**
1. No Dashboard, vá para **Settings** > **Environment Variables**
2. Clique em **Add variable**
3. Adicione as seguintes variáveis:

```
Nome: RESEND_API_KEY
Valor: re_jPVhRiom_9jSDP2HUAQnf4WccCp4a6t4F

Nome: FROM_EMAIL
Valor: noreply@hopecann.com

Nome: FROM_NAME
Valor: HopeCann Platform
```

### 4️⃣ **Deploy da Função**
1. Após colar o código, clique em **Deploy function**
2. Aguarde o deploy ser concluído
3. A função aparecerá na lista de Edge Functions

### 5️⃣ **Testar a Função**
1. Vá para **Edge Functions** > **send-appointment-emails**
2. Clique em **Invoke function**
3. Use este payload de teste:

```json
{
  "emailData": {
    "doctorName": "Dr. João Silva",
    "doctorEmail": "seu_email@gmail.com",
    "patientName": "Maria Santos",
    "patientEmail": "seu_email@gmail.com",
    "appointmentDate": "segunda-feira, 28 de janeiro de 2025",
    "appointmentTime": "14:30",
    "meetLink": "https://meet.google.com/user",
    "specialty": "Cardiologia"
  }
}
```

## ✅ **Verificação Final**

Após o deploy:
1. ✅ Edge Function `send-appointment-emails` criada
2. ✅ Variáveis de ambiente configuradas
3. ✅ Teste realizado com sucesso
4. ✅ Frontend já configurado para usar a função

## 🎉 **Pronto!**

O sistema de emails estará funcionando automaticamente após cada agendamento de consulta!

**Logs da função:** Edge Functions > send-appointment-emails > Logs
