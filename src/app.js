const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const router = require('./router/index.js');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(router);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
