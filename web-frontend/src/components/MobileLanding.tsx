import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Container,
  AppBar,
  Toolbar,
  Button
} from '@mui/material';
import {
  ShoppingCart as SalesIcon,
  People as CustomersIcon,
  SwapHoriz as TransferIcon,
  Receipt as ExpensesIcon,
  Assessment as ReportsIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';
import Link from 'next/link';

const MobileLanding: NextPage = () => {
  const mobileModules = [
    {
      title: 'Ventas',
      description: 'Registro de ventas y transacciones',
      icon: <SalesIcon sx={{ fontSize: 40, color: '#2e7d32' }} />,
      href: '/sales',
      color: '#e8f5e8'
    },
    {
      title: 'Clientes',
      description: 'Gestión de clientes',
      icon: <CustomersIcon sx={{ fontSize: 40, color: '#9c27b0' }} />,
      href: '/customers',
      color: '#f3e5f5'
    },
    {
      title: 'Transferencias',
      description: 'Transferir stock entre almacenes',
      icon: <TransferIcon sx={{ fontSize: 40, color: '#795548' }} />,
      href: '/transfers',
      color: '#efebe9'
    },
    {
      title: 'Gastos',
      description: 'Registro y control de gastos',
      icon: <ExpensesIcon sx={{ fontSize: 40, color: '#e91e63' }} />,
      href: '/expenses',
      color: '#fce4ec'
    },
    {
      title: 'Reportes',
      description: 'Generación de reportes y análisis',
      icon: <ReportsIcon sx={{ fontSize: 40, color: '#00838f' }} />,
      href: '/reports',
      color: '#e0f7fa'
    }
  ];

  return (
    <>
      <Head>
        <title>Healthynola POS - Móvil</title>
        <meta name="description" content="Sistema de gestión de inventario y ventas Healthynola - Versión Móvil" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <Box sx={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
        {/* Header */}
        <AppBar position="static" sx={{ backgroundColor: '#2e7d32' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              🥣 Healthynola POS
            </Typography>
            <Button color="inherit" startIcon={<AccountIcon />}>
              Iniciar Sesión
            </Button>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="sm" sx={{ py: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: '#2e7d32' }}>
              Bienvenido
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sistema de gestión de inventario y ventas
            </Typography>
          </Box>

          {/* Mobile Modules Grid */}
          <Grid container spacing={3}>
            {mobileModules.map((module, index) => (
              <Grid item xs={12} key={index}>
                <Link href={module.href} style={{ textDecoration: 'none' }}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      },
                      backgroundColor: module.color,
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          backgroundColor: 'white',
                          boxShadow: 1
                        }}>
                          {module.icon}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
                            {module.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {module.description}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="body2" color="text.secondary">
              © 2024 Healthynola POS. Versión Móvil
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default MobileLanding;
