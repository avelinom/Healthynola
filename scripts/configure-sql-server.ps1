# Script para configurar SQL Server para el proyecto
# Ejecutar como Administrador

Write-Host "🗄️ Configurando SQL Server para tu proyecto..." -ForegroundColor Green

# Habilitar autenticación mixta
Write-Host "🔐 Configurando autenticación..." -ForegroundColor Yellow
$sqlScript = @"
USE [master]
GO
EXEC xp_instance_regwrite N'HKEY_LOCAL_MACHINE', N'Software\Microsoft\MSSQLServer\MSSQLServer', N'LoginMode', REG_DWORD, 2
GO
"@

# Ejecutar script SQL
Invoke-Sqlcmd -Query $sqlScript -ServerInstance "localhost"

# Crear base de datos y usuario
Write-Host "📊 Creando base de datos y usuario..." -ForegroundColor Yellow
$createDbScript = @"
-- Crear base de datos
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'mi_proyecto_db')
BEGIN
    CREATE DATABASE [mi_proyecto_db]
END
GO

-- Crear usuario de login
IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = 'mi_proyecto_user')
BEGIN
    CREATE LOGIN [mi_proyecto_user] WITH PASSWORD = 'mi_proyecto_secure_password_2024'
END
GO

-- Crear usuario de base de datos
USE [mi_proyecto_db]
GO
IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'mi_proyecto_user')
BEGIN
    CREATE USER [mi_proyecto_user] FOR LOGIN [mi_proyecto_user]
    ALTER ROLE [db_owner] ADD MEMBER [mi_proyecto_user]
END
GO
"@

Invoke-Sqlcmd -Query $createDbScript -ServerInstance "localhost"

# Habilitar TCP/IP
Write-Host "🌐 Configurando TCP/IP..." -ForegroundColor Yellow
$tcpConfig = @"
-- Habilitar TCP/IP
EXEC xp_instance_regwrite N'HKEY_LOCAL_MACHINE', N'Software\Microsoft\MSSQLServer\MSSQLServer\SuperSocketNetLib\Tcp\IPAll', N'TcpPort', REG_SZ, N'1433'
EXEC xp_instance_regwrite N'HKEY_LOCAL_MACHINE', N'Software\Microsoft\MSSQLServer\MSSQLServer\SuperSocketNetLib\Tcp\IPAll', N'TcpDynamicPorts', REG_SZ, N''
"@

Invoke-Sqlcmd -Query $tcpConfig -ServerInstance "localhost"

# Reiniciar servicio SQL Server
Write-Host "🔄 Reiniciando SQL Server..." -ForegroundColor Yellow
Restart-Service -Name "MSSQLSERVER" -Force

Write-Host "✅ Configuración de SQL Server completada!" -ForegroundColor Green
Write-Host "🔑 Credenciales de base de datos:" -ForegroundColor Cyan
Write-Host "   - Servidor: localhost" -ForegroundColor White
Write-Host "   - Puerto: 1433" -ForegroundColor White
Write-Host "   - Base de datos: mi_proyecto_db" -ForegroundColor White
Write-Host "   - Usuario: mi_proyecto_user" -ForegroundColor White
Write-Host "   - Contraseña: mi_proyecto_secure_password_2024" -ForegroundColor White
