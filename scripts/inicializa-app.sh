#!/bin/bash

# Cores para o terminal
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${CYAN}--- 🚀 Iniciando App (Bash Script) ---${NC}"

# 1. Instalar pacotes
echo -e "${YELLOW}--- Instalando dependências ---${NC}"
npm install

# 2. Iniciar Emuladores em Background
echo -e "${GREEN}--- Iniciando Emuladores em Background ---${NC}"
npm run firebase:emulators &

# 3. Aguardar estabilização
echo -e "Aguardando 10s..."
sleep 10

# 4. Rodar Seed
echo -e "${YELLOW}--- Populando Banco de Dados ---${NC}"
npm run seed

# 5. Iniciar Dev
echo -e "${GREEN}--- Iniciando Servidor Dev ---${NC}"
npm run dev