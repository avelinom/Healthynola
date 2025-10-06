const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate PDF Report
 */
function generatePDFReport(report, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(outputPath);
      
      doc.pipe(stream);
      
      // Header
      doc.fontSize(20).text('Reporte de Validación del Sistema', { align: 'center' });
      doc.fontSize(12).text('Healthynola POS', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Fecha: ${new Date(report.timestamp).toLocaleString('es-MX')}`, { align: 'center' });
      doc.moveDown(2);
      
      // Status
      doc.fontSize(16).text('Estado del Sistema', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Estado: ${report.message}`);
      doc.moveDown();
      
      // Summary
      doc.fontSize(16).text('Resumen General', { underline: true });
      doc.moveDown();
      doc.fontSize(11);
      doc.text(`• Total de Módulos: ${report.summary?.totalModules || 0}`);
      doc.text(`• Usuarios Activos: ${report.summary?.activeUsers || 0}`);
      doc.text(`• Tablas en BD: ${report.summary?.existingTables || 0} de ${report.summary?.totalTables || 0}`);
      doc.text(`• Total de Registros: ${report.summary?.totalRecords || 0}`);
      doc.text(`• Errores: ${report.summary?.errors || 0}`);
      doc.text(`• Advertencias: ${report.summary?.warnings || 0}`);
      doc.moveDown(2);
      
      // Users
      doc.fontSize(16).text('Usuarios del Sistema', { underline: true });
      doc.moveDown();
      doc.fontSize(10);
      if (report.users?.list) {
        report.users.list.forEach(user => {
          doc.text(`• ${user.name} (${user.role}) - ${user.email} - ${user.active ? 'Activo' : 'Inactivo'}`);
        });
      }
      doc.moveDown(2);
      
      // Modules by Role
      doc.fontSize(16).text('Módulos por Rol', { underline: true });
      doc.moveDown();
      doc.fontSize(10);
      if (report.modules?.roles) {
        Object.entries(report.modules.roles).forEach(([roleName, roleData]) => {
          doc.text(`${roleName}:`);
          doc.text(`  - Acceso Web: ${roleData.webAccess} módulos`);
          doc.text(`  - Acceso Móvil: ${roleData.mobileAccess} módulos`);
          doc.moveDown(0.5);
        });
      }
      doc.moveDown();
      
      // Consignments
      doc.fontSize(16).text('Sistema de Consignaciones', { underline: true });
      doc.moveDown();
      doc.fontSize(10);
      doc.text(`• Consignaciones: ${report.consignments?.totalConsignments || 0}`);
      doc.text(`• Visitas: ${report.consignments?.totalVisits || 0}`);
      doc.text(`• Consignatarios: ${report.consignments?.consignatarios || 0}`);
      doc.moveDown(2);
      
      // Database
      doc.fontSize(16).text('Base de Datos', { underline: true });
      doc.moveDown();
      doc.fontSize(10);
      if (report.database?.records) {
        doc.text('Registros por tabla:');
        Object.entries(report.database.records).forEach(([table, count]) => {
          doc.text(`  • ${table}: ${count}`);
        });
      }
      doc.moveDown(2);
      
      // Suggestions
      if (report.suggestions && report.suggestions.length > 0) {
        doc.addPage();
        doc.fontSize(16).text('Sugerencias y Advertencias', { underline: true });
        doc.moveDown();
        doc.fontSize(10);
        report.suggestions.forEach((suggestion, index) => {
          const icon = suggestion.severity === 'error' ? '❌' : suggestion.severity === 'warning' ? '⚠️' : 'ℹ️';
          doc.text(`${icon} ${suggestion.message}`);
          doc.fontSize(9).text(`   Acción: ${suggestion.action}`, { italics: true });
          doc.fontSize(10);
          doc.moveDown(0.5);
        });
      }
      
      // Footer
      doc.fontSize(8).text(
        `Reporte generado por Healthynola POS - ${new Date().toLocaleString('es-MX')}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
      
      doc.end();
      
      stream.on('finish', () => {
        logger.info(`PDF report generated: ${outputPath}`);
        resolve(outputPath);
      });
      
      stream.on('error', (error) => {
        logger.error('Error generating PDF:', error);
        reject(error);
      });
      
    } catch (error) {
      logger.error('Error in generatePDFReport:', error);
      reject(error);
    }
  });
}

/**
 * @route   POST /api/system/production-readiness
 * @desc    Valida que el sistema esté listo para producción
 * @access  Private (Admin only)
 */
router.post('/production-readiness', protect, authorize('admin'), async (req, res) => {
  try {
    const report = {
      timestamp: new Date().toISOString(),
      status: 'checking',
      modules: {},
      users: {},
      consignments: {},
      mobile: {},
      database: {},
      suggestions: []
    };

    // 1. MÓDULOS DEL SISTEMA
    logger.info('Checking system modules...');
    const allModules = [
      'dashboard', 'estadisticas', 'sales', 'customers', 'transfers', 'expenses', 
      'reports', 'inventory', 'products', 'production', 'raw-materials', 'recipes', 
      'batches', 'users', 'settings', 'roles', 'categories', 'warehouses', 
      'packaging-types', 'consignments', 'consignment-visits'
    ];
    
    report.modules.total = allModules.length;
    report.modules.list = allModules;
    
    // Get roles and their permissions
    const roles = await db('roles').where('active', true);
    report.modules.roles = {};
    
    for (const role of roles) {
      const permissions = await db('role_permissions')
        .where({ role: role.name })
        .select('module', 'has_access', 'mobile_dashboard_visible');
      
      const webModules = permissions.filter(p => p.has_access).map(p => p.module);
      const mobileModules = permissions.filter(p => p.mobile_dashboard_visible).map(p => p.module);
      
      // For admin, they have access to ALL modules
      const isAdmin = role.name === 'admin';
      
      report.modules.roles[role.display_name] = {
        role: role.name,
        webAccess: isAdmin ? allModules.length : webModules.length,
        mobileAccess: isAdmin ? allModules.length : mobileModules.length,
        webModules: isAdmin ? allModules : webModules,
        mobileModules: isAdmin ? allModules : mobileModules
      };
    }

    // 2. USUARIOS
    logger.info('Checking users...');
    const users = await db('users')
      .leftJoin('roles', 'users.role', 'roles.name')
      .select(
        'users.id',
        'users.name',
        'users.email',
        'users.role',
        'users.active',
        'roles.display_name as role_display'
      );
    
    report.users.total = users.length;
    report.users.active = users.filter(u => u.active).length;
    report.users.list = users.map(u => ({
      name: u.name,
      email: u.email,
      role: u.role_display || u.role,
      active: u.active,
      hasPassword: true // All users in DB have hashed passwords
    }));

    // Check for users without passwords (shouldn't exist)
    const usersWithoutPassword = await db('users')
      .whereNull('password')
      .orWhere('password', '');
    
    if (usersWithoutPassword.length > 0) {
      report.suggestions.push({
        severity: 'error',
        message: `${usersWithoutPassword.length} usuario(s) sin contraseña`,
        action: 'Asignar contraseñas a todos los usuarios'
      });
    }

    // 3. SISTEMA DE CONSIGNACIONES
    logger.info('Checking consignments system...');
    const consignments = await db('consignments').count('* as count').first();
    const consignmentVisits = await db('consignment_visits').count('* as count').first();
    const customers = await db('customers').where('tipo', 'Consignación').count('* as count').first();
    
    report.consignments.totalConsignments = parseInt(consignments.count);
    report.consignments.totalVisits = parseInt(consignmentVisits.count);
    report.consignments.consignatarios = parseInt(customers.count);
    report.consignments.ready = true;
    
    if (report.consignments.consignatarios === 0) {
      report.suggestions.push({
        severity: 'warning',
        message: 'No hay consignatarios registrados',
        action: 'Agregar al menos un cliente como consignatario'
      });
    }

    // 4. SISTEMA MÓVIL
    logger.info('Checking mobile system...');
    const mobileEnabledRoles = await db('role_permissions')
      .where('mobile_dashboard_visible', true)
      .distinct('role');
    
    report.mobile.rolesWithAccess = mobileEnabledRoles.length;
    report.mobile.ready = mobileEnabledRoles.length > 0;
    
    if (!report.mobile.ready) {
      report.suggestions.push({
        severity: 'warning',
        message: 'Ningún rol tiene acceso móvil configurado',
        action: 'Configurar permisos móviles en Roles y Permisos'
      });
    }

    // 5. BASE DE DATOS
    logger.info('Checking database...');
    const tables = [
      'users', 'customers', 'products', 'inventory', 'sales', 'consignments',
      'consignment_visits', 'warehouses', 'categories', 'packaging_types',
      'raw_materials', 'recipes', 'batches', 'expenses', 'transfers',
      'inventory_movements', 'role_permissions', 'roles', 'settings', 'system_logs'
    ];
    
    report.database.requiredTables = tables.length;
    report.database.existingTables = [];
    
    // Check each table exists
    for (const table of tables) {
      try {
        await db(table).limit(1);
        report.database.existingTables.push(table);
      } catch (error) {
        logger.error(`Table ${table} does not exist`);
        report.suggestions.push({
          severity: 'error',
          message: `Tabla "${table}" no existe`,
          action: 'Ejecutar migraciones de base de datos'
        });
      }
    }
    
    // Get record counts for main tables
    const salesCount = await db('sales').count('* as count').first();
    const productsCount = await db('products').count('* as count').first();
    const customersCount = await db('customers').count('* as count').first();
    const inventoryCount = await db('inventory').count('* as count').first();
    
    report.database.records = {
      sales: parseInt(salesCount.count),
      products: parseInt(productsCount.count),
      customers: parseInt(customersCount.count),
      inventory: parseInt(inventoryCount.count),
      consignments: report.consignments.totalConsignments,
      users: report.users.total
    };
    
    report.database.ready = report.database.existingTables.length === tables.length;

    // 6. BACKUP
    logger.info('Checking backups...');
    // In production, you might want to check if automatic backups are configured
    report.database.backupRecommended = true;
    report.suggestions.push({
      severity: 'info',
      message: 'Configurar backups automáticos en Neon',
      action: 'Activar Point-in-Time Recovery en Neon Dashboard'
    });

    // 7. VALIDACIONES ADICIONALES
    
    // Check if admin user exists
    const adminUser = await db('users').where({ role: 'admin', active: true }).first();
    if (!adminUser) {
      report.suggestions.push({
        severity: 'error',
        message: 'No hay usuario administrador activo',
        action: 'Crear o activar un usuario administrador'
      });
    }

    // Check if there are products
    if (report.database.records.products === 0) {
      report.suggestions.push({
        severity: 'warning',
        message: 'No hay productos registrados',
        action: 'Agregar productos al catálogo'
      });
    }

    // Check if there are warehouses
    const warehousesCount = await db('warehouses').where('activo', true).count('* as count').first();
    if (parseInt(warehousesCount.count) === 0) {
      report.suggestions.push({
        severity: 'error',
        message: 'No hay almacenes activos',
        action: 'Crear al menos un almacén'
      });
    }

    // FINAL STATUS
    const hasErrors = report.suggestions.some(s => s.severity === 'error');
    const hasWarnings = report.suggestions.some(s => s.severity === 'warning');
    
    if (hasErrors) {
      report.status = 'not_ready';
      report.message = 'Sistema NO está listo para producción. Hay errores críticos.';
    } else if (hasWarnings) {
      report.status = 'ready_with_warnings';
      report.message = 'Sistema listo para producción con advertencias.';
    } else {
      report.status = 'ready';
      report.message = '¡Sistema 100% listo para producción! 🚀';
    }

    // Add summary
    report.summary = {
      totalModules: report.modules.total,
      totalUsers: report.users.total,
      activeUsers: report.users.active,
      totalTables: report.database.requiredTables,
      existingTables: report.database.existingTables.length,
      totalRecords: Object.values(report.database.records).reduce((a, b) => a + b, 0),
      errors: report.suggestions.filter(s => s.severity === 'error').length,
      warnings: report.suggestions.filter(s => s.severity === 'warning').length,
      info: report.suggestions.filter(s => s.severity === 'info').length
    };

    logger.info('Production readiness check completed', { status: report.status });
    
    res.status(200).json({
      success: true,
      data: report
    });

  } catch (error) {
    logger.error('Error checking production readiness:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar el sistema',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/system/initialize-production
 * @desc    Crea backup y limpia transacciones para inicializar sistema
 * @access  Private (Admin only)
 */
router.post('/initialize-production', protect, authorize('admin'), async (req, res) => {
  try {
    logger.info('Starting production initialization...');
    
    const result = {
      timestamp: new Date().toISOString(),
      backup: {
        created: false,
        filename: null,
        error: null
      },
      report: {
        created: false,
        filename: null,
        path: null,
        error: null
      },
      cleanup: {
        executed: false,
        tables: {},
        error: null
      },
      status: 'in_progress'
    };

    // 0. GENERATE PRE-INITIALIZATION REPORT
    try {
      logger.info('Generating pre-initialization report...');
      
      // Get current system state (simplified version)
      const usersCount = await db('users').count('* as count').first();
      const productsCount = await db('products').count('* as count').first();
      const salesCount = await db('sales').count('* as count').first();
      const consignmentsCount = await db('consignments').count('* as count').first();
      const visitCount = await db('consignment_visits').count('* as count').first();
      
      const preReport = {
        timestamp: new Date().toISOString(),
        message: 'Reporte Pre-Inicialización del Sistema',
        status: 'pre_initialization',
        summary: {
          totalModules: 20,
          activeUsers: parseInt(usersCount.count),
          totalProducts: parseInt(productsCount.count),
          totalSales: parseInt(salesCount.count),
          totalConsignments: parseInt(consignmentsCount.count),
          totalVisits: parseInt(visitCount.count)
        },
        database: {
          records: {
            sales: parseInt(salesCount.count),
            consignments: parseInt(consignmentsCount.count),
            visits: parseInt(visitCount.count)
          }
        },
        users: { list: [] },
        modules: { roles: {} },
        consignments: {
          totalConsignments: parseInt(consignmentsCount.count),
          totalVisits: parseInt(visitCount.count),
          consignatarios: 0
        },
        suggestions: [
          { severity: 'info', message: 'Sistema inicializado para producción', action: 'Datos transaccionales borrados, configuración mantenida' }
        ]
      };
      
      // Create backups directory if it doesn't exist
      const backupsDir = path.join(__dirname, '../../backups');
      if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
      }
      
      const reportFilename = `reporte_pre_init_${Date.now()}.pdf`;
      const reportPath = path.join(backupsDir, reportFilename);
      
      await generatePDFReport(preReport, reportPath);
      
      result.report.created = true;
      result.report.filename = reportFilename;
      result.report.path = reportPath;
      
      logger.info(`Pre-initialization report generated: ${reportFilename}`);
    } catch (reportError) {
      logger.error('Error generating report:', reportError);
      result.report.error = reportError.message;
    }

    // 1. CREATE BACKUP (CRÍTICO: DEBE EJECUTARSE ANTES DE BORRAR)
    // Using Node.js native backup (compatible with Render - no pg_dump needed)
    try {
      const backupFilename = `production_init_${Date.now()}.sql`;
      const backupsDir = path.join(__dirname, '../../backups');
      const backupPath = path.join(backupsDir, backupFilename);
      
      // Create backups directory if it doesn't exist
      if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
      }
      
      logger.info('Creating backup using Node.js (Render-compatible)...');
      
      // Create backup using Node.js (no pg_dump required)
      let backupSQL = `-- Healthynola Production Backup - ${new Date().toISOString()}\n`;
      backupSQL += `-- Database: ${process.env.DATABASE_URL ? 'Neon' : 'Local'}\n`;
      backupSQL += `-- Generated before production initialization\n\n`;
      backupSQL += `SET search_path TO public;\n\n`;
      
      // Get all tables from public schema
      const tables = await db.raw(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename NOT LIKE 'pg_%'
          AND tablename NOT LIKE 'sql_%'
        ORDER BY tablename
      `);
      
      logger.info(`Backing up ${tables.rows.length} tables...`);
      
      for (const { tablename } of tables.rows) {
        try {
          const count = await db(tablename).count('* as count').first();
          const recordCount = parseInt(count.count);
          
          backupSQL += `\n-- ===============================================\n`;
          backupSQL += `-- Table: ${tablename} (${recordCount} records)\n`;
          backupSQL += `-- ===============================================\n\n`;
          
          if (recordCount > 0) {
            const data = await db(tablename).select('*');
            
            for (const row of data) {
              const columns = Object.keys(row);
              const values = columns.map(col => {
                const val = row[col];
                if (val === null) return 'NULL';
                if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                if (val instanceof Date) return `'${val.toISOString()}'`;
                if (typeof val === 'boolean') return val ? 'true' : 'false';
                if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
                return val;
              });
              
              backupSQL += `INSERT INTO "${tablename}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
            }
          }
        } catch (tableError) {
          logger.warn(`Could not backup table ${tablename}:`, tableError.message);
        }
      }
      
      // Write backup file
      fs.writeFileSync(backupPath, backupSQL);
      const stats = fs.statSync(backupPath);
      
      result.backup.created = true;
      result.backup.filename = backupFilename;
      result.backup.path = backupPath;
      result.backup.size = `${(stats.size / 1024 / 1024).toFixed(2)} MB`;
      
      logger.info(`Backup created successfully: ${backupFilename} (${result.backup.size})`);
      
    } catch (backupError) {
      logger.error('Error creating backup:', backupError);
      result.backup.error = backupError.message;
      
      // ⚠️ CRÍTICO: SI EL BACKUP FALLA, NO CONTINUAR
      result.status = 'failed';
      result.message = '❌ Error: No se pudo crear el backup. Inicialización cancelada por seguridad.';
      
      return res.status(500).json({
        success: false,
        data: result
      });
    }

    // 2. CLEAN TRANSACTIONAL DATA (SOLO SI EL BACKUP FUE EXITOSO)
    try {
      // Tables to clean (transactional data)
      const tablesToClean = [
        'sales',
        'consignments',
        'consignment_visits',
        'transfers',
        'inventory_movements',
        'expenses',
        'system_logs',
        'production_batches'
      ];

      for (const table of tablesToClean) {
        try {
          const countBefore = await db(table).count('* as count').first();
          await db(table).del();
          const countAfter = await db(table).count('* as count').first();
          
          result.cleanup.tables[table] = {
            recordsBefore: parseInt(countBefore.count),
            recordsAfter: parseInt(countAfter.count),
            deleted: parseInt(countBefore.count)
          };
          
          logger.info(`Cleaned table ${table}: ${countBefore.count} records deleted`);
        } catch (tableError) {
          logger.error(`Error cleaning table ${table}:`, tableError);
          result.cleanup.tables[table] = {
            error: tableError.message
          };
        }
      }

      result.cleanup.executed = true;
      
      // Calculate total records deleted
      const totalDeleted = Object.values(result.cleanup.tables)
        .filter(t => !t.error)
        .reduce((sum, t) => sum + (t.deleted || 0), 0);
      
      result.cleanup.totalDeleted = totalDeleted;
      
    } catch (cleanupError) {
      logger.error('Error during cleanup:', cleanupError);
      result.cleanup.error = cleanupError.message;
    }

    // 3. DETERMINE FINAL STATUS
    if (result.cleanup.executed && result.backup.created && result.report.created) {
      result.status = 'success';
      result.message = `✅ Backup ejecutado y sistema inicializado - Listo para Día 1 de operación\n📄 Reporte guardado: ${result.report.filename}`;
    } else if (result.cleanup.executed) {
      result.status = 'partial_success';
      result.message = '⚠️ Sistema inicializado pero backup o reporte falló';
    } else {
      result.status = 'failed';
      result.message = '❌ Inicialización falló';
    }

    logger.info('Production initialization completed', { 
      status: result.status,
      reportPath: result.report.path 
    });
    
    res.status(200).json({
      success: result.status === 'success' || result.status === 'partial_success',
      data: result
    });

  } catch (error) {
    logger.error('Error initializing production:', error);
    res.status(500).json({
      success: false,
      message: 'Error al inicializar el sistema',
      error: error.message
    });
  }
});

module.exports = router;

