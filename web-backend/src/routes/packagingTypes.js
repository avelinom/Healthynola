const express = require('express');
const router = express.Router();
const db = require('../config/database');
const logger = require('../utils/logger');
const { authenticate, authorize } = require('../middleware/auth');

// Get all packaging types
router.get('/', async (req, res) => {
  try {
    const { includeInactive } = req.query;
    
    let query = db('packaging_types').select('*').orderBy('peso_kg', 'desc');
    
    if (!includeInactive) {
      query = query.where('activo', true);
    }
    
    const packagingTypes = await query;
    
    res.json({
      success: true,
      data: packagingTypes
    });
  } catch (error) {
    logger.error('Error fetching packaging types:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los tipos de empaque'
    });
  }
});

// Get single packaging type
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const packagingType = await db('packaging_types').where({ id }).first();
    
    if (!packagingType) {
      return res.status(404).json({
        success: false,
        error: 'Tipo de empaque no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: packagingType
    });
  } catch (error) {
    logger.error('Error fetching packaging type:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el tipo de empaque'
    });
  }
});

// Create new packaging type
router.post('/', async (req, res) => {
  try {
    const { nombre, etiqueta, peso_kg, tipo_contenedor, unidad_medida, cantidad, activo } = req.body;
    
    // Validate required fields
    if (!nombre || !etiqueta || !tipo_contenedor || !unidad_medida || cantidad === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, etiqueta, tipo_contenedor, unidad_medida y cantidad son requeridos'
      });
    }
    
    // Check if nombre already exists
    const existing = await db('packaging_types').where({ nombre }).first();
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un tipo de empaque con ese nombre'
      });
    }
    
    const [packagingType] = await db('packaging_types')
      .insert({
        nombre,
        etiqueta,
        peso_kg: parseFloat(peso_kg),
        tipo_contenedor,
        unidad_medida,
        cantidad: parseFloat(cantidad),
        activo: activo !== undefined ? activo : true
      })
      .returning('*');
    
    logger.info(`Packaging type created: ${packagingType.nombre}`);
    
    res.status(201).json({
      success: true,
      data: packagingType
    });
  } catch (error) {
    logger.error('Error creating packaging type:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear el tipo de empaque'
    });
  }
});

// Update packaging type
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, etiqueta, peso_kg, tipo_contenedor, unidad_medida, cantidad, activo } = req.body;
    
    // Check if packaging type exists
    const existingType = await db('packaging_types').where({ id }).first();
    if (!existingType) {
      return res.status(404).json({
        success: false,
        error: 'Tipo de empaque no encontrado'
      });
    }
    
    // If nombre is being changed, check for uniqueness
    if (nombre && nombre !== existingType.nombre) {
      const duplicate = await db('packaging_types').where({ nombre }).first();
      if (duplicate) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe un tipo de empaque con ese nombre'
        });
      }
    }
    
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (etiqueta !== undefined) updateData.etiqueta = etiqueta;
    if (peso_kg !== undefined) updateData.peso_kg = parseFloat(peso_kg);
    if (tipo_contenedor !== undefined) updateData.tipo_contenedor = tipo_contenedor;
    if (unidad_medida !== undefined) updateData.unidad_medida = unidad_medida;
    if (cantidad !== undefined) updateData.cantidad = parseFloat(cantidad);
    if (activo !== undefined) updateData.activo = activo;
    updateData.updated_at = db.fn.now();
    
    const [packagingType] = await db('packaging_types')
      .where({ id })
      .update(updateData)
      .returning('*');
    
    logger.info(`Packaging type updated: ${packagingType.nombre}`);
    
    res.json({
      success: true,
      data: packagingType
    });
  } catch (error) {
    logger.error('Error updating packaging type:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el tipo de empaque'
    });
  }
});

// Delete packaging type
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if packaging type exists
    const packagingType = await db('packaging_types').where({ id }).first();
    if (!packagingType) {
      return res.status(404).json({
        success: false,
        error: 'Tipo de empaque no encontrado'
      });
    }
    
    await db('packaging_types').where({ id }).del();
    
    logger.info(`Packaging type deleted: ${packagingType.nombre}`);
    
    res.json({
      success: true,
      message: 'Tipo de empaque eliminado correctamente'
    });
  } catch (error) {
    logger.error('Error deleting packaging type:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar el tipo de empaque'
    });
  }
});

module.exports = router;

