exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('products').del();
  
  // Inserts seed entries
  return knex('products').insert([
    {
      id: 1,
      nombre: 'Granola Natural 500g',
      descripcion: 'Granola artesanal con ingredientes naturales',
      categoria: 'Granola',
      precio: 15000,
      costo: 8000,
      unidad_medida: 'g',
      stock_minimo: 10,
      activo: true
    },
    {
      id: 2,
      nombre: 'Granola con Chocolate 500g',
      descripcion: 'Granola artesanal con chocolate oscuro',
      categoria: 'Granola',
      precio: 18000,
      costo: 10000,
      unidad_medida: 'g',
      stock_minimo: 10,
      activo: true
    },
    {
      id: 3,
      nombre: 'Granola con Frutas 500g',
      descripcion: 'Granola artesanal con frutas deshidratadas',
      categoria: 'Granola',
      precio: 20000,
      costo: 12000,
      unidad_medida: 'g',
      stock_minimo: 10,
      activo: true
    },
    {
      id: 4,
      nombre: 'Mix de Frutos Secos 250g',
      descripcion: 'Mezcla de almendras, nueces y maní',
      categoria: 'Snacks',
      precio: 12000,
      costo: 7000,
      unidad_medida: 'g',
      stock_minimo: 15,
      activo: true
    }
  ]);
};
