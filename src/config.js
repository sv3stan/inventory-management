const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  URL: process.env.URL || 'localhost',
  PORT: process.env.PORT || '3000',
  History_URL: process.env.HISTORY_URL,
  History_PORT: process.env.HISTORY_PORT,
  DB_NAME_MAIN: process.env.DB_NAME_MAIN,
  DB_USER: process.env.DB_USER,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_PORT: process.env.DB_PORT || '5432',
  ServiceURL: `http://${process.env.URL || 'localhost'}:${
    process.env.PORT || '3000'
  }`,
};
