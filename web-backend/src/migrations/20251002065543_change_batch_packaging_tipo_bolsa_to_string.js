/**
 * Migration: Change tipo_bolsa from ENUM to string
 * This allows dynamic packaging types instead of hardcoded values
 */

exports.up = async function(knex) {
  // First, add a temporary column
  await knex.schema.table('batch_packaging', function(table) {
    table.string('tipo_bolsa_temp', 50);
  });
  
  // Copy data from old column to temp column
  await knex.raw(`
    UPDATE batch_packaging 
    SET tipo_bolsa_temp = tipo_bolsa::text
  `);
  
  // Drop the old column with ENUM constraint
  await knex.schema.table('batch_packaging', function(table) {
    table.dropColumn('tipo_bolsa');
  });
  
  // Rename temp column to original name
  await knex.raw(`
    ALTER TABLE batch_packaging 
    RENAME COLUMN tipo_bolsa_temp TO tipo_bolsa
  `);
  
  // Make it NOT NULL
  await knex.raw(`
    ALTER TABLE batch_packaging 
    ALTER COLUMN tipo_bolsa SET NOT NULL
  `);
};

exports.down = async function(knex) {
  // Revert back to ENUM (note: this will fail if there are values not in the enum)
  await knex.schema.table('batch_packaging', function(table) {
    table.dropColumn('tipo_bolsa');
  });
  
  await knex.schema.table('batch_packaging', function(table) {
    table.enum('tipo_bolsa', ['1kg', '0.5kg', '100g']).notNullable().after('product_id');
  });
};
