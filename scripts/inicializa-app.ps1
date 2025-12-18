# --- Variáveis de Configuração ---
$Gitpull = "git pull" 
$NpmInstall = "npm install" 
$FirebaseEmulators = "npm run firebase:emulators" 
$NpmSeed = "npm run seed"
$NpmDev = "npm run dev"

function Execute-Command {
    param([string]$Desc, [string]$Cmd)
    Write-Host "--- $Desc ---" -ForegroundColor Yellow
    try {
        Invoke-Expression $Cmd
    } catch {
        Write-Host "ERRO: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

Write-Host "--- 🚀 Iniciando App (PowerShell Core Linux) ---" -ForegroundColor Cyan

# 1. Atualizando projeto com git pull (Síncrono)
Execute-Command "Atualizando projeto com git pull" $Gitpull

# 1. Instalar pacotes (Síncrono)
Execute-Command "Instalando dependências" $NpmInstall

# 2. Firebase Emulators em Background
Write-Host "--- Iniciando Emuladores em Background ---" -ForegroundColor Green
Invoke-Expression "$FirebaseEmulators &"

# 3. Aguardar (Ajuste o tempo se necessário)
Write-Host "Aguardando 10s para estabilização..." -ForegroundColor DarkGray
Start-Sleep -Seconds 10 

# 4. Seed
Execute-Command "Populando Banco de Dados" $NpmSeed

# 5. Dev (Bloqueante)
Execute-Command "Iniciando Servidor Dev" $NpmDev