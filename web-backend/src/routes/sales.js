const express = require('express');
const router = express.Router();
const db = require('../config/database');
const logger = require('../utils/logger');
const PDFDocument = require('pdfkit');

// Helper function to get Mexico Central time (GMT-6)
const getMexicoCentralTime = () => {
  const now = new Date();
  // Subtract 6 hours to convert from UTC to Mexico Central
  const mexicoTime = new Date(now.getTime() - (6 * 60 * 60 * 1000));
  return mexicoTime;
};
const fs = require('fs');

// Helper to transform sale from DB to frontend format
const transformSale = (dbSale) => {
  if (!dbSale) return null;
  return {
    id: dbSale.id,
    customerId: dbSale.customer_id,
    customerName: dbSale.customer_name, // Joined from customers table
    productId: dbSale.product_id,
    productName: dbSale.product_name, // Joined from products table
    productCategory: dbSale.product_category, // Joined from products table
    userId: dbSale.user_id,
    quantity: parseFloat(dbSale.cantidad),
    unitPrice: parseFloat(dbSale.precio_unitario),
    subtotal: parseFloat(dbSale.subtotal),
    total: parseFloat(dbSale.total),
    paymentMethod: dbSale.metodo_pago,
    salesperson: dbSale.vendedor,
    warehouse: dbSale.almacen,
    notes: dbSale.notas,
    cancelled: dbSale.cancelada,
    cancellationDate: dbSale.fecha_cancelacion,
    cancelledBy: dbSale.cancelada_por,
    createdAt: dbSale.created_at,
    updatedAt: dbSale.updated_at,
  };
};

// GET /api/sales - Obtener todas las ventas
router.get('/', async (req, res) => {
  try {
    const sales = await db('sales')
      .leftJoin('customers', 'sales.customer_id', 'customers.id')
      .join('products', 'sales.product_id', 'products.id')
      .select(
        'sales.*',
        'customers.nombre as customer_name',
        'products.nombre as product_name',
        'products.categoria as product_category'
      )
      .orderBy('sales.created_at', 'desc');

    res.json({
      success: true,
      data: sales.map(transformSale)
    });
  } catch (error) {
    logger.error('Error fetching sales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las ventas',
      error: error.message
    });
  }
});

