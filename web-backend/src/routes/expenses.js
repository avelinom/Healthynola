const express = require('express');
const router = express.Router();
const db = require('../config/database');
const logger = require('../utils/logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

// Helper function to get Mexico Central time (GMT-6)
const getMexicoCentralTime = () => {
  const now = new Date();
  const mexicoTime = new Date(now.getTime() - (6 * 60 * 60 * 1000));
  return mexicoTime;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/receipts');
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images and PDFs only
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes y archivos PDF'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// Helper to transform expense from DB to frontend format
const transformExpense = (dbExpense) => {
  if (!dbExpense) return null;
  
  return {
    id: dbExpense.id,
    userId: dbExpense.user_id,
    descripcion: dbExpense.descripcion,
    categoria: dbExpense.categoria,
    monto: parseFloat(dbExpense.monto),
    metodoPago: dbExpense.metodo_pago,
    responsable: dbExpense.responsable,
    fecha: dbExpense.fecha,
    notas: dbExpense.notas,
    receiptPath: dbExpense.receipt_path,
    hasReceipt: !!dbExpense.receipt_path,
    createdAt: dbExpense.created_at,
    updatedAt: dbExpense.updated_at
  };
};

// GET /api/expenses - Obtener todos los gastos
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, categoria } = req.query;
    
    let query = db('expenses')
      .select('*')
      .orderBy('fecha', 'desc');
    
    // Apply filters
    if (startDate) {
      query = query.where('fecha', '>=', startDate);
    }
    if (endDate) {
      query = query.where('fecha', '<=', endDate);
    }
    if (categoria) {
      query = query.where('categoria', categoria);
    }
    
    const expenses = await query;
    
    res.json({
      success: true,
      data: expenses.map(transformExpense)
    });
    
  } catch (error) {
    logger.error('Error fetching expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los gastos',
      error: error.message
    });
  }
});

// GET /api/expenses/:id - Obtener un gasto específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const expense = await db('expenses')
      .where({ id })
      .first();
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: transformExpense(expense)
    });
    
  } catch (error) {
    logger.error('Error fetching expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el gasto',
      error: error.message
    });
  }
});

// POST /api/expenses - Crear nuevo gasto (with optional receipt upload)
router.post('/', upload.single('receipt'), async (req, res) => {
  try {
    const { descripcion, categoria, monto, metodoPago, responsable, fecha, notas } = req.body;
    
    // Validate required fields
    if (!descripcion || !categoria || !monto || !metodoPago || !responsable) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }
    
    // Validate amount is positive
    if (parseFloat(monto) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser mayor a 0'
      });
    }
    
    const mexicoTime = getMexicoCentralTime();
    const expenseDate = fecha ? new Date(fecha) : mexicoTime;
    
    // Get receipt path if file was uploaded
    const receiptPath = req.file ? `/uploads/receipts/${req.file.filename}` : null;
    
    const [newExpense] = await db('expenses').insert({
      user_id: 1, // TODO: Get from auth session
      descripcion,
      categoria,
      monto: parseFloat(monto),
      metodo_pago: metodoPago,
      responsable,
      fecha: expenseDate,
      notas: notas || null,
      receipt_path: receiptPath,
      created_at: mexicoTime,
      updated_at: mexicoTime
    }).returning('*');
    
    res.status(201).json({
      success: true,
      message: 'Gasto creado exitosamente',
      data: transformExpense(newExpense)
    });
    
  } catch (error) {
    logger.error('Error creating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el gasto',
      error: error.message
    });
  }
});

// PUT /api/expenses/:id - Actualizar gasto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, categoria, monto, metodoPago, responsable, fecha, notas } = req.body;
    
    const expense = await db('expenses').where({ id }).first();
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
    }
    
    const mexicoTime = getMexicoCentralTime();
    
    const [updatedExpense] = await db('expenses')
      .where({ id })
      .update({
        descripcion: descripcion || expense.descripcion,
        categoria: categoria || expense.categoria,
        monto: monto ? parseFloat(monto) : expense.monto,
        metodo_pago: metodoPago || expense.metodo_pago,
        responsable: responsable || expense.responsable,
        fecha: fecha || expense.fecha,
        notas: notas !== undefined ? notas : expense.notas,
        updated_at: mexicoTime
      })
      .returning('*');
    
    res.json({
      success: true,
      message: 'Gasto actualizado exitosamente',
      data: transformExpense(updatedExpense)
    });
    
  } catch (error) {
    logger.error('Error updating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el gasto',
      error: error.message
    });
  }
});

