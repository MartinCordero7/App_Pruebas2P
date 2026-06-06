#!/bin/bash

echo "Iniciando Administración de Condominios..."
echo

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado"
    exit 1
fi

# Crear carpeta data para la base de datos
mkdir -p backend/data

# Instalar dependencias del backend
echo "Instalando dependencias del backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Error instalando dependencias del backend"
    cd ..
    exit 1
fi
cd ..

# Instalar dependencias del frontend
echo "Instando dependencias del frontend..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Error instalando dependencias del frontend"
    cd ..
    exit 1
fi
cd ..

echo
echo "==================================="
echo "Iniciando servidor backend..."
echo "==================================="
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

sleep 3

echo
echo "==================================="
echo "Iniciando servidor frontend..."
echo "==================================="
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo
echo "==================================="
echo "La aplicación se está iniciando..."
echo "==================================="
echo
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo
echo "Presiona Ctrl+C para detener"
echo

# Esperar a que los procesos terminen
wait $BACKEND_PID $FRONTEND_PID
