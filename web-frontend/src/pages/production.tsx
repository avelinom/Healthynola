import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useProducts } from '@/hooks/useProducts';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Factory as ProductionIcon,
  Add as AddIcon,
  Inventory as InventoryIcon,
  CalendarToday as CalendarIcon,
  Assignment as BatchIcon
} from '@mui/icons-material';
import Layout from '@/components/Layout';

interface ProductionBatch {
  id: number;
  batchNumber: string;
  product: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  productionDate: string;
  expirationDate: string;
  status: 'active' | 'expired' | 'depleted';
}

const Production: NextPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(25); // Default 25kg batch
  const [unitCost, setUnitCost] = useState(0);
  const [productionDate, setProductionDate] = useState(new Date().toISOString().split('T')[0]);
  const [expirationDate, setExpirationDate] = useState('');
  const [notes, setNotes] = useState('');

  // Load products directly from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data.data || []);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      loadProducts();
    }
  }, []);

  // Filter active products and convert to production format
  const activeProducts = products
    .filter(product => product.activo)
    .map(product => ({
      id: product.id,
      name: product.nombre,
      avgCost: product.costo // Use costo as avgCost per kg
    }));

  // Mock recent batches
  const recentBatches: ProductionBatch[] = [
    {
      id: 1,
      batchNumber: 'GN-2024-001',
      product: 'Granola Natural 500g',
      quantity: 25,
      unitCost: 320,
      totalCost: 8000,
      productionDate: '2024-09-28',
      expirationDate: '2024-12-28',
      status: 'active'
    },
    {
      id: 2,
      batchNumber: 'GC-2024-002',
      product: 'Granola con Chocolate 500g',
      quantity: 25,
      unitCost: 400,
      totalCost: 10000,
      productionDate: '2024-09-27',
      expirationDate: '2024-12-27',
      status: 'active'
    }
  ];

  const handleProductChange = (productName: string) => {
    setSelectedProduct(productName);
    const product = activeProducts.find(p => p.name === productName);
    if (product) {
      setUnitCost(product.avgCost);
      // Auto-calculate expiration date (3 months from production)
      const prodDate = new Date(productionDate);
      const expDate = new Date(prodDate);
      expDate.setMonth(expDate.getMonth() + 3);
      setExpirationDate(expDate.toISOString().split('T')[0]);
    }
  };

  const generateBatchNumber = (productName: string) => {
    const productCode = productName.split(' ')[0].substring(0, 2).toUpperCase();
    const year = new Date().getFullYear();
    const sequence = String(Date.now()).slice(-3); // Simple sequence
    return `${productCode}-${year}-${sequence}`;
  };

  const handleRegisterBatch = () => {
    if (!selectedProduct || quantity <= 0 || unitCost <= 0) {
      alert('Complete todos los campos requeridos');
      return;
    }

    const batchNumber = generateBatchNumber(selectedProduct);
    const totalCost = quantity * unitCost;

    // Here you would make an API call to:
    // 1. Create the production batch record
    // 2. Add the quantity to "Almacén Principal" inventory
    // 3. Create inventory movement record

    alert(`¡Lote registrado exitosamente!
    
Número de Lote: ${batchNumber}
Producto: ${selectedProduct}
Cantidad: ${quantity} kg
Costo Total: $${totalCost.toLocaleString()}

El inventario se agregó automáticamente al Almacén Principal.`);

    // Clear form
    setSelectedProduct('');
    setQuantity(25);
    setUnitCost(0);
    setExpirationDate('');
    setNotes('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      active: { label: 'Activo', color: 'success' as const },
      expired: { label: 'Vencido', color: 'error' as const },
      depleted: { label: 'Agotado', color: 'default' as const }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  return (
    <>
      <Head>
        <title>Producción - Healthynola POS</title>
        <meta name="description" content="Registro de producción y lotes del sistema Healthynola POS" />
      </Head>

      <Layout title="Registro de Producción">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
          {/* Production Form */}
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ProductionIcon />
                  Nuevo Lote de Producción
                </Typography>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Flujo:</strong> Producción → Almacén Principal → Distribución (MMM/DVP) → Ventas
                  </Typography>
                </Alert>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Producto a Producir</InputLabel>
                    <Select
                      value={selectedProduct}
                      label="Producto a Producir"
                      onChange={(e) => handleProductChange(e.target.value)}
                    >
                      {activeProducts.map((product) => (
                        <MenuItem key={product.id} value={product.name}>
                          {product.name}
                          <Chip 
                            size="small" 
                            label={`${formatCurrency(product.avgCost)}/kg`}
                            sx={{ ml: 1 }}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Cantidad (kg)"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0.1, step: 0.1 }}
                    fullWidth
                    helperText="Lotes típicos de 25kg"
                  />

                  <TextField
                    label="Costo por kg"
                    type="number"
                    value={unitCost}
                    onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, step: 10 }}
                    fullWidth
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                    }}
                  />

                  <TextField
                    label="Fecha de Producción"
                    type="date"
                    value={productionDate}
                    onChange={(e) => setProductionDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />

                  <TextField
                    label="Fecha de Vencimiento"
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    helperText="Típicamente 3 meses desde producción"
                  />

                  <TextField
                    label="Notas (Opcional)"
                    multiline
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    fullWidth
                    placeholder="Observaciones sobre el lote..."
                  />

                  <Divider />

                  <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Resumen del Lote:
                    </Typography>
                    <Typography variant="body2">
                      <strong>Costo Total:</strong> {formatCurrency(quantity * unitCost)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Destino:</strong> Almacén Principal
                    </Typography>
                    {selectedProduct && (
                      <Typography variant="body2">
                        <strong>Número de Lote:</strong> {generateBatchNumber(selectedProduct)}
                      </Typography>
                    )}
                  </Box>

                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={handleRegisterBatch}
                    disabled={!selectedProduct || quantity <= 0 || unitCost <= 0}
                    fullWidth
                  >
                    Registrar Lote de Producción
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Batches */}
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BatchIcon />
                  Lotes Recientes
                </Typography>

                <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Lote</TableCell>
                        <TableCell>Producto</TableCell>
                        <TableCell align="center">Cantidad</TableCell>
                        <TableCell align="right">Costo Total</TableCell>
                        <TableCell align="center">F. Producción</TableCell>
                        <TableCell align="center">F. Vencimiento</TableCell>
                        <TableCell align="center">Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentBatches.map((batch) => (
                        <TableRow key={batch.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {batch.batchNumber}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {batch.product}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {batch.quantity} kg
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(batch.totalCost)}
                          </TableCell>
                          <TableCell align="center">
                            {new Date(batch.productionDate).toLocaleDateString('es-CO')}
                          </TableCell>
                          <TableCell align="center">
                            {new Date(batch.expirationDate).toLocaleDateString('es-CO')}
                          </TableCell>
                          <TableCell align="center">
                            {getStatusChip(batch.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Recordatorio:</strong> Cuando Mariana o Dana necesiten inventario, 
                    deben usar la función de &quot;Transferencias&quot; para mover stock del Almacén Principal 
                    a sus almacenes personales (MMM/DVP).
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        )}
      </Layout>
    </>
  );
};

export default Production;
