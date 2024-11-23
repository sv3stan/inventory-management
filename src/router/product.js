const express = require('express');
const { addProduct } = require('../controllers/product');
const router = express.Router();

module.exports = (pool) => {
  router.post('/', addProduct(pool));
  return router;
};
