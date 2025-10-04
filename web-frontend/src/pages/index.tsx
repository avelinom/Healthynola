import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import {
  LocalDining as GranolaIcon,
  LocalDrink as KombuchaIcon,
  Restaurant as PizzaIcon,
  ShoppingCart as SalesIcon,
  People as CustomersIcon,
  Inventory as InventoryIcon,
  SwapHoriz as TransferIcon,
  Receipt as ExpensesIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Category as CategoryIcon,
  LocalShipping as WarehouseIcon,
  Science as RawMaterialsIcon,
  RestaurantMenu as RecipeIcon,
  Work as BatchIcon,
  Inventory2 as PackagingIcon
} from '@mui/icons-material';
import Link from 'next/link';

// Componente de logo Healthynola
const HealthynolaLogo = ({ size = 40 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: '#FF6B35',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      mr: 1
    }}
  >
    <Typography
      variant="h6"
      sx={{
        color: 'white',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        fontSize: size * 0.4
      }}
    >
      H
    </Typography>
  </Box>
);

// Componente de logo Brebaxe
const BrebaxeLogo = ({ size = 40 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: '8px',
      background: '#1976D2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      mr: 1,
      border: '2px solid #FFD700'
    }}
  >
    <Typography
      variant="h6"
      sx={{
        color: 'white',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        fontSize: size * 0.3
      }}
    >
      B
    </Typography>
  </Box>
);

// Componente de logo Pizzatta
const PizzattaLogo = ({ size = 40 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: '8px',
      background: '#2E7D32',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      mr: 1
    }}
  >
    <Typography
      variant="h6"
      sx={{
        color: 'white',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        fontSize: size * 0.3
      }}
    >
      P
    </Typography>
  </Box>
);

