exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('role_permissions').del();
  
  // Define all available modules
  const modules = [
    'dashboard',
    'sales',
    'customers',
    'transfers',
    'expenses',
    'reports',
    'inventory',
    'products',
    'production',
    'raw-materials',
    'recipes',
    'batches',
    'users',
    'settings'
  ];
  
  // Define role permissions
  const rolePermissions = {
    admin: modules.map(module => ({ role: 'admin', module, has_access: true })),
    manager: modules.filter(module => 
      !['users', 'settings'].includes(module)
    ).map(module => ({ role: 'manager', module, has_access: true })),
    cashier: ['dashboard', 'sales', 'customers', 'inventory', 'products'].map(module => 
      ({ role: 'cashier', module, has_access: true })
    ),
    salesperson: ['dashboard', 'sales', 'customers', 'products', 'inventory'].map(module => 
      ({ role: 'salesperson', module, has_access: true })
    )
  };
  
  // Insert all permissions
  const allPermissions = Object.values(rolePermissions).flat();
  await knex('role_permissions').insert(allPermissions);
};