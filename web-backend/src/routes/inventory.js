const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Helper to transform inventory item from DB to frontend format
const transformInventoryItem = (dbItem) => {
  return {
    id: dbItem.id,
    productId: dbItem.product_id,
    productName: dbItem.product_name,
    warehouse: dbItem.warehouse || dbItem.almacen,
    currentStock: parseFloat(dbItem.quantity || dbItem.cantidad),
    minStock: parseFloat(dbItem.min_stock || dbItem.stock_minimo || 0),
    maxStock: parseFloat(dbItem.max_stock || dbItem.stock_maximo || 100),
    notes: dbItem.notes || '',
    createdAt: dbItem.created_at,
    updatedAt: dbItem.updated_at
  };
};

// GET /api/inventory - Obtener todo el inventario
router.get('/', async (req, res) => {
  try {
    const { warehouse } = req.query;
    
    let query = db('inventory')
      .join('products', 'inventory.product_id', 'products.id')
      .select(
        'inventory.id',
        'inventory.product_id',
        'inventory.almacen',
        'inventory.cantidad',
        'inventory.stock_minimo',
        'inventory.stock_maximo',
        'products.nombre as product_name',
        'inventory.created_at',
        'inventory.updated_at'
      );
    
    // Filter by warehouse if provided
    if (warehouse) {
      query = query.where('inventory.almacen', warehouse);
    }
    
    const inventory = await query
      .orderBy('inventory.almacen', 'asc')
      .orderBy('products.nombre', 'asc');

    res.json({
      success: true,
      data: inventory.map(transformInventoryItem)
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el inventario',
      error: error.message
    });
  }
});

// GET /api/inventory/product/:productId/:warehouse - Obtener stock de un producto en un almacén
router.get('/product/:productId/:warehouse', async (req, res) => {
  try {
    const { productId, warehouse } = req.params;
    
    const inventoryItem = await db('inventory')
      .where({
        product_id: productId,
        almacen: warehouse
      })
      .first();

    if (!inventoryItem) {
      return res.json({
        success: true,
        data: {
          quantity: 0,
          exists: false
        }
      });
    }

    res.json({
      success: true,
      data: {
        quantity: parseFloat(inventoryItem.cantidad),
        exists: true
      }
    });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el item de inventario',
      error: error.message
    });
  }
});

// POST /api/inventory/update-stock - Actualizar stock (descontar o agregar)
router.post('/update-stock', async (req, res) => {
  try {
    const { productId, warehouse, change, reason } = req.body;

    if (!productId || !warehouse || change === undefined) {
      return res.status(400).json({
        success: false,
        message: 'productId, warehouse y change son requeridos'
      });
    }

    // Buscar el item de inventario existente
    const existingItem = await db('inventory')
      .where({
        product_id: productId,
        almacen: warehouse
      })
      .first();

    let newQuantity;

    if (existingItem) {
      // Actualizar cantidad existente
      newQuantity = parseFloat(existingItem.cantidad) + parseFloat(change);
      
      // No permitir cantidades negativas
      if (newQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock insuficiente',
          currentStock: parseFloat(existingItem.cantidad),
          requested: Math.abs(parseFloat(change))
        });
      }

      await db('inventory')
        .where({
          product_id: productId,
          almacen: warehouse
        })
        .update({
          cantidad: newQuantity,
          updated_at: new Date()
        });
    } else {
      // Crear nuevo item de inventario (solo si change es positivo)
      if (parseFloat(change) < 0) {
        return res.status(400).json({
          success: false,
          message: 'No hay stock disponible para este producto en este almacén'
        });
      }

      newQuantity = parseFloat(change);
      
      await db('inventory').insert({
        product_id: productId,
        almacen: warehouse,
        cantidad: newQuantity,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Registrar movimiento de inventario
    await db('inventory_movements').insert({
      product_id: productId,
      user_id: 1, // TODO: Get from auth session
      almacen: warehouse,
      tipo: 'venta', // venta, produccion, transferencia, ajuste
      cantidad_anterior: existingItem ? parseFloat(existingItem.cantidad) : 0,
      cantidad_movimiento: Math.abs(parseFloat(change)),
      cantidad_nueva: newQuantity,
      motivo: reason || (parseFloat(change) > 0 ? 'Ingreso' : 'Venta'),
      created_at: new Date(),
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Stock actualizado exitosamente',
      data: {
        productId,
        warehouse,
        previousQuantity: existingItem ? parseFloat(existingItem.cantidad) : 0,
        change: parseFloat(change),
        newQuantity
      }
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el stock',
      error: error.message
    });
  }
});

// POST /api/inventory - Crear nuevo item de inventario
router.post('/', async (req, res) => {
  try {
    const { productId, warehouse, currentStock, minStock, notes } = req.body;

    if (!productId || !warehouse || currentStock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'productId, warehouse y currentStock son requeridos'
      });
    }

    // Verificar que el producto existe
    const product = await db('products').where('id', productId).first();
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar que no existe ya un item para este producto en este almacén
    const existingItem = await db('inventory')
      .where({ product_id: productId, almacen: warehouse })
      .first();

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un item de inventario para este producto en este almacén'
      });
    }

    // Crear el item de inventario
    const [newItem] = await db('inventory').insert({
      product_id: productId,
      almacen: warehouse,
      cantidad: parseFloat(currentStock),
      created_at: new Date(),
      updated_at: new Date()
    }).returning('*');

    // Registrar movimiento de inventario
    await db('inventory_movements').insert({
      product_id: productId,
      user_id: 1, // TODO: Get from auth session
      almacen: warehouse,
      tipo: 'ajuste',
      cantidad_anterior: 0,
      cantidad_movimiento: parseFloat(currentStock),
      cantidad_nueva: parseFloat(currentStock),
      motivo: 'Creación de item de inventario',
      created_at: new Date(),
      updated_at: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Item de inventario creado exitosamente',
      data: transformInventoryItem({
        ...newItem,
        product_name: product.nombre,
        min_stock: product.stock_minimo
      })
    });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el item de inventario',
      error: error.message
    });
  }
});

