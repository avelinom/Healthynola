exports.up = function(knex) {
  return knex.schema.createTable('customers', function(table) {
    table.increments('id').primary();
    table.string('nombre').notNullable();
    table.string('email');
    table.string('telefono');
    table.text('direccion');
    table.enum('tipo', ['Regular', 'Mayorista', 'Consignación', 'VIP']).notNullable().defaultTo('Regular');
    table.text('notas');
    table.boolean('activo').notNullable().defaultTo(true);
    table.timestamps(true, true);
    
    table.index(['nombre']);
    table.index(['email']);
    table.index(['tipo']);
    table.index(['activo']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('customers');
};
