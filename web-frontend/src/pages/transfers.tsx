import React, { useState, useEffect, useMemo } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { addTransfer, Transfer } from '@/store/slices/transfersSlice';
import { addActivity } from '@/store/slices/activitySlice';
import { updateStock } from '@/store/slices/inventorySlice';
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
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  SwapHoriz as TransferIcon,
  Send as SendIcon,
  History as HistoryIcon,
  Warehouse as WarehouseIcon
} from '@mui/icons-material';
import Layout from '@/components/Layout';

const Transfers: NextPage = () => {
  const dispatch = useDispatch();
  const transfers = useSelector((state: RootState) => state.transfers.transfers);

  const [products, setProducts] = useState<any[]>([]); // Load from API instead of Redux
  const [inventoryItems, setInventoryItems] = useState<any[]>([]); // Load from API instead of Redux
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [fromWarehouse, setFromWarehouse] = useState('');
  const [toWarehouse, setToWarehouse] = useState('');
  const [reason, setReason] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);

  // inventorySummary and inventoryBreakdown are now calculated with useMemo

  // State for transfers from API
  const [apiTransfers, setApiTransfers] = useState<Transfer[]>([]);

  // State for warehouses - loaded once from API
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [warehousesLoaded, setWarehousesLoaded] = useState(false);
  
  // Compute active warehouses only when warehouses change
  const activeWarehouses = warehouses.filter(w => w.activo);

  // Load warehouses once on mount
  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const response = await fetch('/api/warehouses');
        const data = await response.json();
        
        if (data.success) {
          setWarehouses(data.data || []);
          setWarehousesLoaded(true);
        }
      } catch (error) {
        console.error('Error loading warehouses:', error);
      }
    };

    if (!warehousesLoaded) {
      loadWarehouses();
    }
  }, [warehousesLoaded]);

  // Load data from API - simplified to fix loading state
  useEffect(() => {
    const loadData = async () => {
      try {
        const [inventoryRes, transfersRes, productsRes] = await Promise.all([
          fetch('/api/inventory'),
          fetch('/api/transfers'),
          fetch('/api/products')
        ]);
        
        const inventoryData = await inventoryRes.json();
        const transfersData = await transfersRes.json();
        const productsData = await productsRes.json();
        
        if (inventoryData.success) {
          setInventoryItems(inventoryData.data || []);
        }
        
        if (transfersData.success) {
          setApiTransfers(transfersData.data || []);
        }
        
        if (productsData.success) {
          setProducts(productsData.data || []);
        }
        
        setIsClient(true);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    loadData();
  }, []);

  // State for inventory summary - initialized empty to avoid hydration mismatch
  const [inventorySummary, setInventorySummary] = useState<Record<string, number>>({});

  // State for detailed inventory breakdown by warehouse
  const [inventoryBreakdown, setInventoryBreakdown] = useState<{
    [warehouse: string]: Array<{
      productName: string;
      quantity: number;
    }>;
  }>({});

  // Calculate inventory summary once when data is loaded
  useEffect(() => {
    if (inventoryItems.length > 0) {
      const summary: Record<string, number> = {};
      const breakdown: Record<string, Array<{productName: string, quantity: number}>> = {};
      
      activeWarehouses.forEach(warehouse => {
        const warehouseItems = inventoryItems.filter((item: any) => item.warehouse === warehouse.codigo);
        
        summary[warehouse.codigo] = warehouseItems.reduce((sum: number, item: any) => 
          sum + parseFloat(item.currentStock || 0), 0
        );
        
        breakdown[warehouse.codigo] = warehouseItems
          .map((item: any) => ({
            productName: item.productName,
            quantity: parseFloat(item.currentStock || 0)
          }))
          .sort((a: any, b: any) => b.quantity - a.quantity);
      });
      
      setInventorySummary(summary);
      setInventoryBreakdown(breakdown);
    }
  }, [inventoryItems.length]); // Only depend on length to avoid infinite loops

  // Get available products from inventory - use API data
  const availableProducts = products.filter(product => 
    product.activo
  );

  // Get available quantities for selected product
  const getAvailableQuantity = (productId: number, warehouse: string) => {
    // Find the specific product in the selected warehouse using warehouse code directly
    const productInWarehouse = inventoryItems.find((item: any) => 
      item.productId === productId && item.warehouse === warehouse
    );
    
    return productInWarehouse ? parseFloat(productInWarehouse.currentStock || 0) : 0;
  };

  const handleTransfer = async () => {
    if (!selectedProduct || !quantity || !fromWarehouse || !toWarehouse || !reason) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    if (fromWarehouse === toWarehouse) {
      alert('El almacén de origen y destino no pueden ser el mismo.');
      return;
    }
    if (quantity <= 0) {
      alert('La cantidad a transferir debe ser mayor a cero.');
      return;
    }

    try {
      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: parseInt(selectedProduct),
          quantity,
          fromWarehouse,
          toWarehouse,
          reason
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        console.error('Transfer error:', data);
        alert(`Error: ${data.message}`);
        return;
      }

      // Add to Redux for immediate UI update
      dispatch(addTransfer({
        productId: parseInt(selectedProduct),
        productName: data.data.productName,
        quantity,
        fromWarehouse,
        toWarehouse,
        notes: reason,
        createdBy: 'Admin',
        status: 'completed' as const
      }));

      // Add activity
      dispatch(addActivity({
        type: 'inventory',
        action: 'Transferencia de inventario',
        details: `${data.data.productName} (${quantity} unidades) de ${fromWarehouse} a ${toWarehouse}`,
        userId: '1',
        userName: 'Admin'
      }));

      // Reload data to update inventory summary and transfers
      try {
        const [inventoryRes, transfersRes] = await Promise.all([
          fetch('/api/inventory'),
          fetch('/api/transfers')
        ]);
        
        const inventoryData = await inventoryRes.json();
        const transfersData = await transfersRes.json();
        
        if (inventoryData.success) {
          setInventoryItems(inventoryData.data || []);
        }
        
        if (transfersData.success) {
          setApiTransfers(transfersData.data || []);
        }
      } catch (error) {
        console.error('Error reloading data:', error);
      }

      alert('Transferencia realizada exitosamente!');

      // Reset form
      setSelectedProduct('');
      setQuantity(0);
      setFromWarehouse('');
      setToWarehouse('');
      setReason('');
    } catch (error) {
      console.error('Error creating transfer:', error);
      alert('Error al realizar la transferencia. Por favor intente nuevamente.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  // Get recent transfers (last 10) - use API data if available, fallback to Redux
  const recentTransfers = (apiTransfers.length > 0 ? apiTransfers : transfers).slice(0, 10);

  if (!isClient) {
    return (
      <>
        <Head>
          <title>Transferencias - Healthynola POS</title>
          <meta name="description" content="Gestión de transferencias entre almacenes" />
        </Head>
        <Layout>
          <Box sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <Typography>Cargando...</Typography>
          </Box>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Transferencias - Healthynola POS</title>
        <meta name="description" content="Gestión de transferencias entre almacenes" />
      </Head>
      <Layout>
        <Box sx={{ py: 3 }}>
          <Typography variant="h4" gutterBottom>
            Transferencias entre Almacenes
          </Typography>

          {/* Inventory Summary - Moved to top */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarehouseIcon />Resumen de Inventario por Almacén
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {activeWarehouses.map((warehouse) => (
                  <Grid item xs={12} sm={6} md={3} key={warehouse.codigo}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">
                        {warehouse.nombre}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {inventorySummary[warehouse.codigo as keyof typeof inventorySummary] || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        unidades totales
                      </Typography>
                      
                      {/* Product breakdown */}
                      <Box sx={{ mt: 2, textAlign: 'left' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                          Desglose por producto:
                        </Typography>
                        <List dense sx={{ py: 0 }}>
                          {inventoryBreakdown[warehouse.codigo]?.length > 0 ? (
                            inventoryBreakdown[warehouse.codigo].map((item, index) => (
                              <ListItem key={index} sx={{ py: 0, px: 0 }}>
                                <ListItemText
                                  primary={
                                    <Typography variant="caption" color="text.secondary">
                                      {item.productName} = {item.quantity}
                                    </Typography>
                                  }
                                />
                              </ListItem>
                            ))
                          ) : (
                            <ListItem sx={{ py: 0, px: 0 }}>
                              <ListItemText
                                primary={
                                  <Typography variant="caption" color="text.secondary">
                                    Sin productos
                                  </Typography>
                                }
                              />
                            </ListItem>
                          )}
                        </List>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {/* Transfer Form */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TransferIcon />Nueva Transferencia
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Producto</InputLabel>
                        <Select
                          value={selectedProduct}
                          label="Producto"
                          onChange={(e) => setSelectedProduct(e.target.value)}
                        >
                          {availableProducts.map((product) => (
                            <MenuItem key={product.id} value={product.id.toString()}>
                              {product.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Desde Almacén</InputLabel>
                        <Select
                          value={fromWarehouse}
                          label="Desde Almacén"
                          onChange={(e) => setFromWarehouse(e.target.value)}
                        >
                          {activeWarehouses.map((warehouse) => (
                            <MenuItem key={warehouse.codigo} value={warehouse.codigo}>
                              {warehouse.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Hacia Almacén</InputLabel>
                        <Select
                          value={toWarehouse}
                          label="Hacia Almacén"
                          onChange={(e) => setToWarehouse(e.target.value)}
                        >
                          {activeWarehouses.map((warehouse) => (
                            <MenuItem key={warehouse.codigo} value={warehouse.codigo}>
                              {warehouse.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Cantidad"
                        type="number"
                        fullWidth
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                        helperText={
                          selectedProduct && fromWarehouse 
                            ? `Disponible: ${getAvailableQuantity(parseInt(selectedProduct), fromWarehouse)}`
                            : ''
                        }
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Motivo de la transferencia"
                        fullWidth
                        multiline
                        rows={2}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ej: Reposición de stock, venta especial, etc."
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<SendIcon />}
                        onClick={handleTransfer}
                        disabled={!selectedProduct || !quantity || !fromWarehouse || !toWarehouse}
                        size="large"
                      >
                        Realizar Transferencia
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Transfers */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryIcon />Transferencias Recientes
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Producto</TableCell>
                          <TableCell align="center">Cantidad</TableCell>
                          <TableCell align="center">Origen → Destino</TableCell>
                          <TableCell align="center">Estado</TableCell>
                          <TableCell align="center">Fecha</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentTransfers.map((transfer) => (
                          <TableRow key={transfer.id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {transfer.productName}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {transfer.quantity}
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" color="text.secondary">
                                {transfer.fromWarehouse} → {transfer.toWarehouse}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={getStatusLabel(transfer.status)}
                                color={getStatusColor(transfer.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(transfer.transferDate)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Layout>
    </>
  );
};

export default Transfers;