// GET /api/sales/report/pdf - Generate PDF sales report (MUST be before /report)
router.get('/report/pdf', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = db('sales')
      .leftJoin('customers', 'sales.customer_id', 'customers.id')
      .join('products', 'sales.product_id', 'products.id')
      .select(
        'sales.*',
        'customers.nombre as customer_name',
        'products.nombre as product_name',
        'products.categoria as product_category'
      )
      .where('sales.cancelada', false);

    // Apply date filters if provided
    // Note: dates in DB are stored in Mexico Central time (GMT-6)
    if (startDate) {
      // Start of day: 00:00:00
      const startDateTime = new Date(startDate + 'T00:00:00');
      query = query.where('sales.created_at', '>=', startDateTime);
    }
    if (endDate) {
      // End of day: 23:59:59
      const endDateTime = new Date(endDate + 'T23:59:59');
      query = query.where('sales.created_at', '<=', endDateTime);
    }

    const sales = await query.orderBy('sales.created_at', 'desc');

    // Calculate report data
    const reportData = {
      summary: {
        totalSales: 0,
        cashSales: 0,
        transferSales: 0,
        consignmentSales: 0,
        giftSales: 0,
        totalTransactions: sales.length
      },
      cashOnHand: 0,
      bankDeposits: 0,
      consignments: [],
      gifts: [],
      salesByBagType: {},
      salesByWarehouse: {},
      salesByPaymentMethod: {
        Efectivo: 0,
        Transferencia: 0,
        Consignación: 0,
        Regalo: 0
      }
    };

    // Process each sale
    sales.forEach(sale => {
      const total = parseFloat(sale.total);
      const paymentMethod = sale.metodo_pago;
      const productCategory = sale.product_category;
      const warehouse = sale.almacen;

      // Update totals
      reportData.summary.totalSales += total;
      
      // Update method-specific totals
      if (paymentMethod === 'Efectivo') {
        reportData.summary.cashSales += total;
        reportData.cashOnHand += total;
      } else if (paymentMethod === 'Transferencia') {
        reportData.summary.transferSales += total;
        reportData.bankDeposits += total;
      } else if (paymentMethod === 'Consignación') {
        reportData.summary.consignmentSales += total;
      } else if (paymentMethod === 'Regalo') {
        reportData.summary.giftSales += total;
      }
      
      reportData.salesByPaymentMethod[paymentMethod] += total;

      // Consignments and gifts
      if (paymentMethod === 'Consignación') {
        reportData.consignments.push({
          productName: sale.product_name,
          customerName: sale.customer_name || 'Cliente General',
          amount: total,
          quantity: parseFloat(sale.cantidad),
          date: sale.created_at
        });
      } else if (paymentMethod === 'Regalo') {
        reportData.gifts.push({
          productName: sale.product_name,
          customerName: sale.customer_name || 'Cliente General',
          quantity: parseFloat(sale.cantidad),
          date: sale.created_at
        });
      }

      // Sales by bag type (using product category)
      if (!reportData.salesByBagType[productCategory]) {
        reportData.salesByBagType[productCategory] = {
          total: 0,
          quantity: 0,
          products: []
        };
      }
      reportData.salesByBagType[productCategory].total += total;
      reportData.salesByBagType[productCategory].quantity += parseFloat(sale.cantidad);
      
      // Add product to bag type if not already present
      const existingProduct = reportData.salesByBagType[productCategory].products.find(
        p => p.name === sale.product_name
      );
      if (existingProduct) {
        existingProduct.total += total;
        existingProduct.quantity += parseFloat(sale.cantidad);
      } else {
        reportData.salesByBagType[productCategory].products.push({
          name: sale.product_name,
          total: total,
          quantity: parseFloat(sale.cantidad)
        });
      }

      // Sales by warehouse
      if (!reportData.salesByWarehouse[warehouse]) {
        reportData.salesByWarehouse[warehouse] = 0;
      }
      reportData.salesByWarehouse[warehouse] += total;
    });

    // Round all monetary values
    reportData.summary.totalSales = Math.round(reportData.summary.totalSales * 100) / 100;
    reportData.summary.cashSales = Math.round(reportData.summary.cashSales * 100) / 100;
    reportData.summary.transferSales = Math.round(reportData.summary.transferSales * 100) / 100;
    reportData.summary.consignmentSales = Math.round(reportData.summary.consignmentSales * 100) / 100;
    reportData.summary.giftSales = Math.round(reportData.summary.giftSales * 100) / 100;
    reportData.cashOnHand = Math.round(reportData.cashOnHand * 100) / 100;
    reportData.bankDeposits = Math.round(reportData.bankDeposits * 100) / 100;

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-ventas-${new Date().toISOString().split('T')[0]}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add title
    doc.fontSize(20).text('Reporte de Ventas Detallado', { align: 'center' });
    doc.fontSize(10).text(`Generado: ${new Date().toLocaleString('es-MX')}`, { align: 'center' });
    doc.moveDown(2);

    // Financial Summary
    doc.fontSize(14).text('Resumen Financiero', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Efectivo en Caja: $${reportData.cashOnHand.toFixed(2)}`);
    doc.text(`  - ${reportData.summary.cashSales} ventas en efectivo`);
    doc.moveDown(0.5);
    doc.text(`Depósitos Bancarios: $${reportData.bankDeposits.toFixed(2)}`);
    doc.text(`  - ${reportData.summary.transferSales} ventas por transferencia`);
    doc.moveDown(1);

    // Consignments
    if (reportData.consignments.length > 0) {
      doc.fontSize(14).text('Productos en Consignación', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      reportData.consignments.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.productName} - ${item.customerName}`);
        doc.text(`   Cantidad: ${item.quantity}, Monto: $${item.amount.toFixed(2)}`);
      });
      doc.moveDown(1);
    }

    // Gifts
    if (reportData.gifts.length > 0) {
      doc.fontSize(14).text('Productos de Regalo', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      reportData.gifts.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.productName} - ${item.customerName}`);
        doc.text(`   Cantidad: ${item.quantity}`);
      });
      doc.moveDown(1);
    }

    // Sales by Bag Type
    doc.fontSize(14).text('Ventas por Tipo de Bolsa', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    Object.entries(reportData.salesByBagType).forEach(([category, data]) => {
      doc.text(`${category}: $${data.total.toFixed(2)} (${data.quantity} unidades)`);
      data.products.forEach(product => {
        doc.text(`  - ${product.name}: $${product.total.toFixed(2)} (${product.quantity} unidades)`);
      });
      doc.moveDown(0.5);
    });

    // General Summary
    doc.addPage();
    doc.fontSize(14).text('Resumen General', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Total de Ventas: $${reportData.summary.totalSales.toFixed(2)}`);
    doc.text(`Total de Transacciones: ${reportData.summary.totalTransactions}`);
    doc.text(`Consignaciones: $${reportData.summary.consignmentSales.toFixed(2)}`);
    doc.text(`Regalos: $${reportData.summary.giftSales.toFixed(2)}`);
    doc.moveDown(1);

    // Sales by Warehouse
    doc.fontSize(14).text('Ventas por Almacén', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    Object.entries(reportData.salesByWarehouse).forEach(([warehouse, total]) => {
      doc.text(`${warehouse}: $${total.toFixed(2)}`);
    });

    // Finalize PDF
    doc.end();
  } catch (error) {
    logger.error('Error generating PDF report:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte PDF',
      error: error.message
    });
  }
});

