exports.up = function(knex) {
  return knex.schema.table('packaging_types', function(table) {
    table.string('tipo_contenedor', 50).notNullable().defaultTo('bolsa'); // bolsa, lata, botella, etc.
    table.string('unidad_medida', 10).notNullable().defaultTo('kg'); // kg, g, L, mL
    table.decimal('cantidad', 10, 3).notNullable().defaultTo(1.000); // cantidad en la unidad especificada
  });
};

exports.down = function(knex) {
  return knex.schema.table('packaging_types', function(table) {
    table.dropColumn('tipo_contenedor');
    table.dropColumn('unidad_medida');
    table.dropColumn('cantidad');
  });
};
