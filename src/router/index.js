const express = require('express');
const config = require('../config');

const rootRouter = require('./root');
const shopRouter = require('./shop');
const productRouter = require('./product');
const stocksRouter = require('./stocks');

const { createPool } = require('../utils/dbInit');

const router = express.Router();

const userPool = createPool(config.DB_NAME);

router.get('/', rootRouter());
router.use('/shop', shopRouter(userPool));
router.use('/product', productRouter(userPool));
router.use('/stocks', stocksRouter(userPool));

module.exports = router;
