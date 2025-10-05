import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useConsignments } from '@/hooks/useConsignments';
import Layout from '@/components/Layout';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  Edit as EditIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const ConsignmentVisits: NextPage = () => {
  const { 
    consignments, 
    visits, 
    loading, 
    error, 
    loadConsignments, 
    loadVisits, 
    updateVisit 
  } = useConsignments();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    visit_date: '',
    status: '',
    notes: ''
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('[consignment-visits] Loading data...');
        await Promise.all([
          loadConsignments(),
          loadVisits()
        ]);
        console.log('[consignment-visits] Data loaded successfully');
      } catch (error) {
        console.error('Error loading consignment data:', error);
      }
    };
    
    loadData();
  }, []);

  // Filtrar visitas del mes actual
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Debug logs
  console.log('[consignment-visits] State:', { visits, loading, error });
  console.log('[consignment-visits] Visits length:', visits?.length || 0);
  
  const currentMonthVisits = visits.filter(visit => {
    const visitDate = new Date(visit.visit_date);
    return visitDate.getMonth() === currentMonth && visitDate.getFullYear() === currentYear;
  });

  // Estadísticas de visitas
  const visitStats = {
    total: currentMonthVisits.length,
    programadas: currentMonthVisits.filter(v => v.status === 'programada').length,
    hechas: currentMonthVisits.filter(v => v.status === 'hecha').length,
    por_hacer: currentMonthVisits.filter(v => v.status === 'por_hacer').length
  };

  const handleEditVisit = (visit: any) => {
    setSelectedVisit(visit);
    setEditForm({
      visit_date: visit.visit_date,
      status: visit.status,
      notes: visit.notes || ''
    });
    setEditDialogOpen(true);
  };

  const handleSaveVisit = async () => {
    if (!selectedVisit) return;

    try {
      const result = await updateVisit(selectedVisit.id, editForm);
      if (result.success) {
        setEditDialogOpen(false);
        setSelectedVisit(null);
        loadVisits(); // Recargar visitas
      } else {
        alert(`Error al actualizar visita: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating visit:', error);
      alert('Error al actualizar visita');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'programada':
        return 'primary';
      case 'hecha':
        return 'success';
      case 'por_hacer':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'programada':
        return <ScheduleIcon />;
      case 'hecha':
        return <CheckIcon />;
      case 'por_hacer':
        return <CalendarIcon />;
      default:
        return <CalendarIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout title="Visitas a Consignatarios">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Cargando visitas...
          </Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Visitas a Consignatarios - Healthynola POS</title>
        <meta name="description" content="Gestión de visitas a consignatarios" />
      </Head>

      <Layout title="Visitas a Consignatarios">
        <Box sx={{ py: 3 }}>
          <Container maxWidth="lg">
            {/* Estadísticas del mes actual */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#e3f2fd' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <CalendarIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {visitStats.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Visitas este mes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#e8f5e8' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <ScheduleIcon sx={{ fontSize: 40, color: '#2e7d32', mb: 1 }} />
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                      {visitStats.programadas}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Programadas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#f3e5f5' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <CheckIcon sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                      {visitStats.hechas}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hechas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#fff3e0' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <CalendarIcon sx={{ fontSize: 40, color: '#f57c00', mb: 1 }} />
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                      {visitStats.por_hacer}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Por Hacer
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Lista de visitas */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon />
                  Visitas Programadas - {new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                {currentMonthVisits.length === 0 ? (
                  <Alert severity="info">
                    No hay visitas programadas para este mes
                  </Alert>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell align="center">Cliente</TableCell>
                          <TableCell align="center">Producto</TableCell>
                          <TableCell align="center">Cantidad</TableCell>
                          <TableCell align="center">Fecha de Consignación</TableCell>
                          <TableCell align="center">Fecha de Visita</TableCell>
                          <TableCell align="center">Responsable</TableCell>
                          <TableCell align="center">Estado</TableCell>
                          <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentMonthVisits.map((visit) => (
                          <TableRow key={visit.id}>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                <PersonIcon color="primary" />
                                {visit.client_name}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                <InventoryIcon color="action" />
                                {visit.product_name}
                              </Box>
                            </TableCell>
                            <TableCell align="center">{visit.quantity} unidades</TableCell>
                            <TableCell align="center">{formatDate((visit as any).delivery_date || (visit as any).deliveryDate)}</TableCell>
                            <TableCell align="center">{formatDate(visit.visit_date)}</TableCell>
                            <TableCell align="center">{visit.responsible_user}</TableCell>
                            <TableCell align="center">
                              <Chip
                                icon={getStatusIcon(visit.status)}
                                label={visit.status}
                                color={getStatusColor(visit.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Editar visita">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditVisit(visit)}
                                  color="primary"
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Container>
        </Box>

        {/* Dialog para editar visita */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Editar Visita</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Fecha de visita"
                  value={editForm.visit_date ? new Date(editForm.visit_date) : null}
                  onChange={(newValue) => {
                    if (newValue) {
                      setEditForm(prev => ({
                        ...prev,
                        visit_date: newValue.toISOString().split('T')[0]
                      }));
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal'
                    }
                  }}
                />
              </LocalizationProvider>

              <FormControl fullWidth margin="normal">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                  label="Estado"
                >
                  <MenuItem value="programada">Programada</MenuItem>
                  <MenuItem value="hecha">Hecha</MenuItem>
                  <MenuItem value="por_hacer">Por Hacer</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                margin="normal"
                label="Notas"
                multiline
                rows={3}
                value={editForm.notes}
                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveVisit} variant="contained">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </Layout>
    </>
  );
};

export default ConsignmentVisits;
