exports.up = function(knex) {
  return knex.schema.createTable('expenses', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.string('descripcion').notNullable();
    table.string('categoria').notNullable();
    table.decimal('monto', 10, 2).notNullable();
    table.enum('metodo_pago', ['Efectivo', 'Transferencia', 'Tarjeta']).notNullable();
    table.string('responsable').notNullable();
    table.date('fecha').notNullable();
    table.text('notas');
    table.timestamps(true, true);
    
    table.foreign('user_id').references('id').inTable('users').onDelete('RESTRICT');
    
    table.index(['user_id']);
    table.index(['categoria']);
    table.index(['fecha']);
    table.index(['responsable']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('expenses');
};
