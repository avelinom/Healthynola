import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Activity } from '@/store/slices/activitySlice';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as SalesIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import Layout from '@/components/Layout';

const Dashboard: NextPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get data from Redux store
  const activities = useSelector((state: RootState) => state.activity.activities);
  const sales = useSelector((state: RootState) => state.sales.sales);

  // State for client-side stats to avoid hydration mismatch
  const [isClient, setIsClient] = useState(false);
  const [stats, setStats] = useState({
    todaySales: 0,
    totalProducts: 0,
    lowStockItems: 0,
    totalCustomers: 0
  });

  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  // Load data directly from API
  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [productsRes, customersRes, inventoryRes, salesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/customers'),
        fetch('/api/inventory'),
        fetch('/api/sales')
      ]);
      
      const productsData = await productsRes.json();
      const customersData = await customersRes.json();
      const inventoryData = await inventoryRes.json();
      const salesData = await salesRes.json();
      
      setProducts(productsData.data || []);
      setCustomers(customersData.data || []);
      setInventoryItems(inventoryData.data || []);
      
      // Calculate stats with API data
      if (salesData.success) {
        const apiSales = salesData.data || [];
        
          // Calculate today's sales (using Mexico Central time)
          const today = new Date();
          // Get today's date in UTC (sales are stored in UTC which corresponds to Mexico Central GMT-6)
          const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format in UTC
          
          const todaySales = apiSales.filter((sale: any) => {
            const saleDate = new Date(sale.createdAt || sale.created_at || sale.timestamp);
            // Compare dates directly in UTC (backend stores in Mexico time but as UTC)
            const saleDateStr = saleDate.toISOString().split('T')[0]; // YYYY-MM-DD format in UTC
            return saleDateStr === todayStr;
          });
        
        const todaySalesAmount = todaySales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total || sale.finalAmount || 0), 0);
        const lowStockCount = (inventoryData.data || []).filter((item: any) => 
          parseFloat(item.currentStock || 0) < parseFloat(item.minStock || 0)
        ).length;
        
        setStats({
          todaySales: todaySalesAmount,
          totalProducts: (productsData.data || []).filter((p: any) => p.activo).length,
          lowStockItems: lowStockCount,
          totalCustomers: (customersData.data || []).filter((c: any) => c.activo !== false).length
        });
      }
      
      setIsClient(true);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadData();
    }
  }, [loadData]);

  // Auto-refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadData]);

  // Generate recent activity from API data (client-side only)
  useEffect(() => {
    if (isClient && products.length > 0 && customers.length > 0) {
      // Generate recent activity from products and customers
      const generatedActivities: Activity[] = [];
      
      // Add recent products (sorted by created_at)
      const recentProducts = [...products]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 2);
      
      recentProducts.forEach(product => {
        generatedActivities.push({
          id: `product-${product.id}`,
          type: 'product',
          action: 'Producto agregado',
          details: `${product.nombre}`,
          timestamp: product.created_at,
          userId: '1'
        });
      });

      // Add recent customers (sorted by created_at)
      const recentCustomers = [...customers]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 2);
      
      recentCustomers.forEach(customer => {
        generatedActivities.push({
          id: `customer-${customer.id}`,
          type: 'customer',
          action: 'Cliente registrado',
          details: `${customer.name}`,
          timestamp: customer.created_at,
          userId: '1'
        });
      });

      // Sort all activities by timestamp and take the 5 most recent
      const sortedActivities = generatedActivities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

      setRecentActivity(sortedActivities);
    }
  }, [products, customers, isClient]);

  // Calculate low stock alerts dynamically
  const lowStockAlerts = inventoryItems
    .filter(item => item.currentStock < item.minStock)
    .map(item => ({
      product: item.productName,
      currentStock: item.currentStock,
      minStock: item.minStock,
      warehouse: item.warehouse
    }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <>
      <Head>
        <title>Dashboard - Healthynola POS</title>
        <meta name="description" content="Panel de control del sistema Healthynola POS" />
      </Head>

      <Layout title="Dashboard">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Ventas Hoy
                    </Typography>
                    <Typography variant="h5" component="h2">
                      {isClient ? formatCurrency(stats.todaySales) : '$0'}
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Productos
                    </Typography>
                    <Typography variant="h5" component="h2">
                      {isClient ? stats.totalProducts : 0}
                    </Typography>
                  </Box>
                  <SalesIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Stock Bajo
                    </Typography>
                    <Typography variant="h5" component="h2" color="warning.main">
                      {isClient ? stats.lowStockItems : 0}
                    </Typography>
                  </Box>
                  <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Clientes
                    </Typography>
                    <Typography variant="h5" component="h2">
                      {isClient ? stats.totalCustomers : 0}
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 40, color: 'info.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Recent Activity */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Actividad Reciente
              </Typography>
              <List>
                {recentActivity.map((activity) => (
                  <ListItem key={activity.id} divider>
                    <ListItemIcon>
                      {activity.type === 'sale' && <SalesIcon color="success" />}
                      {activity.type === 'inventory' && <InventoryIcon color="primary" />}
                      {activity.type === 'customer' && <PeopleIcon color="info" />}
                      {activity.type === 'product' && <InventoryIcon color="secondary" />}
                      {activity.type === 'user' && <PeopleIcon color="warning" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.action}
                      secondary={`${activity.details} - ${formatTime(activity.timestamp)}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Low Stock Alerts */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="warning" />
                Alertas de Stock
              </Typography>
              <List>
                {lowStockAlerts.map((alert, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={alert.product}
                      secondary={`Almacén: ${alert.warehouse} | Stock: ${alert.currentStock} | Mín: ${alert.minStock}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
          </>
        )}
      </Layout>
    </>
  );
};

export default Dashboard;
