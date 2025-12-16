# inicializa-app.ps1 (Versão Adaptada para Linux/WSL/Git Bash)

# --- Variáveis de Configuração ---
$FirebaseEmulators = "npm run firebase:emulators" # Adicionado 'npm run' para melhor compatibilidade
$NpmSeed = "npm run seed"
$NpmDev = "npm run dev"

# --- Funções Auxiliares (Simplificadas para ambiente Unix-like) ---

function Execute-Command {
    param(
        [Parameter(Mandatory=$true)]
        [string]$CommandDescription,
        [Parameter(Mandatory=$true)]
        [string]$Command
    )

    Write-Host "--- Iniciando: $CommandDescription ---" -ForegroundColor Yellow
    try {
        # Para comandos não bloqueantes (como 'seed'), executamos diretamente
        # Para comandos bloqueantes (como 'dev'), ele será o último comando
        Invoke-Expression $Command
        
    } catch {
        Write-Host "ERRO ao executar '$CommandDescription': $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# --- Execução dos Comandos ---

Write-Host "--- 🚀 Iniciando o Processo de Inicialização (Firebase, Seed, Dev) ---" -ForegroundColor Cyan

# 1. Iniciar Emuladores do Firebase em Background (Com '&' ou 'nohup')
# No PowerShell Core (pwsh) em Linux, podemos usar 'nohup' ou o operador de background '&'.
# A forma mais simples de rodar em background é adicionar '&' ao final do comando e rodá-lo via Invoke-Expression.

Write-Host "Iniciando emuladores do Firebase em background..." -ForegroundColor Green
Write-Host "PID do processo será exibido (use 'kill' para pará-lo)." -ForegroundColor DarkGray

# Executamos o comando com '&' no final.
# Nota: É comum definir 'firebase:emulators' no package.json como 'firebase emulators:start'
# Se não estiver no seu package.json, mude $FirebaseEmulators para "firebase emulators:start"
Invoke-Expression "$FirebaseEmulators &"

# 2. Aguardar o Início dos Emuladores
Write-Host "Aguardando 10 segundos para os emuladores subirem..." -ForegroundColor DarkGray
Start-Sleep -Seconds 10 

# 3. Executar Seed
Execute-Command "Script de Seed" $NpmSeed

# 4. Iniciar Servidor de Desenvolvimento Vue (Bloqueante - fica na janela atual)
Write-Host "Iniciando 'npm run dev' na janela atual..." -ForegroundColor Green
Execute-Command "Servidor de Desenvolvimento Vue" $NpmDev