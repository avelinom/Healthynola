const express = require('express');
const router = express.Router();
const knex = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// @route   GET /api/roles
// @desc    Get all roles
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const roles = await knex('roles')
      .select('*')
      .orderBy('created_at', 'desc');
    
    logger.info(`Roles list retrieved: ${roles.length} roles`);
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    logger.error('Error fetching roles:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/roles/:id
// @desc    Get a single role by ID
// @access  Private (Admin only)
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const role = await knex('roles')
      .where({ id })
      .first();
    
    if (!role) {
      return res.status(404).json({ success: false, error: 'Rol no encontrado' });
    }
    
    res.status(200).json({ success: true, data: role });
  } catch (error) {
    logger.error('Error fetching role:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/roles
// @desc    Create a new role
// @access  Private (Admin only)
router.post(
  '/',
  [
    protect,
    authorize('admin'),
    body('name').notEmpty().withMessage('El nombre interno es requerido')
      .matches(/^[a-z0-9_-]+$/).withMessage('El nombre solo puede contener letras minúsculas, números, guiones y guiones bajos'),
    body('display_name').notEmpty().withMessage('El nombre visible es requerido'),
    body('description').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, display_name, description } = req.body;

    try {
      // Check if role already exists
      const existingRole = await knex('roles').where({ name }).first();
      if (existingRole) {
        return res.status(400).json({ success: false, error: 'Ya existe un rol con este nombre' });
      }

      const [role] = await knex('roles')
        .insert({
          name,
          display_name,
          description,
          is_system: false,
          active: true,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now(),
        })
        .returning('*');

      // Initialize permissions for the new role (all modules with no access by default)
      const modules = [
        'dashboard', 'estadisticas', 'sales', 'customers', 'products', 'inventory',
        'transfers', 'expenses', 'reports', 'users', 'roles', 'settings',
        'categories', 'warehouses', 'raw-materials', 'recipes', 'batches',
        'production', 'packaging-types', 'consignment-visits'
      ];
      const initialPermissions = modules.map(module => ({
        role: name,
        module,
        has_access: false,
        mobile_dashboard_visible: false,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      }));
      await knex('role_permissions').insert(initialPermissions);

      logger.info(`Role created: ${name}`);
      res.status(201).json({ success: true, message: 'Rol creado exitosamente', data: role });
    } catch (error) {
      logger.error('Error creating role:', error);
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({ success: false, error: 'Duplicate field value entered' });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// @route   PUT /api/roles/:id
// @desc    Update a role
// @access  Private (Admin only)
router.put(
  '/:id',
  [
    protect,
    authorize('admin'),
    body('display_name').optional().notEmpty().withMessage('El nombre visible no puede estar vacío'),
    body('description').optional().isString(),
    body('active').optional().isBoolean()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { display_name, description, active } = req.body;

    try {
      const role = await knex('roles').where({ id }).first();
      
      if (!role) {
        return res.status(404).json({ success: false, error: 'Rol no encontrado' });
      }

      // Prevent modification of system roles' name
      if (role.is_system && req.body.name) {
        return res.status(403).json({ success: false, error: 'No se puede modificar el nombre de un rol del sistema' });
      }

      const updateData = {
        updated_at: knex.fn.now(),
      };

      if (display_name !== undefined) updateData.display_name = display_name;
      if (description !== undefined) updateData.description = description;
      if (active !== undefined) updateData.active = active;

      const [updatedRole] = await knex('roles')
        .where({ id })
        .update(updateData)
        .returning('*');

      logger.info(`Role updated: ${updatedRole.name}`);
      res.status(200).json({ success: true, message: 'Rol actualizado exitosamente', data: updatedRole });
    } catch (error) {
      logger.error('Error updating role:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// @route   DELETE /api/roles/:id
// @desc    Delete a role
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const role = await knex('roles').where({ id }).first();
    
    if (!role) {
      return res.status(404).json({ success: false, error: 'Rol no encontrado' });
    }

    // Prevent deletion of system roles
    if (role.is_system) {
      return res.status(403).json({ success: false, error: 'No se puede eliminar un rol del sistema' });
    }

    // Check if any users have this role
    const usersWithRole = await knex('users').where({ role: role.name }).count('* as count');
    if (parseInt(usersWithRole[0].count) > 0) {
      return res.status(400).json({ 
        success: false, 
        error: `No se puede eliminar el rol porque hay ${usersWithRole[0].count} usuario(s) asignado(s)` 
      });
    }

    // Delete role permissions
    await knex('role_permissions').where({ role: role.name }).del();
    
    // Delete role
    await knex('roles').where({ id }).del();

    logger.info(`Role deleted: ${role.name}`);
    res.status(200).json({ success: true, message: 'Rol eliminado exitosamente' });
  } catch (error) {
    logger.error('Error deleting role:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/roles/:id/permissions
// @desc    Get permissions for a specific role
// @access  Private (Admin only)
router.get('/:id/permissions', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const role = await knex('roles').where({ id }).first();
    if (!role) {
      return res.status(404).json({ success: false, error: 'Rol no encontrado' });
    }
    
    const permissions = await knex('role_permissions')
      .where({ role: role.name })
      .select('*');
    
    res.status(200).json({ success: true, data: permissions });
  } catch (error) {
    logger.error('Error fetching role permissions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

