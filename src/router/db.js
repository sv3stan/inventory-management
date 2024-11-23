const express = require('express');

const DBRouter = express.Router();

// Обработчик маршрута для проверки времени на сервере
module.exports = (pool) => {
  DBRouter.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT NOW()');
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).send('Error connecting to the database');
    }
  });

  return DBRouter;
};
