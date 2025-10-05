import React, { useState } from 'react';
import Head from 'next/head';
import { Box, Button, Container, Typography, Paper, Alert } from '@mui/material';
import { useRouter } from 'next/router';

const ClearCachePage = () => {
  const router = useRouter();
  const [cleared, setCleared] = useState(false);

  const clearAll = () => {
    if (typeof window !== 'undefined') {
      // Limpiar localStorage
      localStorage.clear();
      // Limpiar sessionStorage
      sessionStorage.clear();
      
      setCleared(true);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  const clearReduxOnly = () => {
    if (typeof window !== 'undefined') {
      // Guardar token y usuario
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      // Limpiar todo
      localStorage.clear();
      sessionStorage.clear();
      
      // Restaurar token y usuario
      if (token) localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', user);
      
      setCleared(true);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  };

  return (
    <>
      <Head>
        <title>Limpiar Caché - Healthynola POS</title>
      </Head>

      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            🧹 Limpiador de Caché
          </Typography>

          <Box sx={{ mb: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              ¿Por qué usar esto?
            </Typography>
            <Typography variant="body2" paragraph>
              El sistema usa Redux Persist para guardar datos en localStorage. A veces estos datos quedan desactualizados y causan problemas.
            </Typography>
            <Typography variant="subtitle2" fontWeight="bold">
              Síntomas comunes:
            </Typography>
            <Typography component="ul" variant="body2" sx={{ mt: 1 }}>
              <li>Números incorrectos en estadísticas</li>
              <li>Datos viejos que no se actualizan</li>
              <li>Inconsistencias entre móvil y web</li>
            </Typography>
          </Box>

          {cleared && (
            <Alert severity="success" sx={{ mb: 2 }}>
              ✅ Caché limpiado exitosamente! Redirigiendo...
            </Alert>
          )}

          <Button
            variant="contained"
            color="error"
            fullWidth
            size="large"
            onClick={clearAll}
            disabled={cleared}
            sx={{ mb: 2 }}
          >
            🗑️ Limpiar TODO el Caché
          </Button>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={clearReduxOnly}
            disabled={cleared}
            sx={{ mb: 2 }}
          >
            🔄 Limpiar Solo Redux (mantener sesión)
          </Button>

          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={() => router.push('/login')}
            disabled={cleared}
          >
            ➡️ Ir al Login
          </Button>
        </Paper>
      </Container>
    </>
  );
};

export default ClearCachePage;



