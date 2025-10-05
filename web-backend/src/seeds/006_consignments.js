exports.seed = async function(knex) {
  // Limpiar tablas existentes
  await knex('consignment_visits').del();
  await knex('consignments').del();
  
  // Obtener IDs de ventas, clientes y productos existentes
  const sales = await knex('sales').select('id', 'salesperson').limit(3);
  const customers = await knex('customers').where('tipo', 'consignacion').select('id', 'nombre').limit(2);
  const products = await knex('products').select('id', 'nombre').limit(3);
  
  if (sales.length === 0 || customers.length === 0 || products.length === 0) {
    console.log('No hay suficientes datos para crear consignaciones de ejemplo');
    return;
  }
  
  // Crear consignaciones de ejemplo
  const consignments = [
    {
      sale_id: sales[0].id,
      client_id: customers[0].id,
      product_id: products[0].id,
      quantity: 10,
      delivery_date: '2024-10-01',
      payment_status: 'pending',
      amount_paid: 0,
      next_visit_date: '2024-10-15',
      notes: 'Primera consignación - Cliente nuevo'
    },
    {
      sale_id: sales[1]?.id || sales[0].id,
      client_id: customers[1]?.id || customers[0].id,
      product_id: products[1]?.id || products[0].id,
      quantity: 5,
      delivery_date: '2024-10-02',
      payment_status: 'paid',
      amount_paid: 500,
      next_visit_date: '2024-10-16',
      notes: 'Consignación pagada parcialmente'
    },
    {
      sale_id: sales[2]?.id || sales[0].id,
      client_id: customers[0].id,
      product_id: products[2]?.id || products[0].id,
      quantity: 8,
      delivery_date: '2024-10-03',
      payment_status: 'credit',
      amount_paid: 0,
      next_visit_date: '2024-10-17',
      notes: 'Consignación a crédito'
    }
  ];
  
  // Insertar consignaciones
  const insertedConsignments = await knex('consignments').insert(consignments).returning('*');
  
  // Crear visitas de ejemplo
  const visits = [
    {
      consignment_id: insertedConsignments[0].id,
      visit_date: '2024-10-15',
      visit_type: 'delivery',
      status: 'programada',
      notes: 'Visita programada para reponer stock'
    },
    {
      consignment_id: insertedConsignments[1].id,
      visit_date: '2024-10-10',
      visit_type: 'collection',
      status: 'hecha',
      notes: 'Visita completada - Productos vendidos'
    },
    {
      consignment_id: insertedConsignments[2].id,
      visit_date: '2024-10-05',
      visit_type: 'check',
      status: 'por_hacer',
      notes: 'Visita pendiente - Verificar stock'
    }
  ];
  
  await knex('consignment_visits').insert(visits);
  
  console.log('✅ Consignaciones de ejemplo creadas');
};
