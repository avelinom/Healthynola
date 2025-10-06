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
  Close as CloseIcon,
  RocketLaunch as RocketIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import Layout from '@/components/Layout';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { useRouter } from 'next/router';
import { apiService } from '@/services/api';

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

  // Production Readiness Dialog
  const [openReadinessDialog, setOpenReadinessDialog] = useState(false);
  const [readinessReport, setReadinessReport] = useState<any>(null);
  const [checkingReadiness, setCheckingReadiness] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [initializationResult, setInitializationResult] = useState<any>(null);

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

  const handleCheckProductionReadiness = async () => {
    try {
      setCheckingReadiness(true);
      setSnackbar({ open: true, message: 'Validando sistema...', severity: 'info' });
      
      const response = await apiService.checkProductionReadiness();
      
      if (response.success) {
        setReadinessReport(response.data);
        setOpenReadinessDialog(true);
        
        const severity = response.data.status === 'ready' ? 'success' 
          : response.data.status === 'ready_with_warnings' ? 'warning' 
          : 'error';
        
        setSnackbar({ 
          open: true, 
          message: response.data.message, 
          severity 
        });
      } else {
        setSnackbar({ 
          open: true, 
          message: 'Error al validar el sistema', 
          severity: 'error' 
        });
      }
    } catch (error) {
      console.error('Error checking production readiness:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error de conexión al validar el sistema', 
        severity: 'error' 
      });
    } finally {
      setCheckingReadiness(false);
    }
  };

  const handleCloseReadinessDialog = () => {
    setOpenReadinessDialog(false);
    setInitializationResult(null);
  };

  const handleInitializeProduction = async () => {
    if (!window.confirm('⚠️ ADVERTENCIA: Esta acción borrará todas las transacciones (ventas, gastos, transferencias, etc.) pero mantendrá productos, usuarios y configuración.\n\n¿Estás seguro de que deseas inicializar el sistema para producción?')) {
      return;
    }

    try {
      setInitializing(true);
      setSnackbar({ open: true, message: 'Inicializando sistema...', severity: 'info' });

      const response = await apiService.initializeProduction();

      if (response.success) {
        setInitializationResult(response.data);
        setSnackbar({
          open: true,
          message: response.data.message || 'Sistema inicializado correctamente',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Error al inicializar el sistema',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error initializing production:', error);
      setSnackbar({
        open: true,
        message: 'Error de conexión al inicializar el sistema',
        severity: 'error'
      });
    } finally {
      setInitializing(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <ErrorIcon color="error" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'info': return <InfoIcon color="info" />;
      default: return <CheckIcon color="success" />;
    }
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

          {/* Producción - Solo para Admin */}
          {user?.role === 'admin' && (
            <Grid item xs={12}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RocketIcon />
                    Puesta en Producción
                  </Typography>
                  <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.3)' }} />
                  
                  <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                    Valida que todos los componentes del sistema estén listos para lanzamiento a producción.
                    Esta herramienta verifica módulos, usuarios, permisos, base de datos y configuraciones.
                  </Typography>

                  <Button 
                    variant="contained" 
                    size="large"
                    fullWidth
                    onClick={handleCheckProductionReadiness}
                    disabled={checkingReadiness}
                    startIcon={checkingReadiness ? <CircularProgress size={20} color="inherit" /> : <RocketIcon />}
                    sx={{
                      backgroundColor: 'white',
                      color: '#667eea',
                      fontWeight: 'bold',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9)'
                      }
                    }}
                  >
                    {checkingReadiness ? 'Validando Sistema...' : 'Alistar Sistema para Producción'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}
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

        {/* Production Readiness Report Dialog */}
        <Dialog 
          open={openReadinessDialog} 
          onClose={handleCloseReadinessDialog} 
          maxWidth="md" 
          fullWidth
          scroll="paper"
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            background: readinessReport?.status === 'ready' 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : readinessReport?.status === 'ready_with_warnings'
              ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white'
          }}>
            <RocketIcon />
            Reporte de Validación del Sistema
            <IconButton
              onClick={handleCloseReadinessDialog}
              sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {readinessReport && (
              <Box>
                {/* Status Summary */}
                <Alert 
                  severity={
                    readinessReport.status === 'ready' ? 'success' 
                    : readinessReport.status === 'ready_with_warnings' ? 'warning' 
                    : 'error'
                  }
                  sx={{ mb: 3 }}
                >
                  <Typography variant="h6">{readinessReport.message}</Typography>
                </Alert>

                {/* Summary Stats */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {readinessReport.summary?.totalModules}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Módulos
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {readinessReport.summary?.activeUsers}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Usuarios Activos
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="info.main">
                          {readinessReport.summary?.existingTables}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tablas BD
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="secondary.main">
                          {readinessReport.summary?.totalRecords}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Registros
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Users by Role */}
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  👥 Usuarios por Rol
                </Typography>
                <List dense>
                  {readinessReport.users?.list?.map((user: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {user.active ? <CheckIcon color="success" /> : <ErrorIcon color="error" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={`${user.name} (${user.role})`}
                        secondary={user.email}
                      />
                    </ListItem>
                  ))}
                </List>

                {/* Modules by Role */}
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  📊 Módulos por Rol
                </Typography>
                {Object.entries(readinessReport.modules?.roles || {}).map(([roleName, roleData]: [string, any]) => (
                  <Card key={roleName} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {roleName}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Web: <strong>{roleData.webAccess} módulos</strong>
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Móvil: <strong>{roleData.mobileAccess} módulos</strong>
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}

                {/* Consignments */}
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  📦 Sistema de Consignaciones
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Consignaciones: <strong>{readinessReport.consignments?.totalConsignments}</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Visitas: <strong>{readinessReport.consignments?.totalVisits}</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Consignatarios: <strong>{readinessReport.consignments?.consignatarios}</strong>
                    </Typography>
                  </Grid>
                </Grid>

                {/* Suggestions */}
                {readinessReport.suggestions && readinessReport.suggestions.length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      💡 Sugerencias y Advertencias
                    </Typography>
                    <List>
                      {readinessReport.suggestions.map((suggestion: any, index: number) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            {getSeverityIcon(suggestion.severity)}
                          </ListItemIcon>
                          <ListItemText
                            primary={suggestion.message}
                            secondary={`Acción: ${suggestion.action}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
            <Button onClick={handleCloseReadinessDialog} variant="outlined">
              Cerrar
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {!initializationResult && readinessReport?.status === 'ready' && (
                <Button 
                  variant="contained" 
                  color="warning"
                  startIcon={initializing ? <CircularProgress size={20} color="inherit" /> : <BackupIcon />}
                  onClick={handleInitializeProduction}
                  disabled={initializing}
                >
                  {initializing ? 'Inicializando...' : 'Inicializar Sistema'}
                </Button>
              )}
              {initializationResult && (
                <Alert severity="success" sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {initializationResult.message}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {initializationResult.cleanup?.totalDeleted || 0} registros eliminados
                  </Typography>
                  {initializationResult.backup?.filename && (
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      💾 Backup: {initializationResult.backup.filename} ({initializationResult.backup.size || 'N/A'})
                    </Typography>
                  )}
                  {initializationResult.report?.filename && (
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      📄 Reporte: {initializationResult.report.filename}
                    </Typography>
                  )}
                </Alert>
              )}
            </Box>
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
