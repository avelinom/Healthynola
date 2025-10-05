import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface NextVisitModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (nextVisitDate: string) => void;
  clientName: string;
  productName: string;
  quantity: number;
}

const NextVisitModal: React.FC<NextVisitModalProps> = ({
  open,
  onClose,
  onConfirm,
  clientName,
  productName,
  quantity
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!selectedDate) {
      setError('Por favor selecciona una fecha');
      return;
    }

    // Validar que la fecha sea futura
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate <= today) {
      setError('La fecha debe ser futura');
      return;
    }

    setError(null);
    onConfirm(selectedDate.toISOString().split('T')[0]);
  };

  const handleClose = () => {
    setError(null);
    setSelectedDate(new Date());
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            📅 Programar Próxima Visita
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Venta a Consignación
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>Cliente:</strong> {clientName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>Producto:</strong> {productName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>Cantidad:</strong> {quantity} unidades
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Selecciona la fecha de tu próxima visita:
            </Typography>
            <DatePicker
              label="Fecha de próxima visita"
              value={selectedDate}
              onChange={(newValue) => {
                setSelectedDate(newValue);
                setError(null);
              }}
              minDate={new Date()}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'normal'
                }
              }}
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Recordatorio:</strong> Se te enviará una alerta vía WhatsApp para recordarte esta cita. 
              Si quieres cambiar tu cita ve al módulo de consignaciones y selecciona una nueva fecha.
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            variant="contained" 
            color="primary"
            disabled={!selectedDate}
          >
            Confirmar Visita
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default NextVisitModal;
