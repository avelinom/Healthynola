import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { useRawMaterials } from '@/hooks/useRawMaterials';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { RawMaterial } from '@/store/slices/rawMaterialsSlice';

const RawMaterialsPage = () => {
  const { rawMaterials, loading, fetchRawMaterials, createRawMaterial, updateRawMaterial, deleteRawMaterial, updateStock } = useRawMaterials();
  const [openModal, setOpenModal] = useState(false);
  const [currentRawMaterial, setCurrentRawMaterial] = useState<RawMaterial | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    unidadMedida: 'kg',
    costoPorUnidad: '',
    proveedor: '',
    stockActual: '',
    stockMinimo: '',
    notas: ''
  });

  useEffect(() => {
    setIsClient(true);
    fetchRawMaterials();
  }, []);

  const handleOpenModal = (rawMaterial?: RawMaterial) => {
    if (rawMaterial) {
      setCurrentRawMaterial(rawMaterial);
      setFormData({
        nombre: rawMaterial.nombre,
        descripcion: rawMaterial.descripcion || '',
        unidadMedida: rawMaterial.unidadMedida,
        costoPorUnidad: rawMaterial.costoPorUnidad.toString(),
        proveedor: rawMaterial.proveedor || '',
        stockActual: rawMaterial.stockActual.toString(),
        stockMinimo: rawMaterial.stockMinimo.toString(),
        notas: rawMaterial.notas || ''
      });
    } else {
      setCurrentRawMaterial(null);
      setFormData({
        nombre: '',
        descripcion: '',
        unidadMedida: 'kg',
        costoPorUnidad: '',
        proveedor: '',
        stockActual: '0',
        stockMinimo: '0',
        notas: ''
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentRawMaterial(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.costoPorUnidad) {
      alert('Nombre y costo son requeridos');
      return;
    }

    const rawMaterialData = {
      nombre: formData.nombre,
      descripcion: formData.descripcion || undefined,
      unidadMedida: formData.unidadMedida,
      costoPorUnidad: parseFloat(formData.costoPorUnidad),
      proveedor: formData.proveedor || undefined,
      stockActual: formData.stockActual ? parseFloat(formData.stockActual) : 0,
      stockMinimo: formData.stockMinimo ? parseFloat(formData.stockMinimo) : 0,
      notas: formData.notas || undefined
    };

    let success = false;
    if (currentRawMaterial) {
      success = await updateRawMaterial(currentRawMaterial.id, rawMaterialData);
    } else {
      success = await createRawMaterial(rawMaterialData);
    }

    if (success) {
      handleCloseModal();
      fetchRawMaterials();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar esta materia prima?')) {
      const success = await deleteRawMaterial(id);
      if (success) {
        fetchRawMaterials();
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  };

  if (!isClient) {
    return (
      <Layout title="Materia Prima">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Materia Prima - Healthynola POS</title>
        <meta name="description" content="Gestión de materia prima" />
      </Head>

      <Layout title="Materia Prima">
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2">
            Gestión de Materia Prima
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
          >
            Nueva Materia Prima
          </Button>
        </Box>

        {loading && rawMaterials.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Nombre</strong></TableCell>
                  <TableCell><strong>Unidad</strong></TableCell>
                  <TableCell><strong>Costo/Unidad</strong></TableCell>
                  <TableCell><strong>Stock Actual</strong></TableCell>
                  <TableCell><strong>Stock Mínimo</strong></TableCell>
                  <TableCell><strong>Proveedor</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell align="center"><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rawMaterials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                        No hay materia prima registrada. Haga clic en &quot;Nueva Materia Prima&quot; para comenzar.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rawMaterials.map((rm) => (
                    <TableRow key={rm.id} hover>
                      <TableCell>{rm.nombre}</TableCell>
                      <TableCell>{rm.unidadMedida}</TableCell>
                      <TableCell>{formatCurrency(rm.costoPorUnidad)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={`${rm.stockActual} ${rm.unidadMedida}`}
                          color={rm.stockActual < rm.stockMinimo ? 'error' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{rm.stockMinimo} {rm.unidadMedida}</TableCell>
                      <TableCell>{rm.proveedor || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={rm.activo ? 'Activo' : 'Inactivo'}
                          color={rm.activo ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenModal(rm)}
                          title="Editar"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(rm.id)}
                          title="Eliminar"
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

        {/* Modal for Create/Edit */}
        <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
          <DialogTitle>
            {currentRawMaterial ? 'Editar Materia Prima' : 'Nueva Materia Prima'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Descripción"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={2}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Unidad de Medida</InputLabel>
                    <Select
                      name="unidadMedida"
                      value={formData.unidadMedida}
                      label="Unidad de Medida"
                      onChange={handleChange}
                    >
                      <MenuItem value="kg">Kilogramos (kg)</MenuItem>
                      <MenuItem value="g">Gramos (g)</MenuItem>
                      <MenuItem value="litros">Litros</MenuItem>
                      <MenuItem value="ml">Mililitros (ml)</MenuItem>
                      <MenuItem value="unidades">Unidades</MenuItem>
                      <MenuItem value="cajas">Cajas</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Costo por Unidad"
                    name="costoPorUnidad"
                    type="number"
                    value={formData.costoPorUnidad}
                    onChange={handleChange}
                    margin="normal"
                    required
                    inputProps={{ step: "0.01", min: "0" }}
                  />
                </Grid>
              </Grid>
              <TextField
                fullWidth
                label="Proveedor"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleChange}
                margin="normal"
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Stock Actual"
                    name="stockActual"
                    type="number"
                    value={formData.stockActual}
                    onChange={handleChange}
                    margin="normal"
                    inputProps={{ step: "0.01", min: "0" }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Stock Mínimo"
                    name="stockMinimo"
                    type="number"
                    value={formData.stockMinimo}
                    onChange={handleChange}
                    margin="normal"
                    inputProps={{ step: "0.01", min: "0" }}
                  />
                </Grid>
              </Grid>
              <TextField
                fullWidth
                label="Notas"
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="secondary">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : (currentRawMaterial ? 'Guardar Cambios' : 'Crear')}
            </Button>
          </DialogActions>
        </Dialog>
      </Layout>
    </>
  );
};

export default RawMaterialsPage;