// DELETE /api/expenses/:id - Eliminar gasto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const expense = await db('expenses').where({ id }).first();
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
    }
    
    // Delete receipt file if exists
    if (expense.receipt_path) {
      const filePath = path.join(__dirname, '../..', expense.receipt_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await db('expenses').where({ id }).del();
    
    res.json({
      success: true,
      message: 'Gasto eliminado exitosamente'
    });
    
  } catch (error) {
    logger.error('Error deleting expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el gasto',
      error: error.message
    });
  }
});

// POST /api/expenses/:id/receipt - Upload receipt to existing expense
router.post('/:id/receipt', upload.single('receipt'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }
    
    const expense = await db('expenses').where({ id }).first();
    
    if (!expense) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
    }
    
    // Delete old receipt if exists
    if (expense.receipt_path) {
      const oldFilePath = path.join(__dirname, '../..', expense.receipt_path);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    
    const receiptPath = `/uploads/receipts/${req.file.filename}`;
    const mexicoTime = getMexicoCentralTime();
    
    const [updatedExpense] = await db('expenses')
      .where({ id })
      .update({
        receipt_path: receiptPath,
        updated_at: mexicoTime
      })
      .returning('*');
    
    res.json({
      success: true,
      message: 'Recibo subido exitosamente',
      data: transformExpense(updatedExpense)
    });
    
  } catch (error) {
    logger.error('Error uploading receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir el recibo',
      error: error.message
    });
  }
});

// GET /api/expenses/:id/receipt - Download/view receipt
router.get('/:id/receipt', async (req, res) => {
  try {
    const { id } = req.params;
    
    const expense = await db('expenses').where({ id }).first();
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
    }
    
    if (!expense.receipt_path) {
      return res.status(404).json({
        success: false,
        message: 'Este gasto no tiene recibo'
      });
    }
    
    const filePath = path.join(__dirname, '../..', expense.receipt_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo de recibo no encontrado'
      });
    }
    
    res.sendFile(filePath);
    
  } catch (error) {
    logger.error('Error downloading receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar el recibo',
      error: error.message
    });
  }
});

// GET /api/expenses/report - Generate expenses report (JSON)
router.get('/report', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = db('expenses')
      .select('*')
      .orderBy('fecha', 'desc');
    
    // Apply date filters
    if (startDate) {
      const startDateTime = new Date(startDate + 'T00:00:00');
      query = query.where('fecha', '>=', startDateTime);
    }
    if (endDate) {
      const endDateTime = new Date(endDate + 'T23:59:59');
      query = query.where('fecha', '<=', endDateTime);
    }
    
    const expenses = await query;
    
    // Calculate report data
    const reportData = {
      summary: {
        totalExpenses: 0,
        cashExpenses: 0,
        transferExpenses: 0,
        cardExpenses: 0,
        totalTransactions: expenses.length
      },
      expensesByCategory: {},
      expensesByPaymentMethod: {
        Efectivo: 0,
        Transferencia: 0,
        Tarjeta: 0
      },
      expensesByResponsible: {}
    };
    
    // Process each expense
    expenses.forEach(expense => {
      const amount = parseFloat(expense.monto);
      const paymentMethod = expense.metodo_pago;
      const categoria = expense.categoria;
      const responsable = expense.responsable;
      
      // Update totals
      reportData.summary.totalExpenses += amount;
      
      // Update payment method totals
      if (paymentMethod === 'Efectivo') {
        reportData.summary.cashExpenses += amount;
      } else if (paymentMethod === 'Transferencia') {
        reportData.summary.transferExpenses += amount;
      } else if (paymentMethod === 'Tarjeta') {
        reportData.summary.cardExpenses += amount;
      }
      
      reportData.expensesByPaymentMethod[paymentMethod] = 
        (reportData.expensesByPaymentMethod[paymentMethod] || 0) + amount;
      
      // Group by category
      if (!reportData.expensesByCategory[categoria]) {
        reportData.expensesByCategory[categoria] = {
          total: 0,
          count: 0,
          expenses: []
        };
      }
      reportData.expensesByCategory[categoria].total += amount;
      reportData.expensesByCategory[categoria].count += 1;
      reportData.expensesByCategory[categoria].expenses.push({
        descripcion: expense.descripcion,
        monto: amount,
        fecha: expense.fecha
      });
      
      // Group by responsible
      if (!reportData.expensesByResponsible[responsable]) {
        reportData.expensesByResponsible[responsable] = 0;
      }
      reportData.expensesByResponsible[responsable] += amount;
    });
    
    // Round monetary values
    reportData.summary.totalExpenses = Math.round(reportData.summary.totalExpenses * 100) / 100;
    reportData.summary.cashExpenses = Math.round(reportData.summary.cashExpenses * 100) / 100;
    reportData.summary.transferExpenses = Math.round(reportData.summary.transferExpenses * 100) / 100;
    reportData.summary.cardExpenses = Math.round(reportData.summary.cardExpenses * 100) / 100;
    
    res.json({
      success: true,
      data: reportData
    });
    
  } catch (error) {
    logger.error('Error generating expenses report:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte de gastos',
      error: error.message
    });
  }
});

