/**
 * Migration: Create raw_materials table
 * Stores raw materials used in recipes with costs
 */

exports.up = function(knex) {
  return knex.schema.createTable('raw_materials', function(table) {
    table.increments('id').primary();
    table.string('nombre').notNullable();
    table.text('descripcion');
    table.string('unidad_medida').notNullable(); // kg, litros, unidades, etc.
    table.decimal('costo_por_unidad', 10, 2).notNullable();
    table.string('proveedor');
    table.decimal('stock_actual', 10, 2).defaultTo(0);
    table.decimal('stock_minimo', 10, 2).defaultTo(0);
    table.text('notas');
    table.boolean('activo').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('raw_materials');
};
