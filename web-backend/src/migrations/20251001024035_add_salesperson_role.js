exports.up = function(knex) {
  return knex.raw(`
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role = ANY (ARRAY['admin'::text, 'manager'::text, 'cashier'::text, 'salesperson'::text]));
  `);
};

exports.down = function(knex) {
  // Note: PostgreSQL doesn't support removing enum values easily
  // This would require recreating the enum type
  return Promise.resolve();
};