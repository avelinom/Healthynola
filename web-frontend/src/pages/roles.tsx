import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import Layout from '@/components/Layout';
import { useRoles, Role } from '@/hooks/useRoles';
import { usePermissions } from '@/hooks/usePermissions';
import { apiService } from '@/services/api';

interface ModulePermission {
  has_access: boolean;
  mobile_dashboard_visible: boolean;
}

interface RolePermissions {
  [module: string]: ModulePermission;
}

const Roles: NextPage = () => {
  const { roles, loading: rolesLoading, createRole, updateRole, deleteRole, fetchRoles } = useRoles();
  const { modules } = usePermissions();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [openPermissionsDialog, setOpenPermissionsDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  const [roleForm, setRoleForm] = useState({
    name: '',
    display_name: '',
    description: '',
  });

  const [permissions, setPermissions] = useState<RolePermissions>({});

  const handleOpenDialog = () => {
    setEditingRole(null);
    setRoleForm({ name: '', display_name: '', description: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRole(null);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      display_name: role.display_name,
      description: role.description || '',
    });
    setOpenDialog(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // If changing the name field, convert to lowercase and replace spaces with hyphens
    if (name === 'name') {
      const sanitizedValue = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
      setRoleForm({ ...roleForm, [name]: sanitizedValue });
    } else {
      setRoleForm({ ...roleForm, [name]: value });
    }
  };

  const handleSaveRole = async () => {
    if (!roleForm.name || !roleForm.display_name) {
      setSnackbar({ open: true, message: 'Por favor completa todos los campos requeridos', severity: 'error' });
      return;
    }

    // Validate name format
    if (!editingRole && !/^[a-z0-9_-]+$/.test(roleForm.name)) {
      setSnackbar({ open: true, message: 'El nombre interno solo puede contener letras minúsculas, números, guiones y guiones bajos', severity: 'error' });
      return;
    }

    if (editingRole) {
      // Update role (can't change name)
      const result = await updateRole(editingRole.id, {
        display_name: roleForm.display_name,
        description: roleForm.description,
      });
      if (result.success) {
        setSnackbar({ open: true, message: result.message || 'Rol actualizado exitosamente', severity: 'success' });
        handleCloseDialog();
      } else {
        setSnackbar({ open: true, message: result.message, severity: 'error' });
      }
    } else {
      // Create new role
      const result = await createRole({
        name: roleForm.name,
        display_name: roleForm.display_name,
        description: roleForm.description,
      });
      if (result.success) {
        setSnackbar({ open: true, message: result.message || 'Rol creado exitosamente', severity: 'success' });
        handleCloseDialog();
      } else {
        setSnackbar({ open: true, message: result.message, severity: 'error' });
      }
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.is_system) {
      setSnackbar({ open: true, message: 'No se puede eliminar un rol del sistema', severity: 'error' });
      return;
    }

    if (window.confirm(`¿Estás seguro de que quieres eliminar el rol "${role.display_name}"?`)) {
      const result = await deleteRole(role.id);
      if (result.success) {
        setSnackbar({ open: true, message: result.message, severity: 'success' });
      } else {
        setSnackbar({ open: true, message: result.message, severity: 'error' });
      }
    }
  };

  const handleOpenPermissions = async (role: Role) => {
    setSelectedRole(role);
    setLoadingPermissions(true);
    setOpenPermissionsDialog(true);

    try {
      // Get current permissions for this role
      const response = await apiService.getPermissions();
      if (response.success && response.data[role.name]) {
        setPermissions(response.data[role.name]);
      } else {
        // Initialize with default permissions (all false)
        const defaultPerms: RolePermissions = {};
        modules.forEach(mod => {
          defaultPerms[mod.id] = { has_access: false, mobile_dashboard_visible: true };
        });
        setPermissions(defaultPerms);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      setSnackbar({ open: true, message: 'Error al cargar permisos', severity: 'error' });
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleClosePermissions = () => {
    setOpenPermissionsDialog(false);
    setSelectedRole(null);
    setPermissions({});
  };

  const handlePermissionChange = (moduleId: string, field: 'has_access' | 'mobile_dashboard_visible', value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [field]: value,
      },
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      const response = await apiService.updatePermissions(selectedRole.name, permissions);
      if (response.success) {
        setSnackbar({ open: true, message: 'Permisos actualizados exitosamente', severity: 'success' });
        handleClosePermissions();
      } else {
        setSnackbar({ open: true, message: response.message || 'Error al actualizar permisos', severity: 'error' });
      }
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Error al actualizar permisos', severity: 'error' });
    }
  };

  return (
    <>
      <Head>
        <title>Gestión de Roles - Healthynola POS</title>
        <meta name="description" content="Gestión de roles y permisos del sistema" />
      </Head>
      <Layout title="Gestión de Roles y Permisos">
        <Box sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SecurityIcon sx={{ fontSize: 40, color: '#2e7d32' }} />
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#333' }}>
                Roles del Sistema
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Crear Rol
            </Button>
          </Box>

          {rolesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Nombre</strong></TableCell>
                    <TableCell><strong>Identificador</strong></TableCell>
                    <TableCell><strong>Descripción</strong></TableCell>
                    <TableCell><strong>Tipo</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                    <TableCell align="center"><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {role.display_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={role.name} size="small" color="default" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {role.description || 'Sin descripción'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {role.is_system ? (
                          <Chip label="Sistema" color="info" size="small" />
                        ) : (
                          <Chip label="Personalizado" color="default" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={role.active ? 'Activo' : 'Inactivo'}
                          color={role.active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Gestionar permisos">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenPermissions(role)}
                          >
                            <SecurityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar rol">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditRole(role)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        {!role.is_system && (
                          <Tooltip title="Eliminar rol">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteRole(role)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Dialog: Create/Edit Role */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Identificador interno"
                name="name"
                value={roleForm.name}
                onChange={handleFormChange}
                fullWidth
                required
                disabled={!!editingRole}
                placeholder="cajero"
                helperText={editingRole ? 'No se puede modificar el identificador de un rol existente' : 'Se convertirá automáticamente a minúsculas. Ej: cajero, supervisor, gerente-tienda'}
              />
              <TextField
                label="Nombre visible"
                name="display_name"
                value={roleForm.display_name}
                onChange={handleFormChange}
                fullWidth
                required
                helperText="Ej: Cajero, Supervisor"
              />
              <TextField
                label="Descripción"
                name="description"
                value={roleForm.description}
                onChange={handleFormChange}
                fullWidth
                multiline
                rows={3}
                helperText="Descripción breve del rol"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSaveRole} variant="contained" color="primary">
              {editingRole ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog: Manage Permissions */}
        <Dialog open={openPermissionsDialog} onClose={handleClosePermissions} maxWidth="md" fullWidth>
          <DialogTitle>
            Permisos de "{selectedRole?.display_name}"
          </DialogTitle>
          <DialogContent>
            {loadingPermissions ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ pt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Configura qué módulos puede acceder este rol y cuáles son visibles en el dashboard móvil.
                </Typography>
                
                {/* Statistics Summary */}
                <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Chip
                    icon={<SecurityIcon />}
                    label={`Módulos Web Seleccionados: ${Object.values(permissions).filter(p => p?.has_access).length}`}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Chip
                    icon={<VisibilityIcon />}
                    label={`Módulos Móvil Seleccionados: ${Object.values(permissions).filter(p => p?.mobile_dashboard_visible).length}`}
                    color="secondary"
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Chip
                    label={`Total de Módulos: ${modules.length}`}
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                
                <Grid container spacing={2}>
                  {modules.map((module) => (
                    <Grid item xs={12} key={module.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {module.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {module.description}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={permissions[module.id]?.has_access || false}
                                    onChange={(e) => handlePermissionChange(module.id, 'has_access', e.target.checked)}
                                    color="primary"
                                  />
                                }
                                label="Acceso"
                              />
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={permissions[module.id]?.mobile_dashboard_visible || false}
                                    onChange={(e) => handlePermissionChange(module.id, 'mobile_dashboard_visible', e.target.checked)}
                                    color="secondary"
                                    disabled={!permissions[module.id]?.has_access}
                                  />
                                }
                                label="Visible en móvil"
                              />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePermissions}>Cancelar</Button>
            <Button onClick={handleSavePermissions} variant="contained" color="primary" disabled={loadingPermissions}>
              Guardar Permisos
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
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

export default Roles;

