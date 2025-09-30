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

// Transform recipe data for frontend
const transformRecipe = (dbRecipe) => {
  return {
    id: dbRecipe.id,
    nombre: dbRecipe.nombre,
    descripcion: dbRecipe.descripcion,
    productId: dbRecipe.product_id,
    productName: dbRecipe.product_name,
    rendimiento: parseFloat(dbRecipe.rendimiento),
    unidadRendimiento: dbRecipe.unidad_rendimiento,
    notas: dbRecipe.notas,
    activo: dbRecipe.activo,
    createdAt: dbRecipe.created_at,
    updatedAt: dbRecipe.updated_at
  };
};

// Transform ingredient data for frontend
const transformIngredient = (dbIngredient) => {
  return {
    id: dbIngredient.id,
    recipeId: dbIngredient.recipe_id,
    rawMaterialId: dbIngredient.raw_material_id,
    rawMaterialName: dbIngredient.raw_material_name,
    cantidad: parseFloat(dbIngredient.cantidad),
    unidad: dbIngredient.unidad,
    costoCalculado: parseFloat(dbIngredient.costo_calculado || 0),
    costoPorUnidad: parseFloat(dbIngredient.costo_por_unidad || 0),
    createdAt: dbIngredient.created_at,
    updatedAt: dbIngredient.updated_at
  };
};

// GET /api/recipes - Get all recipes
router.get('/', async (req, res) => {
  try {
    const { activo } = req.query;
    
    let query = db('recipes')
      .leftJoin('products', 'recipes.product_id', 'products.id')
      .select(
        'recipes.*',
        'products.nombre as product_name'
      )
      .orderBy('recipes.nombre', 'asc');
    
    if (activo !== undefined) {
      query = query.where('recipes.activo', activo === 'true');
    }
    
    const recipes = await query;
    const transformed = recipes.map(transformRecipe);
    
    res.json({
      success: true,
      data: transformed
    });
  } catch (error) {
    logger.error('Error fetching recipes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recetas',
      error: error.message
    });
  }
});

// GET /api/recipes/:id - Get single recipe with ingredients
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const recipe = await db('recipes')
      .leftJoin('products', 'recipes.product_id', 'products.id')
      .select(
        'recipes.*',
        'products.nombre as product_name'
      )
      .where('recipes.id', id)
      .first();
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }
    
    // Get ingredients
    const ingredients = await db('recipe_ingredients')
      .join('raw_materials', 'recipe_ingredients.raw_material_id', 'raw_materials.id')
      .select(
        'recipe_ingredients.*',
        'raw_materials.nombre as raw_material_name',
        'raw_materials.costo_por_unidad'
      )
      .where('recipe_ingredients.recipe_id', id);
    
    const transformedRecipe = transformRecipe(recipe);
    transformedRecipe.ingredients = ingredients.map(transformIngredient);
    
    res.json({
      success: true,
      data: transformedRecipe
    });
  } catch (error) {
    logger.error('Error fetching recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener receta',
      error: error.message
    });
  }
});

// POST /api/recipes - Create new recipe
router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      productId,
      rendimiento,
      unidadRendimiento,
      notas
    } = req.body;
    
    // Validation
    if (!nombre || !rendimiento || !unidadRendimiento) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, rendimiento y unidad son requeridos'
      });
    }
    
    const mexicoTime = getMexicoCentralTime();
    
    const [newRecipe] = await db('recipes').insert({
      nombre,
      descripcion,
      product_id: productId || null,
      rendimiento: parseFloat(rendimiento),
      unidad_rendimiento: unidadRendimiento,
      notas,
      activo: true,
      created_at: mexicoTime,
      updated_at: mexicoTime
    }).returning('*');
    
    logger.info(`Recipe created: ${newRecipe.nombre}`);
    
    res.status(201).json({
      success: true,
      message: 'Receta creada exitosamente',
      data: transformRecipe(newRecipe)
    });
  } catch (error) {
    logger.error('Error creating recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear receta',
      error: error.message
    });
  }
});

