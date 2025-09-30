import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { useBatches } from '@/hooks/useBatches';
import { useRecipes } from '@/hooks/useRecipes';
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
  Grid,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { Batch } from '@/store/slices/batchesSlice';

const BatchesPage = () => {
  const { batches, loading, fetchBatches, createBatch, updateBatch, deleteBatch } = useBatches();
  const { recipes, fetchRecipes } = useRecipes();
  const [openModal, setOpenModal] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    codigoLote: '',
    recipeId: '',
    fechaProduccion: '',
    notas: ''
  });

  useEffect(() => {
    setIsClient(true);
    fetchBatches();
    fetchRecipes();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenModal = (batch?: Batch) => {
    if (batch) {
      setCurrentBatch(batch);
      setFormData({
        codigoLote: batch.codigoLote,
        recipeId: batch.recipeId.toString(),
        fechaProduccion: batch.fechaProduccion || '',
        notas: batch.notas || ''
      });
    } else {
      setCurrentBatch(null);
      // Generate batch code
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const generatedCode = `LOTE-${dateStr}-${randomSuffix}`;
      
      setFormData({
        codigoLote: generatedCode,
        recipeId: '',
        fechaProduccion: today.toISOString().split('T')[0],
        notas: ''
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentBatch(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.codigoLote || !formData.recipeId) {
      alert('Código de lote y receta son requeridos');
      return;
    }

    const batchData = {
      codigoLote: formData.codigoLote,
      recipeId: parseInt(formData.recipeId),
      fechaProduccion: formData.fechaProduccion || undefined,
      notas: formData.notas || undefined
    };

    let result = null;
    if (currentBatch) {
      await updateBatch(currentBatch.id, batchData);
    } else {
      result = await createBatch(batchData);
    }

    if (result || currentBatch) {
      handleCloseModal();
      fetchBatches();
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este lote?')) {
      const success = await deleteBatch(id);
      if (success) {
        fetchBatches();
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'planificado':
        return 'info';
      case 'en_proceso':
        return 'warning';
      case 'completado':
        return 'success';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'planificado':
        return 'Planificado';
      case 'en_proceso':
        return 'En Proceso';
      case 'completado':
        return 'Completado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  };

  const filteredBatches = tabValue === 0 
    ? batches.filter(b => b.estado === 'planificado')
    : tabValue === 1
    ? batches.filter(b => b.estado === 'completado')
    : batches;

  if (!isClient) {
    return (
      <Layout title="Lotes de Producción">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Lotes de Producción - Healthynola POS</title>
        <meta name="description" content="Gestión de lotes de producción" />
      </Head>

      <Layout title="Lotes de Producción">
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2">
            Gestión de Lotes
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
          >
            Nuevo Lote
          </Button>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Planificados" />
            <Tab label="Completados" />
            <Tab label="Todos" />
          </Tabs>
        </Box>

        {loading && batches.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Código Lote</strong></TableCell>
                  <TableCell><strong>Receta</strong></TableCell>
                  <TableCell><strong>Producto</strong></TableCell>
                  <TableCell><strong>Fecha Producción</strong></TableCell>
                  <TableCell><strong>Cantidad</strong></TableCell>
                  <TableCell><strong>Costo</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell align="center"><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBatches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                        No hay lotes en esta categoría.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBatches.map((batch) => (
                    <TableRow key={batch.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {batch.codigoLote}
                        </Typography>
                      </TableCell>
                      <TableCell>{batch.recipeName || '-'}</TableCell>
                      <TableCell>{batch.productName || '-'}</TableCell>
                      <TableCell>{formatDate(batch.fechaProduccion || '')}</TableCell>
                      <TableCell>
                        {batch.cantidadProducida > 0 
                          ? `${batch.cantidadProducida} ${batch.unidad}`
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {batch.costoTotalCalculado > 0 
                          ? formatCurrency(batch.costoTotalCalculado)
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusLabel(batch.estado)}
                          color={getStatusColor(batch.estado)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {batch.estado === 'planificado' && (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenModal(batch)}
                            title="Editar"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                        {batch.estado === 'planificado' && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(batch.id)}
                            title="Eliminar"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Modal for Create/Edit Batch */}
        <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
          <DialogTitle>
            {currentBatch ? 'Editar Lote' : 'Nuevo Lote de Producción'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Código de Lote"
                name="codigoLote"
                value={formData.codigoLote}
                onChange={handleChange}
                margin="normal"
                required
                helperText="Código único para identificar el lote"
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Receta</InputLabel>
                <Select
                  name="recipeId"
                  value={formData.recipeId}
                  label="Receta"
                  onChange={handleChange}
                >
                  {recipes.filter(r => r.activo).map((recipe) => (
                    <MenuItem key={recipe.id} value={recipe.id}>
                      {recipe.nombre} ({recipe.rendimiento} {recipe.unidadRendimiento})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Fecha de Producción"
                name="fechaProduccion"
                type="date"
                value={formData.fechaProduccion}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Notas"
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={3}
                helperText="Observaciones o detalles adicionales"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="secondary">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : (currentBatch ? 'Guardar Cambios' : 'Crear Lote')}
            </Button>
          </DialogActions>
        </Dialog>
      </Layout>
    </>
  );
};

export default BatchesPage;
