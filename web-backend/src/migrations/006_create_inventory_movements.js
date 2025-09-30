exports.up = function(knex) {
  return knex.schema.createTable('inventory_movements', function(table) {
    table.increments('id').primary();
    table.integer('product_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.enum('almacen', ['Principal', 'MMM', 'DVP']).notNullable();
    table.enum('tipo', ['venta', 'produccion', 'transferencia', 'ajuste']).notNullable();
    table.decimal('cantidad_anterior', 10, 3).notNullable();
    table.decimal('cantidad_movimiento', 10, 3).notNullable();
    table.decimal('cantidad_nueva', 10, 3).notNullable();
    table.string('motivo').notNullable();
    table.integer('referencia_id').unsigned(); // ID of related record (sale, production, etc.)
    table.string('referencia_tipo'); // Type of reference (sale, production, etc.)
    table.timestamps(true, true);
    
    table.foreign('product_id').references('id').inTable('products').onDelete('RESTRICT');
    table.foreign('user_id').references('id').inTable('users').onDelete('RESTRICT');
    
    table.index(['product_id']);
    table.index(['user_id']);
    table.index(['almacen']);
    table.index(['tipo']);
    table.index(['referencia_id', 'referencia_tipo']);
    table.index(['created_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('inventory_movements');
};
