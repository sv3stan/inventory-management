const express = require('express');

const { addStocks, incStocks, decStocks } = require('../controllers/stocks');
const { getStocks } = require('../controllers/getStocks');

const router = express.Router();

module.exports = (pool) => {
  router.post('/', addStocks(pool));
  router.put('/inc', incStocks(pool));
  router.put('/dec', decStocks(pool));
  router.get('/', getStocks(pool));
  return router;
};
