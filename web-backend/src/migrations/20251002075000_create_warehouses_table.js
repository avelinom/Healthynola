exports.up = function(knex) {
  return knex.schema.createTable('warehouses', function(table) {
    table.increments('id').primary();
    table.string('nombre', 100).notNullable().unique();
    table.string('codigo', 20).notNullable().unique(); // e.g., 'Principal', 'MMM', 'DVP'
    table.text('direccion');
    table.string('telefono', 20);
    table.string('responsable', 100);
    table.boolean('activo').defaultTo(true);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('warehouses');
};

