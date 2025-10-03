exports.up = async function(knex) {
  // Step 1: Add temporary column for almacen
  await knex.schema.table('inventory', function(table) {
    table.string('almacen_temp', 20);
  });
  
  // Step 2: Copy data from old almacen column to temp column
  await knex.raw(`
    UPDATE inventory 
    SET almacen_temp = almacen::text
  `);
  
  // Step 3: Drop the old almacen column (with ENUM constraint)
  await knex.schema.table('inventory', function(table) {
    table.dropColumn('almacen');
  });
  
  // Step 4: Rename temp column to almacen
  await knex.raw(`
    ALTER TABLE inventory 
    RENAME COLUMN almacen_temp TO almacen
  `);
  
  // Step 5: Make it NOT NULL and add index
  await knex.raw(`
    ALTER TABLE inventory 
    ALTER COLUMN almacen SET NOT NULL
  `);
  
  await knex.schema.table('inventory', function(table) {
    table.index('almacen');
  });
  
  // Step 6: Add stock_minimo and stock_maximo columns
  await knex.schema.table('inventory', function(table) {
    table.decimal('stock_minimo', 10, 3).defaultTo(0);
    table.decimal('stock_maximo', 10, 3).defaultTo(100);
  });
};

exports.down = async function(knex) {
  // Remove stock columns
  await knex.schema.table('inventory', function(table) {
    table.dropColumn('stock_minimo');
    table.dropColumn('stock_maximo');
  });
  
  // Revert almacen back to ENUM (note: this will fail if there are values not in the enum)
  await knex.schema.table('inventory', function(table) {
    table.dropColumn('almacen');
    table.enum('almacen', ['Principal', 'MMM', 'DVP']).notNullable();
  });
};

