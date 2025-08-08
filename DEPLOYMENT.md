# 🚀 Guia de Deploy - HopeCann Beta 1.0

## 📋 Informações do Ambiente de Produção

### 🏗️ Arquitetura Atual
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Pagamentos    │
│   (Lovable)     │───▶│   (Supabase)    │───▶│   (Pagar.me)    │
│   React + TS    │    │   PostgreSQL    │    │   Webhooks      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🌐 URLs e Domínios

### Ambiente de Produção
- **Frontend Principal:** https://hopecann.lovable.app
- **Supabase URL:** https://ekhhpbevlyiicuqzddne.supabase.co
- **Supabase Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Ambientes Disponíveis
- ✅ **Produção:** Estável e ativo
- 🟡 **Staging:** Disponível via Lovable
- 🔧 **Development:** Local/Codespaces

## 🗄️ Configuração do Banco de Dados

### Status do Supabase
- **Projeto ID:** ekhhpbevlyiicuqzddne
- **Região:** East US (Ohio)
- **Plano:** Pro
- **Status:** 🟢 Ativo e estável

### Estatísticas do Banco
```sql
-- Tabelas ativas: 19
-- RLS habilitado: 100%
-- Políticas de segurança: 42
-- Edge Functions: 8
-- Storage Buckets: 3
```

### Tabelas Principais
```
├── auth.users (Supabase Auth)
├── public.medicos (4 registros)
├── public.pacientes (6 registros)
├── public.clinicas (2 registros)
├── public.consultas (7 registros)
├── public.receitas (15+ registros)
├── public.atestados (5 registros)
├── public.mensagens (Chat histórico)
└── ... outras tabelas de apoio
```

## 🔐 Variáveis de Ambiente

### Supabase
```env
VITE_SUPABASE_URL=https://ekhhpbevlyiicuqzddne.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Pagar.me (Produção)
```env
VITE_PAGARME_PUBLIC_KEY=pk_live_...
PAGARME_SECRET_KEY=sk_live_... (Server-side only)
```

### Configurações Adicionais
```env
VITE_APP_VERSION=1.0.0-beta.1
VITE_ENVIRONMENT=production
VITE_SENTRY_DSN=https://...
```

## 📦 Edge Functions Ativas

### 1. send-appointment-emails
- **Status:** ✅ Ativo
- **Função:** Envio de emails de confirmação
- **URL:** https://ekhhpbevlyiicuqzddne.supabase.co/functions/v1/send-appointment-emails

### 2. process-payment
- **Status:** ✅ Ativo  
- **Função:** Processamento de webhooks Pagar.me
- **URL:** https://ekhhpbevlyiicuqzddne.supabase.co/functions/v1/process-payment

## 🗂️ Storage Buckets

### 1. medical-documents
- **Uso:** Certificados médicos, laudos, exames
- **Política:** Privado com RLS
- **Tamanho:** ~50MB utilizados

### 2. profile-pictures
- **Uso:** Fotos de perfil de usuários
- **Política:** Público para leitura
- **Tamanho:** ~10MB utilizados

### 3. prescriptions
- **Uso:** Receitas médicas geradas
- **Política:** Privado com RLS
- **Tamanho:** ~25MB utilizados

## 🔄 Processo de Deploy

### Deploy Automático (Lovable)
1. **Método:** Git push ou Lovable UI
2. **Tempo:** ~2-3 minutos
3. **Rollback:** Disponível via Lovable dashboard
4. **Monitoramento:** Automático

### Deploy Manual (Emergência)
```bash
# 1. Build do projeto
npm run build

# 2. Deploy via Vercel CLI (backup)
vercel --prod

# 3. Verificação de saúde
curl -f https://hopecann.lovable.app/health
```

## 📊 Monitoramento e Saúde

### Métricas Ativas
- **Uptime:** 100% (últimos 30 dias)
- **Response Time:** ~200ms média
- **Error Rate:** <0.1%
- **Database Performance:** Excelente

### Dashboards
- **Supabase Analytics:** Métricas de DB e Auth
- **Lovable Dashboard:** Performance do frontend
- **Pagar.me Dashboard:** Transações e pagamentos

### Alertas Configurados
- ✅ Downtime detection
- ✅ Error rate spikes
- ✅ Database performance issues
- ✅ Payment failures

## 🔧 Manutenção e Backup

### Backup Automático
- **Frequência:** Diário (Supabase)
- **Retenção:** 30 dias
- **Localização:** AWS S3 (Supabase managed)

### Tarefas de Manutenção
```sql
-- Limpeza semanal de logs antigos
DELETE FROM auth.audit_log_entries 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Otimização de índices
REINDEX DATABASE postgres;

-- Verificação de integridade
SELECT COUNT(*) FROM medicos WHERE status = 'ativo';
```

## 🚨 Procedimentos de Emergência

### Rollback Rápido
1. Acesse o Lovable Dashboard
2. Navegue até "Deployments"
3. Clique em "Revert" na versão anterior
4. Confirme o rollback

### Restauração de Banco
```sql
-- Via Supabase Dashboard
-- Settings > Database > Backups
-- Selecione o backup desejado
-- Clique em "Restore"
```

### Contatos de Emergência
- **Lovable Support:** support@lovable.dev
- **Supabase Support:** Via dashboard ou Discord
- **Pagar.me Support:** suporte@pagar.me

## 📈 Plano de Escalabilidade

### Limites Atuais
- **Concurrent Users:** ~100 (teste beta)
- **Database Connections:** 25 (Supabase Pro)
- **Edge Function Calls:** 500K/mês
- **Storage:** 8GB total

### Próximos Upgrades
- **v1.0.0:** Supabase Team plan
- **v1.1.0:** CDN customizado
- **v1.2.0:** Multi-region deployment

## ✅ Checklist de Deploy

### Pré-Deploy
- [ ] Testes automatizados passando
- [ ] Code review aprovado
- [ ] Variáveis de ambiente verificadas
- [ ] Backup do banco atualizado

### Pós-Deploy
- [ ] Health check da aplicação
- [ ] Verificação de funcionalidades críticas
- [ ] Monitoramento de logs por 24h
- [ ] Comunicação com usuários beta

---

**Última Atualização:** 08/08/2025  
**Versão do Deploy:** 1.0.0-beta.1  
**Responsável:** Equipe HopeCann