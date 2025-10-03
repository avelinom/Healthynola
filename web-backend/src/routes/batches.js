const express = require('express');
const router = express.Router();
const db = require('../config/database');
const logger = require('../utils/logger');

// Helper function to get Mexico Central time (GMT-6)
const getMexicoCentralTime = () => {
  const now = new Date();
  const mexicoTime = new Date(now.getTime() - (6 * 60 * 60 * 1000));
  return mexicoTime;
};

// Transform batch data for frontend
const transformBatch = (dbBatch) => {
  return {
    id: dbBatch.id,
    codigoLote: dbBatch.codigo_lote,
    recipeId: dbBatch.recipe_id,
    recipeName: dbBatch.recipe_name,
    productName: dbBatch.product_name,
    fechaProduccion: dbBatch.fecha_produccion,
    cantidadProducida: parseFloat(dbBatch.cantidad_producida || 0),
    unidad: dbBatch.unidad,
    costoTotalCalculado: parseFloat(dbBatch.costo_total_calculado || 0),
    estado: dbBatch.estado,
    notas: dbBatch.notas,
    createdAt: dbBatch.created_at,
    updatedAt: dbBatch.updated_at
  };
};

// Transform packaging data for frontend
const transformPackaging = (dbPackaging) => {
  return {
    id: dbPackaging.id,
    batchId: dbPackaging.batch_id,
    productId: dbPackaging.product_id,
    productName: dbPackaging.product_name,
    tipoBolsa: dbPackaging.tipo_bolsa,
    cantidadBolsas: dbPackaging.cantidad_bolsas,
    almacen: dbPackaging.almacen,
    createdAt: dbPackaging.created_at
  };
};

// GET /api/batches - Get all batches
router.get('/', async (req, res) => {
  try {
    const { estado } = req.query;
    
    let query = db('batches')
      .leftJoin('recipes', 'batches.recipe_id', 'recipes.id')
      .leftJoin('products', 'recipes.product_id', 'products.id')
      .select(
        'batches.*',
        'recipes.nombre as recipe_name',
        'products.nombre as product_name'
      )
      .orderBy('batches.created_at', 'desc');
    
    if (estado) {
      query = query.where('batches.estado', estado);
    }
    
    const batches = await query;
    const transformed = batches.map(transformBatch);
    
    res.json({
      success: true,
      data: transformed
    });
  } catch (error) {
    logger.error('Error fetching batches:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener lotes',
      error: error.message
    });
  }
});

// GET /api/batches/:id - Get single batch with packaging details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const batch = await db('batches')
      .leftJoin('recipes', 'batches.recipe_id', 'recipes.id')
      .leftJoin('products', 'recipes.product_id', 'products.id')
      .select(
        'batches.*',
        'recipes.nombre as recipe_name',
        'products.nombre as product_name'
      )
      .where('batches.id', id)
      .first();
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Lote no encontrado'
      });
    }
    
    // Get packaging details
    const packaging = await db('batch_packaging')
      .leftJoin('products', 'batch_packaging.product_id', 'products.id')
      .select(
        'batch_packaging.*',
        'products.nombre as product_name'
      )
      .where('batch_packaging.batch_id', id);
    
    const transformedBatch = transformBatch(batch);
    transformedBatch.packaging = packaging.map(transformPackaging);
    
    res.json({
      success: true,
      data: transformedBatch
    });
  } catch (error) {
    logger.error('Error fetching batch:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener lote',
      error: error.message
    });
  }
});

// POST /api/batches - Create new batch
router.post('/', async (req, res) => {
  try {
    const {
      codigoLote,
      recipeId,
      fechaProduccion,
      notas
    } = req.body;
    
    // Validation
    if (!codigoLote || !recipeId) {
      return res.status(400).json({
        success: false,
        message: 'Código de lote y receta son requeridos'
      });
    }
    
    // Check if recipe exists
    const recipe = await db('recipes').where('id', recipeId).first();
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }
    
    // Check if batch code already exists
    const existingBatch = await db('batches').where('codigo_lote', codigoLote).first();
    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un lote con este código'
      });
    }
    
    // Calculate recipe cost
    const ingredients = await db('recipe_ingredients')
      .where('recipe_id', recipeId);
    
    const costoTotal = ingredients.reduce((sum, ing) => {
      return sum + parseFloat(ing.costo_calculado || 0);
    }, 0);
    
    const mexicoTime = getMexicoCentralTime();
    
    const [newBatch] = await db('batches').insert({
      codigo_lote: codigoLote,
      recipe_id: recipeId,
      fecha_produccion: fechaProduccion || mexicoTime.toISOString().split('T')[0],
      cantidad_producida: recipe.rendimiento,
      unidad: recipe.unidad_rendimiento,
      costo_total_calculado: costoTotal,
      estado: 'planificado',
      notas,
      created_at: mexicoTime,
      updated_at: mexicoTime
    }).returning('*');
    
    logger.info(`Batch created: ${newBatch.codigo_lote}`);
    
    res.status(201).json({
      success: true,
      message: 'Lote creado exitosamente',
      data: transformBatch(newBatch)
    });
  } catch (error) {
    logger.error('Error creating batch:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear lote',
      error: error.message
    });
  }
});

