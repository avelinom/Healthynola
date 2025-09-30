import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { useBatches } from '@/hooks/useBatches';
import { useProducts } from '@/hooks/useProducts';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import {
  Factory as ProductionIcon,
  LocalShipping as PackageIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { Batch } from '@/store/slices/batchesSlice';

interface PackagingItem {
  productId: number;
  productName: string;
  tipoBolsa: '1kg' | '0.5kg' | '100g';
  cantidadBolsas: number;
  almacen: string;
}

const ProductionPage = () => {
  const { batches, loading, fetchBatches, fetchBatch, completeBatch } = useBatches();
  const { products, loadProducts } = useProducts();
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedBatchDetails, setSelectedBatchDetails] = useState<Batch | null>(null);
  const [openPackagingModal, setOpenPackagingModal] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [packagingItems, setPackagingItems] = useState<PackagingItem[]>([]);
  const [newPackaging, setNewPackaging] = useState({
    productId: '',
    tipoBolsa: '1kg' as '1kg' | '0.5kg' | '100g',
    cantidadBolsas: '',
    almacen: 'Principal'
  });

  useEffect(() => {
    setIsClient(true);
    fetchBatches('planificado');
    loadProducts();
  }, []);

  const handleBatchSelect = async (e: any) => {
    const batchId = e.target.value;
    setSelectedBatchId(batchId);
    
    if (batchId) {
      const batchDetails = await fetchBatch(parseInt(batchId));
      setSelectedBatchDetails(batchDetails);
    } else {
      setSelectedBatchDetails(null);
    }
  };

  const handleOpenPackagingModal = () => {
    if (!selectedBatchDetails) {
      alert('Por favor seleccione un lote');
      return;
    }
    setPackagingItems([]);
    setNewPackaging({
      productId: selectedBatchDetails.productName ? 
        (products.find(p => p.nombre === selectedBatchDetails.productName)?.id.toString() || '') : '',
      tipoBolsa: '1kg',
      cantidadBolsas: '',
      almacen: 'Principal'
    });
    setOpenPackagingModal(true);
  };

  const handleClosePackagingModal = () => {
    setOpenPackagingModal(false);
    setPackagingItems([]);
  };

  const handlePackagingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setNewPackaging(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPackagingItem = () => {
    if (!newPackaging.productId || !newPackaging.cantidadBolsas || !newPackaging.almacen) {
      alert('Todos los campos son requeridos');
      return;
    }

    const product = products.find(p => p.id === parseInt(newPackaging.productId));
    if (!product) {
      alert('Producto no encontrado');
      return;
    }

    const newItem: PackagingItem = {
      productId: product.id,
      productName: product.nombre,
      tipoBolsa: newPackaging.tipoBolsa,
      cantidadBolsas: parseInt(newPackaging.cantidadBolsas),
      almacen: newPackaging.almacen
    };

    setPackagingItems(prev => [...prev, newItem]);
    
    // Reset form
    setNewPackaging({
      productId: '',
      tipoBolsa: '1kg',
      cantidadBolsas: '',
      almacen: 'Principal'
    });
  };

  const handleRemovePackagingItem = (index: number) => {
    setPackagingItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompleteProduction = async () => {
    if (packagingItems.length === 0) {
      alert('Debe añadir al menos un tipo de empaque');
      return;
    }

    if (!selectedBatchDetails) {
      alert('Error: No se ha seleccionado un lote');
      return;
    }

    const success = await completeBatch(selectedBatchDetails.id, packagingItems);
    
    if (success) {
      handleClosePackagingModal();
      setSelectedBatchId('');
      setSelectedBatchDetails(null);
      fetchBatches('planificado');
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

  const getBagWeight = (tipoBolsa: string) => {
    switch (tipoBolsa) {
      case '1kg': return 1;
      case '0.5kg': return 0.5;
      case '100g': return 0.1;
      default: return 0;
    }
  };

  const getTotalBagWeight = () => {
    return packagingItems.reduce((sum, item) => {
      return sum + (getBagWeight(item.tipoBolsa) * item.cantidadBolsas);
    }, 0);
  };

  const plannedBatches = batches.filter(b => b.estado === 'planificado');

  if (!isClient) {
    return (
      <Layout title="Producción">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Producción - Healthynola POS</title>
        <meta name="description" content="Gestión de producción de lotes" />
      </Head>

      <Layout title="Producción">
        <Grid container spacing={3}>
          {/* Left Column - Batch Selection */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ProductionIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">
                    Producir Lote
                  </Typography>
                </Box>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Seleccionar Lote</InputLabel>
                  <Select
                    value={selectedBatchId}
                    label="Seleccionar Lote"
                    onChange={handleBatchSelect}
                  >
                    <MenuItem value="">
                      <em>Seleccione un lote...</em>
                    </MenuItem>
                    {plannedBatches.map((batch) => (
                      <MenuItem key={batch.id} value={batch.id}>
                        {batch.codigoLote} - {batch.recipeName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {plannedBatches.length === 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No hay lotes planificados. Cree uno en el módulo de "Lotes".
                  </Alert>
                )}

                {selectedBatchDetails && (
                  <Box sx={{ mt: 3 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Detalles del Lote:
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Código:
                        </Typography>
                        <Typography variant="body2">
                          {selectedBatchDetails.codigoLote}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Receta:
                        </Typography>
                        <Typography variant="body2">
                          {selectedBatchDetails.recipeName}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Producto:
                        </Typography>
                        <Typography variant="body2">
                          {selectedBatchDetails.productName || '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Rendimiento:
                        </Typography>
                        <Typography variant="body2">
                          {selectedBatchDetails.cantidadProducida} {selectedBatchDetails.unidad}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          Costo Total:
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {formatCurrency(selectedBatchDetails.costoTotalCalculado)}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={<PackageIcon />}
                      onClick={handleOpenPackagingModal}
                      sx={{ mt: 3 }}
                    >
                      Empacar y Completar Lote
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Recent Batches */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Lotes Planificados
                </Typography>
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Código</strong></TableCell>
                        <TableCell><strong>Receta</strong></TableCell>
                        <TableCell><strong>Estado</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {plannedBatches.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                              No hay lotes planificados
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        plannedBatches.map((batch) => (
                          <TableRow key={batch.id} hover>
                            <TableCell>{batch.codigoLote}</TableCell>
                            <TableCell>{batch.recipeName}</TableCell>
                            <TableCell>
                              <Chip label="Planificado" color="info" size="small" />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Packaging Modal */}
        <Dialog open={openPackagingModal} onClose={handleClosePackagingModal} maxWidth="md" fullWidth>
          <DialogTitle>
            Empacar Lote: {selectedBatchDetails?.codigoLote}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Especifique cómo desea empacar este lote. Puede crear diferentes tipos de bolsas.
              </Alert>

              {/* Add Packaging Form */}
              <Card sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Añadir Empaque:
                  </Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Producto</InputLabel>
                        <Select
                          name="productId"
                          value={newPackaging.productId}
                          label="Producto"
                          onChange={handlePackagingChange}
                        >
                          {products.filter(p => p.activo).map((product) => (
                            <MenuItem key={product.id} value={product.id}>
                              {product.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Tipo</InputLabel>
                        <Select
                          name="tipoBolsa"
                          value={newPackaging.tipoBolsa}
                          label="Tipo"
                          onChange={handlePackagingChange}
                        >
                          <MenuItem value="1kg">1 kg</MenuItem>
                          <MenuItem value="0.5kg">1/2 kg</MenuItem>
                          <MenuItem value="100g">100 g</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Cantidad"
                        name="cantidadBolsas"
                        type="number"
                        value={newPackaging.cantidadBolsas}
                        onChange={handlePackagingChange}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Almacén</InputLabel>
                        <Select
                          name="almacen"
                          value={newPackaging.almacen}
                          label="Almacén"
                          onChange={handlePackagingChange}
                        >
                          <MenuItem value="Principal">Principal</MenuItem>
                          <MenuItem value="MMM">MMM</MenuItem>
                          <MenuItem value="DVP">DVP</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton
                        color="primary"
                        onClick={handleAddPackagingItem}
                        sx={{ border: '2px solid', borderRadius: 1 }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Current Packaging Items */}
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Empaques Añadidos:
              </Typography>
              {packagingItems.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No hay empaques añadidos. Use el formulario de arriba para añadir.
                </Typography>
              ) : (
                <>
                  <TableContainer component={Paper} sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell><strong>Producto</strong></TableCell>
                          <TableCell><strong>Tipo Bolsa</strong></TableCell>
                          <TableCell align="center"><strong>Cantidad</strong></TableCell>
                          <TableCell><strong>Almacén</strong></TableCell>
                          <TableCell align="center"><strong>Acción</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {packagingItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell>{item.tipoBolsa}</TableCell>
                            <TableCell align="center">{item.cantidadBolsas}</TableCell>
                            <TableCell>{item.almacen}</TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemovePackagingItem(index)}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Card sx={{ backgroundColor: '#e3f2fd' }}>
                    <CardContent>
                      <Typography variant="body2">
                        <strong>Total de kg empacados:</strong> {getTotalBagWeight().toFixed(2)} kg
                      </Typography>
                      {selectedBatchDetails && (
                        <Typography variant="body2" color={getTotalBagWeight() > selectedBatchDetails.cantidadProducida ? 'error' : 'text.secondary'}>
                          <strong>Rendimiento del lote:</strong> {selectedBatchDetails.cantidadProducida} {selectedBatchDetails.unidad}
                        </Typography>
                      )}
                      {selectedBatchDetails && getTotalBagWeight() > selectedBatchDetails.cantidadProducida && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          El peso total empacado excede el rendimiento del lote
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePackagingModal} color="secondary">
              Cancelar
            </Button>
            <Button 
              onClick={handleCompleteProduction} 
              color="primary" 
              variant="contained"
              disabled={packagingItems.length === 0 || loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Completar Producción'}
            </Button>
          </DialogActions>
        </Dialog>
      </Layout>
    </>
  );
};

export default ProductionPage;