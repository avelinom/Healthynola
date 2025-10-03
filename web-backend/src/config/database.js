const knex = require('knex');
const config = require('./config');

const dbConfig = {
  client: 'postgresql',
  connection: process.env.DATABASE_URL || {
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
    ssl: config.database.ssl ? { rejectUnauthorized: false } : false
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './src/migrations'
  },
  seeds: {
    directory: './src/seeds'
  },
  ...(process.env.DATABASE_URL && { ssl: { rejectUnauthorized: false } })
};

const db = knex(dbConfig);

// Test database connection
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });

module.exports = db;
