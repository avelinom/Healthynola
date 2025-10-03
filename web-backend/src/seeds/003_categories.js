exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('categories').del();
  
  // Inserts seed entries
  await knex('categories').insert([
    {
      id: 1,
      nombre: 'Granola',
      descripcion: 'Productos de granola artesanal',
      color: '#2e7d32',
      activo: true
    },
    {
      id: 2,
      nombre: 'Snacks',
      descripcion: 'Snacks saludables y frutos secos',
      color: '#ff9800',
      activo: true
    },
    {
      id: 3,
      nombre: 'Cereales',
      descripcion: 'Cereales y productos de desayuno',
      color: '#9c27b0',
      activo: true
    },
    {
      id: 4,
      nombre: 'Frutos Secos',
      descripcion: 'Frutos secos y semillas',
      color: '#795548',
      activo: true
    },
    {
      id: 5,
      nombre: 'Bebidas',
      descripcion: 'Bebidas saludables y kombucha',
      color: '#2196f3',
      activo: true
    },
    {
      id: 6,
      nombre: 'Otros',
      descripcion: 'Otros productos diversos',
      color: '#607d8b',
      activo: true
    }
  ]);
};
