/**
 * Migration: Create batches and batch_packaging tables
 * Stores production batches and their packaging details
 */

exports.up = function(knex) {
  return knex.schema
    .createTable('batches', function(table) {
      table.increments('id').primary();
      table.string('codigo_lote').notNullable().unique();
      table.integer('recipe_id').unsigned().notNullable().references('id').inTable('recipes').onDelete('RESTRICT');
      table.date('fecha_produccion');
      table.decimal('cantidad_producida', 10, 2);
      table.string('unidad');
      table.decimal('costo_total_calculado', 10, 2);
      table.enum('estado', ['planificado', 'en_proceso', 'completado', 'cancelado']).defaultTo('planificado');
      table.text('notas');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('batch_packaging', function(table) {
      table.increments('id').primary();
      table.integer('batch_id').unsigned().notNullable().references('id').inTable('batches').onDelete('CASCADE');
      table.integer('product_id').unsigned().references('id').inTable('products').onDelete('SET NULL');
      table.enum('tipo_bolsa', ['1kg', '0.5kg', '100g']).notNullable();
      table.integer('cantidad_bolsas').notNullable();
      table.string('almacen').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('batch_packaging')
    .dropTableIfExists('batches');
};
