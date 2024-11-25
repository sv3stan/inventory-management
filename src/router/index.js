const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const rootRouter = require('./root');
const shopRouter = require('./shop');
const productRouter = require('./product');
const stocksRouter = require('./stocks');

const initializeDatabase = require('../utils/dbInit');

const router = express.Router();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

initializeDatabase()
  .then(() => console.log('Database initialized successfully'))
  .catch((err) => console.error('Error during database initialization:', err));

router.get('/', rootRouter());
router.use('/shop', shopRouter(pool));
router.use('/product', productRouter(pool));
router.use('/stocks', stocksRouter(pool));

module.exports = router;
//
