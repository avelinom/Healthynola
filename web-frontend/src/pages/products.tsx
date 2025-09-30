import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/store/slices/productsSlice';
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
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Inventory as ProductsIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import Layout from '@/components/Layout';

const Products: NextPage = () => {
  const { products, loading, error, createProduct, updateProduct, deleteProduct, loadProducts } = useProducts();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Ensure we're on the client side and load products
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      loadProducts();
    }
  }, [loadProducts]);
  
  // Form state for new/edit product
  const [productForm, setProductForm] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    precio: 0,
    costo: 0,
    unidadMedida: 'g',
    stockMinimo: 10,
    activo: true
  });


  const categorias = ['Granola', 'Snacks', 'Cereales', 'Frutos Secos', 'Otros'];
  const unidadesMedida = ['g', 'kg', 'ml', 'l', 'unidad'];

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        nombre: product.nombre,
        descripcion: product.descripcion,
        categoria: product.categoria,
        precio: product.precio,
        costo: product.costo,
        unidadMedida: product.unidadMedida,
        stockMinimo: product.stockMinimo,
        activo: product.activo
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        nombre: '',
        descripcion: '',
        categoria: '',
        precio: 0,
        costo: 0,
        unidadMedida: 'g',
        stockMinimo: 10,
        activo: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
  };

  const handleInputChange = (field: string, value: any) => {
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProduct = async () => {
    if (!productForm.nombre.trim()) {
      alert('El nombre del producto es obligatorio');
      return;
    }

    if (productForm.precio <= 0) {
      alert('El precio debe ser mayor a 0');
      return;
    }

    try {
      if (editingProduct) {
        // Update existing product
        const result = await updateProduct(editingProduct.id, {
          ...productForm,
          nombre: productForm.nombre.trim()
        });
        
        if (result.success) {
          alert(`Producto "${productForm.nombre}" actualizado exitosamente!`);
        } else {
          alert(`Error: ${result.error}`);
        }
      } else {
        // Create new product
        const result = await createProduct({
          ...productForm,
          nombre: productForm.nombre.trim()
        });
        
        if (result.success) {
          alert(`Producto "${productForm.nombre}" creado exitosamente!`);
        } else {
          alert(`Error: ${result.error}`);
        }
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto');
    }
  };

  const handleToggleProductStatus = (productId: number) => {
    // TODO: Implement toggle status with API
    console.log('Toggle product status:', productId);
  };

  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el producto "${productName}"? Esta acción no se puede deshacer.`)) {
      try {
        const result = await deleteProduct(productId);
        
        if (result.success) {
          alert(`Producto "${productName}" eliminado exitosamente.`);
        } else {
          alert(`Error: ${result.error}`);
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error al eliminar el producto');
      }
    }
  };

  const filteredProducts = isClient ? products.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateMargin = (precio: number, costo: number) => {
    if (costo === 0) return 0;
    return ((precio - costo) / precio) * 100;
  };

  return (
    <>
      <Head>
        <title>Productos - Healthynola POS</title>
        <meta name="description" content="Gestión de productos del sistema Healthynola POS" />
      </Head>

      <Layout title="Catálogo de Productos">
        {!isClient ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ProductsIcon />
                Gestión de Productos
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ minWidth: 200 }}
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
                  onClick={() => handleOpenDialog()}
                >
                  Nuevo Producto
                </Button>
              </Box>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell align="right">Precio</TableCell>
                    <TableCell align="right">Costo</TableCell>
                    <TableCell align="center">Margen</TableCell>
                    <TableCell align="center">Stock Mín.</TableCell>
                    <TableCell align="center">Estado</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Box sx={{ maxWidth: 200 }}>
                          <Typography variant="body2" fontWeight="medium" noWrap>
                            {product.nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {product.descripcion}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={product.categoria} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(product.precio)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(product.costo)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography 
                          variant="body2" 
                          color={calculateMargin(product.precio, product.costo) > 50 ? 'success.main' : 'warning.main'}
                          fontWeight="medium"
                        >
                          {calculateMargin(product.precio, product.costo).toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {product.stockMinimo} {product.unidadMedida}
                      </TableCell>
                      <TableCell align="center">
                        <FormControlLabel
                          control={
                            <Switch
                              checked={product.activo}
                              onChange={() => handleToggleProductStatus(product.id)}
                              size="small"
                            />
                          }
                          label=""
                        />
                        <Typography variant="caption" display="block">
                          {product.activo ? 'Activo' : 'Inactivo'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(product)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteProduct(product.id, product.nombre)}
                          color="error"
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
        )}

        {/* Product Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </Typography>
            <Button
              onClick={handleCloseDialog}
              sx={{ minWidth: 'auto', p: 0.5 }}
            >
              <CloseIcon />
            </Button>
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={8}>
                <TextField
                  label="Nombre del Producto *"
                  fullWidth
                  value={productForm.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder="Ej: Granola Natural 500g"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={productForm.categoria}
                    label="Categoría"
                    onChange={(e) => handleInputChange('categoria', e.target.value)}
                  >
                    {categorias.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Descripción"
                  fullWidth
                  multiline
                  rows={2}
                  value={productForm.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  placeholder="Descripción detallada del producto"
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Precio de Venta *"
                  type="number"
                  fullWidth
                  value={productForm.precio || ''}
                  onChange={(e) => handleInputChange('precio', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Costo"
                  type="number"
                  fullWidth
                  value={productForm.costo || ''}
                  onChange={(e) => handleInputChange('costo', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Unidad de Medida</InputLabel>
                  <Select
                    value={productForm.unidadMedida}
                    label="Unidad de Medida"
                    onChange={(e) => handleInputChange('unidadMedida', e.target.value)}
                  >
                    {unidadesMedida.map((unidad) => (
                      <MenuItem key={unidad} value={unidad}>
                        {unidad}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Stock Mínimo"
                  type="number"
                  fullWidth
                  value={productForm.stockMinimo || ''}
                  onChange={(e) => handleInputChange('stockMinimo', parseInt(e.target.value) || 0)}
                  helperText="Cantidad mínima para alertas"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={productForm.activo}
                      onChange={(e) => handleInputChange('activo', e.target.checked)}
                    />
                  }
                  label="Producto Activo"
                  sx={{ mt: 2 }}
                />
              </Grid>

              {productForm.precio > 0 && productForm.costo > 0 && (
                <Grid item xs={12}>
                  <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Análisis de Rentabilidad:
                    </Typography>
                    <Typography variant="body2">
                      <strong>Margen de Ganancia:</strong> {calculateMargin(productForm.precio, productForm.costo).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2">
                      <strong>Ganancia por Unidad:</strong> {formatCurrency(productForm.precio - productForm.costo)}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} variant="outlined">
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveProduct} 
              variant="contained"
              disabled={!productForm.nombre.trim() || productForm.precio <= 0}
            >
              {editingProduct ? 'Actualizar' : 'Crear'} Producto
            </Button>
          </DialogActions>
        </Dialog>
      </Layout>
    </>
  );
};

export default Products;
