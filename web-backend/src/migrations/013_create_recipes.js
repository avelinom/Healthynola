/**
 * Migration: Create recipes and recipe_ingredients tables
 * Stores recipes and their ingredients with quantities
 */

exports.up = function(knex) {
  return knex.schema
    .createTable('recipes', function(table) {
      table.increments('id').primary();
      table.string('nombre').notNullable();
      table.text('descripcion');
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('SET NULL');
      table.decimal('rendimiento', 10, 2).notNullable(); // Cuánto produce esta receta
      table.string('unidad_rendimiento').notNullable(); // kg, litros, unidades
      table.text('notas');
      table.boolean('activo').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('recipe_ingredients', function(table) {
      table.increments('id').primary();
      table.integer('recipe_id').unsigned().notNullable().references('id').inTable('recipes').onDelete('CASCADE');
      table.integer('raw_material_id').unsigned().notNullable().references('id').inTable('raw_materials').onDelete('CASCADE');
      table.decimal('cantidad', 10, 3).notNullable();
      table.string('unidad').notNullable();
      table.decimal('costo_calculado', 10, 2); // Se calcula automáticamente
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('recipe_ingredients')
    .dropTableIfExists('recipes');
};
