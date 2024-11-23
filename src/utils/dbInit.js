const { Pool } = require('pg');
const { readFileSync } = require('fs');
const { join } = require('path');
require('dotenv').config();

// Пул для подключения к базе postgres
const adminPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'postgres',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Путь к SQL-файлу для создания таблиц
const createTablesSQL = readFileSync(
  join(__dirname, '../sql/create_table.sql'),
  'utf-8'
);

const initializeDatabase = async () => {
  let adminClient;

  try {
    // Подключение администратора
    adminClient = await adminPool.connect();

    // Проверка существования базы данных
    const res = await adminClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [process.env.DB_NAME]
    );

    if (res.rowCount > 0) {
      console.log(`Database ${process.env.DB_NAME} already exists.`);
    } else {
      // Создание базы данных
      await adminClient.query(`CREATE DATABASE "${process.env.DB_NAME}";`);
      console.log(`Database ${process.env.DB_NAME} created successfully.`);
    }

    // Создание таблиц
    const userPool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || '5432', 10),
    });

    const client = await userPool.connect();
    try {
      await client.query(createTablesSQL);
      console.log('Tables created successfully (if not exist).');
    } finally {
      client.release();
    }

    userPool.end(); // Завершение пула пользователя
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  } finally {
    if (adminClient) adminClient.release();
    adminPool.end(); // Завершение пула администратора
  }
};

module.exports = initializeDatabase;
