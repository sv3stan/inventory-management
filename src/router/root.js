const express = require('express');
const { getRootHandler } = require('../controllers/root');
const router = express.Router();

module.exports = () => {
  router.get('/', getRootHandler());
  return router;
};
