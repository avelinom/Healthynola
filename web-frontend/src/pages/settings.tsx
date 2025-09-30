import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Snackbar,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Store as StoreIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import Layout from '@/components/Layout';

const Settings: NextPage = () => {
  interface Backup {
    filename: string;
    createdAt: string;
    size: number;
  }

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({ open: false, message: '', severity: 'success' });
  const [backups, setBackups] = useState<Backup[]>([]);
  const [lastBackup, setLastBackup] = useState<Backup | null>(null);

  // Cargar lista de respaldos al montar el componente
  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const response = await fetch('/api/backup/list');
      const data = await response.json();
      
      if (data.success) {
        setBackups(data.backups);
        if (data.backups.length > 0) {
          setLastBackup(data.backups[0]);
        }
      }
    } catch (error) {
      console.error('Error al cargar respaldos:', error);
    }
  };

  const createBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setSnackbar({
          open: true,
          message: `Respaldo creado exitosamente: ${data.backup.fileName} (${data.backup.size} MB)`,
          severity: 'success'
        });
        
        // Recargar lista de respaldos
        await loadBackups();
        
        // Descargar automáticamente el respaldo
        downloadBackup(data.backup.fileName);
      } else {
        setSnackbar({
          open: true,
          message: `Error al crear respaldo: ${data.message}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error al crear respaldo:', error);
      setSnackbar({
        open: true,
        message: 'Error de conexión al crear respaldo',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = (fileName: string) => {
    const link = document.createElement('a');
    link.href = `/api/backup/download/${fileName}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (size: number) => {
    return `${size} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Head>
        <title>Configuración - Healthynola POS</title>
        <meta name="description" content="Configuración del sistema Healthynola POS" />
      </Head>

      <Layout title="Configuración del Sistema">
        <Grid container spacing={3}>
          {/* General Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StoreIcon />
                  Configuración General
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <TextField
                    label="Nombre del Negocio"
                    defaultValue="Healthynola"
                    fullWidth
                  />
                  <TextField
                    label="Dirección"
                    defaultValue="Calle 123 #45-67, Bogotá"
                    fullWidth
                  />
                  <TextField
                    label="Teléfono"
                    defaultValue="(+57) 300 123 4567"
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    defaultValue="info@healthynola.com"
                    type="email"
                    fullWidth
                  />
                  
                  <Divider />
                  
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Modo oscuro"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Sonidos del sistema"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Modo sin conexión"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Notifications */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationsIcon />
                  Notificaciones
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Alertas de stock bajo"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Notificaciones de ventas"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Recordatorios de vencimiento"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Reportes automáticos"
                  />
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <TextField
                    label="Stock mínimo para alertas"
                    type="number"
                    defaultValue="10"
                    size="small"
                  />
                  <TextField
                    label="Email para notificaciones"
                    type="email"
                    defaultValue="admin@healthynola.com"
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Security */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon />
                  Seguridad
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Autenticación de dos factores"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Sesiones automáticas"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Log de actividades"
                  />
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Button variant="outlined" size="small">
                    Cambiar Contraseña
                  </Button>
                  <Button variant="outlined" size="small">
                    Gestionar Usuarios
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* System */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BackupIcon />
                  Sistema
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <UpdateIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Versión del Sistema"
                      secondary="v1.0.0 - Última actualización: 29/09/2024"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <BackupIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Último Respaldo"
                      secondary={
                        lastBackup 
                          ? `${formatDate(lastBackup.createdAt)} - ${formatFileSize(lastBackup.size)}`
                          : "No hay respaldos disponibles"
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Total de Respaldos"
                      secondary={
                        <Chip 
                          label={`${backups.length} archivos`} 
                          size="small" 
                          color={backups.length > 0 ? "success" : "default"}
                        />
                      }
                    />
                  </ListItem>
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={createBackup}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : <BackupIcon />}
                  >
                    {loading ? 'Creando...' : 'Crear Respaldo'}
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={loadBackups}
                  >
                    Actualizar Lista
                  </Button>
                  <Button variant="outlined" size="small" color="warning">
                    Limpiar Cache
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Backup History */}
        {backups.length > 0 && (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BackupIcon />
                    Historial de Respaldos
                  </Typography>
                  
                  <List dense>
                    {backups.slice(0, 5).map((backup, index) => (
                      <ListItem key={backup.filename} divider={index < 4}>
                        <ListItemIcon>
                          <BackupIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={backup.filename}
                          secondary={`${formatDate(backup.createdAt)} - ${formatFileSize(backup.size)}`}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => downloadBackup(backup.filename)}
                        >
                          Descargar
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                  
                  {backups.length > 5 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Y {backups.length - 5} respaldos más...
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Save Button */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" size="large" sx={{ minWidth: 200 }}>
            Guardar Configuración
          </Button>
        </Box>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Layout>
    </>
  );
};

export default Settings;
