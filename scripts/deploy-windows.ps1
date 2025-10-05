# Script de despliegue para Windows
# Ejecutar en la VM después del pull del repositorio

Write-Host "🚀 Iniciando despliegue en Windows..." -ForegroundColor Green

# Variables
$appDir = "C:\mi-proyecto"
$backendDir = "$appDir\web-backend"
$frontendDir = "$appDir\web-frontend"

Set-Location $appDir

# Instalar dependencias del backend
Write-Host "📦 Instalando dependencias del backend..." -ForegroundColor Yellow
Set-Location $backendDir
npm ci --production

# Instalar dependencias del frontend
Write-Host "📦 Instalando dependencias del frontend..." -ForegroundColor Yellow
Set-Location $frontendDir
npm ci
npm run build

# Configurar variables de entorno del backend
Write-Host "⚙️ Configurando variables de entorno..." -ForegroundColor Yellow
Set-Location $backendDir
$envContent = @"
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=1433
DB_NAME=mi_proyecto_db
DB_USER=tu_usuario_sql_server
DB_PASSWORD=tu_password_sql_server
JWT_SECRET=tu_jwt_secret_aqui
FRONTEND_URL=http://$(Invoke-RestMethod -Uri 'https://api.ipify.org')
"@
$envContent | Out-File -FilePath ".env" -Encoding UTF8

# Ejecutar migraciones
Write-Host "🗄️ Ejecutando migraciones de base de datos..." -ForegroundColor Yellow
npm run migrate

# Detener servicios existentes
Write-Host "🔄 Deteniendo servicios existentes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Iniciar servicios con PM2
Write-Host "🚀 Iniciando servicios..." -ForegroundColor Yellow
Set-Location $backendDir
pm2 start src/server.js --name "mi-proyecto-backend"

Set-Location $frontendDir
pm2 start npm --name "mi-proyecto-frontend" -- start

# Guardar configuración de PM2
pm2 save

Write-Host "✅ Despliegue completado!" -ForegroundColor Green
Write-Host "🌐 Aplicación disponible en: http://$(Invoke-RestMethod -Uri 'https://api.ipify.org')" -ForegroundColor Cyan
Write-Host "📊 Estado de servicios:" -ForegroundColor Cyan
pm2 status