// PUT /api/inventory/:id - Actualizar item de inventario
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { currentStock, minStock, maxStock, notes } = req.body;

    const existingItem = await db('inventory')
      .join('products', 'inventory.product_id', 'products.id')
      .select('inventory.*', 'products.nombre as product_name')
      .where('inventory.id', id)
      .first();

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Item de inventario no encontrado'
      });
    }

    const oldQuantity = parseFloat(existingItem.cantidad);
    const newQuantity = parseFloat(currentStock);

    // Preparar datos para actualizar
    const updateData = {
      cantidad: newQuantity,
      updated_at: new Date()
    };
    
    // Actualizar stock_minimo si se proporciona
    if (minStock !== undefined) {
      updateData.stock_minimo = parseFloat(minStock);
    }
    
    // Actualizar stock_maximo si se proporciona
    if (maxStock !== undefined) {
      updateData.stock_maximo = parseFloat(maxStock);
    }

    // Actualizar el item
    await db('inventory')
      .where('id', id)
      .update(updateData);

    // Registrar movimiento de inventario si cambió la cantidad
    if (oldQuantity !== newQuantity) {
      await db('inventory_movements').insert({
        product_id: existingItem.product_id,
        user_id: 1, // TODO: Get from auth session
        almacen: existingItem.almacen,
        tipo: 'ajuste',
        cantidad_anterior: oldQuantity,
        cantidad_movimiento: Math.abs(newQuantity - oldQuantity),
        cantidad_nueva: newQuantity,
        motivo: 'Actualización manual de stock',
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Get updated item with all fields
    const updatedItem = await db('inventory')
      .join('products', 'inventory.product_id', 'products.id')
      .select(
        'inventory.id',
        'inventory.product_id',
        'inventory.almacen',
        'inventory.cantidad',
        'inventory.stock_minimo',
        'inventory.stock_maximo',
        'products.nombre as product_name',
        'inventory.created_at',
        'inventory.updated_at'
      )
      .where('inventory.id', id)
      .first();

    res.json({
      success: true,
      message: 'Item de inventario actualizado exitosamente',
      data: transformInventoryItem(updatedItem)
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el item de inventario',
      error: error.message
    });
  }
});

// DELETE /api/inventory/:id - Eliminar item de inventario
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingItem = await db('inventory')
      .join('products', 'inventory.product_id', 'products.id')
      .select('inventory.*', 'products.nombre as product_name')
      .where('inventory.id', id)
      .first();

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Item de inventario no encontrado'
      });
    }

    // Verificar que no hay stock antes de eliminar
    if (parseFloat(existingItem.cantidad) > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un item con stock. Primero debe transferir o ajustar el stock a cero.'
      });
    }

    // Eliminar el item
    await db('inventory').where('id', id).del();

    // Registrar movimiento de inventario
    await db('inventory_movements').insert({
      product_id: existingItem.product_id,
      user_id: 1, // TODO: Get from auth session
      almacen: existingItem.almacen,
      tipo: 'ajuste',
      cantidad_anterior: parseFloat(existingItem.cantidad),
      cantidad_movimiento: 0,
      cantidad_nueva: 0,
      motivo: 'Eliminación de item de inventario',
      created_at: new Date(),
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: 'Item de inventario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el item de inventario',
      error: error.message
    });
  }
});

module.exports = router;