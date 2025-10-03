exports.up = function(knex) {
  return knex.schema.createTable('packaging_types', function(table) {
    table.increments('id').primary();
    table.string('nombre', 50).notNullable().unique(); // e.g., "1kg", "0.5kg", "100g"
    table.string('etiqueta', 50).notNullable(); // e.g., "1 kg", "1/2 kg", "100 g"
    table.decimal('peso_kg', 10, 3).notNullable(); // Weight in kg: 1, 0.5, 0.1
    table.boolean('activo').defaultTo(true);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('packaging_types');
};
