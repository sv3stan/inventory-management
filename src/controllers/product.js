const axios = require('axios');
const config = require('../config');
const addProduct = (pool) => async (req, res) => {
  const { plu, name } = req.body;

  if (!name || !plu) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const exists = await pool.query('SELECT * FROM products WHERE plu = $1', [
      plu,
    ]);

    if (exists.rows.length > 0) {
      return res.status(409).json({ error: 'PLU already exists' });
    }

    const result = await pool.query(
      'INSERT INTO products (plu, name) VALUES ($1, $2) RETURNING *',
      [plu, name]
    );

    res.status(201).json(result.rows[0]);

    const historyServiceUrl = `http://${config.History_URL}:${config.History_PORT}/product`;
    const historyData = {
      plu,
      name,
      action: 'add_product',
    };

    try {
      const response = await axios.post(historyServiceUrl, historyData);
      console.log('History created:', response.data);
    } catch (historyError) {
      console.error('Error creating history:', historyError);
    }
  } catch (error) {
    console.error('Unexpected error while adding product:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  addProduct,
};
