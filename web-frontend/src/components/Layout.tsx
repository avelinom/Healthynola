import React from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container,
  Breadcrumbs,
  Link as MuiLink,
  Menu,
  MenuItem,
  IconButton,
  Chip
} from '@mui/material';
import { 
  Home as HomeIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBreadcrumbs?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'Healthynola POS',
  showBreadcrumbs = true 
}) => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    router.push('/login');
  };
  
  const getBreadcrumbs = () => {
    const pathSegments = router.asPath.split('/').filter(segment => segment);
    const breadcrumbs = [
      { label: 'Inicio', href: '/', icon: <HomeIcon fontSize="small" /> }
    ];
    
    pathSegments.forEach((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ label, href, icon: <HomeIcon fontSize="small" /> });
    });
    
    return breadcrumbs;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }}>
              🥣 Healthynola POS
            </Typography>
          </Link>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {isAuthenticated && user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={user.role}
                size="small"
                color="secondary"
                variant="outlined"
                sx={{ color: 'white', borderColor: 'white' }}
              />
              <Typography variant="body2" sx={{ color: 'white' }}>
                {user.name}
              </Typography>
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
                size="small"
              >
                <AccountIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Cerrar Sesión
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button
              color="inherit"
              startIcon={<AccountIcon />}
              onClick={() => router.push('/login')}
            >
              Iniciar Sesión
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Breadcrumbs */}
      {showBreadcrumbs && router.pathname !== '/' && (
        <Box sx={{ bgcolor: 'grey.50', py: 1 }}>
          <Container maxWidth="lg">
            <Breadcrumbs>
              {getBreadcrumbs().map((crumb, index) => (
                <Link key={crumb.href} href={crumb.href} passHref legacyBehavior>
                  <MuiLink
                    color={index === getBreadcrumbs().length - 1 ? 'text.primary' : 'inherit'}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {crumb.icon}
                    {crumb.label}
                  </MuiLink>
                </Link>
              ))}
            </Breadcrumbs>
          </Container>
        </Box>
      )}

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="lg">
          {title !== 'Healthynola POS' && (
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
              {title}
            </Typography>
          )}
          {children}
        </Container>
      </Box>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          py: 2,
          textAlign: 'center'
        }}
      >
        <Typography variant="body2">
          © 2024 Healthynola POS. Todos los derechos reservados.
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;
