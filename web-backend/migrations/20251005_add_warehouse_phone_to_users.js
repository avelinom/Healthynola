/**
 * Migration: Add warehouse and phone columns to users table
 * Date: 2025-10-05
 * Description: Adds warehouse and phone columns to users table for complete user management
 */

exports.up = async function(knex) {
  console.log('Adding warehouse and phone columns to users table...');
  
  await knex.schema.table('users', function(table) {
    table.string('warehouse').defaultTo('Principal');
    table.string('phone').nullable();
  });
  
  console.log('✅ Warehouse and phone columns added successfully');
};

exports.down = async function(knex) {
  console.log('Removing warehouse and phone columns from users table...');
  
  await knex.schema.table('users', function(table) {
    table.dropColumn('warehouse');
    table.dropColumn('phone');
  });
  
  console.log('❌ Warehouse and phone columns removed');
};

