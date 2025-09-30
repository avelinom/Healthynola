exports.up = function(knex) {
  return knex.schema.createTable('production_batches', function(table) {
    table.increments('id').primary();
    table.integer('product_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.string('lote_numero').notNullable().unique();
    table.decimal('cantidad', 10, 3).notNullable();
    table.decimal('costo_total', 10, 2).notNullable();
    table.decimal('costo_unitario', 10, 2).notNullable();
    table.date('fecha_produccion').notNullable();
    table.date('fecha_vencimiento').notNullable();
    table.enum('estado', ['activo', 'vencido', 'agotado']).notNullable().defaultTo('activo');
    table.text('notas');
    table.timestamps(true, true);
    
    table.foreign('product_id').references('id').inTable('products').onDelete('RESTRICT');
    table.foreign('user_id').references('id').inTable('users').onDelete('RESTRICT');
    
    table.index(['product_id']);
    table.index(['user_id']);
    table.index(['lote_numero']);
    table.index(['fecha_vencimiento']);
    table.index(['estado']);
    table.index(['fecha_produccion']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('production_batches');
};
