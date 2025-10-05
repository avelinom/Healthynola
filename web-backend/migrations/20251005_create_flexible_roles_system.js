/**
 * Migration: Create flexible roles system
 * - Creates 'roles' table for dynamic role management
 * - Adds 'mobile_dashboard_visible' column to 'role_permissions'
 * - Migrates existing hardcoded roles to 'roles' table
 */

exports.up = async function(knex) {
  console.log('📝 Creating flexible roles system...');
  
  // 1. Create 'roles' table
  await knex.schema.createTable('roles', function(table) {
    table.increments('id').primary();
    table.string('name', 50).notNullable().unique().comment('Internal role identifier (e.g. "admin", "cashier")');
    table.string('display_name', 100).notNullable().comment('Display name (e.g. "Administrador", "Cajero")');
    table.text('description').nullable().comment('Role description');
    table.boolean('is_system').defaultTo(false).comment('System roles cannot be deleted');
    table.boolean('active').defaultTo(true).comment('Active/Inactive status');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
  
  console.log('✅ Table "roles" created');
  
  // 2. Add 'mobile_dashboard_visible' column to 'role_permissions'
  await knex.schema.table('role_permissions', function(table) {
    table.boolean('mobile_dashboard_visible').defaultTo(true).comment('Show this module card on mobile dashboard');
  });
  
  console.log('✅ Added "mobile_dashboard_visible" to "role_permissions"');
  
  // 3. Insert system roles (existing hardcoded roles)
  await knex('roles').insert([
    {
      name: 'admin',
      display_name: 'Administrador',
      description: 'Acceso completo al sistema',
      is_system: true,
      active: true
    },
    {
      name: 'manager',
      display_name: 'Gerente',
      description: 'Gestión de operaciones y reportes',
      is_system: true,
      active: true
    },
    {
      name: 'salesperson',
      display_name: 'Vendedor',
      description: 'Registro de ventas y consultas',
      is_system: true,
      active: true
    },
    {
      name: 'cashier',
      display_name: 'Cajero',
      description: 'Operaciones de caja y ventas',
      is_system: true,
      active: true
    }
  ]);
  
  console.log('✅ System roles inserted');
  
  // 4. Update existing role_permissions to set mobile_dashboard_visible = true by default
  await knex('role_permissions').update({ mobile_dashboard_visible: true });
  
  console.log('✅ Updated existing permissions with mobile_dashboard_visible');
  
  console.log('🎉 Flexible roles system created successfully!');
};

exports.down = async function(knex) {
  console.log('⏪ Rolling back flexible roles system...');
  
  // Remove mobile_dashboard_visible column
  await knex.schema.table('role_permissions', function(table) {
    table.dropColumn('mobile_dashboard_visible');
  });
  
  console.log('✅ Removed "mobile_dashboard_visible" column');
  
  // Drop roles table
  await knex.schema.dropTable('roles');
  
  console.log('✅ Dropped "roles" table');
  console.log('❌ Flexible roles system rolled back');
};



