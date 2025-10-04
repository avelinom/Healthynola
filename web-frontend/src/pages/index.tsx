import React from 'react';
import { useRouter } from 'next/router';
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
  useMediaQuery
} from '@mui/material';
import {
  LocalDining as GranolaIcon,
  LocalDrink as KombuchaIcon,
  Restaurant as PizzaIcon
} from '@mui/icons-material';

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

  const handleLogin = () => {
    router.push('/login');
  };

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