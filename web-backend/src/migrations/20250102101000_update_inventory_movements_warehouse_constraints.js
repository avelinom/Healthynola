exports.up = function(knex) {
  return knex.schema.raw(`
    -- Remove old constraint
    ALTER TABLE inventory_movements DROP CONSTRAINT IF EXISTS inventory_movements_almacen_check;
    
    -- Update existing data to use new codes
    UPDATE inventory_movements SET almacen = 'AP' WHERE almacen = 'Principal';
    
    -- Change column type to flexible string
    ALTER TABLE inventory_movements ALTER COLUMN almacen TYPE VARCHAR(50);
  `);
};

exports.down = function(knex) {
  return knex.schema.raw(`
    -- Revert data changes
    UPDATE inventory_movements SET almacen = 'Principal' WHERE almacen = 'AP';
    
    -- Keep as string type
    ALTER TABLE inventory_movements ALTER COLUMN almacen TYPE VARCHAR(50);
  `);
};