// GET /api/sales/report - Obtener reporte detallado de ventas
router.get('/report', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = db('sales')
      .leftJoin('customers', 'sales.customer_id', 'customers.id')
      .join('products', 'sales.product_id', 'products.id')
      .select(
        'sales.*',
        'customers.nombre as customer_name',
        'products.nombre as product_name',
        'products.categoria as product_category'
      )
      .where('sales.cancelada', false);

    // Apply date filters if provided
    // Note: dates in DB are stored in Mexico Central time (GMT-6)
    if (startDate) {
      // Start of day: 00:00:00
      const startDateTime = new Date(startDate + 'T00:00:00');
      query = query.where('sales.created_at', '>=', startDateTime);
    }
    if (endDate) {
      // End of day: 23:59:59
      const endDateTime = new Date(endDate + 'T23:59:59');
      query = query.where('sales.created_at', '<=', endDateTime);
    }

    const sales = await query.orderBy('sales.created_at', 'desc');

    // Calculate report data
    const reportData = {
      summary: {
        totalSales: 0,
        cashSales: 0,
        transferSales: 0,
        consignmentSales: 0,
        giftSales: 0,
        totalTransactions: sales.length
      },
      cashOnHand: 0,
      bankDeposits: 0,
      consignments: [],
      gifts: [],
      salesByBagType: {},
      salesByWarehouse: {},
      salesByPaymentMethod: {
        Efectivo: 0,
        Transferencia: 0,
        Consignación: 0,
        Regalo: 0
      }
    };

    // Process each sale
    sales.forEach(sale => {
      const total = parseFloat(sale.total);
      const paymentMethod = sale.metodo_pago;
      const productCategory = sale.product_category;
      const warehouse = sale.almacen;

      // Update totals
      reportData.summary.totalSales += total;
      
      // Update method-specific totals
      if (paymentMethod === 'Efectivo') {
        reportData.summary.cashSales += total;
      } else if (paymentMethod === 'Transferencia') {
        reportData.summary.transferSales += total;
      } else if (paymentMethod === 'Consignación') {
        reportData.summary.consignmentSales += total;
      } else if (paymentMethod === 'Regalo') {
        reportData.summary.giftSales += total;
      }
      
      reportData.salesByPaymentMethod[paymentMethod] += total;

      // Cash on hand and bank deposits
      if (paymentMethod === 'Efectivo') {
        reportData.cashOnHand += total;
      } else if (paymentMethod === 'Transferencia') {
        reportData.bankDeposits += total;
      }

      // Consignments and gifts
      if (paymentMethod === 'Consignación') {
        reportData.consignments.push({
          productName: sale.product_name,
          customerName: sale.customer_name || 'Cliente General',
          amount: total,
          quantity: parseFloat(sale.cantidad),
          date: sale.created_at
        });
      } else if (paymentMethod === 'Regalo') {
        reportData.gifts.push({
          productName: sale.product_name,
          customerName: sale.customer_name || 'Cliente General',
          quantity: parseFloat(sale.cantidad),
          date: sale.created_at
        });
      }

      // Sales by bag type (using product category)
      if (!reportData.salesByBagType[productCategory]) {
        reportData.salesByBagType[productCategory] = {
          total: 0,
          quantity: 0,
          products: []
        };
      }
      reportData.salesByBagType[productCategory].total += total;
      reportData.salesByBagType[productCategory].quantity += parseFloat(sale.cantidad);
      
      // Add product to bag type if not already present
      const existingProduct = reportData.salesByBagType[productCategory].products.find(
        p => p.name === sale.product_name
      );
      if (existingProduct) {
        existingProduct.total += total;
        existingProduct.quantity += parseFloat(sale.cantidad);
      } else {
        reportData.salesByBagType[productCategory].products.push({
          name: sale.product_name,
          total: total,
          quantity: parseFloat(sale.cantidad)
        });
      }

      // Sales by warehouse
      if (!reportData.salesByWarehouse[warehouse]) {
        reportData.salesByWarehouse[warehouse] = 0;
      }
      reportData.salesByWarehouse[warehouse] += total;
    });

    // Round all monetary values
    reportData.summary.totalSales = Math.round(reportData.summary.totalSales * 100) / 100;
    reportData.summary.cashSales = Math.round(reportData.summary.cashSales * 100) / 100;
    reportData.summary.transferSales = Math.round(reportData.summary.transferSales * 100) / 100;
    reportData.summary.consignmentSales = Math.round(reportData.summary.consignmentSales * 100) / 100;
    reportData.summary.giftSales = Math.round(reportData.summary.giftSales * 100) / 100;
    reportData.cashOnHand = Math.round(reportData.cashOnHand * 100) / 100;
    reportData.bankDeposits = Math.round(reportData.bankDeposits * 100) / 100;

    // Round warehouse totals
    Object.keys(reportData.salesByWarehouse).forEach(warehouse => {
      reportData.salesByWarehouse[warehouse] = Math.round(reportData.salesByWarehouse[warehouse] * 100) / 100;
    });

    // Round payment method totals
    Object.keys(reportData.salesByPaymentMethod).forEach(method => {
      reportData.salesByPaymentMethod[method] = Math.round(reportData.salesByPaymentMethod[method] * 100) / 100;
    });

    // Round bag type totals
    Object.keys(reportData.salesByBagType).forEach(category => {
      reportData.salesByBagType[category].total = Math.round(reportData.salesByBagType[category].total * 100) / 100;
      reportData.salesByBagType[category].products.forEach(product => {
        product.total = Math.round(product.total * 100) / 100;
      });
    });

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    logger.error('Error generating sales report:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte de ventas',
      error: error.message
    });
  }
});

