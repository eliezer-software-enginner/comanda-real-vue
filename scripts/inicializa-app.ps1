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

Write-Host "--- 🚀 Iniciando App (PowerShell) ---" -ForegroundColor Cyan

# 1. Atualizando projeto (BLOQUEANTE)
Execute-Command "Atualizando projeto com git pull" $Gitpull

# 2. Instalar pacotes (BLOQUEANTE)
Execute-Command "Instalando dependências" $NpmInstall

# 3. Firebase Emulators em Background (NÃO BLOQUEANTE)
Write-Host "--- Iniciando Emuladores em Background ---" -ForegroundColor Green
Start-Process `
    -FilePath "powershell" `
    -ArgumentList "-NoExit", "-Command", $FirebaseEmulators `
    -WorkingDirectory (Get-Location) `
    -NoNewWindow

# 4. Aguardar estabilização
Write-Host "Aguardando 35s para estabilização..." -ForegroundColor DarkGray
Start-Sleep -Seconds 35

# 5. Seed (BLOQUEANTE)
Execute-Command "Populando Banco de Dados" $NpmSeed

# 6. Dev (BLOQUEANTE)
Execute-Command "Iniciando Servidor Dev" $NpmDev
