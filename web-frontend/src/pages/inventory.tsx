import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import {
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateStockById,
  InventoryItem
} from '@/store/slices/inventorySlice';
import { addActivity } from '@/store/slices/activitySlice';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Update as UpdateIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import Layout from '@/components/Layout';

const Inventory: NextPage = () => {
  const dispatch = useDispatch();
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [stockUpdateDialog, setStockUpdateDialog] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<InventoryItem | null>(null);

  // Load inventory and products from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [inventoryRes, productsRes] = await Promise.all([
          fetch('http://localhost:3001/api/inventory'),
          fetch('http://localhost:3001/api/products')
        ]);
        
        const inventoryData = await inventoryRes.json();
        const productsData = await productsRes.json();
        
        // Map backend data to frontend format
        const mappedInventory = (inventoryData.data || []).map((item: any) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          warehouse: item.warehouse,
          currentStock: parseFloat(item.currentStock || 0),
          minStock: parseFloat(item.minStock || 0),
          maxStock: 1000, // Default max stock
          notes: item.notes || '',
          updatedAt: item.updatedAt
        }));
        
        setInventoryItems(mappedInventory);
        setProducts(productsData.data || []);
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

  // Form state for editing inventory item
  const [inventoryForm, setInventoryForm] = useState({
    productId: 0,
    warehouse: '',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    notes: ''
  });

  // Form state for stock update
  const [stockForm, setStockForm] = useState({
    newStock: 0,
    notes: ''
  });

  const warehouses = ['Principal', 'DVP', 'MMM'];

  const handleOpenDialog = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setInventoryForm({
        productId: item.productId,
        warehouse: item.warehouse,
        currentStock: item.currentStock,
        minStock: item.minStock,
        maxStock: item.maxStock,
        notes: item.notes || ''
      });
    } else {
      setEditingItem(null);
      setInventoryForm({
        productId: 0,
        warehouse: '',
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setInventoryForm({
      productId: 0,
      warehouse: '',
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      notes: ''
    });
  };

  const handleOpenStockDialog = (item: InventoryItem) => {
    setUpdatingItem(item);
    setStockForm({
      newStock: item.currentStock,
      notes: ''
    });
    setStockUpdateDialog(true);
  };

  const handleCloseStockDialog = () => {
    setStockUpdateDialog(false);
    setUpdatingItem(null);
    setStockForm({
      newStock: 0,
      notes: ''
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setInventoryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStockInputChange = (field: string, value: any) => {
    setStockForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveItem = async () => {
    if (!inventoryForm.productId || !inventoryForm.warehouse) {
      alert('Producto y almacén son obligatorios');
      return;
    }

    try {
      if (editingItem) {
        // Actualizar item existente
        const response = await fetch(`http://localhost:3001/api/inventory/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentStock: inventoryForm.currentStock,
            minStock: inventoryForm.minStock,
            notes: inventoryForm.notes
          })
        });

        const data = await response.json();
        
        if (!data.success) {
          alert(`Error al actualizar: ${data.message}`);
          return;
        }

        // Recargar datos
        const inventoryRes = await fetch('/api/inventory');
        const inventoryData = await inventoryRes.json();
        
        const mappedInventory = (inventoryData.data || []).map((item: any) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          warehouse: item.warehouse,
          currentStock: parseFloat(item.currentStock || 0),
          minStock: parseFloat(item.minStock || 0),
          maxStock: 1000,
          notes: item.notes || '',
          updatedAt: item.updatedAt
        }));
        
        setInventoryItems(mappedInventory);
        alert('Item actualizado exitosamente!');
      } else {
        // Crear nuevo item
        const response = await fetch('http://localhost:3001/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: inventoryForm.productId,
            warehouse: inventoryForm.warehouse,
            currentStock: inventoryForm.currentStock,
            minStock: inventoryForm.minStock,
            notes: inventoryForm.notes
          })
        });

        const data = await response.json();
        
        if (!data.success) {
          alert(`Error al crear: ${data.message}`);
          return;
        }

        // Recargar datos
        const inventoryRes = await fetch('/api/inventory');
        const inventoryData = await inventoryRes.json();
        
        const mappedInventory = (inventoryData.data || []).map((item: any) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          warehouse: item.warehouse,
          currentStock: parseFloat(item.currentStock || 0),
          minStock: parseFloat(item.minStock || 0),
          maxStock: 1000,
          notes: item.notes || '',
          updatedAt: item.updatedAt
        }));
        
        setInventoryItems(mappedInventory);
        alert('Item creado exitosamente!');
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error al guardar el item. Por favor intente nuevamente.');
    }
  };

  const handleUpdateStock = async () => {
    if (!updatingItem) return;

    try {
      const response = await fetch(`http://localhost:3001/api/inventory/${updatingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStock: stockForm.newStock,
          minStock: updatingItem.minStock,
          notes: stockForm.notes
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        alert(`Error al actualizar: ${data.message}`);
        return;
      }

      // Recargar datos
      const inventoryRes = await fetch('http://localhost:3001/api/inventory');
      const inventoryData = await inventoryRes.json();
      
      const mappedInventory = (inventoryData.data || []).map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        warehouse: item.warehouse,
        currentStock: parseFloat(item.currentStock || 0),
        minStock: parseFloat(item.minStock || 0),
        maxStock: 1000,
        notes: item.notes || '',
        updatedAt: item.updatedAt
      }));
      
      setInventoryItems(mappedInventory);
      alert('Stock actualizado exitosamente!');
      handleCloseStockDialog();
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error al actualizar el stock. Por favor intente nuevamente.');
    }
  };

  const handleDeleteItem = async (itemId: number, productName: string, warehouse: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el item "${productName}" del almacén "${warehouse}"? Esta acción no se puede deshacer.`)) {
      try {
        const response = await fetch(`http://localhost:3001/api/inventory/${itemId}`, {
          method: 'DELETE'
        });

        const data = await response.json();
        
        if (!data.success) {
          alert(`Error al eliminar: ${data.message}`);
          return;
        }

        // Recargar datos
        const inventoryRes = await fetch('/api/inventory');
        const inventoryData = await inventoryRes.json();
        
        const mappedInventory = (inventoryData.data || []).map((item: any) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          warehouse: item.warehouse,
          currentStock: parseFloat(item.currentStock || 0),
          minStock: parseFloat(item.minStock || 0),
          maxStock: 1000,
          notes: item.notes || '',
          updatedAt: item.updatedAt
        }));
        
        setInventoryItems(mappedInventory);
        alert('Item eliminado exitosamente!');
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error al eliminar el item. Por favor intente nuevamente.');
      }
    }
  };

  const filteredItems = inventoryItems.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.warehouse.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (item: InventoryItem) => {
    if (item.currentStock <= item.minStock) {
      return item.currentStock === 0 ? 'error' : 'warning';
    }
    return 'success';
  };

  const getStatusLabel = (item: InventoryItem) => {
    if (item.currentStock === 0) return 'Agotado';
    if (item.currentStock <= item.minStock) return 'Bajo';
    return 'Normal';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <>
      <Head>
        <title>Inventario - Healthynola POS</title>
        <meta name="description" content="Control de inventario del sistema Healthynola POS" />
      </Head>
      <Layout>
        <Box sx={{ py: 3 }}>
          <Typography variant="h4" gutterBottom>
            Control de Inventario
          </Typography>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InventoryIcon />Inventario por Almacén
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Buscar producto o almacén..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                    Nuevo Item
                  </Button>
                </Box>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell>Almacén</TableCell>
                      <TableCell align="right">Stock Actual</TableCell>
                      <TableCell align="right">Stock Mín.</TableCell>
                      <TableCell align="right">Stock Máx.</TableCell>
                      <TableCell align="center">Estado</TableCell>
                      <TableCell align="center">Última Actualización</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell component="th" scope="row">
                          <Typography variant="body2" fontWeight="medium">
                            {item.productName}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.warehouse}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {item.currentStock}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{item.minStock}</TableCell>
                        <TableCell align="right">{item.maxStock}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getStatusLabel(item)}
                            color={getStatusColor(item) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(item.updatedAt)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenDialog(item)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="secondary"
                            onClick={() => handleOpenStockDialog(item)}
                          >
                            <UpdateIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteItem(item.id, item.productName, item.warehouse)}
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
        </Box>

        {/* Edit/Add Item Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {editingItem ? 'Editar Item de Inventario' : 'Nuevo Item de Inventario'}
            </Typography>
            <Button
              onClick={handleCloseDialog}
              sx={{ minWidth: 'auto', p: 0.5 }}
            >
              <CloseIcon />
            </Button>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Producto</InputLabel>
                  <Select
                    value={inventoryForm.productId}
                    label="Producto"
                    onChange={(e) => handleInputChange('productId', e.target.value)}
                  >
                    {products.filter(p => p.activo).map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Almacén</InputLabel>
                  <Select
                    value={inventoryForm.warehouse}
                    label="Almacén"
                    onChange={(e) => handleInputChange('warehouse', e.target.value)}
                  >
                    {warehouses.map((warehouse) => (
                      <MenuItem key={warehouse} value={warehouse}>
                        {warehouse}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Stock Actual"
                  type="number"
                  fullWidth
                  value={inventoryForm.currentStock}
                  onChange={(e) => handleInputChange('currentStock', parseInt(e.target.value) || 0)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Stock Mínimo"
                  type="number"
                  fullWidth
                  value={inventoryForm.minStock}
                  onChange={(e) => handleInputChange('minStock', parseInt(e.target.value) || 0)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Stock Máximo"
                  type="number"
                  fullWidth
                  value={inventoryForm.maxStock}
                  onChange={(e) => handleInputChange('maxStock', parseInt(e.target.value) || 0)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Notas"
                  fullWidth
                  multiline
                  rows={2}
                  value={inventoryForm.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Notas adicionales sobre el item de inventario..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="secondary">
              Cancelar
            </Button>
            <Button
              onClick={handleSaveItem}
              variant="contained"
              disabled={!inventoryForm.productId || !inventoryForm.warehouse}
            >
              {editingItem ? 'Actualizar Item' : 'Guardar Item'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Stock Update Dialog */}
        <Dialog
          open={stockUpdateDialog}
          onClose={handleCloseStockDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Actualizar Stock
            </Typography>
            <Button
              onClick={handleCloseStockDialog}
              sx={{ minWidth: 'auto', p: 0.5 }}
            >
              <CloseIcon />
            </Button>
          </DialogTitle>
          <DialogContent dividers>
            {updatingItem && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Producto: {updatingItem.productName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Almacén: {updatingItem.warehouse}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Stock actual: {updatingItem.currentStock}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Nuevo Stock"
                    type="number"
                    fullWidth
                    value={stockForm.newStock}
                    onChange={(e) => handleStockInputChange('newStock', parseInt(e.target.value) || 0)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Notas de la actualización"
                    fullWidth
                    multiline
                    rows={2}
                    value={stockForm.notes}
                    onChange={(e) => handleStockInputChange('notes', e.target.value)}
                    placeholder="Motivo de la actualización de stock..."
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseStockDialog} color="secondary">
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateStock}
              variant="contained"
            >
              Actualizar Stock
            </Button>
          </DialogActions>
        </Dialog>
      </Layout>
    </>
  );
};

export default Inventory;