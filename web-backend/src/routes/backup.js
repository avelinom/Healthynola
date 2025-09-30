const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Endpoint para crear respaldo de la base de datos
router.post('/create', async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `healthynola_backup_${timestamp}.sql`;
    const backupPath = path.join(__dirname, '../backups', backupFileName);
    
    // Crear directorio de respaldos si no existe
    const backupsDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    // Configuración de la base de datos desde variables de entorno
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '5432',
      database: process.env.DB_NAME || 'healthynola_pos',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || ''
    };

    // Comando pg_dump - usar ruta completa para macOS con Homebrew
    const pgDumpPath = '/opt/homebrew/Cellar/postgresql@15/15.14/bin/pg_dump';
    const pgDumpCommand = `PGPASSWORD="${dbConfig.password}" ${pgDumpPath} -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} --no-password --format=custom --compress=9 --file="${backupPath}"`;

    console.log('Iniciando respaldo de la base de datos...');
    console.log(`Archivo de respaldo: ${backupFileName}`);

    exec(pgDumpCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('Error al crear respaldo:', error);
        return res.status(500).json({
          success: false,
          message: 'Error al crear el respaldo de la base de datos',
          error: error.message
        });
      }

      if (stderr) {
        console.warn('Advertencias durante el respaldo:', stderr);
      }

      // Verificar que el archivo se creó correctamente
      if (fs.existsSync(backupPath)) {
        const stats = fs.statSync(backupPath);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log(`Respaldo creado exitosamente: ${backupFileName} (${fileSizeInMB} MB)`);

        res.json({
          success: true,
          message: 'Respaldo creado exitosamente',
          backup: {
            fileName: backupFileName,
            filePath: backupPath,
            size: fileSizeInMB,
            timestamp: new Date().toISOString(),
            downloadUrl: `/api/backup/download/${backupFileName}`
          }
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'El archivo de respaldo no se creó correctamente'
        });
      }
    });

  } catch (error) {
    console.error('Error en el proceso de respaldo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Endpoint para descargar un respaldo
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const backupPath = path.join(__dirname, '../backups', filename);

    // Verificar que el archivo existe
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo de respaldo no encontrado'
      });
    }

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Enviar el archivo
    const fileStream = fs.createReadStream(backupPath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('Error al enviar archivo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al descargar el archivo'
      });
    });

  } catch (error) {
    console.error('Error en descarga:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Endpoint para listar respaldos disponibles
router.get('/list', (req, res) => {
  try {
    const backupsDir = path.join(__dirname, '../backups');
    
    if (!fs.existsSync(backupsDir)) {
      return res.json({
        success: true,
        backups: []
      });
    }

    const files = fs.readdirSync(backupsDir)
      .filter(file => file.endsWith('.sql'))
      .map(file => {
        const filePath = path.join(backupsDir, file);
        const stats = fs.statSync(filePath);
        return {
          fileName: file,
          size: (stats.size / (1024 * 1024)).toFixed(2),
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          downloadUrl: `/api/backup/download/${file}`
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      backups: files
    });

  } catch (error) {
    console.error('Error al listar respaldos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al listar respaldos',
      error: error.message
    });
  }
});

module.exports = router;