# Configuração Google OAuth - Hope-Cann-Connect

## 🚨 PROBLEMA IDENTIFICADO
O erro 404 na Vercel ao fazer login com Google acontece por configuração incorreta das URLs de callback no Supabase.

## ✅ SOLUÇÃO IMPLEMENTADA

### 1. Arquivos Criados/Modificados:
- ✅ `src/pages/AuthCallback.tsx` - Página para processar callback OAuth
- ✅ `src/App.tsx` - Adicionada rota `/auth/callback`
- ✅ `src/pages/Login.tsx` - Corrigido redirect URL
- ✅ `vercel.json` - Configuração para deploy na Vercel

### 2. Configurações Necessárias no Supabase:

#### No Dashboard do Supabase (https://supabase.com/dashboard):

1. **Acesse Authentication > Settings**
2. **Configure as Site URLs:**
   ```
   Site URL: https://seu-dominio-vercel.app
   ```

3. **Configure as Redirect URLs (adicione TODAS):**
   ```
   https://seu-dominio-vercel.app/auth/callback
   https://localhost:3000/auth/callback
   http://localhost:3000/auth/callback
   http://localhost:5173/auth/callback
   https://localhost:5173/auth/callback
   ```

4. **Configure Google OAuth Provider:**
   - Vá em Authentication > Providers
   - Habilite Google
   - Adicione Client ID e Client Secret do Google Console

### 3. Configuração no Google Console:

1. **Acesse Google Cloud Console**
2. **Vá em APIs & Services > Credentials**
3. **Configure Authorized redirect URIs:**
   ```
   https://nxiaxpgyqpmnkmebvvap.supabase.co/auth/v1/callback
   ```

### 4. Variáveis de Ambiente (.env.local):
```env
VITE_SUPABASE_URL=https://nxiaxpgyqpmnkmebvvap.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

## 🔧 COMO TESTAR:

### Local:
1. `npm run dev`
2. Acesse http://localhost:5173/login
3. Clique em "Login com Google"
4. Deve redirecionar para `/auth/callback` e processar o login

### Produção (Vercel):
1. Deploy na Vercel
2. Configure as URLs no Supabase com seu domínio da Vercel
3. Teste o login com Google

## 🐛 TROUBLESHOOTING:

### Erro 404 na Vercel:
- ✅ Verificar se `vercel.json` está configurado
- ✅ Verificar se as redirect URLs estão corretas no Supabase
- ✅ Verificar se a rota `/auth/callback` existe no App.tsx

### Erro "Invalid redirect URL":
- ✅ Adicionar todas as URLs possíveis no Supabase
- ✅ Verificar se o domínio da Vercel está correto

### Erro de CORS:
- ✅ Verificar Site URL no Supabase
- ✅ Verificar se está usando HTTPS em produção

## 📋 CHECKLIST FINAL:

- [ ] Supabase: Site URL configurada
- [ ] Supabase: Redirect URLs configuradas
- [ ] Supabase: Google Provider habilitado
- [ ] Google Console: Redirect URI configurada
- [ ] Vercel: Deploy realizado
- [ ] Teste local funcionando
- [ ] Teste produção funcionando

## 🔄 FLUXO DO OAUTH:

1. Usuário clica em "Login com Google"
2. Redirecionamento para Google OAuth
3. Google redireciona para `/auth/callback`
4. `AuthCallback.tsx` processa a sessão
5. Cria usuário se não existir
6. Redireciona para área do usuário

## 📞 SUPORTE:

Se ainda houver problemas:
1. Verificar logs no Supabase Dashboard
2. Verificar Network tab no DevTools
3. Verificar console do navegador
4. Verificar logs da Vercel
