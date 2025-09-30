exports.up = function(knex) {
  return knex.schema.createTable('sales', function(table) {
    table.increments('id').primary();
    table.integer('customer_id').unsigned();
    table.integer('product_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.decimal('cantidad', 10, 3).notNullable();
    table.decimal('precio_unitario', 10, 2).notNullable();
    table.decimal('subtotal', 10, 2).notNullable();
    table.decimal('total', 10, 2).notNullable();
    table.enum('metodo_pago', ['Efectivo', 'Transferencia', 'Regalo', 'Consignación']).notNullable();
    table.string('vendedor').notNullable();
    table.enum('almacen', ['Principal', 'MMM', 'DVP']).notNullable();
    table.text('notas');
    table.boolean('cancelada').notNullable().defaultTo(false);
    table.timestamp('fecha_cancelacion');
    table.integer('cancelada_por').unsigned();
    table.timestamps(true, true);
    
    table.foreign('customer_id').references('id').inTable('customers').onDelete('SET NULL');
    table.foreign('product_id').references('id').inTable('products').onDelete('RESTRICT');
    table.foreign('user_id').references('id').inTable('users').onDelete('RESTRICT');
    table.foreign('cancelada_por').references('id').inTable('users').onDelete('SET NULL');
    
    table.index(['customer_id']);
    table.index(['product_id']);
    table.index(['user_id']);
    table.index(['vendedor']);
    table.index(['almacen']);
    table.index(['metodo_pago']);
    table.index(['cancelada']);
    table.index(['created_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('sales');
};
