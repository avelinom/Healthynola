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
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Store as StoreIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  Update as UpdateIcon,
  AdminPanelSettings as AdminIcon,
  Lock as LockIcon,
  People as PeopleIcon,
  Download as DownloadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import Layout from '@/components/Layout';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { useRouter } from 'next/router';

interface Backup {
  fileName: string;
  size: string;
  createdAt: string;
  modifiedAt: string;
  downloadUrl: string;
}

const Settings: NextPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { changePassword } = useUsers();
  
  // General Settings
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('es');
  const [businessName, setBusinessName] = useState('Healthynola');
  const [address, setAddress] = useState('Calle 123 #45-67, Bogotá');
  const [phone, setPhone] = useState('(+57) 300 123 4567');
  const [email, setEmail] = useState('info@healthynola.com');

  // Notifications
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [salesNotifications, setSalesNotifications] = useState(true);
  const [expiryReminders, setExpiryReminders] = useState(false);
  const [autoReports, setAutoReports] = useState(true);

  // Security
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [activityLog, setActivityLog] = useState(true);

  // System
  const [systemSounds, setSystemSounds] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  // Backups
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  // Password Change Dialog
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Load backups on mount
  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setLoadingBackups(true);
      const response = await fetch('/api/backup/list');
      const data = await response.json();
      if (data.success) {
        setBackups(data.backups || []);
      }
    } catch (error) {
      console.error('Error loading backups:', error);
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleSaveSettings = () => {
    console.log('Guardando configuración...');
    // Aquí iría la lógica para guardar en el backend
  };

  const handleOpenPasswordDialog = () => {
    setOpenPasswordDialog(true);
  };

  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
    setPasswordForm({
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'Nueva contraseña y confirmación son requeridas',
        severity: 'error'
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'Las contraseñas no coinciden',
        severity: 'error'
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setSnackbar({
        open: true,
        message: 'La contraseña debe tener al menos 6 caracteres',
        severity: 'error'
      });
      return;
    }

    if (!user?.id) {
      setSnackbar({
        open: true,
        message: 'No se pudo identificar el usuario',
        severity: 'error'
      });
      return;
    }

    const result = await changePassword(user.id, {
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword
    });

    if (result.success) {
      setSnackbar({
        open: true,
        message: 'Contraseña actualizada exitosamente',
        severity: 'success'
      });
      handleClosePasswordDialog();
    } else {
      setSnackbar({
        open: true,
        message: result.message || 'Error al cambiar contraseña',
        severity: 'error'
      });
    }
  };

  const handleManageUsers = () => {
    router.push('/users');
  };

  const handleCreateBackup = async () => {
    try {
      setCreatingBackup(true);
      setSnackbar({ open: true, message: 'Creando respaldo...', severity: 'info' });

      const response = await fetch('/api/backup/create', {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        setSnackbar({ 
          open: true, 
          message: `Respaldo creado exitosamente: ${data.backup.fileName}`, 
          severity: 'success' 
        });
        // Reload backups list
        await loadBackups();
      } else {
        setSnackbar({ 
          open: true, 
          message: data.message || 'Error al crear el respaldo', 
          severity: 'error' 
        });
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error de conexión al crear el respaldo', 
        severity: 'error' 
      });
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleDownloadBackup = (fileName: string) => {
    window.open(`/api/backup/download/${fileName}`, '_blank');
  };

  const handleUpdateSystem = () => {
    console.log('Actualizando sistema...');
    // Aquí iría la lógica para actualizar
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getLastBackupTime = () => {
    if (backups.length === 0) return 'Nunca';
    const lastBackup = backups[0];
    try {
      return formatDistanceToNow(new Date(lastBackup.createdAt), { 
        addSuffix: true,
        locale: es 
      });
    } catch {
      return 'Hace algún tiempo';
    }
  };

  return (
    <>
      <Head>
        <title>Configuración - Healthynola POS</title>
        <meta name="description" content="Configuración del sistema Healthynola POS" />
      </Head>
      <Layout title="Configuración del Sistema">
        <Grid container spacing={3}>
          {/* Configuración General */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StoreIcon />
                  Configuración General
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <TextField
                  fullWidth
                  label="Nombre del Negocio"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  margin="normal"
                  size="small"
                />
                
                <TextField
                  fullWidth
                  label="Dirección"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  margin="normal"
                  size="small"
                />
                
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  margin="normal"
                  size="small"
                />
                
                <TextField
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  size="small"
                  type="email"
                />

                <Box sx={{ mt: 3 }}>
                  <FormControlLabel
                    control={<Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />}
                    label="Modo oscuro"
                  />
                </Box>

                <Box sx={{ mt: 1 }}>
                  <FormControlLabel
                    control={<Switch checked={systemSounds} onChange={(e) => setSystemSounds(e.target.checked)} />}
                    label="Sonidos del sistema"
                  />
                </Box>

                <Box sx={{ mt: 1 }}>
                  <FormControlLabel
                    control={<Switch checked={offlineMode} onChange={(e) => setOfflineMode(e.target.checked)} />}
                    label="Modo sin conexión"
                  />
                </Box>

                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSaveSettings}
                  sx={{ mt: 2 }}
                  fullWidth
                >
                  Guardar Cambios
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Notificaciones */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationsIcon />
                  Notificaciones
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <FormControlLabel
                  control={<Switch checked={lowStockAlerts} onChange={(e) => setLowStockAlerts(e.target.checked)} />}
                  label="Alertas de stock bajo"
                />
                
                <FormControlLabel
                  control={<Switch checked={salesNotifications} onChange={(e) => setSalesNotifications(e.target.checked)} />}
                  label="Notificaciones de ventas"
                  sx={{ display: 'block', mt: 1 }}
                />
                
                <FormControlLabel
                  control={<Switch checked={expiryReminders} onChange={(e) => setExpiryReminders(e.target.checked)} />}
                  label="Recordatorios de vencimiento"
                  sx={{ display: 'block', mt: 1 }}
                />
                
                <FormControlLabel
                  control={<Switch checked={autoReports} onChange={(e) => setAutoReports(e.target.checked)} />}
                  label="Reportes automáticos"
                  sx={{ display: 'block', mt: 1 }}
                />

                <TextField
                  fullWidth
                  label="Stock mínimo para alertas"
                  type="number"
                  value={10}
                  margin="normal"
                  size="small"
                  sx={{ mt: 3 }}
                />

                <TextField
                  fullWidth
                  label="Email para notificaciones"
                  value="admin@healthynola.com"
                  margin="normal"
                  size="small"
                  type="email"
                />

                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSaveSettings}
                  sx={{ mt: 2 }}
                  fullWidth
                >
                  Guardar Configuración
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Seguridad */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon />
                  Seguridad
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <FormControlLabel
                  control={<Switch checked={twoFactorAuth} onChange={(e) => setTwoFactorAuth(e.target.checked)} />}
                  label="Autenticación de dos factores"
                />
                
                <FormControlLabel
                  control={<Switch checked={activityLog} onChange={(e) => setActivityLog(e.target.checked)} />}
                  label="Log de actividades"
                  sx={{ display: 'block', mt: 1 }}
                />

                <TextField
                  fullWidth
                  label="Tiempo de sesión (minutos)"
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
                  margin="normal"
                  size="small"
                  sx={{ mt: 3 }}
                />

                <Box sx={{ mt: 3, display: 'flex', gap: 2, flexDirection: 'column' }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    startIcon={<LockIcon />}
                    onClick={handleOpenPasswordDialog}
                  >
                    Cambiar Contraseña
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    startIcon={<PeopleIcon />}
                    onClick={handleManageUsers}
                  >
                    Gestionar Usuarios
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Sistema */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BackupIcon />
                  Sistema
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Último respaldo: {loadingBackups ? 'Cargando...' : getLastBackupTime()}
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={handleCreateBackup}
                    sx={{ mt: 2 }}
                    fullWidth
                    disabled={creatingBackup}
                    startIcon={creatingBackup ? <CircularProgress size={20} /> : <BackupIcon />}
                  >
                    {creatingBackup ? 'Creando...' : 'Crear Respaldo'}
                  </Button>
                  
                  {backups.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="body2" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Respaldos disponibles ({backups.length})
                      </Typography>
                      <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                        {backups.slice(0, 5).map((backup) => (
                          <ListItem
                            key={backup.fileName}
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              mb: 1,
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                          >
                            <ListItemText
                              primary={backup.fileName}
                              secondary={`${backup.size} MB - ${formatDistanceToNow(new Date(backup.createdAt), { addSuffix: true, locale: es })}`}
                            />
                            <Button
                              size="small"
                              startIcon={<DownloadIcon />}
                              onClick={() => handleDownloadBackup(backup.fileName)}
                            >
                              Descargar
                            </Button>
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Versión del sistema: 1.0.0
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="secondary"
                    onClick={handleUpdateSystem}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    Buscar Actualizaciones
                  </Button>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Button variant="outlined" fullWidth size="small">
                    Limpiar Caché
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Change Password Dialog */}
        <Dialog open={openPasswordDialog} onClose={handleClosePasswordDialog} maxWidth="xs" fullWidth>
          <DialogTitle>
            Cambiar Contraseña
            <IconButton
              onClick={handleClosePasswordDialog}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Cambiar contraseña para: <strong>{user?.name}</strong>
              </Typography>
              <TextField
                fullWidth
                label="Nueva Contraseña"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                helperText="Mínimo 6 caracteres"
              />
              <TextField
                fullWidth
                label="Confirmar Nueva Contraseña"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePasswordDialog}>Cancelar</Button>
            <Button onClick={handleChangePassword} variant="contained" color="primary">
              Cambiar Contraseña
            </Button>
          </DialogActions>
        </Dialog>

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