// PUT /api/recipes/:id - Update recipe
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      productId,
      rendimiento,
      unidadRendimiento,
      notas,
      activo
    } = req.body;
    
    const existingRecipe = await db('recipes').where('id', id).first();
    
    if (!existingRecipe) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }
    
    const mexicoTime = getMexicoCentralTime();
    
    const updateData = {
      updated_at: mexicoTime
    };
    
    if (nombre !== undefined) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (productId !== undefined) updateData.product_id = productId || null;
    if (rendimiento !== undefined) updateData.rendimiento = parseFloat(rendimiento);
    if (unidadRendimiento !== undefined) updateData.unidad_rendimiento = unidadRendimiento;
    if (notas !== undefined) updateData.notas = notas;
    if (activo !== undefined) updateData.activo = activo;
    
    const [updatedRecipe] = await db('recipes')
      .where('id', id)
      .update(updateData)
      .returning('*');
    
    logger.info(`Recipe updated: ${updatedRecipe.nombre}`);
    
    res.json({
      success: true,
      message: 'Receta actualizada exitosamente',
      data: transformRecipe(updatedRecipe)
    });
  } catch (error) {
    logger.error('Error updating recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar receta',
      error: error.message
    });
  }
});

// DELETE /api/recipes/:id - Delete recipe
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if recipe is used in any batches
    const usedInBatches = await db('batches')
      .where('recipe_id', id)
      .count('* as count')
      .first();
    
    if (parseInt(usedInBatches.count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar. Esta receta está siendo usada en lotes.'
      });
    }
    
    const deleted = await db('recipes')
      .where('id', id)
      .delete();
    
    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }
    
    logger.info(`Recipe deleted: ID ${id}`);
    
    res.json({
      success: true,
      message: 'Receta eliminada exitosamente'
    });
  } catch (error) {
    logger.error('Error deleting recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar receta',
      error: error.message
    });
  }
});

// POST /api/recipes/:id/ingredients - Add ingredient to recipe
router.post('/:id/ingredients', async (req, res) => {
  try {
    const { id } = req.params;
    const { rawMaterialId, cantidad, unidad } = req.body;
    
    // Validation
    if (!rawMaterialId || !cantidad || !unidad) {
      return res.status(400).json({
        success: false,
        message: 'Materia prima, cantidad y unidad son requeridos'
      });
    }
    
    // Check if recipe exists
    const recipe = await db('recipes').where('id', id).first();
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }
    
    // Check if raw material exists and get its cost
    const rawMaterial = await db('raw_materials').where('id', rawMaterialId).first();
    if (!rawMaterial) {
      return res.status(404).json({
        success: false,
        message: 'Materia prima no encontrada'
      });
    }
    
    // Calculate cost
    const costoCalculado = parseFloat(cantidad) * parseFloat(rawMaterial.costo_por_unidad);
    
    const mexicoTime = getMexicoCentralTime();
    
    const [newIngredient] = await db('recipe_ingredients').insert({
      recipe_id: id,
      raw_material_id: rawMaterialId,
      cantidad: parseFloat(cantidad),
      unidad,
      costo_calculado: costoCalculado,
      created_at: mexicoTime,
      updated_at: mexicoTime
    }).returning('*');
    
    logger.info(`Ingredient added to recipe ${id}: ${rawMaterial.nombre}`);
    
    res.status(201).json({
      success: true,
      message: 'Ingrediente añadido exitosamente',
      data: transformIngredient({
        ...newIngredient,
        raw_material_name: rawMaterial.nombre,
        costo_por_unidad: rawMaterial.costo_por_unidad
      })
    });
  } catch (error) {
    logger.error('Error adding ingredient:', error);
    res.status(500).json({
      success: false,
      message: 'Error al añadir ingrediente',
      error: error.message
    });
  }
});