// GET /api/expenses/report/pdf - Generate PDF expenses report
router.get('/report/pdf', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = db('expenses')
      .select('*')
      .orderBy('fecha', 'desc');
    
    // Apply date filters
    if (startDate) {
      const startDateTime = new Date(startDate + 'T00:00:00');
      query = query.where('fecha', '>=', startDateTime);
    }
    if (endDate) {
      const endDateTime = new Date(endDate + 'T23:59:59');
      query = query.where('fecha', '<=', endDateTime);
    }
    
    const expenses = await query;
    
    // Calculate report data (same as JSON endpoint)
    const reportData = {
      summary: {
        totalExpenses: 0,
        cashExpenses: 0,
        transferExpenses: 0,
        cardExpenses: 0,
        totalTransactions: expenses.length
      },
      expensesByCategory: {},
      expensesByPaymentMethod: {
        Efectivo: 0,
        Transferencia: 0,
        Tarjeta: 0
      },
      expensesByResponsible: {}
    };
    
    expenses.forEach(expense => {
      const amount = parseFloat(expense.monto);
      const paymentMethod = expense.metodo_pago;
      const categoria = expense.categoria;
      const responsable = expense.responsable;
      
      reportData.summary.totalExpenses += amount;
      
      if (paymentMethod === 'Efectivo') {
        reportData.summary.cashExpenses += amount;
      } else if (paymentMethod === 'Transferencia') {
        reportData.summary.transferExpenses += amount;
      } else if (paymentMethod === 'Tarjeta') {
        reportData.summary.cardExpenses += amount;
      }
      
      reportData.expensesByPaymentMethod[paymentMethod] = 
        (reportData.expensesByPaymentMethod[paymentMethod] || 0) + amount;
      
      if (!reportData.expensesByCategory[categoria]) {
        reportData.expensesByCategory[categoria] = {
          total: 0,
          count: 0
        };
      }
      reportData.expensesByCategory[categoria].total += amount;
      reportData.expensesByCategory[categoria].count += 1;
      
      if (!reportData.expensesByResponsible[responsable]) {
        reportData.expensesByResponsible[responsable] = 0;
      }
      reportData.expensesByResponsible[responsable] += amount;
    });
    
    reportData.summary.totalExpenses = Math.round(reportData.summary.totalExpenses * 100) / 100;
    reportData.summary.cashExpenses = Math.round(reportData.summary.cashExpenses * 100) / 100;
    reportData.summary.transferExpenses = Math.round(reportData.summary.transferExpenses * 100) / 100;
    reportData.summary.cardExpenses = Math.round(reportData.summary.cardExpenses * 100) / 100;
    
    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-gastos-${new Date().toISOString().split('T')[0]}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Title
    doc.fontSize(20).text('Reporte de Gastos Detallado', { align: 'center' });
    doc.fontSize(10).text(`Generado: ${new Date().toLocaleString('es-MX')}`, { align: 'center' });
    doc.moveDown(2);
    
    // Financial Summary
    doc.fontSize(14).text('Resumen Financiero', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Total de Gastos: $${reportData.summary.totalExpenses.toFixed(2)}`);
    doc.text(`Total de Transacciones: ${reportData.summary.totalTransactions}`);
    doc.moveDown(1);
    
    // Payment Methods
    doc.fontSize(14).text('Gastos por Método de Pago', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Efectivo: $${reportData.summary.cashExpenses.toFixed(2)}`);
    doc.text(`Transferencia: $${reportData.summary.transferExpenses.toFixed(2)}`);
    doc.text(`Tarjeta: $${reportData.summary.cardExpenses.toFixed(2)}`);
    doc.moveDown(1);
    
    // Expenses by Category
    doc.fontSize(14).text('Gastos por Categoría', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    Object.entries(reportData.expensesByCategory).forEach(([category, data]) => {
      doc.text(`${category}: $${data.total.toFixed(2)} (${data.count} transacciones)`);
    });
    doc.moveDown(1);
    
    // Expenses by Responsible
    if (Object.keys(reportData.expensesByResponsible).length > 0) {
      doc.fontSize(14).text('Gastos por Responsable', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      Object.entries(reportData.expensesByResponsible).forEach(([responsible, total]) => {
        doc.text(`${responsible}: $${total.toFixed(2)}`);
      });
    }
    
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

module.exports = router;
