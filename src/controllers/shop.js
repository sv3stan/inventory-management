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

    console.log(
      `Fields ${JSON.stringify(
        result.rows[0]
      )} have been successfully added to the table`
    );
  } catch (error) {
    if (error.code === '23505') {
      console.error('Duplicate shop name:', error.detail);
      return res.status(409).json({ error: 'Shop name already exists' });
    }
    console.error('Unexpected error while adding shop:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  addShop,
};
