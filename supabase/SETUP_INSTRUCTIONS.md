# 📧 HopeCann - Configuração de Envio de Emails via Supabase Edge Functions

## 🚀 Configuração Inicial

### 1. Instalar Supabase CLI
```bash
# Windows (via npm)
npm install -g supabase

# Ou via Chocolatey
choco install supabase

# Verificar instalação
supabase --version
```

### 2. Fazer Login no Supabase
```bash
supabase login
```

### 3. Linkar o Projeto Local ao Supabase
```bash
# No diretório do projeto
cd "d:\Projetos\Hopecann_v2\Hopecann Oficial\hope-cann-connect"

# Linkar ao projeto (você precisará do Project ID do seu dashboard Supabase)
supabase link --project-ref YOUR_PROJECT_ID
```

## 📧 Configuração do Serviço de Email

### Opção 1: Resend (Recomendado)
1. Acesse [resend.com](https://resend.com) e crie uma conta
2. Obtenha sua API Key
3. Configure no Supabase Dashboard:
   - Vá para Settings > Edge Functions > Environment Variables
   - Adicione: `RESEND_API_KEY` = sua_api_key_aqui

### Opção 2: SendGrid
1. Acesse [sendgrid.com](https://sendgrid.com) e crie uma conta
2. Obtenha sua API Key
3. Modifique a Edge Function para usar SendGrid (código já preparado)
4. Configure no Supabase Dashboard:
   - Adicione: `SENDGRID_API_KEY` = sua_api_key_aqui

### Opção 3: SMTP (Gmail, Outlook, etc.)
1. Configure as credenciais SMTP
2. Modifique a Edge Function para usar SMTP
3. Configure as variáveis de ambiente necessárias

## 🚀 Deploy da Edge Function

### 1. Deploy da Função
```bash
# Deploy da função de envio de emails
supabase functions deploy send-appointment-emails

# Verificar se foi deployada
supabase functions list
```

### 2. Configurar Variáveis de Ambiente
No Dashboard do Supabase:
1. Vá para **Settings** > **Edge Functions**
2. Clique em **Environment Variables**
3. Adicione as variáveis necessárias:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@hopecann.com
FROM_NAME=HopeCann Platform
```

### 3. Testar a Função
```bash
# Testar localmente (opcional)
supabase functions serve send-appointment-emails

# Testar com curl
curl -X POST 'https://your-project-id.supabase.co/functions/v1/send-appointment-emails' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "emailData": {
      "doctorName": "Dr. João Silva",
      "doctorEmail": "doctor@test.com",
      "patientName": "Maria Santos",
      "patientEmail": "patient@test.com",
      "appointmentDate": "segunda-feira, 28 de janeiro de 2025",
      "appointmentTime": "14:30",
      "meetLink": "https://meet.google.com/user",
      "specialty": "Cardiologia"
    }
  }'
```

## 🔧 Configuração no Frontend

O código do frontend já está configurado para usar a Edge Function. Certifique-se de que:

1. A função está deployada com o nome `send-appointment-emails`
2. As variáveis de ambiente estão configuradas
3. O projeto React tem acesso ao Supabase client

## 📋 Verificação

### 1. Logs da Edge Function
```bash
# Ver logs em tempo real
supabase functions logs send-appointment-emails --follow
```

### 2. Testar no Frontend
1. Acesse o agendamento de consultas
2. Complete o processo de agendamento
3. Verifique o console do navegador (F12) para logs
4. Verifique se os emails foram recebidos

## 🔍 Troubleshooting

### Problema: Edge Function não encontrada
```bash
# Verificar se está deployada
supabase functions list

# Re-deploy se necessário
supabase functions deploy send-appointment-emails
```

### Problema: Emails não são enviados
1. Verifique as variáveis de ambiente no Dashboard
2. Verifique os logs da Edge Function
3. Teste a API Key do serviço de email

### Problema: CORS errors
- As configurações de CORS já estão incluídas na Edge Function
- Certifique-se de que o domínio está autorizado no Supabase

## 📧 Personalização de Templates

Os templates de email estão no arquivo `index.ts` da Edge Function. Você pode:

1. Modificar o HTML dos emails
2. Adicionar logos e imagens
3. Personalizar cores e estilos
4. Adicionar mais informações

## 🔐 Segurança

- ✅ API Keys são armazenadas como variáveis de ambiente
- ✅ CORS configurado corretamente
- ✅ Validação de dados de entrada
- ✅ Tratamento de erros robusto

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs da Edge Function
2. Teste a API Key do serviço de email
3. Verifique as configurações no Dashboard Supabase
4. Consulte a documentação oficial do Supabase Edge Functions

---

**🎉 Após seguir estes passos, o sistema de emails estará funcionando automaticamente após cada agendamento de consulta!**
