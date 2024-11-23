const addProduct = (pool) => async (req, res) => {
  const { plu, name } = req.body;

  if (!name || !plu) {
    return res.status(400).json({ error: 'Shop name is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO products (plu, name) VALUES ($1, $2) RETURNING *',
      [plu, name]
    );
    // Отправка добавленной записи в ответе
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  addProduct,
};
