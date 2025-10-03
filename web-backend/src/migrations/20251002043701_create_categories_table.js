exports.up = function(knex) {
  return knex.schema.createTable('categories', function(table) {
    table.increments('id').primary();
    table.string('nombre').notNullable().unique();
    table.text('descripcion');
    table.string('color', 7).defaultTo('#1976d2'); // Color hex para UI
    table.boolean('activo').notNullable().defaultTo(true);
    table.timestamps(true, true);
    
    table.index(['nombre']);
    table.index(['activo']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('categories');
};