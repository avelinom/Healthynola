exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('warehouses').del();
  
  // Inserts seed entries
  await knex('warehouses').insert([
    {
      id: 1,
      nombre: 'Almacén Principal',
      codigo: 'Principal',
      direccion: 'Dirección principal',
      telefono: '',
      responsable: '',
      activo: true
    },
    {
      id: 2,
      nombre: 'Mercado Municipal de Mérida',
      codigo: 'MMM',
      direccion: 'Mercado Municipal',
      telefono: '',
      responsable: '',
      activo: true
    },
    {
      id: 3,
      nombre: 'Dulce Vida Paletas',
      codigo: 'DVP',
      direccion: 'Tienda Dulce Vida',
      telefono: '',
      responsable: '',
      activo: true
    }
  ]);
};

