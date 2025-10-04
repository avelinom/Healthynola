#!/bin/bash

# Script de despliegue para tu proyecto
# Ejecutar en la VM después del pull del repositorio

set -e

echo "🚀 Iniciando despliegue de tu proyecto..."

# Variables
APP_DIR="/home/azureuser/mi-proyecto"
BACKEND_DIR="$APP_DIR/web-backend"
FRONTEND_DIR="$APP_DIR/web-frontend"

cd $APP_DIR

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd $BACKEND_DIR
npm ci --production

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd $FRONTEND_DIR
npm ci
npm run build

# Configurar variables de entorno del backend
echo "⚙️ Configurando variables de entorno..."
cd $BACKEND_DIR
cat > .env << EOF
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mi_proyecto_db
DB_USER=mi_proyecto_user
DB_PASSWORD=mi_proyecto_secure_password_2024
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://$(curl -s ifconfig.me)
EOF

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones de base de datos..."
npm run migrate

# Reiniciar servicios con PM2
echo "🔄 Reiniciando servicios..."
pm2 stop mi-proyecto-backend || true
pm2 stop mi-proyecto-frontend || true
pm2 delete mi-proyecto-backend || true
pm2 delete mi-proyecto-frontend || true

# Iniciar backend
echo "🚀 Iniciando backend..."
cd $BACKEND_DIR
pm2 start src/server.js --name mi-proyecto-backend

# Iniciar frontend
echo "🚀 Iniciando frontend..."
cd $FRONTEND_DIR
pm2 start npm --name mi-proyecto-frontend -- start

# Guardar configuración de PM2
pm2 save

# Reiniciar Nginx
echo "🌐 Reiniciando Nginx..."
sudo systemctl reload nginx

echo "✅ Despliegue completado!"
echo "🌐 Aplicación disponible en: http://$(curl -s ifconfig.me)"
echo "📊 Estado de servicios:"
pm2 status
