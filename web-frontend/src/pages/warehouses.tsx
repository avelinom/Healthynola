import React, { useState, useMemo } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useWarehousesSimple as useWarehouses } from '@/hooks/useWarehousesSimple';
import { Warehouse } from '@/store/slices/warehousesSlice';
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
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormControlLabel,
  Switch,
  Grid,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import {
  Warehouse as WarehouseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import Layout from '@/components/Layout';

const Warehouses: NextPage = () => {
  const { 
    warehouses, 
    activeWarehouses, 
    loading, 
    error, 
    createWarehouse, 
    updateWarehouse, 
    deleteWarehouse, 
    clearError 
  } = useWarehouses();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(true); // Show inactive by default
  const [formLoading, setFormLoading] = useState(false);
  const [warehouseForm, setWarehouseForm] = useState({
    nombre: '',
    codigo: '',
    direccion: '',
    telefono: '',
    responsable: '',
    activo: true
  });

  const handleOpenDialog = (warehouse?: Warehouse) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setWarehouseForm({
        nombre: warehouse.nombre,
        codigo: warehouse.codigo,
        direccion: warehouse.direccion || '',
        telefono: warehouse.telefono || '',
        responsable: warehouse.responsable || '',
        activo: warehouse.activo
      });
    } else {
      setEditingWarehouse(null);
      setWarehouseForm({
        nombre: '',
        codigo: '',
        direccion: '',
        telefono: '',
        responsable: '',
        activo: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingWarehouse(null);
    clearError();
  };

  const handleSubmit = async () => {
    if (!warehouseForm.nombre.trim() || !warehouseForm.codigo.trim()) {
      alert('Nombre y código son requeridos');
      return;
    }

    // If editing and trying to deactivate, check if warehouse has inventory
    if (editingWarehouse && editingWarehouse.activo && !warehouseForm.activo) {
      setFormLoading(true);
      try {
        // Check if warehouse has inventory
        const response = await fetch(`/api/inventory?warehouse=${editingWarehouse.codigo}`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          // Check if any inventory item has quantity > 0
          const hasStock = data.data.some((item: any) => parseFloat(item.currentStock || 0) > 0);
          
          if (hasStock) {
            alert('No se puede desactivar el almacén porque tiene inventario activo. Por favor, transfiera o elimine el inventario primero.');
            setFormLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Error checking inventory:', err);
        alert('Error al verificar el inventario del almacén');
        setFormLoading(false);
        return;
      }
    }

    setFormLoading(true);
    try {
      const result = editingWarehouse
        ? await updateWarehouse(editingWarehouse.id, warehouseForm)
        : await createWarehouse(warehouseForm);

      if (result.success) {
        handleCloseDialog();
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar este almacén?')) {
      await deleteWarehouse(id);
    }
  };

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter(warehouse => {
      // Filter by search term
      const matchesSearch = warehouse.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warehouse.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (warehouse.direccion && warehouse.direccion.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by active status
      const matchesStatus = showInactive ? true : warehouse.activo;
      
      return matchesSearch && matchesStatus;
    });
  }, [warehouses, searchTerm, showInactive]);

  return (
    <>
      <Head>
        <title>Gestión de Almacenes | Healthynola POS</title>
      </Head>
      <Layout title="Gestión de Almacenes">
        <Card elevation={3}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box display="flex" alignItems="center">
                <WarehouseIcon sx={{ fontSize: 32, mr: 1, color: '#00897b' }} />
                <Typography variant="h5">
                  Almacenes
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Nuevo Almacén
              </Button>
            </Box>

            {error && (
              <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box display="flex" gap={2} mb={3} alignItems="center">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar por nombre, código o dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    color="primary"
                  />
                }
                label="Mostrar inactivos"
                sx={{ whiteSpace: 'nowrap' }}
              />
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={2}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Código</strong></TableCell>
                      <TableCell><strong>Nombre</strong></TableCell>
                      <TableCell><strong>Dirección</strong></TableCell>
                      <TableCell><strong>Teléfono</strong></TableCell>
                      <TableCell><strong>Responsable</strong></TableCell>
                      <TableCell><strong>Estado</strong></TableCell>
                      <TableCell align="right"><strong>Acciones</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredWarehouses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography variant="body2" color="text.secondary" py={3}>
                            No hay almacenes registrados
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredWarehouses.map((warehouse) => (
                        <TableRow key={warehouse.id} hover>
                          <TableCell>
                            <Chip 
                              label={warehouse.codigo} 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="500">
                              {warehouse.nombre}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              {warehouse.direccion && (
                                <>
                                  <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {warehouse.direccion}
                                  </Typography>
                                </>
                              )}
                              {!warehouse.direccion && (
                                <Typography variant="body2" color="text.disabled">
                                  Sin dirección
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              {warehouse.telefono && (
                                <>
                                  <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {warehouse.telefono}
                                  </Typography>
                                </>
                              )}
                              {!warehouse.telefono && (
                                <Typography variant="body2" color="text.disabled">
                                  -
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              {warehouse.responsable && (
                                <>
                                  <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {warehouse.responsable}
                                  </Typography>
                                </>
                              )}
                              {!warehouse.responsable && (
                                <Typography variant="body2" color="text.disabled">
                                  -
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={warehouse.activo ? 'Activo' : 'Inactivo'}
                              size="small"
                              color={warehouse.activo ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenDialog(warehouse)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(warehouse.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Box mt={2} display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Total: {warehouses.length} almacenes ({activeWarehouses.length} activos)
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Dialog for Create/Edit */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingWarehouse ? 'Editar Almacén' : 'Nuevo Almacén'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Nombre del Almacén"
                  value={warehouseForm.nombre}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, nombre: e.target.value })}
                  placeholder="Ej: Almacén Principal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Código"
                  value={warehouseForm.codigo}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, codigo: e.target.value })}
                  placeholder="Ej: Principal, MMM, DVP"
                  helperText="Código único para identificar el almacén"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dirección"
                  value={warehouseForm.direccion}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, direccion: e.target.value })}
                  placeholder="Dirección del almacén"
                  multiline
                  rows={2}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={warehouseForm.telefono}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, telefono: e.target.value })}
                  placeholder="Teléfono de contacto"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Responsable"
                  value={warehouseForm.responsable}
                  onChange={(e) => setWarehouseForm({ ...warehouseForm, responsable: e.target.value })}
                  placeholder="Nombre del responsable"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={warehouseForm.activo}
                        onChange={(e) => setWarehouseForm({ ...warehouseForm, activo: e.target.checked })}
                        color="primary"
                      />
                    }
                    label="Almacén Activo"
                  />
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary"
              disabled={formLoading}
            >
              {formLoading ? 'Guardando...' : (editingWarehouse ? 'Actualizar' : 'Crear')}
            </Button>
          </DialogActions>
        </Dialog>
      </Layout>
    </>
  );
};

export default Warehouses;

