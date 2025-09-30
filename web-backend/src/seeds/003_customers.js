exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('customers').del();
  
  // Inserts seed entries
  return knex('customers').insert([
    {
      id: 1,
      nombre: 'Cliente General',
      email: null,
      telefono: null,
      direccion: null,
      tipo: 'Regular',
      notas: 'Cliente por defecto para ventas sin cliente específico',
      activo: true
    },
    {
      id: 2,
      nombre: 'María García',
      email: 'maria.garcia@email.com',
      telefono: '3001234567',
      direccion: 'Calle 123 #45-67, Bogotá',
      tipo: 'Regular',
      notas: 'Cliente frecuente',
      activo: true
    },
    {
      id: 3,
      nombre: 'Tienda El Buen Sabor',
      email: 'pedidos@elbuensabor.com',
      telefono: '3007654321',
      direccion: 'Carrera 50 #30-20, Medellín',
      tipo: 'Mayorista',
      notas: 'Cliente mayorista con descuento del 15%',
      activo: true
    },
    {
      id: 4,
      nombre: 'Café Central',
      email: 'compras@cafecentral.com',
      telefono: '3009876543',
      direccion: 'Avenida 19 #80-45, Cali',
      tipo: 'Consignación',
      notas: 'Productos en consignación, pago a 30 días',
      activo: true
    }
  ]);
};
