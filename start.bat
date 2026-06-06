@echo off
REM Script para iniciar la aplicación de Administración de Condominios

echo Iniciando Administración de Condominios...
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js no está instalado
    pause
    exit /b 1
)

REM Crear carpeta data para la base de datos
if not exist "backend\data" mkdir backend\data

REM Instalar dependencias del backend
echo Instalando dependencias del backend...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Error instalando dependencias del backend
    cd ..
    pause
    exit /b 1
)
cd ..

REM Instalar dependencias del frontend
echo Instalando dependencias del frontend...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Error instalando dependencias del frontend
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ===================================
echo Iniciando servidor backend...
echo ===================================
start cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak

echo.
echo ===================================
echo Iniciando servidor frontend...
echo ===================================
start cmd /k "cd frontend && npm run dev"

echo.
echo ===================================
echo La aplicación se está iniciando...
echo ===================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Presiona cualquier tecla para continuar...
pause
