exports.up = function(knex) {
  return knex.schema.createTable('inventory', function(table) {
    table.increments('id').primary();
    table.integer('product_id').unsigned().notNullable();
    table.enum('almacen', ['Principal', 'MMM', 'DVP']).notNullable();
    table.decimal('cantidad', 10, 3).notNullable().defaultTo(0);
    table.timestamps(true, true);
    
    table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.unique(['product_id', 'almacen']);
    table.index(['product_id']);
    table.index(['almacen']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('inventory');
};
