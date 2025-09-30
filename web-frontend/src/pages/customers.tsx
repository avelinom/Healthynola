import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { Customer } from '@/store/slices/customersSlice';
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
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import Layout from '@/components/Layout';

const Customers: NextPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Load customers directly from API
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/customers');
        const data = await response.json();
        console.log('[Customers Page] Loaded customers:', data.data);
        setCustomers(data.data || []);
      } catch (error) {
        console.error('[Customers Page] Error loading customers:', error);
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      loadCustomers();
    }
  }, []);
  
  // Form state for new/edit customer
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'Regular' as 'Regular' | 'Mayorista' | 'Consignación',
    notes: ''
  });

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setCustomerForm({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        type: customer.type,
        notes: customer.notes || ''
      });
    } else {
      setEditingCustomer(null);
      setCustomerForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        type: 'Regular',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCustomer(null);
    // Reset form
    setCustomerForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      type: 'Regular',
      notes: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveCustomer = async () => {
    if (!customerForm.name.trim()) {
      alert('El nombre del cliente es obligatorio');
      return;
    }

    try {
      if (editingCustomer) {
        // Update existing customer
        const updatedCustomer = {
          name: customerForm.name.trim(),
          email: customerForm.email.trim() || null,
          phone: customerForm.phone.trim() || null,
          address: customerForm.address.trim() || null,
          type: customerForm.type,
          notes: customerForm.notes.trim() || null
        };

        const response = await fetch(`http://localhost:3001/api/customers/${editingCustomer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCustomer)
        });
        
        const result = await response.json();
        
        if (result.success) {
          alert(`Cliente "${updatedCustomer.name}" actualizado exitosamente!`);
          // Reload customers
          const customersResponse = await fetch('/api/customers');
          const customersData = await customersResponse.json();
          setCustomers(customersData.data || []);
        } else {
          alert(`Error: No se pudo actualizar el cliente`);
        }
      } else {
        // Create new customer
        const newCustomer = {
          name: customerForm.name.trim(),
          email: customerForm.email.trim() || null,
          phone: customerForm.phone.trim() || null,
          address: customerForm.address.trim() || null,
          type: customerForm.type,
          notes: customerForm.notes.trim() || null,
          active: true
        };

        const response = await fetch('http://localhost:3001/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCustomer)
        });
        
        const result = await response.json();
        
        if (result.success) {
          alert(`Cliente "${newCustomer.name}" agregado exitosamente!`);
          // Reload customers
          const customersResponse = await fetch('/api/customers');
          const customersData = await customersResponse.json();
          setCustomers(customersData.data || []);
        } else {
          alert(`Error: No se pudo crear el cliente`);
        }
      }

      // Close dialog
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error al guardar el cliente');
    }
  };

  const handleDeleteCustomer = async (customerId: number, customerName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al cliente "${customerName}"? Esta acción no se puede deshacer.`)) {
      try {
        const response = await fetch(`http://localhost:3001/api/customers/${customerId}`, {
          method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
          alert(`Cliente "${customerName}" eliminado exitosamente.`);
          // Reload customers
          const customersResponse = await fetch('/api/customers');
          const customersData = await customersResponse.json();
          setCustomers(customersData.data || []);
        } else {
          alert(`Error: No se pudo eliminar el cliente`);
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Error al eliminar el cliente');
      }
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Mayorista': return 'primary';
      case 'Consignación': return 'warning';
      default: return 'default';
    }
  };

  return (
    <>
      <Head>
        <title>Clientes - Healthynola POS</title>
        <meta name="description" content="Gestión de clientes del sistema Healthynola POS" />
      </Head>

      <Layout title="Gestión de Clientes">
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon />
                Base de Datos de Clientes
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Buscar cliente..."
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
                  Nuevo Cliente
                </Button>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Teléfono</TableCell>
                      <TableCell align="center">Tipo</TableCell>
                      <TableCell align="center">Estado</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell component="th" scope="row">
                        <Typography variant="body2" fontWeight="medium">
                          {customer.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {customer.email || '-'}
                      </TableCell>
                      <TableCell>
                        {customer.phone || '-'}
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={customer.type} 
                          color={getTypeColor(customer.type) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={customer.active ? 'Activo' : 'Inactivo'}
                          color={customer.active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(customer)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteCustomer(customer.id, customer.name)}
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
            )}
          </CardContent>
        </Card>

        {/* New Customer Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
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
              <Grid item xs={12}>
                <TextField
                  label="Nombre del Cliente *"
                  fullWidth
                  value={customerForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: María García"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={customerForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="cliente@email.com"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Teléfono"
                  fullWidth
                  value={customerForm.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="3001234567"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Dirección"
                  fullWidth
                  multiline
                  rows={2}
                  value={customerForm.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Dirección completa del cliente"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Cliente</InputLabel>
                  <Select
                    value={customerForm.type}
                    label="Tipo de Cliente"
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  >
                    <MenuItem value="Regular">Regular</MenuItem>
                    <MenuItem value="Mayorista">Mayorista</MenuItem>
                    <MenuItem value="Consignación">Consignación</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Notas"
                  fullWidth
                  multiline
                  rows={2}
                  value={customerForm.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Notas adicionales sobre el cliente..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} variant="outlined">
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveCustomer} 
              variant="contained"
              disabled={!customerForm.name.trim()}
            >
              {editingCustomer ? 'Actualizar Cliente' : 'Guardar Cliente'}
            </Button>
          </DialogActions>
        </Dialog>
      </Layout>
    </>
  );
};

export default Customers;
