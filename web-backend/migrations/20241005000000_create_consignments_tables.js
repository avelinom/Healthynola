exports.up = function(knex) {
  return knex.schema
    .createTable('consignments', function(table) {
      table.increments('id').primary();
      table.integer('sale_id').unsigned().notNullable();
      table.integer('client_id').unsigned().notNullable();
      table.integer('product_id').unsigned().notNullable();
      table.integer('quantity').notNullable();
      table.date('delivery_date').notNullable();
      table.enum('payment_status', ['pending', 'paid', 'credit']).defaultTo('pending');
      table.decimal('amount_paid', 10, 2).defaultTo(0);
      table.date('next_visit_date').notNullable();
      table.text('notes');
      table.timestamps(true, true);
      
      // Foreign keys
      table.foreign('sale_id').references('id').inTable('sales').onDelete('CASCADE');
      table.foreign('client_id').references('id').inTable('customers').onDelete('CASCADE');
      table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    })
    .createTable('consignment_visits', function(table) {
      table.increments('id').primary();
      table.integer('consignment_id').unsigned().notNullable();
      table.date('visit_date').notNullable();
      table.enum('visit_type', ['delivery', 'collection', 'check']).defaultTo('delivery');
      table.enum('status', ['programada', 'hecha', 'por_hacer']).defaultTo('programada');
      table.text('notes');
      table.timestamps(true, true);
      
      // Foreign key
      table.foreign('consignment_id').references('id').inTable('consignments').onDelete('CASCADE');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('consignment_visits')
    .dropTable('consignments');
};
