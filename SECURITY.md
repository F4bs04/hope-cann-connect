# Guia de Segurança - HopeCann Platform

## 🔐 Proteção de Chaves Sensíveis

### ✅ Status Atual de Segurança

**VERIFICADO**: Não há exposição de chaves sensíveis no repositório:
- ✅ Nenhuma chave da API Resend hardcoded no código fonte
- ✅ Chaves do Supabase são públicas (anon key) - seguro para exposição
- ✅ Variáveis sensíveis estão configuradas apenas no Supabase Dashboard

### 🛡️ Chaves e Configurações Protegidas

#### **API Keys Protegidas:**
- `RESEND_API_KEY` - Configurada apenas no Supabase Dashboard como variável de ambiente
- Outras chaves de terceiros devem seguir o mesmo padrão

#### **Chaves Públicas (Seguras para Exposição):**
- `SUPABASE_URL` - URL pública do projeto
- `SUPABASE_PUBLISHABLE_KEY` - Chave anônima pública (Row Level Security protege os dados)

### 📁 Arquivos Protegidos pelo .gitignore

```gitignore
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Supabase
.env.supabase
supabase/.env

# API Keys and secrets
*.key
*.pem
secrets/
```

### 🔄 Fluxo de Recuperação de Senha

#### **Configuração Atual:**
1. **Página de Solicitação:** `/recuperarsenha`
2. **Página de Redefinição:** `/redefinir-senha`
3. **Redirecionamento:** Configurado para `${window.location.origin}/redefinir-senha`

#### **Fluxo Completo:**
1. Usuário acessa `/recuperarsenha`
2. Insere email e solicita recuperação
3. Supabase envia email com link de recuperação
4. Link redireciona para `/redefinir-senha?access_token=...&type=recovery`
5. Página valida token e permite redefinição
6. Nova senha é salva via Supabase Auth

### ⚠️ Pontos de Atenção

#### **Configuração do Supabase Dashboard:**
- Verificar se a URL de redirecionamento está configurada corretamente
- Confirmar se o template de email está ativo
- Validar se as variáveis de ambiente estão definidas

#### **URLs de Redirecionamento Permitidas:**
No Supabase Dashboard > Authentication > URL Configuration:
```
Site URL: https://seu-dominio.com
Redirect URLs: 
- https://seu-dominio.com/redefinir-senha
- http://localhost:5173/redefinir-senha (para desenvolvimento)
```

### 🔧 Verificações de Segurança

#### **Checklist de Segurança:**
- [x] Chaves sensíveis não expostas no código
- [x] .gitignore configurado para proteger arquivos sensíveis
- [x] Variáveis de ambiente configuradas no Supabase
- [x] Fluxo de recuperação de senha implementado
- [x] Validação de token de recuperação
- [x] Redirecionamento seguro configurado

#### **Monitoramento Contínuo:**
- Verificar regularmente se não há commits com chaves expostas
- Validar se novos desenvolvedores seguem as práticas de segurança
- Revisar logs de autenticação para detectar tentativas suspeitas

### 📞 Suporte

Em caso de problemas de segurança:
1. Revisar este documento
2. Verificar configurações no Supabase Dashboard
3. Validar variáveis de ambiente
4. Testar fluxo completo de recuperação

### 🚀 Deploy Seguro

Para deploy em produção:
1. Configurar variáveis de ambiente no servidor
2. Atualizar URLs de redirecionamento no Supabase
3. Verificar se .gitignore está funcionando
4. Testar fluxo completo de autenticação

---

**Última atualização:** 28/01/2025
**Status:** ✅ Seguro - Nenhuma exposição de chaves detectada