// PUT /api/batches/:id - Update batch
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      codigoLote,
      fechaProduccion,
      cantidadProducida,
      estado,
      notas
    } = req.body;
    
    const existingBatch = await db('batches').where('id', id).first();
    
    if (!existingBatch) {
      return res.status(404).json({
        success: false,
        message: 'Lote no encontrado'
      });
    }
    
    const mexicoTime = getMexicoCentralTime();
    
    const updateData = {
      updated_at: mexicoTime
    };
    
    if (codigoLote !== undefined) updateData.codigo_lote = codigoLote;
    if (fechaProduccion !== undefined) updateData.fecha_produccion = fechaProduccion;
    if (cantidadProducida !== undefined) updateData.cantidad_producida = parseFloat(cantidadProducida);
    if (estado !== undefined) updateData.estado = estado;
    if (notas !== undefined) updateData.notas = notas;
    
    const [updatedBatch] = await db('batches')
      .where('id', id)
      .update(updateData)
      .returning('*');
    
    logger.info(`Batch updated: ${updatedBatch.codigo_lote}`);
    
    res.json({
      success: true,
      message: 'Lote actualizado exitosamente',
      data: transformBatch(updatedBatch)
    });
  } catch (error) {
    logger.error('Error updating batch:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar lote',
      error: error.message
    });
  }
});

// DELETE /api/batches/:id - Delete batch
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const batch = await db('batches').where('id', id).first();
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Lote no encontrado'
      });
    }
    
    // Don't allow deletion of completed batches
    if (batch.estado === 'completado') {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un lote completado'
      });
    }
    
    await db('batches').where('id', id).delete();
    
    logger.info(`Batch deleted: ${batch.codigo_lote}`);
    
    res.json({
      success: true,
      message: 'Lote eliminado exitosamente'
    });
  } catch (error) {
    logger.error('Error deleting batch:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar lote',
      error: error.message
    });
  }
});

// POST /api/batches/:id/complete - Complete batch production with packaging
router.post('/:id/complete', async (req, res) => {
  const trx = await db.transaction();
  
  try {
    const { id } = req.params;
    const { packaging } = req.body; // Array of { productId, tipoBolsa, cantidadBolsas, almacen }
    
    // Validation
    if (!packaging || !Array.isArray(packaging) || packaging.length === 0) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: 'Información de empaque es requerida'
      });
    }
    
    const batch = await trx('batches').where('id', id).first();
    
    if (!batch) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        message: 'Lote no encontrado'
      });
    }
    
    if (batch.estado === 'completado') {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: 'Este lote ya fue completado'
      });
    }
    
    const mexicoTime = getMexicoCentralTime();
    
    // Update batch status
    await trx('batches')
      .where('id', id)
      .update({
        estado: 'completado',
        updated_at: mexicoTime
      });
    
    // Create packaging records and update inventory
    for (const pack of packaging) {
      const { productId, tipoBolsa, cantidadBolsas, almacen } = pack;
      
      // Insert packaging record
      await trx('batch_packaging').insert({
        batch_id: id,
        product_id: productId,
        tipo_bolsa: tipoBolsa,
        cantidad_bolsas: parseInt(cantidadBolsas),
        almacen,
        created_at: mexicoTime
      });
      
      // Update or create inventory entry
      const existingInventory = await trx('inventory')
        .where({
          product_id: productId,
          almacen: almacen
        })
        .first();
      
      if (existingInventory) {
        await trx('inventory')
          .where('id', existingInventory.id)
          .update({
            cantidad: parseFloat(existingInventory.cantidad) + parseInt(cantidadBolsas),
            updated_at: mexicoTime
          });
      } else {
        await trx('inventory').insert({
          product_id: productId,
          almacen: almacen,
          cantidad: parseInt(cantidadBolsas),
          created_at: mexicoTime,
          updated_at: mexicoTime
        });
      }
      
      // Record inventory movement
      await trx('inventory_movements').insert({
        product_id: productId,
        user_id: 1, // TODO: Get from auth session
        almacen: almacen,
        tipo: 'produccion',
        cantidad_anterior: existingInventory ? parseFloat(existingInventory.cantidad) : 0,
        cantidad_movimiento: parseInt(cantidadBolsas),
        cantidad_nueva: existingInventory ? parseFloat(existingInventory.cantidad) + parseInt(cantidadBolsas) : parseInt(cantidadBolsas),
        motivo: `Producción de lote ${batch.codigo_lote}`,
        referencia_id: id,
        referencia_tipo: 'batch',
        created_at: mexicoTime,
        updated_at: mexicoTime
      });
    }
    
    // Optionally: Deduct raw materials from stock
    const recipe = await trx('recipes').where('id', batch.recipe_id).first();
    const ingredients = await trx('recipe_ingredients')
      .where('recipe_id', batch.recipe_id);
    
    for (const ingredient of ingredients) {
      const rawMaterial = await trx('raw_materials')
        .where('id', ingredient.raw_material_id)
        .first();
      
      if (rawMaterial && rawMaterial.stock_actual >= ingredient.cantidad) {
        await trx('raw_materials')
          .where('id', ingredient.raw_material_id)
          .update({
            stock_actual: parseFloat(rawMaterial.stock_actual) - parseFloat(ingredient.cantidad),
            updated_at: mexicoTime
          });
      }
    }
    
    await trx.commit();
    
    logger.info(`Batch completed: ${batch.codigo_lote} with ${packaging.length} packaging(s)`);
    
    res.json({
      success: true,
      message: 'Lote completado exitosamente. Inventario actualizado.',
      data: {
        batchId: id,
        codigoLote: batch.codigo_lote,
        packaging: packaging
      }
    });
  } catch (error) {
    await trx.rollback();
    logger.error('Error completing batch:', error);
    res.status(500).json({
      success: false,
      message: 'Error al completar lote',
      error: error.message
    });
  }
});

module.exports = router;
