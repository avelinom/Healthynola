const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const db = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/users - Listar todos los usuarios (sin passwords)
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const users = await db('users')
      .select('id', 'name', 'email', 'role', 'active', 'warehouse', 'phone', 'last_login', 'created_at')
      .orderBy('created_at', 'desc');
    
    logger.info(`Users list retrieved: ${users.length} users`);
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    next(error);
  }
});

// POST /api/users - Crear nuevo usuario
router.post('/', [
  protect,
  authorize('admin'),
  body('name').notEmpty().withMessage('Nombre es requerido'),
  body('email').isEmail().withMessage('Email válido es requerido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener mínimo 6 caracteres'),
  body('role').isIn(['admin', 'manager', 'cashier', 'salesperson']).withMessage('Rol inválido')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { name, email, password, role, warehouse, phone, active = true } = req.body;

    // Verificar si el email ya existe
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    const [newUser] = await db('users')
      .insert({
        name,
        email,
        password: hashedPassword,
        role,
        warehouse: warehouse || 'Principal',
        phone: phone || null,
        active,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning(['id', 'name', 'email', 'role', 'active', 'warehouse', 'phone', 'created_at']);

    logger.info(`User created: ${newUser.email} (${newUser.role})`);

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: newUser
    });
  } catch (error) {
    logger.error('Error creating user:', error);
    next(error);
  }
});

// PUT /api/users/:id - Actualizar usuario (sin contraseña)
router.put('/:id', [
  protect,
  authorize('admin'),
  body('name').optional().notEmpty().withMessage('Nombre no puede estar vacío'),
  body('email').optional().isEmail().withMessage('Email debe ser válido'),
  body('role').optional().isIn(['admin', 'manager', 'cashier', 'salesperson']).withMessage('Rol inválido')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name, email, role, warehouse, phone, active } = req.body;

    // Verificar que el usuario existe
    const user = await db('users').where({ id }).first();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Si se está cambiando el email, verificar que no exista
    if (email && email !== user.email) {
      const existingUser = await db('users').where({ email }).first();
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }
    }

    // Actualizar usuario
    const updateData = {
      updated_at: new Date()
    };
    
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (warehouse !== undefined) updateData.warehouse = warehouse;
    if (phone !== undefined) updateData.phone = phone;
    if (active !== undefined) updateData.active = active;

    await db('users').where({ id }).update(updateData);

    const updatedUser = await db('users')
      .select('id', 'name', 'email', 'role', 'active', 'warehouse', 'phone', 'last_login', 'created_at')
      .where({ id })
      .first();

    logger.info(`User updated: ${updatedUser.email}`);

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: updatedUser
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    next(error);
  }
});

// PUT /api/users/:id/password - Cambiar contraseña
router.put('/:id/password', [
  protect,
  body('newPassword').isLength({ min: 6 }).withMessage('Nueva contraseña debe tener mínimo 6 caracteres'),
  body('confirmPassword').custom((value, { req }) => value === req.body.newPassword).withMessage('Las contraseñas no coinciden')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Verificar que el usuario existe
    const user = await db('users').where({ id }).first();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Si un usuario cambia su propia contraseña, debe proporcionar la actual
    if (req.user.id === parseInt(id)) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña actual es requerida'
        });
      }

      // Verificar contraseña actual
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
      }
    } 
    // Si un admin cambia la contraseña de otro usuario, no necesita la contraseña actual
    else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para cambiar esta contraseña'
      });
    }

    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar contraseña
    await db('users')
      .where({ id })
      .update({
        password: hashedPassword,
        updated_at: new Date()
      });

    logger.info(`Password changed for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    logger.error('Error changing password:', error);
    next(error);
  }
});

// PATCH /api/users/:id/toggle-status - Activar/desactivar usuario
router.patch('/:id/toggle-status', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const user = await db('users').where({ id }).first();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir desactivar al último admin
    if (user.role === 'admin' && user.active) {
      const activeAdmins = await db('users').where({ role: 'admin', active: true }).count('* as count');
      if (parseInt(activeAdmins[0].count) <= 1) {
        return res.status(400).json({
          success: false,
          message: 'No se puede desactivar al último administrador'
        });
      }
    }

    // Toggle active status
    const newStatus = !user.active;
    await db('users')
      .where({ id })
      .update({
        active: newStatus,
        updated_at: new Date()
      });

    const updatedUser = await db('users')
      .select('id', 'name', 'email', 'role', 'active', 'warehouse', 'phone', 'last_login', 'created_at')
      .where({ id })
      .first();

    logger.info(`User ${newStatus ? 'activated' : 'deactivated'}: ${updatedUser.email}`);

    res.json({
      success: true,
      message: `Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente`,
      data: updatedUser
    });
  } catch (error) {
    logger.error('Error toggling user status:', error);
    next(error);
  }
});

// DELETE /api/users/:id - Eliminar usuario
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const user = await db('users').where({ id }).first();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir eliminar administradores
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un administrador'
      });
    }

    // Eliminar usuario
    await db('users').where({ id }).del();

    logger.info(`User deleted: ${user.email}`);

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    next(error);
  }
});

module.exports = router;

