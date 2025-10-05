const db = require('../src/config/database');

async function createSettingsTable() {
  const exists = await db.schema.hasTable('settings');
  
  if (!exists) {
    await db.schema.createTable('settings', (table) => {
      table.increments('id').primary();
      table.string('business_name', 255).notNullable().defaultTo('Healthynola');
      table.string('address', 500);
      table.string('phone', 50);
      table.string('email', 255);
      table.boolean('low_stock_alerts').defaultTo(true);
      table.boolean('sales_notifications').defaultTo(true);
      table.boolean('expiry_reminders').defaultTo(false);
      table.integer('min_stock_alert').defaultTo(10);
      table.string('notification_email', 255);
      table.boolean('activity_log').defaultTo(false);
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });
    
    console.log('✅ Tabla settings creada exitosamente');
    
    // Insert default settings
    await db('settings').insert({
      business_name: 'Healthynola',
      address: 'Calle 123 #45-67, Bogotá',
      phone: '(+57) 300 123 4567',
      email: 'info@healthynola.com',
      low_stock_alerts: true,
      sales_notifications: true,
      expiry_reminders: false,
      min_stock_alert: 10,
      notification_email: 'admin@healthynola.com',
      activity_log: false,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    console.log('✅ Configuración predeterminada insertada');
  } else {
    console.log('⚠️  La tabla settings ya existe');
  }
}

createSettingsTable()
  .then(() => {
    console.log('Migración completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en la migración:', error);
    process.exit(1);
  });

