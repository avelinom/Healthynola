exports.up = function(knex) {
  return knex.schema.raw(`
    -- Remove old constraints
    ALTER TABLE transfers DROP CONSTRAINT IF EXISTS transfers_almacen_origen_check;
    ALTER TABLE transfers DROP CONSTRAINT IF EXISTS transfers_almacen_destino_check;
    
    -- Update existing data to use new codes
    UPDATE transfers SET almacen_origen = 'AP' WHERE almacen_origen = 'Principal';
    UPDATE transfers SET almacen_destino = 'AP' WHERE almacen_destino = 'Principal';
    
    -- Add new constraints with updated codes (or make them flexible strings)
    ALTER TABLE transfers ALTER COLUMN almacen_origen TYPE VARCHAR(50);
    ALTER TABLE transfers ALTER COLUMN almacen_destino TYPE VARCHAR(50);
  `);
};

exports.down = function(knex) {
  return knex.schema.raw(`
    -- Revert data changes
    UPDATE transfers SET almacen_origen = 'Principal' WHERE almacen_origen = 'AP';
    UPDATE transfers SET almacen_destino = 'Principal' WHERE almacen_destino = 'AP';
    
    -- Restore old constraints (optional, can be skipped)
    ALTER TABLE transfers ALTER COLUMN almacen_origen TYPE VARCHAR(50);
    ALTER TABLE transfers ALTER COLUMN almacen_destino TYPE VARCHAR(50);
  `);
};
