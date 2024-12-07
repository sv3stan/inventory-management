const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('../config');
const router = require('../router/index');
const { initializeDatabase, createPool } = require('./dbInit');

const startServer = async () => {
  const adminPool = createPool(config.DB_NAME_MAIN);
  const userPool = createPool(config.DB_NAME);

  try {
    await initializeDatabase(adminPool, userPool);
    console.log('Database initialized successfully');

    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../../public')));
    app.use(router);

    const server = app.listen(config.PORT, () => {
      console.log(`Server running on http://${config.URL}:${config.PORT}`);
    });

    const handleExit = async (signal) => {
      console.log(`Received ${signal}. Closing resources...`);
      try {
        await userPool.end();
        console.log('User pool closed.');
        server.close(() => {
          console.log('Server closed.');
          process.exit(0);
        });
      } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
      }
    };

    process.on('SIGINT', handleExit);
    process.on('SIGTERM', handleExit);
  } catch (err) {
    console.error('Failed to initialize application:', err);
    process.exit(1);
  }
};

module.exports = startServer;
