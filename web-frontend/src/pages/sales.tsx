import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import { addSale } from '@/store/slices/salesSlice';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
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
  IconButton,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import Layout from '@/components/Layout';

interface SaleItem {
  id: number;
  product: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

const Sales: NextPage = () => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customer, setCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [notes, setNotes] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Load data directly from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsRes, customersRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/customers')
        ]);
        
        const productsData = await productsRes.json();
        const customersData = await customersRes.json();
        
        setProducts(productsData.data || []);
        setCustomers(customersData.data || []);
        setIsClient(true);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      loadData();
    }
  }, []);

  // Filter only active products and customers
  const activeProducts = products.filter(product => product.activo);
  const activeCustomers = customers.filter(customer => customer.active);

  const warehouses = ['Principal', 'MMM', 'DVP'];
  const paymentMethods = ['Efectivo', 'Transferencia', 'Regalo', 'Consignación'];

  const addItem = () => {
    if (!selectedProduct || quantity <= 0) return;

    const product = activeProducts.find(p => p.nombre === selectedProduct);
    if (!product) return;

    const newItem: SaleItem = {
      id: Date.now(),
      product: selectedProduct,
      quantity,
      unitPrice: product.precioVenta,
      subtotal: quantity * product.precioVenta
    };

    setSaleItems([...saleItems, newItem]);
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeItem = (id: number) => {
    setSaleItems(saleItems.filter(item => item.id !== id));
  };

  const getTotalAmount = () => {
    return saleItems.reduce((total, item) => total + item.subtotal, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleSale = async () => {
    if (saleItems.length === 0) {
      alert('Agregue al menos un producto a la venta');
      return;
    }
    
    if (!customer || !paymentMethod || !warehouse) {
      alert('Complete todos los campos requeridos');
      return;
    }

    try {
      // 1. Validar stock disponible para cada producto
      for (const item of saleItems) {
        const product = activeProducts.find(p => p.nombre === item.product);
        if (!product) {
          alert(`Producto ${item.product} no encontrado`);
          return;
        }

        // Verificar stock disponible en el almacén seleccionado
        const stockResponse = await fetch(
          `/api/inventory/product/${product.id}/${warehouse}`
        );
        const stockData = await stockResponse.json();

        if (!stockData.success) {
          alert(`Error al verificar stock de ${item.product}`);
          return;
        }

        const availableStock = stockData.data.quantity || 0;
        
        if (availableStock < item.quantity) {
          alert(
            `Stock insuficiente para ${item.product}\n` +
            `Disponible: ${availableStock}\n` +
            `Solicitado: ${item.quantity}`
          );
          return;
        }
      }

      // 2. Get customer info
      const selectedCustomer = activeCustomers.find(c => c.name === customer);
      
      // 3. Guardar cada item como una venta en la base de datos y descontar inventario
      for (const item of saleItems) {
        const product = activeProducts.find(p => p.nombre === item.product);
        
        // 3.1. Descontar del inventario
        const updateResponse = await fetch('/api/inventory/update-stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            warehouse: warehouse,
            change: -item.quantity, // Negativo para descontar
            reason: `Venta a ${customer}`
          })
        });

        const updateData = await updateResponse.json();
        
        if (!updateData.success) {
          alert(`Error al actualizar inventario de ${item.product}: ${updateData.message}`);
          return;
        }

        // 3.2. Guardar venta en la base de datos
        const saleResponse = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: selectedCustomer?.id || null,
            productId: product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            total: item.subtotal, // Sin descuento por ahora
            paymentMethod: paymentMethod,
            salesperson: 'Usuario', // TODO: Get from auth
            warehouse: warehouse,
            notes: notes || null
          })
        });

        const saleData = await saleResponse.json();
        
        if (!saleData.success) {
          alert(`Error al registrar venta de ${item.product}: ${saleData.message}`);
          return;
        }

        // 3.3. Save to Redux for immediate UI update
        dispatch(addSale({
          id: saleData.data.id,
          customerName: customer,
          customerId: selectedCustomer?.id || 0,
          items: [{
            productName: item.product,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal
          }],
          subtotal: item.subtotal,
          discount: 0,
          finalAmount: item.subtotal,
          paymentMethod,
          warehouse,
          notes,
          timestamp: saleData.data.createdAt || new Date().toISOString(),
          createdBy: 'Usuario'
        }));
      }
      
      alert(`${saleItems.length} venta(s) registrada(s) exitosamente!\nInventario actualizado.\nTotal: ${formatCurrency(getTotalAmount())}`);
      
      // 6. Clear form
      setSaleItems([]);
      setCustomer('');
      setPaymentMethod('');
      setWarehouse('');
      setNotes('');
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('Error al procesar la venta. Por favor intente nuevamente.');
    }
  };

  return (
    <>
      <Head>
        <title>Ventas - Healthynola POS</title>
        <meta name="description" content="Registro de ventas del sistema Healthynola POS" />
      </Head>

      <Layout title="Registro de Ventas">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
          {/* Sale Form */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CartIcon />
                  Nueva Venta
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  {/* Product Selection */}
                  <FormControl fullWidth>
                    <InputLabel>Producto</InputLabel>
                    <Select
                      value={selectedProduct}
                      label="Producto"
                      onChange={(e) => setSelectedProduct(e.target.value)}
                    >
                      {activeProducts.map((product) => (
                        <MenuItem key={product.id} value={product.nombre}>
                          {product.nombre} - {formatCurrency(product.precio)}
                          <Chip 
                            size="small" 
                            label={product.categoria}
                            color="primary"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Cantidad"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    inputProps={{ min: 1 }}
                    fullWidth
                  />

                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={addItem}
                    disabled={!selectedProduct}
                    fullWidth
                  >
                    Agregar Producto
                  </Button>

                  {/* Sale Details */}
                  <FormControl fullWidth>
                    <InputLabel>Cliente</InputLabel>
                    <Select
                      value={customer}
                      label="Cliente"
                      onChange={(e) => setCustomer(e.target.value)}
                    >
                      {activeCustomers.map((cust) => (
                        <MenuItem key={cust.id} value={cust.name}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2" fontWeight="medium">
                              {cust.name}
                            </Typography>
                            {(cust.email || cust.phone) && (
                              <Typography variant="caption" color="text.secondary">
                                {cust.email && cust.phone ? `${cust.email} • ${cust.phone}` : cust.email || cust.phone}
                              </Typography>
                            )}
                            <Chip 
                              size="small" 
                              label={cust.type}
                              color={cust.type === 'Mayorista' ? 'primary' : cust.type === 'Consignación' ? 'secondary' : 'default'}
                              variant="outlined"
                              sx={{ alignSelf: 'flex-start', mt: 0.5 }}
                            />
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Método de Pago</InputLabel>
                    <Select
                      value={paymentMethod}
                      label="Método de Pago"
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      {paymentMethods.map((method) => (
                        <MenuItem key={method} value={method}>
                          {method}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Almacén</InputLabel>
                    <Select
                      value={warehouse}
                      label="Almacén"
                      onChange={(e) => setWarehouse(e.target.value)}
                    >
                      {warehouses.map((wh) => (
                        <MenuItem key={wh} value={wh}>
                          {wh}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Notas (Opcional)"
                    multiline
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    fullWidth
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Sale Items */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptIcon />
                  Productos en la Venta
                </Typography>

                {saleItems.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No hay productos agregados a la venta
                  </Alert>
                ) : (
                  <>
                    <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, overflowX: 'auto' }}>
                      <Table sx={{ minWidth: 400 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>Producto</TableCell>
                            <TableCell align="center">Cantidad</TableCell>
                            <TableCell align="right">Precio Unit.</TableCell>
                            <TableCell align="right">Subtotal</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {saleItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                  {item.product}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">{item.quantity}</TableCell>
                              <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                              <TableCell align="right">{formatCurrency(item.subtotal)}</TableCell>
                              <TableCell align="center">
                                <IconButton
                                  color="error"
                                  onClick={() => removeItem(item.id)}
                                  size="small"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h5" component="div">
                        Total: {formatCurrency(getTotalAmount())}
                      </Typography>
                      <Button
                        variant="contained"
                        color="success"
                        size="large"
                        onClick={handleSale}
                        startIcon={<ReceiptIcon />}
                      >
                        Procesar Venta
                      </Button>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        )}
      </Layout>
    </>
  );
};

export default Sales;
