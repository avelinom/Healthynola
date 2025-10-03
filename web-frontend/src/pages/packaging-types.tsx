import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { usePackagingTypes } from '@/hooks/usePackagingTypes';
import { PackagingType } from '@/store/slices/packagingTypesSlice';
import {
  Box,
  Button,
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Chip,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Scale as ScaleIcon
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const PackagingTypes: NextPage = () => {
  const { 
    packagingTypes, 
    activePackagingTypes, 
    loading, 
    error, 
    createPackagingType, 
    updatePackagingType, 
    deletePackagingType 
  } = usePackagingTypes();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingType, setEditingType] = useState<PackagingType | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    etiqueta: '',
    peso_kg: '',
    tipo_contenedor: '',
    unidad_medida: '',
    cantidad: '',
    activo: true
  });

  const handleOpenDialog = (type?: PackagingType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        nombre: type.nombre,
        etiqueta: type.etiqueta,
        peso_kg: type.peso_kg,
        tipo_contenedor: type.tipo_contenedor || '',
        unidad_medida: type.unidad_medida || '',
        cantidad: type.cantidad || '',
        activo: type.activo
      });
    } else {
      setEditingType(null);
      setFormData({
        nombre: '',
        etiqueta: '',
        peso_kg: '',
        tipo_contenedor: '',
        unidad_medida: '',
        cantidad: '',
        activo: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingType(null);
    setFormData({
      nombre: '',
      etiqueta: '',
      peso_kg: '',
      tipo_contenedor: '',
      unidad_medida: '',
      cantidad: '',
      activo: true
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'activo' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.etiqueta || !formData.tipo_contenedor || !formData.unidad_medida || !formData.cantidad) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    const cantidadNum = parseFloat(formData.cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      toast.error('La cantidad debe ser un número positivo');
      return;
    }

    // Calcular peso_kg basado en unidad de medida y cantidad
    let peso_kg = 0;
    if (formData.unidad_medida === 'kg') {
      peso_kg = cantidadNum;
    } else if (formData.unidad_medida === 'g') {
      peso_kg = cantidadNum / 1000;
    } else if (formData.unidad_medida === 'L') {
      peso_kg = cantidadNum; // 1 litro ≈ 1 kg (aproximado)
    } else if (formData.unidad_medida === 'mL') {
      peso_kg = cantidadNum / 1000; // 1000 mL = 1 kg (aproximado)
    }

    try {
      let result;
      const dataToSend = {
        ...formData,
        peso_kg: peso_kg.toFixed(3),
        cantidad: cantidadNum.toFixed(3)
      };

      if (editingType) {
        result = await updatePackagingType(editingType.id, dataToSend);
      } else {
        result = await createPackagingType(dataToSend);
      }

      if (result.success) {
        toast.success(editingType ? 'Tipo actualizado correctamente' : 'Tipo creado correctamente');
        handleCloseDialog();
      } else {
        toast.error(result.error || 'Error al guardar el tipo de empaque');
      }
    } catch (err) {
      toast.error('Error de conexión');
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar el tipo de empaque "${nombre}"?`)) {
      return;
    }

    try {
      const result = await deletePackagingType(id);
      if (result.success) {
        toast.success('Tipo eliminado correctamente');
      } else {
        toast.error(result.error || 'Error al eliminar el tipo de empaque');
      }
    } catch (err) {
      toast.error('Error de conexión');
    }
  };

  if (loading && packagingTypes.length === 0) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Tipos de Empaque - Healthynola POS</title>
      </Head>
      <Layout>
        <Box sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Tipos de Empaque
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
            >
              Nuevo Tipo
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Card>
            <CardContent>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell><strong>Nombre</strong></TableCell>
                      <TableCell><strong>Etiqueta</strong></TableCell>
                      <TableCell><strong>Contenedor</strong></TableCell>
                      <TableCell align="center"><strong>Cantidad</strong></TableCell>
                      <TableCell align="center"><strong>Peso equiv.</strong></TableCell>
                      <TableCell align="center"><strong>Estado</strong></TableCell>
                      <TableCell align="center"><strong>Acciones</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {packagingTypes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            No hay tipos de empaque registrados
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      packagingTypes.map((type) => (
                        <TableRow key={type.id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <ScaleIcon color="action" fontSize="small" />
                              <Typography variant="body2" fontWeight="medium">
                                {type.nombre}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {type.etiqueta}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {type.tipo_contenedor || 'bolsa'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight="medium">
                              {parseFloat(type.cantidad || '0').toFixed(3)} {type.unidad_medida || 'kg'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight="medium">
                              {parseFloat(type.peso_kg).toFixed(3)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {type.activo ? (
                              <Chip
                                label="Activo"
                                size="small"
                                sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
                              />
                            ) : (
                              <Chip
                                label="Inactivo"
                                size="small"
                                sx={{ bgcolor: '#ffebee', color: '#c62828' }}
                              />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(type)}
                              sx={{ color: '#1976d2' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(type.id, type.etiqueta)}
                              sx={{ color: '#d32f2f' }}
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

              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Total: <strong>{packagingTypes.length}</strong> tipos de empaque
                  {' | '}
                  Activos: <strong>{activePackagingTypes.length}</strong>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Dialog para crear/editar tipo de empaque */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingType ? 'Editar Tipo de Empaque' : 'Nuevo Tipo de Empaque'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre (ID único)"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="ej: bolsa-1kg, lata-355ml, botella-1L"
                  helperText="Identificador único sin espacios"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Etiqueta (Nombre visible)"
                  name="etiqueta"
                  value={formData.etiqueta}
                  onChange={handleChange}
                  placeholder="ej: Bolsa 1 kg, Lata 355 mL, Botella 1 L"
                  helperText="Texto que se mostrará en la interfaz"
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Tipo de Contenedor"
                  name="tipo_contenedor"
                  value={formData.tipo_contenedor}
                  onChange={handleChange}
                  placeholder="ej: bolsa, lata, botella"
                  helperText="Tipo de empaque"
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Unidad de Medida"
                  name="unidad_medida"
                  value={formData.unidad_medida}
                  onChange={handleChange}
                  placeholder="ej: kg, g, L, mL"
                  helperText="kg, g, L, o mL"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cantidad"
                  name="cantidad"
                  type="number"
                  value={formData.cantidad}
                  onChange={handleChange}
                  placeholder="ej: 1, 0.5, 355, 1000"
                  helperText="Cantidad en la unidad especificada"
                  inputProps={{ step: '0.001', min: '0' }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.activo}
                      onChange={handleChange}
                      name="activo"
                      color="success"
                    />
                  }
                  label="Tipo activo"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
            >
              {editingType ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>
      </Layout>
    </>
  );
};

export default PackagingTypes;

