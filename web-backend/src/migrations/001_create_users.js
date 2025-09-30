exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.enum('role', ['admin', 'manager', 'cashier']).notNullable().defaultTo('cashier');
    table.boolean('active').notNullable().defaultTo(true);
    table.timestamp('last_login');
    table.timestamps(true, true);
    
    table.index(['email']);
    table.index(['role']);
    table.index(['active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