// PUT /api/recipes/:recipeId/ingredients/:ingredientId - Update ingredient
router.put('/:recipeId/ingredients/:ingredientId', async (req, res) => {
  try {
    const { ingredientId } = req.params;
    const { cantidad, unidad } = req.body;
    
    const ingredient = await db('recipe_ingredients')
      .where('id', ingredientId)
      .first();
    
    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Ingrediente no encontrado'
      });
    }
    
    // Get raw material cost
    const rawMaterial = await db('raw_materials')
      .where('id', ingredient.raw_material_id)
      .first();
    
    const mexicoTime = getMexicoCentralTime();
    
    const updateData = {
      updated_at: mexicoTime
    };
    
    if (cantidad !== undefined) {
      updateData.cantidad = parseFloat(cantidad);
      updateData.costo_calculado = parseFloat(cantidad) * parseFloat(rawMaterial.costo_por_unidad);
    }
    if (unidad !== undefined) {
      updateData.unidad = unidad;
    }
    
    const [updated] = await db('recipe_ingredients')
      .where('id', ingredientId)
      .update(updateData)
      .returning('*');
    
    logger.info(`Ingredient updated: ID ${ingredientId}`);
    
    res.json({
      success: true,
      message: 'Ingrediente actualizado exitosamente',
      data: transformIngredient({
        ...updated,
        raw_material_name: rawMaterial.nombre,
        costo_por_unidad: rawMaterial.costo_por_unidad
      })
    });
  } catch (error) {
    logger.error('Error updating ingredient:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar ingrediente',
      error: error.message
    });
  }
});

// DELETE /api/recipes/:recipeId/ingredients/:ingredientId - Remove ingredient
router.delete('/:recipeId/ingredients/:ingredientId', async (req, res) => {
  try {
    const { ingredientId } = req.params;
    
    const deleted = await db('recipe_ingredients')
      .where('id', ingredientId)
      .delete();
    
    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ingrediente no encontrado'
      });
    }
    
    logger.info(`Ingredient deleted: ID ${ingredientId}`);
    
    res.json({
      success: true,
      message: 'Ingrediente eliminado exitosamente'
    });
  } catch (error) {
    logger.error('Error deleting ingredient:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar ingrediente',
      error: error.message
    });
  }
});

// GET /api/recipes/:id/cost - Calculate total recipe cost
router.get('/:id/cost', async (req, res) => {
  try {
    const { id } = req.params;
    
    const recipe = await db('recipes').where('id', id).first();
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada'
      });
    }
    
    const ingredients = await db('recipe_ingredients')
      .join('raw_materials', 'recipe_ingredients.raw_material_id', 'raw_materials.id')
      .select(
        'recipe_ingredients.*',
        'raw_materials.nombre as raw_material_name',
        'raw_materials.costo_por_unidad'
      )
      .where('recipe_ingredients.recipe_id', id);
    
    const totalCost = ingredients.reduce((sum, ing) => {
      return sum + parseFloat(ing.costo_calculado || 0);
    }, 0);
    
    const costoPorUnidad = totalCost / parseFloat(recipe.rendimiento);
    
    res.json({
      success: true,
      data: {
        recipeId: parseInt(id),
        recipeName: recipe.nombre,
        rendimiento: parseFloat(recipe.rendimiento),
        unidadRendimiento: recipe.unidad_rendimiento,
        totalCost: parseFloat(totalCost.toFixed(2)),
        costoPorUnidad: parseFloat(costoPorUnidad.toFixed(2)),
        ingredients: ingredients.map(ing => ({
          name: ing.raw_material_name,
          cantidad: parseFloat(ing.cantidad),
          unidad: ing.unidad,
          costoPorUnidad: parseFloat(ing.costo_por_unidad),
          costoTotal: parseFloat(ing.costo_calculado)
        }))
      }
    });
  } catch (error) {
    logger.error('Error calculating recipe cost:', error);
    res.status(500).json({
      success: false,
      message: 'Error al calcular costo de receta',
      error: error.message
    });
  }
});

module.exports = router;
