exports.up = function(knex) {
  return knex.schema.createTable('transfers', function(table) {
    table.increments('id').primary();
    table.integer('product_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.decimal('cantidad', 10, 3).notNullable();
    table.enum('almacen_origen', ['Principal', 'MMM', 'DVP']).notNullable();
    table.enum('almacen_destino', ['Principal', 'MMM', 'DVP']).notNullable();
    table.string('motivo').notNullable();
    table.timestamps(true, true);
    
    table.foreign('product_id').references('id').inTable('products').onDelete('RESTRICT');
    table.foreign('user_id').references('id').inTable('users').onDelete('RESTRICT');
    
    table.index(['product_id']);
    table.index(['user_id']);
    table.index(['almacen_origen']);
    table.index(['almacen_destino']);
    table.index(['created_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('transfers');
};