// GET /api/sales/:id - Obtener una venta por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await db('sales')
      .leftJoin('customers', 'sales.customer_id', 'customers.id')
      .join('products', 'sales.product_id', 'products.id')
      .select(
        'sales.*',
        'customers.nombre as customer_name',
        'products.nombre as product_name'
      )
      .where('sales.id', id)
      .first();
    
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    res.json({
      success: true,
      data: transformSale(sale)
    });
  } catch (error) {
    logger.error('Error fetching sale:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la venta',
      error: error.message
    });
  }
});

// POST /api/sales - Crear una nueva venta
router.post('/', async (req, res) => {
  try {
    const {
      customerId,
      productId,
      quantity,
      unitPrice,
      subtotal,
      total,
      paymentMethod,
      salesperson,
      warehouse,
      notes
    } = req.body;

    // Validar campos requeridos
    if (!productId || !quantity || !unitPrice || !paymentMethod || !warehouse || !salesperson) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }

    const mexicoTime = getMexicoCentralTime();
    
    const [newSale] = await db('sales').insert({
      customer_id: customerId || null,
      product_id: productId,
      user_id: 1, // TODO: Get from auth session
      cantidad: quantity,
      precio_unitario: unitPrice,
      subtotal: subtotal,
      total: total,
      metodo_pago: paymentMethod,
      vendedor: salesperson,
      almacen: warehouse,
      notas: notes || null,
      cancelada: false,
      created_at: mexicoTime,
      updated_at: mexicoTime
    }).returning('*');

    res.status(201).json({
      success: true,
      message: 'Venta creada exitosamente',
      data: transformSale(newSale)
    });
  } catch (error) {
    logger.error('Error creating sale:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la venta',
      error: error.message
    });
  }
});

