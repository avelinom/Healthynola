exports.up = function(knex) {
  return knex.schema.createTable('system_logs', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned();
    table.string('funcion').notNullable();
    table.string('tipo').notNullable();
    table.text('mensaje').notNullable();
    table.enum('nivel', ['INFO', 'WARNING', 'ERROR', 'SUCCESS']).notNullable();
    table.json('metadata'); // Additional data as JSON
    table.string('ip_address');
    table.string('user_agent');
    table.timestamps(true, true);
    
    table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
    
    table.index(['user_id']);
    table.index(['funcion']);
    table.index(['tipo']);
    table.index(['nivel']);
    table.index(['created_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('system_logs');
};
