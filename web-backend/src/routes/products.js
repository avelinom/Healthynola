const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Transform database product to frontend format
const transformProduct = (dbProduct) => {
  return {
    id: dbProduct.id,
    nombre: dbProduct.nombre,
    descripcion: dbProduct.descripcion,
    categoria: dbProduct.categoria,
    precio: parseFloat(dbProduct.precio),
    precioVenta: parseFloat(dbProduct.precio), // Same as precio for now
    costo: parseFloat(dbProduct.costo),
    unidadMedida: dbProduct.unidad_medida,
    stockMinimo: parseFloat(dbProduct.stock_minimo),
    activo: dbProduct.activo,
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at
  };
};

// GET /api/products - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await db('products').select('*').orderBy('nombre');
    const transformedProducts = products.map(transformProduct);
    res.json({
      success: true,
      data: transformedProducts
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
});

// GET /api/products/:id - Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await db('products').where('id', id).first();
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: transformProduct(product)
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto',
      error: error.message
    });
  }
});

// POST /api/products - Crear un nuevo producto
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, categoria, precio, costo, unidadMedida, stockMinimo, activo } = req.body;
    
    const [newProduct] = await db('products')
      .insert({
        nombre,
        descripcion,
        categoria,
        precio,
        costo,
        unidad_medida: unidadMedida,
        stock_minimo: stockMinimo,
        activo: activo !== undefined ? activo : true,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: transformProduct(newProduct)
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear producto',
      error: error.message
    });
  }
});

// PUT /api/products/:id - Actualizar un producto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, categoria, precio, costo, unidadMedida, stockMinimo, activo } = req.body;
    
    const updated = await db('products')
      .where('id', id)
      .update({
        nombre,
        descripcion,
        categoria,
        precio,
        costo,
        unidad_medida: unidadMedida,
        stock_minimo: stockMinimo,
        activo,
        updated_at: new Date()
      });
    
    if (updated === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    const updatedProduct = await db('products').where('id', id).first();
    
    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: transformProduct(updatedProduct)
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar producto',
      error: error.message
    });
  }
});

// DELETE /api/products/:id - Eliminar un producto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await db('products').where('id', id).del();
    
    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto',
      error: error.message
    });
  }
});

module.exports = router;