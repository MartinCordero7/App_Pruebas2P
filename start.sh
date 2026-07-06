#!/bin/bash

set -e

echo "Iniciando frontend de Administración de Condominios..."

if ! command -v npm &> /dev/null; then
    echo "ERROR: npm no está instalado"
    exit 1
fi

cd frontend
npm install
npm run dev
