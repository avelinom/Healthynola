const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Helper to transform warehouse from DB to frontend format
const transformWarehouse = (dbWarehouse) => {
  if (!dbWarehouse) return null;
  return {
    id: dbWarehouse.id,
    nombre: dbWarehouse.nombre,
    codigo: dbWarehouse.codigo,
    direccion: dbWarehouse.direccion,
    telefono: dbWarehouse.telefono,
    responsable: dbWarehouse.responsable,
    activo: dbWarehouse.activo,
    createdAt: dbWarehouse.created_at,
    updatedAt: dbWarehouse.updated_at
  };
};

// GET /api/warehouses - Get all warehouses
router.get('/', async (req, res) => {
  try {
    const { includeInactive } = req.query;
    
    let query = db('warehouses');
    
    // Filter by active status unless includeInactive is true
    if (includeInactive !== 'true') {
      query = query.where('activo', true);
    }
    
    const warehouses = await query.orderBy('nombre', 'asc');
    
    res.json({
      success: true,
      data: warehouses.map(transformWarehouse)
    });
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener almacenes',
      error: error.message
    });
  }
});

// GET /api/warehouses/:id - Get a single warehouse by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const warehouse = await db('warehouses')
      .where('id', id)
      .first();
    
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Almacén no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: transformWarehouse(warehouse)
    });
  } catch (error) {
    console.error('Error fetching warehouse:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener almacén',
      error: error.message
    });
  }
});

// POST /api/warehouses - Create a new warehouse
router.post('/', async (req, res) => {
  try {
    const { nombre, codigo, direccion, telefono, responsable, activo } = req.body;
    
    // Validate required fields
    if (!nombre || !codigo) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y código son requeridos'
      });
    }
    
    // Check if codigo already exists
    const existingWarehouse = await db('warehouses')
      .where('codigo', codigo)
      .first();
    
    if (existingWarehouse) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un almacén con ese código'
      });
    }
    
    const [newWarehouse] = await db('warehouses')
      .insert({
        nombre,
        codigo,
        direccion: direccion || null,
        telefono: telefono || null,
        responsable: responsable || null,
        activo: activo !== undefined ? activo : true
      })
      .returning('*');
    
    res.status(201).json({
      success: true,
      message: 'Almacén creado exitosamente',
      data: transformWarehouse(newWarehouse)
    });
  } catch (error) {
    console.error('Error creating warehouse:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear almacén',
      error: error.message
    });
  }
});

// PUT /api/warehouses/:id - Update a warehouse
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, codigo, direccion, telefono, responsable, activo } = req.body;
    
    // Check if warehouse exists
    const existingWarehouse = await db('warehouses')
      .where('id', id)
      .first();
    
    if (!existingWarehouse) {
      return res.status(404).json({
        success: false,
        message: 'Almacén no encontrado'
      });
    }
    
    // Validate required fields
    if (!nombre || !codigo) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y código son requeridos'
      });
    }
    
    // Check if codigo already exists for another warehouse
    if (codigo !== existingWarehouse.codigo) {
      const duplicateWarehouse = await db('warehouses')
        .where('codigo', codigo)
        .whereNot('id', id)
        .first();
      
      if (duplicateWarehouse) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro almacén con ese código'
        });
      }
    }
    
    const [updatedWarehouse] = await db('warehouses')
      .where('id', id)
      .update({
        nombre,
        codigo,
        direccion: direccion || null,
        telefono: telefono || null,
        responsable: responsable || null,
        activo: activo !== undefined ? activo : existingWarehouse.activo,
        updated_at: new Date()
      })
      .returning('*');
    
    res.json({
      success: true,
      message: 'Almacén actualizado exitosamente',
      data: transformWarehouse(updatedWarehouse)
    });
  } catch (error) {
    console.error('Error updating warehouse:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar almacén',
      error: error.message
    });
  }
});

// DELETE /api/warehouses/:id - Delete a warehouse
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if warehouse exists
    const warehouse = await db('warehouses')
      .where('id', id)
      .first();
    
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Almacén no encontrado'
      });
    }
    
    // Check if warehouse is used in inventory
    const inventoryCount = await db('inventory')
      .where('almacen', warehouse.codigo)
      .count('* as count')
      .first();
    
    if (parseInt(inventoryCount.count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el almacén porque tiene inventario asociado'
      });
    }
    
    // Check if warehouse is used in sales
    const salesCount = await db('sales')
      .where('almacen', warehouse.codigo)
      .count('* as count')
      .first();
    
    if (parseInt(salesCount.count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el almacén porque tiene ventas asociadas'
      });
    }
    
    await db('warehouses')
      .where('id', id)
      .delete();
    
    res.json({
      success: true,
      message: 'Almacén eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting warehouse:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar almacén',
      error: error.message
    });
  }
});

module.exports = router;

