import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useExpenses } from '@/hooks/useExpenses';
import { useInventory } from '@/hooks/useInventory';
import { useConsignments } from '@/hooks/useConsignments';
import { useSales } from '@/hooks/useSales';
import { RootState } from '@/store';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import {
  ShoppingCart as SalesIcon,
  People as CustomersIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Receipt as ExpensesIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import Layout from '@/components/Layout';

const Estadisticas = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // Hooks para obtener datos
  const { products, loading: productsLoading } = useProducts();
  const { customers, loading: customersLoading } = useCustomers();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { inventory, loading: inventoryLoading } = useInventory();
  const { visits, getVisitStats, getConsignments } = useConsignments();
  const { sales, loading: salesLoading } = useSales();

  // Estados para estadísticas
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalSales: 0,
    totalExpenses: 0,
    salesToday: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    activeProducts: 0,
    consignedProducts: 0,
    visitStats: {
      total: 0,
      programadas: 0,
      hechas: 0,
      por_hacer: 0
    }
  });

  // Calcular estadísticas
  useEffect(() => {
    const calculateStats = async () => {
      if (products && customers && sales && expenses && inventory &&
          Array.isArray(products) && Array.isArray(customers) &&
          Array.isArray(sales) && Array.isArray(expenses) && Array.isArray(inventory)) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filtrar ventas según el rol del usuario
        const isAdmin = user?.role === 'admin';
        const userName = user?.name || '';
        
        const filteredSales = isAdmin 
          ? sales 
          : sales.filter((sale: any) => 
              sale.salesperson === userName || 
              sale.vendedor === userName
            );

        const salesToday = filteredSales.filter(sale => {
          const saleDate = new Date(sale.timestamp || sale.createdAt || sale.created_at);
          saleDate.setHours(0, 0, 0, 0);
          return saleDate.getTime() === today.getTime();
        });

        // Calcular stock bajo y stock agotado usando el inventario
        // Soportar tanto camelCase como snake_case para compatibilidad
        console.log('[ESTADISTICAS] Total inventory items:', inventory.length);
        console.log('[ESTADISTICAS] Sample inventory item:', inventory[0]);
        
        const lowStockProducts = inventory.filter(item => {
          const currentStock = Number(item.currentStock ?? item.current_stock ?? 0);
          const minStock = Number(item.minStock ?? item.min_stock ?? 0);
          const isLowStock = minStock > 0 && currentStock > 0 && currentStock <= minStock;
          if (isLowStock) {
            console.log('[ESTADISTICAS] LOW STOCK:', { 
              product: item.productName || item.product_name, 
              currentStock, 
              minStock 
            });
          }
          return isLowStock;
        });
        
        const outOfStockProducts = inventory.filter(item => {
          const currentStock = item.currentStock ?? item.current_stock ?? 0;
          const isOutOfStock = Number(currentStock) === 0;
          if (isOutOfStock) {
            console.log('[ESTADISTICAS] OUT OF STOCK:', { 
              product: item.productName || item.product_name, 
              warehouse: item.warehouse,
              currentStock: item.currentStock ?? item.current_stock 
            });
          }
          return isOutOfStock;
        });
        
        console.log('[ESTADISTICAS] Low stock count:', lowStockProducts.length);
        console.log('[ESTADISTICAS] Out of stock count:', outOfStockProducts.length);

        const activeProducts = products.filter(product => product.activo);

        // Obtener estadísticas de visitas
        let visitStats = { total: 0, programadas: 0, hechas: 0, por_hacer: 0 };
        try {
          const statsResult = await getVisitStats();
          if (statsResult.success) {
            visitStats = statsResult.data;
          }
        } catch (error) {
          console.error('Error getting visit stats:', error);
        }

        // Calcular productos consignados (suma de unidades de consignaciones del año actual)
        let consignedProducts = 0;
        try {
          const consignmentsResult = await getConsignments();
          if (consignmentsResult.success && consignmentsResult.data) {
            const currentYear = new Date().getFullYear();
            // Sumar cantidades solo de consignaciones del año actual
            consignedProducts = consignmentsResult.data
              .filter((consignment: any) => {
                const deliveryYear = new Date(consignment.delivery_date).getFullYear();
                return deliveryYear === currentYear;
              })
              .reduce((total: number, consignment: any) => {
                return total + (parseInt(consignment.quantity) || 0);
              }, 0);
          }
        } catch (error) {
          console.error('Error getting consignments:', error);
        }

        setStats({
          totalProducts: products.length,
          totalCustomers: customers.length,
          totalSales: filteredSales.length,
          totalExpenses: expenses.length,
          salesToday: salesToday.length,
          lowStockProducts: lowStockProducts.length,
          outOfStockProducts: outOfStockProducts.length,
          activeProducts: activeProducts.length,
          consignedProducts,
          visitStats
        });
      }
    };

    calculateStats();
  }, [products, customers, sales, expenses, inventory, visits, user]); // Removed getVisitStats and getConsignments from dependencies

  if (isLoading || productsLoading || customersLoading || salesLoading || expensesLoading || inventoryLoading) {
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
          Cargando estadísticas...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const calculateTotalSalesAmount = () => {
    if (!sales || !Array.isArray(sales) || !user) return 0;
    
    const isAdmin = user.role === 'admin';
    const userName = user.name || '';
    
    const filteredSales = isAdmin 
      ? sales 
      : sales.filter((sale: any) => 
          sale.salesperson === userName || 
          sale.vendedor === userName
        );
    
    return filteredSales.reduce((total, sale) => total + (sale.finalAmount || sale.total || 0), 0);
  };

  const calculateTotalExpensesAmount = () => {
    if (!expenses || !Array.isArray(expenses)) return 0;
    return expenses.reduce((total, expense) => total + (expense.monto || 0), 0);
  };

  const calculateSalesTodayAmount = () => {
    if (!sales || !Array.isArray(sales) || !user) return 0;
    
    const isAdmin = user.role === 'admin';
    const userName = user.name || '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const filteredSales = isAdmin 
      ? sales 
      : sales.filter((sale: any) => 
          sale.salesperson === userName || 
          sale.vendedor === userName
        );
    
    const salesToday = filteredSales.filter(sale => {
      const saleDate = new Date(sale.timestamp || sale.createdAt || sale.created_at);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    });

    return salesToday.reduce((total, sale) => total + (sale.finalAmount || sale.total || 0), 0);
  };

  return (
    <Layout>
      <Box sx={{ py: 3 }}>
      <Container maxWidth="lg">
        {/* Header */}
          <Box sx={{ mb: 4 }}>
          <Typography
              variant="h4"
              component="h1"
            sx={{
              fontWeight: 'bold',
              color: '#333',
              mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2
              }}
            >
              <AssessmentIcon sx={{ fontSize: 40, color: '#2e7d32' }} />
              Sales Overview
          </Typography>
        </Box>

          {/* Primera Fila: Vendedor Top centrado */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Grid item xs={12} sm={8} md={6}>
                <Card sx={{ height: '100%', bgcolor: '#f3e5f5' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <PeopleIcon sx={{ fontSize: 30, color: '#9c27b0', mr: 1 }} />
                      <Typography variant="h6" component="h2">
                        Vendedor del mes
                      </Typography>
                    </Box>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: '#9c27b0', mb: 1 }}>
                      {sales && Array.isArray(sales) && sales.length > 0 ? 
                        (() => {
                          // Filtrar ventas del mes actual
                          const currentDate = new Date();
                          const currentMonth = currentDate.getMonth();
                          const currentYear = currentDate.getFullYear();
                          
                          const salesThisMonth = sales.filter((sale: any) => {
                            const saleDate = new Date(sale.createdAt || sale.created_at || sale.timestamp);
                            return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
                          });
                          
                          if (salesThisMonth.length === 0) return 0;
                          
                          // Sumar cantidades vendidas por vendedor
                          const vendedorQuantities = salesThisMonth.reduce((acc: { [key: string]: number }, sale: any) => {
                            const vendedor = sale.salesperson || sale.vendedor || sale.salespersonName || 'Usuario';
                            const cantidad = parseFloat(sale.quantity || sale.cantidad || 0);
                            acc[vendedor] = (acc[vendedor] || 0) + cantidad;
                            return acc;
                          }, {});
                          const topVendedor = Object.keys(vendedorQuantities).reduce((a, b) => 
                            vendedorQuantities[a] > vendedorQuantities[b] ? a : b
                          );
                          return Math.round(vendedorQuantities[topVendedor]);
                        })() : 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      unidades vendidas este mes
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#9c27b0', mb: 1 }}>
                      {sales && Array.isArray(sales) && sales.length > 0 ? 
                        (() => {
                          // Filtrar ventas del mes actual
                          const currentDate = new Date();
                          const currentMonth = currentDate.getMonth();
                          const currentYear = currentDate.getFullYear();
                          
                          const salesThisMonth = sales.filter((sale: any) => {
                            const saleDate = new Date(sale.createdAt || sale.created_at || sale.timestamp);
                            return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
                          });
                          
                          if (salesThisMonth.length === 0) return 'N/A';
                          
                          // Sumar cantidades vendidas por vendedor
                          const vendedorQuantities = salesThisMonth.reduce((acc: { [key: string]: number }, sale: any) => {
                            const vendedor = sale.salesperson || sale.vendedor || sale.salespersonName || 'Usuario';
                            const cantidad = parseFloat(sale.quantity || sale.cantidad || 0);
                            acc[vendedor] = (acc[vendedor] || 0) + cantidad;
                            return acc;
                          }, {});
                          return Object.keys(vendedorQuantities).reduce((a, b) => 
                            vendedorQuantities[a] > vendedorQuantities[b] ? a : b
                          );
                        })() : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      vendedor destacado
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Segunda Fila: Ventas Totales, Ventas Hoy, Productos Totales, Productos Activos */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: '#e8f5e8' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <SalesIcon sx={{ fontSize: 40, color: '#2e7d32', mb: 1 }} />
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    {sales && Array.isArray(sales) ? formatCurrency(calculateTotalSalesAmount()) : '$0.00'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ventas Totales
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: '#e3f2fd' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    {sales && Array.isArray(sales) ? formatCurrency(calculateSalesTodayAmount()) : '$0.00'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ventas Hoy
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: '#fff3e0' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <InventoryIcon sx={{ fontSize: 40, color: '#f57c00', mb: 1 }} />
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                    {products && Array.isArray(products) ? stats.totalProducts : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Productos Totales
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: '#e3f2fd' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <InventoryIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    {stats.consignedProducts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Productos Consignados
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tercera Fila: Stock Bajo, Gastos Totales, Clientes Registrados, Visitas esta semana */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: '#ffebee' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingDownIcon sx={{ fontSize: 40, color: '#d32f2f', mb: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      Stock Bajo:
                    </Typography>
                    <Typography variant="h5" component="span" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                      {stats.lowStockProducts}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      Stock Agotado:
                    </Typography>
                    <Typography variant="h5" component="span" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                      {stats.outOfStockProducts}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Control de Inventario
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: '#e8f5e9' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ExpensesIcon sx={{ fontSize: 40, color: '#2e7d32', mb: 1 }} />
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    {expenses && Array.isArray(expenses) ? formatCurrency(calculateTotalExpensesAmount()) : '$0.00'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gastos registrados
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: '#f3e5f5' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <PeopleIcon sx={{ fontSize: 40, color: '#7b1fa2', mb: 1 }} />
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                    {customers && Array.isArray(customers) ? stats.totalCustomers : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Clientes Registrados
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', bgcolor: '#e1f5fe' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AssessmentIcon sx={{ fontSize: 40, color: '#0277bd', mb: 1 }} />
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#0277bd' }}>
                    {stats.visitStats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Visitas a consignatarios esta semana
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0277bd' }}>
                        {stats.visitStats.programadas}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Programadas
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0277bd' }}>
                        {stats.visitStats.hechas}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Hechas
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0277bd' }}>
                        {stats.visitStats.por_hacer}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Por Hacer
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
        </Grid>

      </Container>
    </Box>
    </Layout>
  );
};

export default Estadisticas;