exports.up = function(knex) {
  return knex.schema.raw(`
    UPDATE inventory 
    SET almacen = 'AP' 
    WHERE almacen = 'Principal'
  `);
};

exports.down = function(knex) {
  return knex.schema.raw(`
    UPDATE inventory 
    SET almacen = 'Principal' 
    WHERE almacen = 'AP'
  `);
};
