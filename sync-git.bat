@echo off
echo Sincronizando com o repositório remoto...
echo.

REM Verificar se estamos no diretório correto
if not exist "package.json" (
    echo ERRO: Execute este script na raiz do projeto Hope-Cann-Connect
    pause
    exit /b 1
)

echo Branch atual:
git branch --show-current
echo.

echo 1. Verificando status...
git status
echo.

echo 2. Fazendo pull das últimas alterações...
git pull
echo.

echo 3. Adicionando arquivos modificados...
git add .
echo.

echo 4. Status após adicionar arquivos:
git status
echo.

set /p commit_msg="Digite a mensagem do commit (ou Enter para pular): "
if not "%commit_msg%"=="" (
    echo 5. Fazendo commit...
    git commit -m "%commit_msg%"
    echo.
    
    echo 6. Fazendo push...
    git push
    echo.
    
    echo ✅ Sincronização concluída!
) else (
    echo ℹ️ Commit pulado. Arquivos adicionados ao staging area.
)

echo.
pause
