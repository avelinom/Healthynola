import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { Box, Container, Typography, Card, CardContent, Grid, Button } from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  ShoppingCart as SalesIcon,
  Inventory as InventoryIcon,
  People as CustomersIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Factory as ProductionIcon,
  SwapHoriz as TransferIcon,
  People as PeopleIcon,
  Receipt as ExpensesIcon,
  Category as RawMaterialsIcon,
  MenuBook as RecipesIcon,
  Assignment as BatchesIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import MobileLanding from '@/components/MobileLanding';

const HomePage: NextPage = () => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Detect mobile device
  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show loading state during client-side detection
  if (!isClient) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  // Show mobile landing for mobile devices
  if (isMobile) {
    return <MobileLanding />;
  }

  const menuItems = [
    {
      title: 'Dashboard',
      description: 'Resumen general del sistema',
      icon: <DashboardIcon fontSize="large" />,
      path: '/dashboard',
      color: '#1976d2'
    },
    {
      title: 'Materia Prima',
      description: 'Gestión de materia prima y costos',
      icon: <RawMaterialsIcon fontSize="large" />,
      path: '/raw-materials',
      color: '#607d8b'
    },
    {
      title: 'Recetas',
      description: 'Recetas de producción con costos',
      icon: <RecipesIcon fontSize="large" />,
      path: '/recipes',
      color: '#ff9800'
    },
    {
      title: 'Lotes',
      description: 'Gestión de lotes de producción',
      icon: <BatchesIcon fontSize="large" />,
      path: '/batches',
      color: '#3f51b5'
    },
    {
      title: 'Producción',
      description: 'Producir y empacar lotes',
      icon: <ProductionIcon fontSize="large" />,
      path: '/production',
      color: '#ff6f00'
    },
    {
      title: 'Ventas',
      description: 'Gestión de ventas y transacciones',
      icon: <SalesIcon fontSize="large" />,
      path: '/sales',
      color: '#2e7d32'
    },
    {
      title: 'Productos',
      description: 'Catálogo y gestión de productos',
      icon: <InventoryIcon fontSize="large" />,
      path: '/products',
      color: '#795548'
    },
    {
      title: 'Inventario',
      description: 'Control de stock y productos',
      icon: <InventoryIcon fontSize="large" />,
      path: '/inventory',
      color: '#ed6c02'
    },
    {
      title: 'Transferencias',
      description: 'Transferir stock entre almacenes',
      icon: <TransferIcon fontSize="large" />,
      path: '/transfers',
      color: '#795548'
    },
    {
      title: 'Clientes',
      description: 'Base de datos de clientes',
      icon: <CustomersIcon fontSize="large" />,
      path: '/customers',
      color: '#9c27b0'
    },
    {
      title: 'Gastos',
      description: 'Registro y control de gastos',
      icon: <ExpensesIcon fontSize="large" />,
      path: '/expenses',
      color: '#e91e63'
    },
    {
      title: 'Reportes',
      description: 'Análisis y estadísticas',
      icon: <ReportsIcon fontSize="large" />,
      path: '/reports',
      color: '#d32f2f'
    },
    {
      title: 'Usuarios',
      description: 'Gestión de usuarios y roles',
      icon: <PeopleIcon fontSize="large" />,
      path: '/users',
      color: '#9c27b0'
    },
    {
      title: 'Configuración',
      description: 'Ajustes del sistema',
      icon: <SettingsIcon fontSize="large" />,
      path: '/settings',
      color: '#616161'
    }
  ];

  return (
    <>
      <Head>
        <title>Healthynola POS - Sistema de Gestión</title>
        <meta name="description" content="Sistema de gestión de inventario y ventas para Healthynola" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box textAlign="center" mb={6}>
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom 
              sx={{ 
                color: 'white',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              🥣 Healthynola POS
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              Sistema de Gestión de Inventario y Ventas
            </Typography>
          </Box>

          {/* Menu Grid */}
          <Grid container spacing={3}>
            {menuItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }
                  }}
                  onClick={() => router.push(item.path)}
                >
                  <CardContent sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Box 
                      sx={{ 
                        color: item.color,
                        mb: 2
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography 
                      variant="h6" 
                      component="h2" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 'bold',
                        color: 'text.primary'
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {item.description}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ 
                        borderColor: item.color,
                        color: item.color,
                        '&:hover': {
                          borderColor: item.color,
                          backgroundColor: `${item.color}10`
                        }
                      }}
                    >
                      Acceder
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Footer */}
          <Box textAlign="center" mt={6}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              © 2024 Healthynola. Todos los derechos reservados.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default HomePage;
