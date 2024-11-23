const addShop = (pool) => async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Shop name is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO shops (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating shop:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  addShop,
};
