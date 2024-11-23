const express = require('express');

const { addShop } = require('../controllers/shop');

const router = express.Router();

module.exports = (pool) => {
  router.post('/', addShop(pool));
  return router;
};