const WelcomePage = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, isLoading } = useAuth();

  const handleLogin = () => {
    router.push('/login');
  };

  // Tarjetas del sistema para usuarios autenticados
  const systemModules = [
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
      title: 'Productos',
      description: 'Catálogo de productos',
      icon: <InventoryIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      href: '/products',
      color: '#e3f2fd'
    },
    {
      title: 'Inventario',
      description: 'Control de stock',
      icon: <InventoryIcon sx={{ fontSize: 40, color: '#ff9800' }} />,
      href: '/inventory',
      color: '#fff3e0'
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
    },
    {
      title: 'Configuración',
      description: 'Configuración del sistema',
      icon: <SettingsIcon sx={{ fontSize: 40, color: '#607d8b' }} />,
      href: '/settings',
      color: '#eceff1'
    },
    {
      title: 'Categorías',
      description: 'Gestión de categorías',
      icon: <CategoryIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
      href: '/categories',
      color: '#e8f5e8'
    },
    {
      title: 'Almacenes',
      description: 'Gestión de almacenes',
      icon: <WarehouseIcon sx={{ fontSize: 40, color: '#9c27b0' }} />,
      href: '/warehouses',
      color: '#f3e5f5'
    },
    {
      title: 'Materias Primas',
      description: 'Gestión de materias primas',
      icon: <RawMaterialsIcon sx={{ fontSize: 40, color: '#ff5722' }} />,
      href: '/raw-materials',
      color: '#fbe9e7'
    },
    {
      title: 'Recetas',
      description: 'Gestión de recetas',
      icon: <RecipeIcon sx={{ fontSize: 40, color: '#795548' }} />,
      href: '/recipes',
      color: '#efebe9'
    },
    {
      title: 'Lotes',
      description: 'Gestión de lotes de producción',
      icon: <BatchIcon sx={{ fontSize: 40, color: '#3f51b5' }} />,
      href: '/batches',
      color: '#e8eaf6'
    },
    {
      title: 'Producción',
      description: 'Proceso de producción',
      icon: <BatchIcon sx={{ fontSize: 40, color: '#009688' }} />,
      href: '/production',
      color: '#e0f2f1'
    },
    {
      title: 'Tipos de Empaque',
      description: 'Gestión de tipos de empaque',
      icon: <PackagingIcon sx={{ fontSize: 40, color: '#ff9800' }} />,
      href: '/packaging-types',
      color: '#fff3e0'
    }
  ];

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

  // Si el usuario está autenticado, mostrar el dashboard
  if (isAuthenticated) {
    return (
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
            {systemModules.map((module, index) => (
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
    );
  }

  const products = [
    {
      id: 1,
      name: 'Granola Artesanal',
      brand: 'Healthynola',
      brandLogo: <HealthynolaLogo size={50} />,
      description: 'Granola artesanal con ingredientes naturales y orgánicos',
      icon: <GranolaIcon sx={{ fontSize: 60, color: '#FF6B35' }} />,
      color: '#FF6B35',
      features: ['Ingredientes naturales', 'Sin conservadores', 'Hecho a mano']
    },
    {
      id: 2,
      name: 'Kombucha Artesanal',
      brand: 'Brebaxe',
      brandLogo: <BrebaxeLogo size={50} />,
      description: 'Bebida fermentada artesanal de Zapopan, Jalisco',
      icon: <KombuchaIcon sx={{ fontSize: 60, color: '#1976D2' }} />,
      color: '#1976D2',
      features: ['Fermentación natural', '355 ml', 'Hecho en México']
    },
    {
      id: 3,
      name: 'Pizza Artesanal',
      brand: 'Pizzatta',
      brandLogo: <PizzattaLogo size={50} />,
      description: 'Pizza artesanal con masa hecha a mano',
      icon: <PizzaIcon sx={{ fontSize: 60, color: '#2E7D32' }} />,
      color: '#2E7D32',
      features: ['Masa artesanal', 'Ingredientes frescos', 'Horneado tradicional']
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          py: 3
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                color: '#333',
                fontFamily: 'monospace'
              }}
            >
              GRUPO DAMMAD
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              color: '#666',
              fontWeight: 300
            }}
          >
            Productos Artesanales Premium
          </Typography>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ flex: 1, py: 6 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 'bold',
              color: '#333',
              mb: 2,
              fontSize: isMobile ? '2.5rem' : '3.5rem'
            }}
          >
            Productos Artesanales
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: '#666',
              mb: 4,
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Descubre nuestra selección de productos artesanales premium, 
            elaborados con ingredientes naturales y técnicas tradicionales.
          </Typography>
        </Box>

        {/* Products Grid */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {products.map((product) => (
            <Grid item xs={12} md={4} key={product.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', flex: 1, p: 4 }}>
                  <Box sx={{ mb: 3 }}>
                    {product.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 'bold',
                      color: product.color,
                      mb: 1
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2
                    }}
                  >
                    {product.brandLogo}
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#666',
                        fontWeight: 500
                      }}
                    >
                      {product.brand}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#777',
                      mb: 3,
                      lineHeight: 1.6
                    }}
                  >
                    {product.description}
                  </Typography>
                  <Box>
                    {product.features.map((feature, index) => (
                      <Typography
                        key={index}
                        variant="body2"
                        sx={{
                          color: '#555',
                          mb: 0.5,
                          '&:before': {
                            content: '"✓ "',
                            color: product.color,
                            fontWeight: 'bold'
                          }
                        }}
                      >
                        {feature}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CTA Section */}
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              mb: 2
            }}
          >
            Sistema de Gestión
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              opacity: 0.9
            }}
          >
            Accede a nuestro sistema de gestión de inventario y ventas
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleLogin}
            sx={{
              background: 'white',
              color: '#667eea',
              px: 6,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: 3,
              '&:hover': {
                background: '#f5f5f5',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
              },
              transition: 'all 0.3s ease-in-out'
            }}
          >
            INICIAR SESIÓN
          </Button>
        </Paper>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          background: '#333',
          color: 'white',
          py: 3,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © 2025 Grupo DAMMAD - Todos los derechos reservados
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.6, mt: 1 }}>
            Productos artesanales elaborados con amor y dedicación ❤️
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default WelcomePage;