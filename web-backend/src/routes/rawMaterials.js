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

// Transform raw material data for frontend
const transformRawMaterial = (dbRawMaterial) => {
  return {
    id: dbRawMaterial.id,
    nombre: dbRawMaterial.nombre,
    descripcion: dbRawMaterial.descripcion,
    unidadMedida: dbRawMaterial.unidad_medida,
    costoPorUnidad: parseFloat(dbRawMaterial.costo_por_unidad),
    proveedor: dbRawMaterial.proveedor,
    stockActual: parseFloat(dbRawMaterial.stock_actual || 0),
    stockMinimo: parseFloat(dbRawMaterial.stock_minimo || 0),
    notas: dbRawMaterial.notas,
    activo: dbRawMaterial.activo,
    createdAt: dbRawMaterial.created_at,
    updatedAt: dbRawMaterial.updated_at
  };
};

// GET /api/raw-materials - Get all raw materials
router.get('/', async (req, res) => {
  try {
    const { activo } = req.query;
    
    let query = db('raw_materials').select('*').orderBy('nombre', 'asc');
    
    if (activo !== undefined) {
      query = query.where('activo', activo === 'true');
    }
    
    const rawMaterials = await query;
    const transformed = rawMaterials.map(transformRawMaterial);
    
    res.json({
      success: true,
      data: transformed
    });
  } catch (error) {
    logger.error('Error fetching raw materials:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener materia prima',
      error: error.message
    });
  }
});

// GET /api/raw-materials/:id - Get single raw material
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const rawMaterial = await db('raw_materials')
      .where('id', id)
      .first();
    
    if (!rawMaterial) {
      return res.status(404).json({
        success: false,
        message: 'Materia prima no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: transformRawMaterial(rawMaterial)
    });
  } catch (error) {
    logger.error('Error fetching raw material:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener materia prima',
      error: error.message
    });
  }
});

// POST /api/raw-materials - Create new raw material
router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      unidadMedida,
      costoPorUnidad,
      proveedor,
      stockActual,
      stockMinimo,
      notas
    } = req.body;
    
    // Validation
    if (!nombre || !unidadMedida || costoPorUnidad === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, unidad de medida y costo son requeridos'
      });
    }
    
    const mexicoTime = getMexicoCentralTime();
    
    const [newRawMaterial] = await db('raw_materials').insert({
      nombre,
      descripcion,
      unidad_medida: unidadMedida,
      costo_por_unidad: parseFloat(costoPorUnidad),
      proveedor,
      stock_actual: stockActual ? parseFloat(stockActual) : 0,
      stock_minimo: stockMinimo ? parseFloat(stockMinimo) : 0,
      notas,
      activo: true,
      created_at: mexicoTime,
      updated_at: mexicoTime
    }).returning('*');
    
    logger.info(`Raw material created: ${newRawMaterial.nombre}`);
    
    res.status(201).json({
      success: true,
      message: 'Materia prima creada exitosamente',
      data: transformRawMaterial(newRawMaterial)
    });
  } catch (error) {
    logger.error('Error creating raw material:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear materia prima',
      error: error.message
    });
  }
});

// PUT /api/raw-materials/:id - Update raw material
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      unidadMedida,
      costoPorUnidad,
      proveedor,
      stockActual,
      stockMinimo,
      notas,
      activo
    } = req.body;
    
    const existingRawMaterial = await db('raw_materials').where('id', id).first();
    
    if (!existingRawMaterial) {
      return res.status(404).json({
        success: false,
        message: 'Materia prima no encontrada'
      });
    }
    
    const mexicoTime = getMexicoCentralTime();
    
    const updateData = {
      updated_at: mexicoTime
    };
    
    if (nombre !== undefined) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (unidadMedida !== undefined) updateData.unidad_medida = unidadMedida;
    if (costoPorUnidad !== undefined) updateData.costo_por_unidad = parseFloat(costoPorUnidad);
    if (proveedor !== undefined) updateData.proveedor = proveedor;
    if (stockActual !== undefined) updateData.stock_actual = parseFloat(stockActual);
    if (stockMinimo !== undefined) updateData.stock_minimo = parseFloat(stockMinimo);
    if (notas !== undefined) updateData.notas = notas;
    if (activo !== undefined) updateData.activo = activo;
    
    const [updatedRawMaterial] = await db('raw_materials')
      .where('id', id)
      .update(updateData)
      .returning('*');
    
    logger.info(`Raw material updated: ${updatedRawMaterial.nombre}`);
    
    res.json({
      success: true,
      message: 'Materia prima actualizada exitosamente',
      data: transformRawMaterial(updatedRawMaterial)
    });
  } catch (error) {
    logger.error('Error updating raw material:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar materia prima',
      error: error.message
    });
  }
});

// DELETE /api/raw-materials/:id - Delete raw material
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if raw material is used in any recipes
    const usedInRecipes = await db('recipe_ingredients')
      .where('raw_material_id', id)
      .count('* as count')
      .first();
    
    if (parseInt(usedInRecipes.count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar. Esta materia prima está siendo usada en recetas.'
      });
    }
    
    const deleted = await db('raw_materials')
      .where('id', id)
      .delete();
    
    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: 'Materia prima no encontrada'
      });
    }
    
    logger.info(`Raw material deleted: ID ${id}`);
    
    res.json({
      success: true,
      message: 'Materia prima eliminada exitosamente'
    });
  } catch (error) {
    logger.error('Error deleting raw material:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar materia prima',
      error: error.message
    });
  }
});

// PUT /api/raw-materials/:id/update-stock - Update stock
router.put('/:id/update-stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { change, reason } = req.body;
    
    if (change === undefined) {
      return res.status(400).json({
        success: false,
        message: 'El cambio de stock es requerido'
      });
    }
    
    const rawMaterial = await db('raw_materials').where('id', id).first();
    
    if (!rawMaterial) {
      return res.status(404).json({
        success: false,
        message: 'Materia prima no encontrada'
      });
    }
    
    const newStock = parseFloat(rawMaterial.stock_actual) + parseFloat(change);
    
    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock insuficiente'
      });
    }
    
    const mexicoTime = getMexicoCentralTime();
    
    const [updated] = await db('raw_materials')
      .where('id', id)
      .update({
        stock_actual: newStock,
        updated_at: mexicoTime
      })
      .returning('*');
    
    logger.info(`Raw material stock updated: ${rawMaterial.nombre}, change: ${change}, reason: ${reason || 'N/A'}`);
    
    res.json({
      success: true,
      message: 'Stock actualizado exitosamente',
      data: transformRawMaterial(updated)
    });
  } catch (error) {
    logger.error('Error updating raw material stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar stock',
      error: error.message
    });
  }
});

module.exports = router;