// PUT /api/sales/:id/cancel - Cancelar una venta
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const sale = await db('sales').where('id', id).first();
    
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    if (sale.cancelada) {
      return res.status(400).json({
        success: false,
        message: 'Esta venta ya está cancelada'
      });
    }

    await db('sales')
      .where('id', id)
      .update({
        cancelada: true,
        fecha_cancelacion: new Date(),
        cancelada_por: 1, // TODO: Get from auth session
        notas: sale.notas ? `${sale.notas}\nCancelación: ${reason}` : `Cancelación: ${reason}`,
        updated_at: new Date()
      });

    res.json({
      success: true,
      message: 'Venta cancelada exitosamente'
    });
  } catch (error) {
    logger.error('Error cancelling sale:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar la venta',
      error: error.message
    });
  }
});

// GET /api/sales/margins/pdf - Generate margins report PDF
router.get('/margins/pdf', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // 1. Get sales data
    let salesQuery = db('sales')
      .join('products', 'sales.product_id', 'products.id')
      .select(
        'sales.*',
        'products.nombre as product_name',
        'products.costo as product_cost'
      )
      .where('sales.cancelada', false);
    
    if (startDate) {
      const startDateTime = new Date(startDate + 'T00:00:00');
      salesQuery = salesQuery.where('sales.created_at', '>=', startDateTime);
    }
    if (endDate) {
      const endDateTime = new Date(endDate + 'T23:59:59');
      salesQuery = salesQuery.where('sales.created_at', '<=', endDateTime);
    }
    
    const sales = await salesQuery;
    
    // 2. Get expenses data
    let expensesQuery = db('expenses').select('*');
    
    if (startDate) {
      expensesQuery = expensesQuery.where('fecha', '>=', startDate);
    }
    if (endDate) {
      expensesQuery = expensesQuery.where('fecha', '<=', endDate);
    }
    
    const expenses = await expensesQuery;
    
    // 3. Calculate metrics
    const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const totalCostOfSales = sales.reduce((sum, sale) => {
      const unitCost = parseFloat(sale.product_cost || 0);
      const quantity = parseFloat(sale.cantidad);
      return sum + (unitCost * quantity);
    }, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.monto), 0);
    
    const grossProfit = totalRevenue - totalCostOfSales;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    
    const netProfit = grossProfit - totalExpenses;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    // 4. Breakdown by category
    const salesByCategory = {};
    sales.forEach(sale => {
      const category = sale.product_category || 'Sin categoría';
      if (!salesByCategory[category]) {
        salesByCategory[category] = {
          revenue: 0,
          cost: 0,
          quantity: 0
        };
      }
      salesByCategory[category].revenue += parseFloat(sale.total);
      salesByCategory[category].cost += parseFloat(sale.product_cost || 0) * parseFloat(sale.cantidad);
      salesByCategory[category].quantity += parseFloat(sale.cantidad);
    });
    
    // Calculate margins by category
    Object.keys(salesByCategory).forEach(category => {
      const cat = salesByCategory[category];
      cat.grossProfit = cat.revenue - cat.cost;
      cat.grossMargin = cat.revenue > 0 ? (cat.grossProfit / cat.revenue) * 100 : 0;
    });
    
    // 5. Expenses by category
    const expensesByCategory = {};
    expenses.forEach(exp => {
      const category = exp.categoria || 'Sin categoría';
      if (!expensesByCategory[category]) {
        expensesByCategory[category] = 0;
      }
      expensesByCategory[category] += parseFloat(exp.monto);
    });
    
    // 6. Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-margenes.pdf');
    
    doc.pipe(res);
    
    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('Reporte de Márgenes', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Generado: ${new Date().toLocaleString('es-MX')}`, { align: 'center' });
    
    if (startDate || endDate) {
      const dateRange = `Período: ${startDate || 'Inicio'} - ${endDate || 'Hoy'}`;
      doc.text(dateRange, { align: 'center' });
    }
    
    doc.moveDown(2);
    
    // Summary Section
    doc.fontSize(14).font('Helvetica-Bold').text('Resumen Financiero');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');
    
    doc.text(`Ingresos Totales: $${totalRevenue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`);
    doc.text(`Costo de Ventas: $${totalCostOfSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`);
    doc.text(`Gastos Operativos: $${totalExpenses.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`);
    doc.moveDown(0.5);
    
    // Gross Margin
    doc.fontSize(12).font('Helvetica-Bold')
      .fillColor(grossMargin >= 0 ? 'green' : 'red')
      .text(`Ganancia Bruta: $${grossProfit.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`, { continued: true })
      .fillColor('black')
      .font('Helvetica')
      .text(` (${grossMargin.toFixed(2)}%)`);
    
    // Net Margin
    doc.fontSize(12).font('Helvetica-Bold')
      .fillColor(netMargin >= 0 ? 'green' : 'red')
      .text(`Ganancia Neta: $${netProfit.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`, { continued: true })
      .fillColor('black')
      .font('Helvetica')
      .text(` (${netMargin.toFixed(2)}%)`);
    
    doc.moveDown(2);
    
    // Sales by Category
    doc.fontSize(14).font('Helvetica-Bold').text('Márgenes por Categoría de Producto');
    doc.moveDown(0.5);
    doc.fontSize(9).font('Helvetica');
    
    Object.keys(salesByCategory).forEach(category => {
      const cat = salesByCategory[category];
      doc.text(`${category}:`);
      doc.text(`  Ventas: $${cat.revenue.toFixed(2)} | Costo: $${cat.cost.toFixed(2)} | Margen: ${cat.grossMargin.toFixed(2)}%`);
      doc.moveDown(0.3);
    });
    
    doc.moveDown(1);
    
    // Expenses by Category
    doc.fontSize(14).font('Helvetica-Bold').text('Gastos por Categoría');
    doc.moveDown(0.5);
    doc.fontSize(9).font('Helvetica');
    
    Object.keys(expensesByCategory).forEach(category => {
      const amount = expensesByCategory[category];
      doc.text(`${category}: $${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`);
    });
    
    doc.end();
    
    logger.info('Margins report PDF generated');
  } catch (error) {
    logger.error('Error generating margins report PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte',
      error: error.message
    });
  }
});

module.exports = router;