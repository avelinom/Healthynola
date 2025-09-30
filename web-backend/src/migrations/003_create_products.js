exports.up = function(knex) {
  return knex.schema.createTable('products', function(table) {
    table.increments('id').primary();
    table.string('nombre').notNullable().unique();
    table.text('descripcion');
    table.string('categoria').notNullable();
    table.decimal('precio', 10, 2).notNullable();
    table.decimal('costo', 10, 2).defaultTo(0);
    table.string('unidad_medida').notNullable();
    table.decimal('stock_minimo', 10, 3).defaultTo(0);
    table.boolean('activo').notNullable().defaultTo(true);
    table.timestamps(true, true);
    
    table.index(['nombre']);
    table.index(['categoria']);
    table.index(['activo']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('products');
};
