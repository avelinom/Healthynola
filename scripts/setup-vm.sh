#!/bin/bash

# Script para configurar la VM de Azure para tu proyecto
# Ejecutar como: sudo bash setup-vm.sh

set -e

echo "🚀 Configurando VM de Azure para tu proyecto..."

# Actualizar sistema
echo "📦 Actualizando sistema..."
apt update && apt upgrade -y

# Instalar Node.js 18
echo "📦 Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Instalar PostgreSQL
echo "🗄️ Instalando PostgreSQL..."
apt install postgresql postgresql-contrib -y

# Instalar PM2
echo "⚙️ Instalando PM2..."
npm install -g pm2

# Instalar Nginx
echo "🌐 Instalando Nginx..."
apt install nginx -y

# Instalar herramientas adicionales
echo "🔧 Instalando herramientas adicionales..."
apt install git curl wget unzip -y

# Configurar PostgreSQL
echo "🗄️ Configurando PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE mi_proyecto_db;"
sudo -u postgres psql -c "CREATE USER mi_proyecto_user WITH PASSWORD 'mi_proyecto_secure_password_2024';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mi_proyecto_db TO mi_proyecto_user;"

# Configurar Nginx
echo "🌐 Configurando Nginx..."
cp nginx.conf /etc/nginx/sites-available/mi-proyecto
ln -sf /etc/nginx/sites-available/mi-proyecto /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Probar configuración de Nginx
nginx -t

# Habilitar servicios
echo "🔄 Habilitando servicios..."
systemctl enable postgresql
systemctl enable nginx
systemctl restart postgresql
systemctl restart nginx

# Crear directorio de la aplicación
echo "📁 Creando directorio de aplicación..."
mkdir -p /home/azureuser/mi-proyecto
chown -R azureuser:azureuser /home/azureuser/mi-proyecto

# Configurar PM2 para el usuario azureuser
echo "⚙️ Configurando PM2..."
sudo -u azureuser pm2 startup systemd -u azureuser --hp /home/azureuser

echo "✅ Configuración completada!"
echo "🔑 Recuerda configurar los secrets en GitHub:"
echo "   - SSH_PRIVATE_KEY"
echo "   - SSH_HOST: $(curl -s ifconfig.me)"
echo "   - SSH_USERNAME: azureuser"
echo "   - DB_PASSWORD: mi_proyecto_secure_password_2024"
echo "   - JWT_SECRET: $(openssl rand -base64 32)"
