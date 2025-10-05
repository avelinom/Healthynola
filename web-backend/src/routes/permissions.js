const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

// GET /api/permissions - Get permissions (all roles for admin, own role for others)
router.get('/', protect, async (req, res, next) => {
  try {
    const userRole = req.user.role;
    
    // Query builder
    let query = db('role_permissions')
      .select('*')
      .orderBy('role', 'asc')
      .orderBy('module', 'asc');
    
    // If not admin, filter to only their role
    if (userRole !== 'admin') {
      query = query.where('role', userRole);
    }
    
    const permissions = await query;
    
    // Group by role for easier frontend consumption
    const groupedPermissions = permissions.reduce((acc, perm) => {
      if (!acc[perm.role]) {
        acc[perm.role] = {};
      }
      acc[perm.role][perm.module] = {
        has_access: perm.has_access,
        mobile_dashboard_visible: perm.mobile_dashboard_visible !== undefined ? perm.mobile_dashboard_visible : true
      };
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
      { id: 'estadisticas', name: 'Sales Overview', description: 'Métricas y estadísticas del sistema' },
      { id: 'sales', name: 'Ventas', description: 'Registro de ventas' },
      { id: 'customers', name: 'Clientes', description: 'Gestión de clientes' },
      { id: 'products', name: 'Productos', description: 'Catálogo de productos' },
      { id: 'inventory', name: 'Inventario', description: 'Control de inventario' },
      { id: 'transfers', name: 'Transferencias', description: 'Transferir stock' },
      { id: 'expenses', name: 'Gastos', description: 'Registro de gastos' },
      { id: 'reports', name: 'Reportes', description: 'Generación de reportes' },
      { id: 'users', name: 'Usuarios', description: 'Gestión de usuarios' },
      { id: 'roles', name: 'Roles y Permisos', description: 'Configuración de roles del sistema' },
      { id: 'settings', name: 'Configuración', description: 'Configuración del sistema' },
      { id: 'categories', name: 'Categorías', description: 'Gestión de categorías' },
      { id: 'warehouses', name: 'Almacenes', description: 'Gestión de almacenes' },
      { id: 'raw-materials', name: 'Materia Prima', description: 'Gestión de materia prima' },
      { id: 'recipes', name: 'Recetas', description: 'Recetas de producción' },
      { id: 'batches', name: 'Lotes', description: 'Gestión de lotes' },
      { id: 'production', name: 'Producción', description: 'Gestión de producción' },
      { id: 'packaging-types', name: 'Tipos de Empaque', description: 'Gestión de tipos de empaque' },
      { id: 'consignment-visits', name: 'Visitas a Consignatarios', description: 'Gestión de visitas a consignatarios' }
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
    
    // Validate role exists in roles table
    const roleExists = await db('roles').where({ name: role }).first();
    if (!roleExists) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido o no existe'
      });
    }
    
    // Start transaction
    await db.transaction(async (trx) => {
      // Delete existing permissions for this role
      await trx('role_permissions').where('role', role).del();
      
      // Insert new permissions
      const permissionEntries = Object.entries(permissions).map(([module, permData]) => {
        // Support both old format (boolean) and new format (object with has_access and mobile_dashboard_visible)
        const hasAccess = typeof permData === 'boolean' ? permData : (permData.has_access || false);
        const mobileDashboardVisible = typeof permData === 'object' ? 
          (permData.mobile_dashboard_visible !== undefined ? permData.mobile_dashboard_visible : true) : 
          true;
        
        return {
          role,
          module,
          has_access: Boolean(hasAccess),
          mobile_dashboard_visible: Boolean(mobileDashboardVisible),
          created_at: new Date(),
          updated_at: new Date()
        };
      });
      
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
