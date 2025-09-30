const express = require('express');
const db = require('../config/database');
const router = express.Router();

// Helper function to transform transfer data
const transformTransfer = (dbTransfer) => {
  return {
    id: dbTransfer.id,
    productId: dbTransfer.product_id,
    productName: dbTransfer.product_name,
    quantity: parseFloat(dbTransfer.cantidad),
    fromWarehouse: dbTransfer.almacen_origen,
    toWarehouse: dbTransfer.almacen_destino,
    reason: dbTransfer.motivo,
    status: 'completed', // All transfers are completed when saved
    transferDate: dbTransfer.created_at,
    createdBy: dbTransfer.user_name || 'Admin',
    createdAt: dbTransfer.created_at,
    updatedAt: dbTransfer.updated_at
  };
};

// GET /api/transfers - Get all transfers
router.get('/', async (req, res) => {
  try {
    const transfers = await db('transfers')
      .select(
        'transfers.*',
        'products.nombre as product_name',
        'users.name as user_name'
      )
      .leftJoin('products', 'transfers.product_id', 'products.id')
      .leftJoin('users', 'transfers.user_id', 'users.id')
      .orderBy('transfers.created_at', 'desc');

    res.json({
      success: true,
      data: transfers.map(transformTransfer)
    });
  } catch (error) {
    console.error('Error fetching transfers:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener transferencias',
      error: error.message
    });
  }
});

// POST /api/transfers - Create a new transfer
router.post('/', async (req, res) => {
  try {
    const {
      productId,
      quantity,
      fromWarehouse,
      toWarehouse,
      reason
    } = req.body;

    if (!productId || !quantity || !fromWarehouse || !toWarehouse || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos para la transferencia'
      });
    }

    // Verify product exists
    const product = await db('products').where('id', productId).first();
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Check stock availability in source warehouse
    const sourceInventory = await db('inventory')
      .where({
        product_id: productId,
        almacen: fromWarehouse
      })
      .first();

    if (!sourceInventory || sourceInventory.cantidad < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente en ${fromWarehouse}. Disponible: ${sourceInventory?.cantidad || 0}`
      });
    }

    // Create transfer record
    const [newTransfer] = await db('transfers').insert({
      product_id: productId,
      user_id: 1, // TODO: Get from auth session
      cantidad: parseFloat(quantity),
      almacen_origen: fromWarehouse,
      almacen_destino: toWarehouse,
      motivo: reason,
      created_at: new Date(),
      updated_at: new Date()
    }).returning('*');

    // Update inventory - decrease from source
    await db('inventory')
      .where({
        product_id: productId,
        almacen: fromWarehouse
      })
      .decrement('cantidad', quantity)
      .update('updated_at', new Date());

    // Update or create inventory in destination
    const destInventory = await db('inventory')
      .where({
        product_id: productId,
        almacen: toWarehouse
      })
      .first();

    if (destInventory) {
      await db('inventory')
        .where({
          product_id: productId,
          almacen: toWarehouse
        })
        .increment('cantidad', quantity)
        .update('updated_at', new Date());
    } else {
      await db('inventory').insert({
        product_id: productId,
        almacen: toWarehouse,
        cantidad: parseFloat(quantity),
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Record inventory movements
    await db('inventory_movements').insert([
      {
        product_id: productId,
        user_id: 1,
        almacen: fromWarehouse,
        tipo: 'transferencia',
        cantidad_anterior: sourceInventory.cantidad,
        cantidad_movimiento: -parseFloat(quantity),
        cantidad_nueva: sourceInventory.cantidad - parseFloat(quantity),
        motivo: `Transferencia a ${toWarehouse}`,
        referencia_id: newTransfer.id,
        referencia_tipo: 'transfer',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        product_id: productId,
        user_id: 1,
        almacen: toWarehouse,
        tipo: 'transferencia',
        cantidad_anterior: destInventory?.cantidad || 0,
        cantidad_movimiento: parseFloat(quantity),
        cantidad_nueva: (destInventory?.cantidad || 0) + parseFloat(quantity),
        motivo: `Transferencia desde ${fromWarehouse}`,
        referencia_id: newTransfer.id,
        referencia_tipo: 'transfer',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    res.status(201).json({
      success: true,
      message: 'Transferencia realizada exitosamente',
      data: transformTransfer({
        ...newTransfer,
        product_name: product.nombre,
        user_name: 'Admin'
      })
    });
  } catch (error) {
    console.error('Error creating transfer:', error);
    res.status(500).json({
      success: false,
      message: 'Error al realizar la transferencia',
      error: error.message
    });
  }
});

module.exports = router;
