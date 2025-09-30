import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Assessment as ReportsIcon,
  TrendingUp as SalesIcon,
  Inventory as InventoryIcon,
  People as CustomersIcon,
  AttachMoney as FinancialIcon,
  Download as DownloadIcon,
  AccountBalance as BankIcon,
  LocalAtm as CashIcon,
  CardGiftcard as GiftIcon,
  Assignment as ConsignmentIcon
} from '@mui/icons-material';
import Layout from '@/components/Layout';

interface SalesReportData {
  summary: {
    totalSales: number;
    cashSales: number;
    transferSales: number;
    consignmentSales: number;
    giftSales: number;
    totalTransactions: number;
  };
  cashOnHand: number;
  bankDeposits: number;
  consignments: Array<{
    productName: string;
    customerName: string;
    amount: number;
    quantity: number;
    date: string;
  }>;
  gifts: Array<{
    productName: string;
    customerName: string;
    quantity: number;
    date: string;
  }>;
  salesByBagType: Record<string, {
    total: number;
    quantity: number;
    products: Array<{
      name: string;
      total: number;
      quantity: number;
    }>;
  }>;
  salesByWarehouse: Record<string, number>;
  salesByPaymentMethod: Record<string, number>;
}

const Reports: NextPage = () => {
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<SalesReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statsLoaded, setStatsLoaded] = useState(false);
  
  // State for form data
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reportType: 'sales'
  });

  // State for quick stats
  const [stats, setStats] = useState({
    todaySales: 0,
    todayTransactions: 0,
    lowStockCount: 0,
    activeCustomersCount: 0
  });

  // Load quick stats
  useEffect(() => {
    const loadStats = async () => {
      if (statsLoaded) return; // Prevent multiple calls
      
      try {
        setLoading(true);
        setIsClient(true);
        
        // Load data from API
        const [salesRes, customersRes, inventoryRes] = await Promise.all([
          fetch('/api/sales'),
          fetch('/api/customers'),
          fetch('/api/inventory')
        ]);
        
        const salesData = await salesRes.json();
        const customersData = await customersRes.json();
        const inventoryData = await inventoryRes.json();
        
        if (salesData.success && customersData.success && inventoryData.success) {
          const sales = salesData.data || [];
          const customers = customersData.data || [];
          const inventoryItems = inventoryData.data || [];
          
          // Calculate today's sales (using Mexico Central time)
          const today = new Date();
          // Get today's date in Mexico Central timezone (GMT-6)
          const todayInMexico = new Date(today.getTime() - (6 * 60 * 60 * 1000)); // Subtract 6 hours
          const todayStr = todayInMexico.toISOString().split('T')[0]; // YYYY-MM-DD format
          
          const todaySales = sales.filter((sale: any) => {
            const saleDate = new Date(sale.createdAt || sale.created_at || sale.timestamp);
            // Convert sale date to Mexico Central time (GMT-6)
            const saleInMexico = new Date(saleDate.getTime() - (6 * 60 * 60 * 1000)); // Subtract 6 hours
            const saleDateStr = saleInMexico.toISOString().split('T')[0]; // YYYY-MM-DD format
            return saleDateStr === todayStr;
          });
          
          const todaySalesAmount = todaySales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total || sale.finalAmount || 0), 0);
          const todayTransactionsCount = todaySales.length;
          
          // Calculate low stock count
          const lowStockCount = inventoryItems.filter((item: any) => 
            parseFloat(item.currentStock || 0) < parseFloat(item.minStock || 0)
          ).length;
          
          // Calculate active customers count
          const activeCustomersCount = customers.filter((c: any) => c.activo !== false).length;
          
          setStats({
            todaySales: todaySalesAmount,
            todayTransactions: todayTransactionsCount,
            lowStockCount: lowStockCount,
            activeCustomersCount: activeCustomersCount
          });
          
          setStatsLoaded(true);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined' && !statsLoaded) {
      loadStats();
    }
  }, [statsLoaded]);

  // Handle form submission - Download PDF
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (formData.startDate) params.append('startDate', formData.startDate);
    if (formData.endDate) params.append('endDate', formData.endDate);
    
    if (formData.reportType === 'sales') {
      // Open PDF in new tab
      window.open(`/api/sales/report/pdf?${params.toString()}`, '_blank');
    } else if (formData.reportType === 'expenses') {
      // Open expenses PDF in new tab
      window.open(`/api/expenses/report/pdf?${params.toString()}`, '_blank');
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Quick stats cards
  const quickStatsCards = [
    {
      title: 'Ventas Hoy',
      value: loading ? '...' : (isClient ? formatCurrency(stats.todaySales) : '$0'),
      icon: <SalesIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success'
    },
    {
      title: 'Transacciones',
      value: loading ? '...' : (isClient ? stats.todayTransactions : 0),
      icon: <InventoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary'
    },
    {
      title: 'Stock Bajo',
      value: loading ? '...' : (isClient ? stats.lowStockCount : 0),
      icon: <CustomersIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning'
    },
    {
      title: 'Clientes Activos',
      value: loading ? '...' : (isClient ? stats.activeCustomersCount : 0),
      icon: <CustomersIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info'
    }
  ];

  return (
    <>
      <Head>
        <title>Reportes - Healthynola POS</title>
        <meta name="description" content="Reportes y análisis del sistema Healthynola POS" />
      </Head>

      <Layout title="Reportes y Análisis">
        <Grid container spacing={3}>
          {/* Quick Stats */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Estadísticas Rápidas
            </Typography>
          </Grid>
          
          {quickStatsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="h6">
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" component="div">
                        {stat.value}
                      </Typography>
                    </Box>
                    {stat.icon}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Report Generation Form */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Generar Reporte de Ventas
                </Typography>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Fecha Inicio"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Fecha Fin"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth>
                        <InputLabel id="report-type-label" shrink>Tipo de Reporte</InputLabel>
                        <Select
                          labelId="report-type-label"
                          value={formData.reportType}
                          onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                          label="Tipo de Reporte"
                          sx={{ '& .MuiSelect-select': { fontSize: '0.875rem' } }}
                        >
                          <MenuItem value="sales">Ventas</MenuItem>
                          <MenuItem value="expenses">Gastos</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        fullWidth
                      >
                        Descargar PDF
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>

          {/* Error Display */}
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
        </Grid>
      </Layout>
    </>
  );
};

export default Reports;