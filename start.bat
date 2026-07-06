@echo off
setlocal

echo Iniciando frontend de Administracion de Condominios...
echo.

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm no esta instalado
    pause
    exit /b 1
)

cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Error instalando dependencias del frontend
    pause
    exit /b 1
)

call npm run dev

pause
