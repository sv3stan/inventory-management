const { Pool } = require('pg');
const { readFileSync } = require('fs');
const { join } = require('path');
const config = require('../config');

const createPool = (database) => {
  return new Pool({
    user: config.DB_USER,
    host: config.DB_HOST,
    database: database,
    password: config.DB_PASSWORD,
    port: parseInt(config.DB_PORT, 10),
  });
};

const initializeDatabase = async (adminPool, userPool) => {
  let admin;

  const createTablesSQL = readFileSync(
    join(__dirname, '../sql/create_table.sql'),
    'utf-8'
  );

  try {
    admin = await adminPool.connect();

    const res = await admin.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [config.DB_NAME]
    );

    if (res.rowCount > 0) {
      console.log(`Database ${config.DB_NAME} already exists.`);
    } else {
      await admin.query(`CREATE DATABASE "${config.DB_NAME}";`);
      console.log(`Database ${config.DB_NAME} created successfully.`);
    }

    admin.release();
    await adminPool.end();
    console.log('Admin pool closed.');

    const client = await userPool.connect();
    try {
      await client.query(createTablesSQL);
      console.log('Tables created successfully (if not exist).');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
};

module.exports = { createPool, initializeDatabase };
