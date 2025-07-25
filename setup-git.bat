@echo off
echo Configurando Git para o projeto Hope-Cann-Connect...
echo.

REM Verificar se estamos no diretório correto
if not exist "package.json" (
    echo ERRO: Execute este script na raiz do projeto Hope-Cann-Connect
    pause
    exit /b 1
)

echo 1. Verificando status atual do Git...
git status
echo.

echo 2. Listando branches existentes...
git branch -a
echo.

echo 3. Criando e trocando para o branch development...
git checkout -b development
echo.

echo 4. Configurando upstream para o branch development...
git push -u origin development
echo.

echo 5. Configurando Git para facilitar sincronização...
git config pull.rebase true
git config push.default current
git config branch.autosetupmerge always
git config branch.autosetuprebase always
echo.

echo 6. Verificando configurações aplicadas...
echo Pull rebase: 
git config pull.rebase
echo Push default: 
git config push.default
echo Auto setup merge: 
git config branch.autosetupmerge
echo Auto setup rebase: 
git config branch.autosetuprebase
echo.

echo ✅ Configuração do Git concluída!
echo.
echo Workflow recomendado:
echo - Desenvolva no branch 'development'
echo - Faça commits frequentes: git add . && git commit -m "sua mensagem"
echo - Sincronize regularmente: git pull && git push
echo - Merge para 'main' apenas quando estável
echo.
pause
