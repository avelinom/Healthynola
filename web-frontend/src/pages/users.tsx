import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useUsers } from '@/hooks/useUsers';
import { useWarehousesSimple } from '@/hooks/useWarehousesSimple';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Switch,
  FormControlLabel,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import {
  People as UsersIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  ManageAccounts as ManagerIcon,
  Person as PersonIcon,
  PointOfSale as CashierIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import Layout from '@/components/Layout';

const Users: NextPage = () => {
  const { users, loading, error, fetchUsers, createUser, updateUser, changePassword, toggleUserStatus, deleteUser } = useUsers();
  const { activeWarehouses, fetchWarehouses } = useWarehousesSimple();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState<any | null>(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  
  // Form state for new/edit user
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'salesperson' as 'admin' | 'manager' | 'cashier' | 'salesperson',
    warehouse: 'Principal',
    phone: '',
    active: true
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Load users and warehouses on mount
  useEffect(() => {
    fetchUsers();
    fetchWarehouses();
  }, []);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    // Reset form
    setUserForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'salesperson',
      warehouse: 'Principal',
      phone: '',
      active: true
    });
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      password: '', // Don't show password on edit
      confirmPassword: '',
      role: user.role,
      warehouse: user.warehouse || 'Principal',
      phone: user.phone || '',
      active: user.active
    });
    setOpenDialog(true);
  };

  const handleOpenPasswordDialog = (user: any) => {
    setChangingPasswordUser(user);
    setPasswordForm({
      newPassword: '',
      confirmPassword: ''
    });
    setOpenPasswordDialog(true);
  };

  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
    setChangingPasswordUser(null);
    setPasswordForm({
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleSaveUser = async () => {
    // Validation
    if (!userForm.name || !userForm.email) {
      setSnackbar({
        open: true,
        message: 'Nombre y email son requeridos',
        severity: 'error'
      });
      return;
    }

    if (!editingUser && (!userForm.password || !userForm.confirmPassword)) {
      setSnackbar({
        open: true,
        message: 'Contraseña y confirmación son requeridas para nuevos usuarios',
        severity: 'error'
      });
      return;
    }

    if (!editingUser && userForm.password !== userForm.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'Las contraseñas no coinciden',
        severity: 'error'
      });
      return;
    }

    if (!editingUser && userForm.password.length < 6) {
      setSnackbar({
        open: true,
        message: 'La contraseña debe tener al menos 6 caracteres',
        severity: 'error'
      });
      return;
    }

    if (editingUser) {
      // Update existing user (without password)
      const result = await updateUser(editingUser.id, {
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        warehouse: userForm.warehouse,
        phone: userForm.phone,
        active: userForm.active
      });

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Usuario actualizado exitosamente',
          severity: 'success'
        });
        handleCloseDialog();
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Error al actualizar usuario',
          severity: 'error'
        });
      }
    } else {
      // Create new user (with password)
      const result = await createUser({
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
        warehouse: userForm.warehouse,
        phone: userForm.phone,
        active: userForm.active
      });

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Usuario creado exitosamente',
          severity: 'success'
        });
        handleCloseDialog();
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Error al crear usuario',
          severity: 'error'
        });
      }
    }
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

    if (changingPasswordUser) {
      const result = await changePassword(changingPasswordUser.id, {
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
    }
  };

  const handleToggleStatus = async (user: any) => {
    const result = await toggleUserStatus(user.id);
    
    if (result.success) {
      setSnackbar({
        open: true,
        message: `Usuario ${!user.active ? 'activado' : 'desactivado'} exitosamente`,
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: result.message || 'Error al cambiar estado del usuario',
        severity: 'error'
      });
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (confirm(`¿Está seguro de eliminar al usuario ${user.name}?`)) {
      const result = await deleteUser(user.id);
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Usuario eliminado exitosamente',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: result.message || 'Error al eliminar usuario',
          severity: 'error'
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminIcon sx={{ fontSize: 18, mr: 0.5 }} />;
      case 'manager':
        return <ManagerIcon sx={{ fontSize: 18, mr: 0.5 }} />;
      case 'cashier':
        return <CashierIcon sx={{ fontSize: 18, mr: 0.5 }} />;
      default:
        return <PersonIcon sx={{ fontSize: 18, mr: 0.5 }} />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'manager':
        return 'Gerente';
      case 'cashier':
        return 'Cajero';
      case 'salesperson':
        return 'Vendedor';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'cashier':
        return 'info';
      default:
        return 'default';
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getRoleLabel(user.role).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Gestión de Usuarios - Healthynola POS</title>
        <meta name="description" content="Gestión de usuarios del sistema Healthynola POS" />
      </Head>
      <Layout title="Gestión de Usuarios">
        <Box sx={{ py: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <UsersIcon sx={{ fontSize: 40 }} />
              Usuarios del Sistema
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Nuevo Usuario
            </Button>
          </Box>

          {/* Search Bar */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardContent>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Almacén</TableCell>
                      <TableCell>Teléfono</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          Cargando usuarios...
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No se encontraron usuarios
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Chip
                              icon={getRoleIcon(user.role)}
                              label={getRoleLabel(user.role)}
                              color={getRoleColor(user.role) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{user.warehouse || 'Principal'}</TableCell>
                          <TableCell>{user.phone || '-'}</TableCell>
                          <TableCell>
                            <Switch
                              checked={user.active}
                              onChange={() => handleToggleStatus(user)}
                              color="primary"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => handleEditUser(user)}
                              color="primary"
                              title="Editar usuario"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenPasswordDialog(user)}
                              color="secondary"
                              title="Cambiar contraseña"
                            >
                              <LockIcon />
                            </IconButton>
                            {user.role !== 'admin' && (
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteUser(user)}
                                color="error"
                                title="Eliminar usuario"
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Create/Edit User Dialog */}
          <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
            <DialogTitle>
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              <IconButton
                onClick={handleCloseDialog}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre Completo"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    required
                  />
                </Grid>
                {!editingUser && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Contraseña"
                        type="password"
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        required
                        helperText="Mínimo 6 caracteres"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Confirmar Contraseña"
                        type="password"
                        value={userForm.confirmPassword}
                        onChange={(e) => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                        required
                      />
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Rol</InputLabel>
                    <Select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                      label="Rol"
                    >
                      <MenuItem value="salesperson">Vendedor</MenuItem>
                      <MenuItem value="cashier">Cajero</MenuItem>
                      <MenuItem value="manager">Gerente</MenuItem>
                      <MenuItem value="admin">Administrador</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Almacén</InputLabel>
                    <Select
                      value={userForm.warehouse}
                      onChange={(e) => setUserForm({ ...userForm, warehouse: e.target.value })}
                      label="Almacén"
                    >
                      {activeWarehouses.map((warehouse) => (
                        <MenuItem key={warehouse.codigo} value={warehouse.nombre}>
                          {warehouse.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userForm.active}
                        onChange={(e) => setUserForm({ ...userForm, active: e.target.checked })}
                      />
                    }
                    label="Usuario Activo"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancelar</Button>
              <Button onClick={handleSaveUser} variant="contained" color="primary">
                {editingUser ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogActions>
          </Dialog>

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
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Cambiar contraseña para: <strong>{changingPasswordUser?.name}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nueva Contraseña"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    helperText="Mínimo 6 caracteres"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirmar Nueva Contraseña"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                  />
                </Grid>
              </Grid>
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
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Layout>
    </>
  );
};

export default Users;
