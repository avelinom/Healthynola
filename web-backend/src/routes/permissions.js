const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

// GET /api/permissions - Get all permissions for all roles
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const permissions = await db('role_permissions')
      .select('*')
      .orderBy('role', 'asc')
      .orderBy('module', 'asc');
    
    // Group by role for easier frontend consumption
    const groupedPermissions = permissions.reduce((acc, perm) => {
      if (!acc[perm.role]) {
        acc[perm.role] = {};
      }
      acc[perm.role][perm.module] = perm.has_access;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: groupedPermissions
    });
  } catch (error) {
    logger.error('Error fetching permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener permisos',
      error: error.message
    });
  }
});

// GET /api/permissions/modules - Get all available modules
router.get('/modules', protect, authorize('admin'), async (req, res, next) => {
  try {
    const modules = [
      { id: 'dashboard', name: 'Dashboard', description: 'Panel principal' },
      { id: 'sales', name: 'Ventas', description: 'Registro de ventas' },
      { id: 'customers', name: 'Clientes', description: 'Gestión de clientes' },
      { id: 'transfers', name: 'Transferencias', description: 'Transferir stock' },
      { id: 'expenses', name: 'Gastos', description: 'Registro de gastos' },
      { id: 'reports', name: 'Reportes', description: 'Generación de reportes' },
      { id: 'inventory', name: 'Inventario', description: 'Control de inventario' },
      { id: 'products', name: 'Productos', description: 'Catálogo de productos' },
      { id: 'production', name: 'Producción', description: 'Gestión de producción' },
      { id: 'raw-materials', name: 'Materia Prima', description: 'Gestión de materia prima' },
      { id: 'recipes', name: 'Recetas', description: 'Recetas de producción' },
      { id: 'batches', name: 'Lotes', description: 'Gestión de lotes' },
      { id: 'users', name: 'Usuarios', description: 'Gestión de usuarios' },
      { id: 'settings', name: 'Configuración', description: 'Configuración del sistema' }
    ];
    
    res.json({
      success: true,
      data: modules
    });
  } catch (error) {
    logger.error('Error fetching modules:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener módulos',
      error: error.message
    });
  }
});

// PUT /api/permissions - Update permissions for a role
router.put('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { role, permissions } = req.body;
    
    if (!role || !permissions) {
      return res.status(400).json({
        success: false,
        message: 'Rol y permisos son requeridos'
      });
    }
    
    // Validate role
    const validRoles = ['admin', 'manager', 'cashier', 'salesperson'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido'
      });
    }
    
    // Start transaction
    await db.transaction(async (trx) => {
      // Delete existing permissions for this role
      await trx('role_permissions').where('role', role).del();
      
      // Insert new permissions
      const permissionEntries = Object.entries(permissions).map(([module, hasAccess]) => ({
        role,
        module,
        has_access: Boolean(hasAccess),
        created_at: new Date(),
        updated_at: new Date()
      }));
      
      if (permissionEntries.length > 0) {
        await trx('role_permissions').insert(permissionEntries);
      }
    });
    
    logger.info(`Permissions updated for role: ${role}`);
    
    res.json({
      success: true,
      message: 'Permisos actualizados correctamente'
    });
  } catch (error) {
    logger.error('Error updating permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar permisos',
      error: error.message
    });
  }
});

// GET /api/permissions/check/:module - Check if current user has access to a module
router.get('/check/:module', protect, async (req, res, next) => {
  try {
    const { module } = req.params;
    const userRole = req.user.role;
    
    const permission = await db('role_permissions')
      .where({ role: userRole, module })
      .first();
    
    res.json({
      success: true,
      hasAccess: permission ? permission.has_access : false
    });
  } catch (error) {
    logger.error('Error checking permission:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar permiso',
      error: error.message
    });
  }
});

module.exports = router;
