import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSelector } from 'react-redux';
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
  Grid,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { RootState } from '../store';
import { useExpenses } from '../hooks/useExpenses';
import { Expense } from '../store/slices/expensesSlice';

const CATEGORIAS = [
  'Gasolina',
  'Materia Prima',
  'Servicios',
  'Salarios',
  'Publicidad',
  'Mantenimiento',
  'Otros',
];

const ExpensesPage = () => {
  const { expenses, loading } = useSelector((state: RootState) => state.expenses);
  const {
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    uploadReceipt,
    downloadReceipt,
  } = useExpenses();

  const [isClient, setIsClient] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    descripcion: '',
    categoria: '',
    monto: '',
    metodoPago: 'Efectivo' as 'Efectivo' | 'Transferencia' | 'Tarjeta',
    responsable: '',
    fecha: new Date().toISOString().split('T')[0],
    notas: '',
  });

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      fetchExpenses();
    }
  }, []);

  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        descripcion: expense.descripcion,
        categoria: expense.categoria,
        monto: expense.monto.toString(),
        metodoPago: expense.metodoPago,
        responsable: expense.responsable,
        fecha: expense.fecha,
        notas: expense.notas || '',
      });
    } else {
      setEditingExpense(null);
      setFormData({
        descripcion: '',
        categoria: '',
        monto: '',
        metodoPago: 'Efectivo',
        responsable: '',
        fecha: new Date().toISOString().split('T')[0],
        notas: '',
      });
    }
    setSelectedFile(null);
    setFilePreview(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingExpense(null);
    setSelectedFile(null);
    setFilePreview(null);
    setError(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Máximo 5MB.');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setError('Solo se permiten imágenes y archivos PDF.');
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.descripcion || !formData.categoria || !formData.monto || !formData.responsable) {
        setError('Por favor complete todos los campos obligatorios');
        return;
      }

      // Validate amount
      if (parseFloat(formData.monto) <= 0) {
        setError('El monto debe ser mayor a 0');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('categoria', formData.categoria);
      formDataToSend.append('monto', formData.monto);
      formDataToSend.append('metodoPago', formData.metodoPago);
      formDataToSend.append('responsable', formData.responsable);
      formDataToSend.append('fecha', formData.fecha);
      if (formData.notas) {
        formDataToSend.append('notas', formData.notas);
      }
      if (selectedFile) {
        formDataToSend.append('receipt', selectedFile);
      }

      let result;
      if (editingExpense) {
        // Update existing expense
        result = await updateExpense(editingExpense.id, {
          descripcion: formData.descripcion,
          categoria: formData.categoria,
          monto: parseFloat(formData.monto),
          metodoPago: formData.metodoPago,
          responsable: formData.responsable,
          fecha: formData.fecha,
          notas: formData.notas,
        });

        // Upload receipt separately if file was selected
        if (selectedFile && result.success) {
          await uploadReceipt(editingExpense.id, selectedFile);
        }
      } else {
        // Create new expense
        result = await createExpense(formDataToSend);
      }

      if (result.success) {
        setSuccess(editingExpense ? 'Gasto actualizado exitosamente' : 'Gasto registrado exitosamente');
        handleCloseModal();
        // Refresh expenses list
        await fetchExpenses();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.message || 'Error al guardar el gasto');
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar el gasto');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar este gasto?')) {
      const result = await deleteExpense(id);
      if (result.success) {
        setSuccess('Gasto eliminado exitosamente');
        await fetchExpenses();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.message || 'Error al eliminar el gasto');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'Efectivo':
        return 'success';
      case 'Transferencia':
        return 'info';
      case 'Tarjeta':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (!isClient) {
    return (
      <Layout title="Gastos">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Gastos - Healthynola POS</title>
        <meta name="description" content="Gestión de gastos del sistema Healthynola POS" />
      </Head>

      <Layout title="Gestión de Gastos">
        <Box>
          {/* Success/Error Messages */}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Header with Add Button */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Lista de Gastos</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
            >
              Registrar Gasto
            </Button>
          </Box>

          {/* Expenses Table */}
          <Card>
            <CardContent>
              {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : expenses.length === 0 ? (
                <Box textAlign="center" p={3}>
                  <Typography variant="body1" color="textSecondary">
                    No hay gastos registrados
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Categoría</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell align="right">Monto</TableCell>
                        <TableCell>Método de Pago</TableCell>
                        <TableCell>Responsable</TableCell>
                        <TableCell align="center">Recibo</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense.id} hover>
                          <TableCell>{formatDate(expense.fecha)}</TableCell>
                          <TableCell>
                            <Chip label={expense.categoria} size="small" />
                          </TableCell>
                          <TableCell>{expense.descripcion}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold">
                              {formatCurrency(expense.monto)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={expense.metodoPago}
                              color={getPaymentMethodColor(expense.metodoPago) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{expense.responsable}</TableCell>
                          <TableCell align="center">
                            {expense.hasReceipt ? (
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => downloadReceipt(expense.id)}
                              >
                                <ReceiptIcon />
                              </IconButton>
                            ) : (
                              <Typography variant="caption" color="textSecondary">
                                Sin recibo
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenModal(expense)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(expense.id)}
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

          {/* Add/Edit Expense Modal */}
          <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
            <DialogTitle>
              {editingExpense ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Descripción *"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Ej: Gasolina para repartidor"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Categoría *</InputLabel>
                    <Select
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      label="Categoría *"
                    >
                      {CATEGORIAS.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Monto *"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Método de Pago *</InputLabel>
                    <Select
                      value={formData.metodoPago}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metodoPago: e.target.value as 'Efectivo' | 'Transferencia' | 'Tarjeta',
                        })
                      }
                      label="Método de Pago *"
                    >
                      <MenuItem value="Efectivo">Efectivo</MenuItem>
                      <MenuItem value="Transferencia">Transferencia</MenuItem>
                      <MenuItem value="Tarjeta">Tarjeta</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Responsable *"
                    value={formData.responsable}
                    onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notas"
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<AttachFileIcon />}
                      fullWidth
                    >
                      {selectedFile
                        ? `Archivo: ${selectedFile.name}`
                        : editingExpense?.hasReceipt
                        ? 'Cambiar Recibo/Voucher'
                        : 'Subir Recibo/Voucher (Opcional)'}
                      <input
                        type="file"
                        hidden
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                      />
                    </Button>
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                      Formatos permitidos: Imágenes (JPG, PNG) o PDF. Máximo 5MB.
                    </Typography>
                  </Box>
                  {filePreview && (
                    <Box mt={2} textAlign="center">
                      <img
                        src={filePreview}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                      />
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal}>Cancelar</Button>
              <Button onClick={handleSubmit} variant="contained" color="primary">
                {editingExpense ? 'Actualizar' : 'Registrar'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Layout>
    </>
  );
};

export default ExpensesPage;
