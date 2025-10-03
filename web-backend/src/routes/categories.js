const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { protect, authorize } = require('../middleware/auth');

// Helper function to transform category data
const transformCategory = (dbCategory) => ({
  id: dbCategory.id,
  nombre: dbCategory.nombre,
  descripcion: dbCategory.descripcion,
  color: dbCategory.color,
  activo: dbCategory.activo,
  createdAt: dbCategory.created_at,
  updatedAt: dbCategory.updated_at
});

// GET /api/categories - Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const { activo } = req.query;
    
    let query = db('categories').select('*');
    
    if (activo !== undefined) {
      query = query.where('activo', activo === 'true');
    }
    
    const categories = await query.orderBy('nombre');
    
    res.json({
      success: true,
      data: categories.map(transformCategory)
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las categorías'
    });
  }
});

// GET /api/categories/:id - Obtener una categoría por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await db('categories')
      .where('id', id)
      .first();
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: transformCategory(category)
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la categoría'
    });
  }
});

// POST /api/categories - Crear una nueva categoría
router.post('/', protect, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { nombre, descripcion, color, activo } = req.body;
    
    // Validate required fields
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la categoría es requerido'
      });
    }
    
    // Check if category name already exists
    const existingCategory = await db('categories')
      .where('nombre', nombre)
      .first();
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre'
      });
    }
    
    const [newCategory] = await db('categories')
      .insert({
        nombre,
        descripcion: descripcion || null,
        color: color || '#1976d2',
        activo: activo !== undefined ? activo : true
      })
      .returning('*');
    
    res.status(201).json({
      success: true,
      data: transformCategory(newCategory),
      message: 'Categoría creada exitosamente'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la categoría'
    });
  }
});

// PUT /api/categories/:id - Actualizar una categoría
router.put('/:id', protect, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, color, activo } = req.body;
    
    // Check if category exists
    const existingCategory = await db('categories')
      .where('id', id)
      .first();
    
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    // Check if new name conflicts with existing category
    if (nombre && nombre !== existingCategory.nombre) {
      const nameConflict = await db('categories')
        .where('nombre', nombre)
        .where('id', '!=', id)
        .first();
      
      if (nameConflict) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una categoría con ese nombre'
        });
      }
    }
    
    const [updatedCategory] = await db('categories')
      .where('id', id)
      .update({
        nombre: nombre || existingCategory.nombre,
        descripcion: descripcion !== undefined ? descripcion : existingCategory.descripcion,
        color: color || existingCategory.color,
        activo: activo !== undefined ? activo : existingCategory.activo,
        updated_at: new Date()
      })
      .returning('*');

    // If the category name changed, update all products that use this category
    if (nombre && nombre !== existingCategory.nombre) {
      await db('products')
        .where('categoria', existingCategory.nombre)
        .update({ categoria: nombre });
    }
    
    res.json({
      success: true,
      data: transformCategory(updatedCategory),
      message: 'Categoría actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la categoría'
    });
  }
});

// DELETE /api/categories/:id - Eliminar una categoría
router.delete('/:id', protect, authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const existingCategory = await db('categories')
      .where('id', id)
      .first();
    
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    // Check if category is being used by products
    const productsUsingCategory = await db('products')
      .where('categoria', existingCategory.nombre)
      .count('* as count')
      .first();
    
    if (parseInt(productsUsingCategory.count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar la categoría porque está siendo utilizada por productos'
      });
    }
    
    await db('categories')
      .where('id', id)
      .del();
    
    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la categoría'
    });
  }
});

// GET /api/categories/:id/products - Obtener productos de una categoría
router.get('/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await db('categories')
      .where('id', id)
      .first();
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    const products = await db('products')
      .where('categoria', category.nombre)
      .select('id', 'nombre', 'precio', 'activo')
      .orderBy('nombre');
    
    res.json({
      success: true,
      data: {
        category: transformCategory(category),
        products: products.map(product => ({
          id: product.id,
          nombre: product.nombre,
          precio: parseFloat(product.precio),
          activo: product.activo
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching category products:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los productos de la categoría'
    });
  }
});

module.exports = router;
