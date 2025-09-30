const express = require('express');
const router = express.Router();
const db = require('../config/database');
const logger = require('../utils/logger');

// Helper to transform sale from DB to frontend format
const transformSale = (dbSale) => {
  if (!dbSale) return null;
  return {
    id: dbSale.id,
    customerId: dbSale.customer_id,
    customerName: dbSale.customer_name, // Joined from customers table
    productId: dbSale.product_id,
    productName: dbSale.product_name, // Joined from products table
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
        'products.nombre as product_name'
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
      created_at: new Date(),
      updated_at: new Date()
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

module.exports = router;