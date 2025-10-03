exports.up = function(knex) {
  return knex.schema.table('sales', function(table) {
    // Add tipo_empaque column - stores the packaging type ID (e.g., '1kg', 'LK-355', 'BK-750')
    table.string('tipo_empaque', 50);
    
    // Add index for faster queries when filtering by packaging type
    table.index(['tipo_empaque']);
  });
};

exports.down = function(knex) {
  return knex.schema.table('sales', function(table) {
    table.dropIndex(['tipo_empaque']);
    table.dropColumn('tipo_empaque');
  });
};

