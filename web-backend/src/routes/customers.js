const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Transform database customer to frontend format
const transformCustomer = (dbCustomer) => {
  return {
    id: dbCustomer.id,
    name: dbCustomer.nombre,
    email: dbCustomer.email,
    phone: dbCustomer.telefono,
    address: dbCustomer.direccion,
    type: dbCustomer.tipo,
    notes: dbCustomer.notas,
    active: dbCustomer.activo,
    created_at: dbCustomer.created_at,
    updated_at: dbCustomer.updated_at
  };
};

// GET /api/customers - Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const customers = await db('customers').select('*').orderBy('nombre');
    const transformedCustomers = customers.map(transformCustomer);
    res.json({
      success: true,
      data: transformedCustomers
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clientes',
      error: error.message
    });
  }
});

// GET /api/customers/:id - Obtener un cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await db('customers').where('id', id).first();
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: transformCustomer(customer)
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cliente',
      error: error.message
    });
  }
});

// POST /api/customers - Crear un nuevo cliente
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address, type, notes, active } = req.body;
    
    const [newCustomer] = await db('customers')
      .insert({
        nombre: name,
        email,
        telefono: phone,
        direccion: address,
        tipo: type,
        notas: notes,
        activo: active !== undefined ? active : true,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: transformCustomer(newCustomer)
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cliente',
      error: error.message
    });
  }
});

// PUT /api/customers/:id - Actualizar un cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, type, notes, active } = req.body;
    
    const updated = await db('customers')
      .where('id', id)
      .update({
        nombre: name,
        email,
        telefono: phone,
        direccion: address,
        tipo: type,
        notas: notes,
        activo: active,
        updated_at: new Date()
      });
    
    if (updated === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    const updatedCustomer = await db('customers').where('id', id).first();
    
    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: transformCustomer(updatedCustomer)
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cliente',
      error: error.message
    });
  }
});

// DELETE /api/customers/:id - Eliminar un cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await db('customers').where('id', id).del();
    
    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cliente',
      error: error.message
    });
  }
});

module.exports = router;