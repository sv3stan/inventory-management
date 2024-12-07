const express = require('express');

const { addStocks, incStocks, decStocks } = require('../controllers/stocks');
const { getStocks } = require('../controllers/getStocks');

const router = express.Router();

module.exports = (pool) => {
  router.post('/add_stocks', addStocks(pool));
  router.put('/inc_stocks', incStocks(pool));
  router.put('/dec_stocks', decStocks(pool));
  router.get('/', getStocks(pool));
  return router;
};
