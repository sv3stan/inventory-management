const axios = require('axios');
const addProduct = (pool) => async (req, res) => {
  const { plu, name } = req.body;

  if (!name || !plu) {
    return res.status(400).json({ error: 'Shop name is required' });
  }

  try {
    const exists = await pool.query(
      'SELECT * FROM products WHERE name = $1 AND plu = $2',
      [name, plu]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'Product already exists' });
    }

    const result = await pool.query(
      'INSERT INTO products (plu, name) VALUES ($1, $2) RETURNING *',
      [plu, name]
    );

    const historyServiceUrl = 'http://localhost:3002/product';
    const historyData = {
      plu,
      name,
      action: 'add_product',
    };

    axios
      .post(historyServiceUrl, historyData)
      .then((response) => {
        console.log('History created:', response.data);
      })
      .catch((error) => {
        console.error('Error creating history:', error);
      });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  addProduct,
};
