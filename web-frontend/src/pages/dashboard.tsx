import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { permissionsService } from '@/services/permissions';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import Layout from '@/components/Layout';
import {
  ShoppingCart as SalesIcon,
  People as CustomersIcon,
  Inventory as InventoryIcon,
  SwapHoriz as TransferIcon,
  Receipt as ExpensesIcon,
  Assessment as ReportsIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Category as CategoryIcon,
  LocalShipping as WarehouseIcon,
  Science as RawMaterialsIcon,
  RestaurantMenu as RecipeIcon,
  Work as BatchIcon,
  Inventory2 as PackagingIcon,
  CalendarToday as ConsignmentIcon,
  PersonAdd as UsersIcon
} from '@mui/icons-material';
import Link from 'next/link';

const Dashboard = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, isLoading, user } = useAuth();
  const [userPermissions, setUserPermissions] = useState<{ [key: string]: { has_access: boolean } }>({});

  // Cargar permisos del usuario
  useEffect(() => {
    const loadUserPermissions = async () => {
      if (user && user.role) {
        try {
          const response = await permissionsService.getAllPermissions();
          if (response[user.role]) {
            setUserPermissions(response[user.role] as any);
          }
        } catch (error) {
          console.error('Error loading permissions:', error);
        }
      }
    };

    if (isAuthenticated) {
      loadUserPermissions();
    }
  }, [user, isAuthenticated]);

  // Tarjetas del sistema para usuarios autenticados
  const systemModules = [
    {
      title: 'Sales Overview',
      description: 'Métricas y estadísticas del sistema',
      icon: <AssessmentIcon sx={{ fontSize: 40, color: '#607d8b' }} />,
      href: '/estadisticas',
      color: '#eceff1',
      moduleId: 'estadisticas'
    },
    {
      title: 'Ventas',
      description: 'Registro de ventas y transacciones',
      icon: <SalesIcon sx={{ fontSize: 40, color: '#2e7d32' }} />,
      href: '/sales',
      color: '#e8f5e8',
      moduleId: 'sales'
    },
    {
      title: 'Clientes',
      description: 'Gestión de clientes',
      icon: <CustomersIcon sx={{ fontSize: 40, color: '#9c27b0' }} />,
      href: '/customers',
      color: '#f3e5f5',
      moduleId: 'customers'
    },
    {
      title: 'Productos',
      description: 'Catálogo de productos',
      icon: <InventoryIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      href: '/products',
      color: '#e3f2fd',
      moduleId: 'products'
    },
    {
      title: 'Inventario',
      description: 'Control de stock',
      icon: <InventoryIcon sx={{ fontSize: 40, color: '#ff9800' }} />,
      href: '/inventory',
      color: '#fff3e0',
      moduleId: 'inventory'
    },
    {
      title: 'Transferencias',
      description: 'Transferir stock entre almacenes',
      icon: <TransferIcon sx={{ fontSize: 40, color: '#795548' }} />,
      href: '/transfers',
      color: '#efebe9',
      moduleId: 'transfers'
    },
    {
      title: 'Gastos',
      description: 'Registro y control de gastos',
      icon: <ExpensesIcon sx={{ fontSize: 40, color: '#e91e63' }} />,
      href: '/expenses',
      color: '#fce4ec',
      moduleId: 'expenses'
    },
    {
      title: 'Reportes',
      description: 'Generación de reportes y análisis',
      icon: <ReportsIcon sx={{ fontSize: 40, color: '#00838f' }} />,
      href: '/reports',
      color: '#e0f7fa',
      moduleId: 'reports'
    },
    {
      title: 'Gestionar Usuarios',
      description: 'Administración de usuarios',
      icon: <UsersIcon sx={{ fontSize: 40, color: '#3f51b5' }} />,
      href: '/users',
      color: '#e8eaf6',
      moduleId: 'users'
    },
    {
      title: 'Roles y Permisos',
      description: 'Configuración de roles del sistema',
      icon: <SettingsIcon sx={{ fontSize: 40, color: '#7b1fa2' }} />,
      href: '/roles',
      color: '#f3e5f5',
      moduleId: 'roles'
    },
    {
      title: 'Configuración',
      description: 'Configuración del sistema',
      icon: <SettingsIcon sx={{ fontSize: 40, color: '#607d8b' }} />,
      href: '/settings',
      color: '#eceff1',
      moduleId: 'settings'
    },
    {
      title: 'Categorías',
      description: 'Gestión de categorías',
      icon: <CategoryIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
      href: '/categories',
      color: '#e8f5e8',
      moduleId: 'categories'
    },
    {
      title: 'Almacenes',
      description: 'Gestión de almacenes',
      icon: <WarehouseIcon sx={{ fontSize: 40, color: '#9c27b0' }} />,
      href: '/warehouses',
      color: '#f3e5f5',
      moduleId: 'warehouses'
    },
    {
      title: 'Materias Primas',
      description: 'Gestión de materias primas',
      icon: <RawMaterialsIcon sx={{ fontSize: 40, color: '#ff5722' }} />,
      href: '/raw-materials',
      color: '#fbe9e7',
      moduleId: 'raw-materials'
    },
    {
      title: 'Recetas',
      description: 'Gestión de recetas',
      icon: <RecipeIcon sx={{ fontSize: 40, color: '#795548' }} />,
      href: '/recipes',
      color: '#efebe9',
      moduleId: 'recipes'
    },
    {
      title: 'Lotes',
      description: 'Gestión de lotes de producción',
      icon: <BatchIcon sx={{ fontSize: 40, color: '#3f51b5' }} />,
      href: '/batches',
      color: '#e8eaf6',
      moduleId: 'batches'
    },
    {
      title: 'Producción',
      description: 'Proceso de producción',
      icon: <BatchIcon sx={{ fontSize: 40, color: '#009688' }} />,
      href: '/production',
      color: '#e0f2f1',
      moduleId: 'production'
    },
    {
      title: 'Tipos de Empaque',
      description: 'Gestión de tipos de empaque',
      icon: <PackagingIcon sx={{ fontSize: 40, color: '#ff9800' }} />,
      href: '/packaging-types',
      color: '#fff3e0',
      moduleId: 'packaging-types'
    },
    {
      title: 'Visitas a Consignatarios',
      description: 'Gestión de visitas a consignatarios',
      icon: <ConsignmentIcon sx={{ fontSize: 40, color: '#e91e63' }} />,
      href: '/consignment-visits',
      color: '#fce4ec',
      moduleId: 'consignment-visits'
    }
  ];

  // Filtrar módulos según permisos del usuario
  const filteredModules = systemModules.filter(module => {
    // Si es admin, mostrar todo
    if (user?.role === 'admin') return true;
    
    // Si no hay permisos cargados aún, no mostrar nada
    if (!userPermissions || Object.keys(userPermissions).length === 0) return false;
    
    // Verificar si el usuario tiene acceso al módulo
    return userPermissions[module.moduleId]?.has_access === true;
  });

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Cargando...
        </Typography>
      </Box>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <Layout title="">
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          py: 4
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                color: '#333',
                mb: 2,
                fontSize: isMobile ? '2rem' : '2.5rem'
              }}
            >
              🥣 Healthynola POS
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#666',
                mb: 4
              }}
            >
              Sistema de gestión de inventario y ventas
            </Typography>
          </Box>

          {/* System Modules Grid */}
          <Grid container spacing={3}>
            {filteredModules.map((module, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Link href={module.href} style={{ textDecoration: 'none' }}>
                  <Card
                    sx={{
                      height: '100%',
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
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Box sx={{ mb: 2 }}>
                        {module.icon}
                      </Box>
                      <Typography
                        variant="h6"
                        component="h2"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          color: '#333'
                        }}
                      >
                        {module.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: '0.875rem' }}
                      >
                        {module.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Layout>
  );
};

export default Dashboard;