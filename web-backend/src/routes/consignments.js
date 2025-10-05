const express = require('express');
const router = express.Router();
const knex = require('../config/database');

// Middleware de autenticación
const { protect } = require('../middleware/auth');

// GET /api/consignments - Obtener todas las consignaciones
router.get('/', async (req, res) => {
  try {
    const consignments = await knex('consignments')
      .join('customers', 'consignments.client_id', 'customers.id')
      .join('products', 'consignments.product_id', 'products.id')
      .join('sales', 'consignments.sale_id', 'sales.id')
      .select(
        'consignments.*',
        'customers.nombre as client_name',
        'customers.telefono as client_phone',
        'customers.direccion as client_address',
        'products.nombre as product_name',
        'sales.vendedor as responsible_user'
      )
      .orderBy('consignments.next_visit_date', 'asc');

    res.json({
      success: true,
      data: consignments
    });
  } catch (error) {
    console.error('Error fetching consignments:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener consignaciones'
    });
  }
});

// GET /api/consignments/visits - Obtener todas las visitas
router.get('/visits', async (req, res) => {
  try {
    const visits = await knex('consignment_visits')
      .join('consignments', 'consignment_visits.consignment_id', 'consignments.id')
      .join('customers', 'consignments.client_id', 'customers.id')
      .join('products', 'consignments.product_id', 'products.id')
      .join('sales', 'consignments.sale_id', 'sales.id')
      .select(
        'consignment_visits.*',
        'customers.nombre as client_name',
        'products.nombre as product_name',
        'sales.vendedor as responsible_user',
        'consignments.quantity',
        'consignments.payment_status',
        'consignments.delivery_date'
      )
      .orderBy('consignment_visits.visit_date', 'asc');

    res.json({
      success: true,
      data: visits
    });
  } catch (error) {
    console.error('Error fetching visits:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener visitas'
    });
  }
});

// POST /api/consignments - Crear nueva consignación
router.post('/', async (req, res) => {
  try {
    const { sale_id, client_id, product_id, quantity, delivery_date, payment_status, amount_paid, next_visit_date, notes } = req.body;

    const consignment = await knex('consignments')
      .insert({
        sale_id,
        client_id,
        product_id,
        quantity,
        delivery_date,
        payment_status: payment_status || 'pending',
        amount_paid: amount_paid || 0,
        next_visit_date,
        notes
      })
      .returning('*');

    // Crear visita automáticamente
    await knex('consignment_visits').insert({
      consignment_id: consignment[0].id,
      visit_date: next_visit_date,
      visit_type: 'delivery',
      status: 'programada',
      notes: 'Visita programada automáticamente'
    });

    res.json({
      success: true,
      data: consignment[0],
      message: 'Consignación creada exitosamente'
    });
  } catch (error) {
    console.error('Error creating consignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear consignación'
    });
  }
});

// PUT /api/consignments/:id - Actualizar consignación
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const consignment = await knex('consignments')
      .where('id', id)
      .update({
        ...updates,
        updated_at: new Date()
      })
      .returning('*');

    if (consignment.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Consignación no encontrada'
      });
    }

    res.json({
      success: true,
      data: consignment[0],
      message: 'Consignación actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error updating consignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar consignación'
    });
  }
});

// PUT /api/consignments/visits/:id - Actualizar visita
router.put('/visits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const visit = await knex('consignment_visits')
      .where('id', id)
      .update({
        ...updates,
        updated_at: new Date()
      })
      .returning('*');

    if (visit.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Visita no encontrada'
      });
    }

    res.json({
      success: true,
      data: visit[0],
      message: 'Visita actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error updating visit:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar visita'
    });
  }
});

// DELETE /api/consignments/:id - Eliminar consignación
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Eliminar visitas relacionadas primero
    await knex('consignment_visits').where('consignment_id', id).del();

    const deleted = await knex('consignments').where('id', id).del();

    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: 'Consignación no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Consignación eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting consignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar consignación'
    });
  }
});

// GET /api/consignments/stats - Obtener estadísticas de visitas
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = knex('consignment_visits');
    
    if (startDate && endDate) {
      query = query.whereBetween('visit_date', [startDate, endDate]);
    } else {
      // Última semana por defecto
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      query = query.where('visit_date', '>=', oneWeekAgo.toISOString().split('T')[0]);
    }

    const visits = await query.select('status');
    
    const stats = {
      total: visits.length,
      programadas: visits.filter(v => v.status === 'programada').length,
      hechas: visits.filter(v => v.status === 'hecha').length,
      por_hacer: visits.filter(v => v.status === 'por_hacer').length
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching visit stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de visitas'
    });
  }
});

module.exports = router;
