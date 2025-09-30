const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // Inserts seed entries
  return knex('users').insert([
    {
      id: 1,
      name: 'Administrador',
      email: 'admin@healthynola.com',
      password: hashedPassword,
      role: 'admin',
      active: true
    },
    {
      id: 2,
      name: 'Gerente',
      email: 'manager@healthynola.com',
      password: await bcrypt.hash('manager123', 10),
      role: 'manager',
      active: true
    },
    {
      id: 3,
      name: 'Cajero Demo',
      email: 'cashier@healthynola.com',
      password: await bcrypt.hash('cashier123', 10),
      role: 'cashier',
      active: true
    }
  ]);
};
