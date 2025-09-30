import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import {
  addUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  User
} from '@/store/slices/usersSlice';
import { addActivity } from '@/store/slices/activitySlice';
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
  IconButton
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
  PointOfSale as CashierIcon
} from '@mui/icons-material';
import Layout from '@/components/Layout';

const Users: NextPage = () => {
  const dispatch = useDispatch();
  const users = useSelector((state: RootState) => state.users.users);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form state for new/edit user
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'salesperson' as 'admin' | 'manager' | 'cashier' | 'salesperson',
    warehouse: 'Principal',
    phone: '',
    active: true
  });

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
      role: 'salesperson',
      warehouse: 'Principal',
      phone: '',
      active: true
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      warehouse: user.warehouse,
      phone: user.phone || '',
      active: user.active
    });
    setOpenDialog(true);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setUserForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveUser = () => {
    if (!userForm.name.trim() || !userForm.email.trim()) {
      alert('El nombre y email del usuario son obligatorios');
      return;
    }

    if (editingUser) {
      // Update existing user
      dispatch(updateUser({
        ...editingUser,
        ...userForm,
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        phone: userForm.phone.trim() || undefined
      }));
      
      // Add activity
      dispatch(addActivity({
        type: 'user',
        action: 'Usuario actualizado',
        details: `${userForm.name} - ${userForm.role}`,
        userId: '1',
        userName: 'Admin'
      }));
      
      alert(`Usuario "${userForm.name}" actualizado exitosamente!`);
    } else {
      // Create new user
      const userData = {
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        role: userForm.role,
        warehouse: userForm.warehouse,
        phone: userForm.phone.trim() || undefined,
        active: userForm.active
      };
      dispatch(addUser(userData));
      
      // Add activity
      dispatch(addActivity({
        type: 'user',
        action: 'Usuario registrado',
        details: `${userData.name} - ${userData.role}`,
        userId: '1',
        userName: 'Admin'
      }));
      
      alert(`Usuario "${userData.name}" creado exitosamente!`);
    }

    handleCloseDialog();
  };

  const handleToggleUserStatus = (userId: number) => {
    dispatch(toggleUserStatus(userId));
  };

  const handleDeleteUser = (userId: number, userName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) {
      dispatch(deleteUser(userId));
      
      // Add activity
      dispatch(addActivity({
        type: 'user',
        action: 'Usuario eliminado',
        details: userName,
        userId: '1',
        userName: 'Admin'
      }));
      
      alert(`Usuario "${userName}" eliminado exitosamente.`);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.warehouse.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'cashier': return 'info';
      case 'salesperson': return 'primary';
      default: return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <AdminIcon fontSize="small" />;
      case 'manager': return <ManagerIcon fontSize="small" />;
      case 'cashier': return <CashierIcon fontSize="small" />;
      case 'salesperson': return <PersonIcon fontSize="small" />;
      default: return <PersonIcon fontSize="small" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      case 'cashier': return 'Cajero';
      case 'salesperson': return 'Vendedor';
      default: return role;
    }
  };

  return (
    <>
      <Head>
        <title>Usuarios - Healthynola POS</title>
        <meta name="description" content="Gestión de usuarios del sistema Healthynola POS" />
      </Head>

      <Layout title="Gestión de Usuarios">
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <UsersIcon />
                Usuarios del Sistema
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Buscar usuario..."
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
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleOpenDialog}
                >
                  Nuevo Usuario
                </Button>
              </Box>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="center">Rol</TableCell>
                    <TableCell align="center">Almacén</TableCell>
                    <TableCell align="center">Estado</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell component="th" scope="row">
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.name}
                          </Typography>
                          {user.phone && (
                            <Typography variant="caption" color="text.secondary">
                              {user.phone}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          icon={getRoleIcon(user.role)}
                          label={getRoleLabel(user.role)} 
                          color={getRoleColor(user.role) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {user.warehouse}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <FormControlLabel
                          control={
                            <Switch
                              checked={user.active}
                              onChange={() => handleToggleUserStatus(user.id)}
                              size="small"
                            />
                          }
                          label=""
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEditUser(user)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          color="error"
                          disabled={user.role === 'admin'} // No permitir eliminar administradores
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* New/Edit User Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Nombre Completo *"
                  fullWidth
                  value={userForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: María García"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Email *"
                  type="email"
                  fullWidth
                  value={userForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="usuario@healthynola.com"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    value={userForm.role}
                    label="Rol"
                    onChange={(e) => handleInputChange('role', e.target.value)}
                  >
                    <MenuItem value="salesperson">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" />
                        Vendedor
                      </Box>
                    </MenuItem>
                    <MenuItem value="cashier">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CashierIcon fontSize="small" />
                        Cajero
                      </Box>
                    </MenuItem>
                    <MenuItem value="manager">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ManagerIcon fontSize="small" />
                        Gerente
                      </Box>
                    </MenuItem>
                    <MenuItem value="admin">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AdminIcon fontSize="small" />
                        Administrador
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Almacén</InputLabel>
                  <Select
                    value={userForm.warehouse}
                    label="Almacén"
                    onChange={(e) => handleInputChange('warehouse', e.target.value)}
                  >
                    <MenuItem value="Principal">Principal</MenuItem>
                    <MenuItem value="MMM">MMM</MenuItem>
                    <MenuItem value="DVP">DVP</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Teléfono"
                  fullWidth
                  value={userForm.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+57 300 123 4567"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userForm.active}
                      onChange={(e) => handleInputChange('active', e.target.checked)}
                    />
                  }
                  label="Usuario Activo"
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} variant="outlined">
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveUser} 
              variant="contained"
              disabled={!userForm.name.trim() || !userForm.email.trim()}
            >
              {editingUser ? 'Actualizar' : 'Crear'} Usuario
            </Button>
          </DialogActions>
        </Dialog>
      </Layout>
    </>
  );
};

export default Users;
