exports.up = function(knex) {
  return knex.schema.createTable('role_permissions', function(table) {
    table.increments('id').primary();
    table.string('role', 50).notNullable();
    table.string('module', 100).notNullable();
    table.boolean('has_access').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Unique constraint to prevent duplicate role-module combinations
    table.unique(['role', 'module']);
    
    // Index for faster queries
    table.index(['role']);
    table.index(['module']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('role_permissions');
};