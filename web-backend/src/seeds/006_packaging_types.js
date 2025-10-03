exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('packaging_types').del();
  
  // Inserts seed entries
  await knex('packaging_types').insert([
    { id: 1, nombre: '1kg', etiqueta: '1 kg', peso_kg: 1.000, activo: true },
    { id: 2, nombre: '0.5kg', etiqueta: '1/2 kg', peso_kg: 0.500, activo: true },
    { id: 3, nombre: '100g', etiqueta: '100 g', peso_kg: 0.100, activo: true }
  ]);
};

