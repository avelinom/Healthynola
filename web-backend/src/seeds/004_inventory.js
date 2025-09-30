exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('inventory').del();
  
  // Get product IDs
  const products = await knex('products').select('id');
  const almacenes = ['Principal', 'MMM', 'DVP'];
  
  const inventoryData = [];
  
  // Create inventory records for each product in each warehouse
  products.forEach(product => {
    almacenes.forEach(almacen => {
      let cantidad = 0;
      
      // Set different initial quantities for demo
      switch (almacen) {
        case 'Principal':
          cantidad = 50; // Main warehouse has more stock
          break;
        case 'MMM':
          cantidad = 20;
          break;
        case 'DVP':
          cantidad = 15;
          break;
      }
      
      inventoryData.push({
        product_id: product.id,
        almacen: almacen,
        cantidad: cantidad
      });
    });
  });
  
  // Inserts seed entries
  return knex('inventory').insert(inventoryData);
};
