# Script para configurar Windows VM para tu proyecto
# Ejecutar como Administrador

Write-Host "🚀 Configurando Windows VM para tu proyecto..." -ForegroundColor Green

# Verificar si se ejecuta como administrador
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "Este script debe ejecutarse como Administrador"
    exit 1
}

# Instalar Git si no está instalado
Write-Host "📦 Verificando Git..." -ForegroundColor Yellow
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Instalando Git..." -ForegroundColor Yellow
    winget install --id Git.Git -e --source winget
}

# Instalar Node.js si no está instalado
Write-Host "📦 Verificando Node.js..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Instalando Node.js..." -ForegroundColor Yellow
    winget install --id OpenJS.NodeJS -e --source winget
}

# Instalar PM2 globalmente
Write-Host "⚙️ Instalando PM2..." -ForegroundColor Yellow
npm install -g pm2
npm install -g pm2-windows-startup

# Configurar PM2 para iniciar con Windows
pm2-startup install

# Habilitar IIS (opcional)
Write-Host "🌐 Configurando IIS..." -ForegroundColor Yellow
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpLogging, IIS-RequestFiltering, IIS-StaticContent, IIS-DefaultDocument, IIS-DirectoryBrowsing

# Configurar SQL Server para conexiones remotas
Write-Host "🗄️ Configurando SQL Server..." -ForegroundColor Yellow
# Habilitar TCP/IP
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQLServer\SuperSocketNetLib\Tcp\IPAll" -Name "TcpPort" -Value "1433"
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQLServer\SuperSocketNetLib\Tcp\IPAll" -Name "TcpDynamicPorts" -Value ""

# Crear directorio de la aplicación
Write-Host "📁 Creando directorio de aplicación..." -ForegroundColor Yellow
$appDir = "C:\mi-proyecto"
if (-not (Test-Path $appDir)) {
    New-Item -ItemType Directory -Path $appDir
}

# Configurar firewall
Write-Host "🔥 Configurando firewall..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "Node.js Backend" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
New-NetFirewallRule -DisplayName "Node.js Frontend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow

Write-Host "✅ Configuración completada!" -ForegroundColor Green
Write-Host "🔑 Recuerda configurar los secrets en GitHub:" -ForegroundColor Cyan
Write-Host "   - SSH_HOST: $(Invoke-RestMethod -Uri 'https://api.ipify.org')" -ForegroundColor White
Write-Host "   - SSH_USERNAME: tu_usuario_windows" -ForegroundColor White
Write-Host "   - SSH_PASSWORD: tu_password_windows" -ForegroundColor White
Write-Host "   - DB_USER: tu_usuario_sql_server" -ForegroundColor White
Write-Host "   - DB_PASSWORD: tu_password_sql_server" -ForegroundColor White
Write-Host "   - JWT_SECRET: $(New-Guid)" -ForegroundColor White
