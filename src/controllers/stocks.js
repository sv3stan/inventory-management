const axios = require('axios');

const addStocks = (pool) => async (req, res) => {
  const { product_id, shop_id, quantity_on_shelf, quantity_in_order } =
    req.body;
  if (
    !product_id ||
    !shop_id ||
    quantity_on_shelf === undefined ||
    quantity_in_order === undefined
  ) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const exists = await pool.query(
      'SELECT * FROM stock WHERE product_id = $1 AND shop_id = $2',
      [product_id, shop_id]
    );

    if (exists.rows.length > 0) {
      return res
        .status(400)
        .json({ error: 'Product already exists in the shop' });
    }

    const result = await pool.query(
      'INSERT INTO stock (product_id, shop_id, quantity_on_shelf, quantity_in_order) VALUES ($1, $2, $3, $4) RETURNING *',
      [product_id, shop_id, quantity_on_shelf, quantity_in_order]
    );

    const product = await pool.query('SELECT plu FROM products WHERE id = $1', [
      product_id,
    ]);
    const plu = product.rows[0].plu;

    const historyServiceUrl = 'http://localhost:3002/stocks';
    const historyData = {
      plu,
      shop_id,
      action: 'add_stocks',
      quantity_on_shelf,
      quantity_in_order,
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
    console.error('Error creating stocks:', error);
    res.status(400).json({ error: err.message });
  }
};

const incStocks = (pool) => async (req, res) => {
  const { product_id, shop_id, quantity_on_shelf, quantity_in_order } =
    req.body;

  const quantity_on_shelf_int = parseInt(quantity_on_shelf, 10);
  const quantity_in_order_int = parseInt(quantity_in_order, 10);

  if (
    !product_id ||
    !shop_id ||
    isNaN(quantity_on_shelf_int) ||
    isNaN(quantity_in_order_int)
  ) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const exists = await pool.query(
      'SELECT * FROM stock WHERE product_id = $1 AND shop_id = $2',
      [product_id, shop_id]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found in the shop' });
    }

    const stock = exists.rows[0];
    const newShelfQuantity = stock.quantity_on_shelf + quantity_on_shelf_int;
    const newOrderQuantity = stock.quantity_in_order + quantity_in_order_int;

    if (newShelfQuantity < 0 || newOrderQuantity < 0) {
      return res.status(400).json({ error: 'Insufficient stock quantity' });
    }

    const result = await pool.query(
      'UPDATE stock SET quantity_on_shelf = $3, quantity_in_order = $4 WHERE product_id = $1 AND shop_id = $2 RETURNING *',
      [product_id, shop_id, newShelfQuantity, newOrderQuantity]
    );

    const product = await pool.query('SELECT plu FROM products WHERE id = $1', [
      product_id,
    ]);
    const plu = product.rows[0].plu;

    const historyServiceUrl = 'http://localhost:3002/stocks/inc';
    const historyData = {
      plu,
      shop_id,
      action: 'inc_stocks',
      quantity_on_shelf,
      quantity_in_order,
    };
    console.log(historyServiceUrl);
    console.log(historyData);

    axios
      .put(historyServiceUrl, historyData)
      .then((response) => {
        console.log('History created:', response.data);
      })
      .catch((error) => {
        console.error('Error creating history:', error);
      });

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const decStocks = (pool) => async (req, res) => {
  const { product_id, shop_id, quantity_on_shelf, quantity_in_order } =
    req.body;

  const quantity_on_shelf_int = parseInt(quantity_on_shelf, 10);
  const quantity_in_order_int = parseInt(quantity_in_order, 10);

  if (
    !product_id ||
    !shop_id ||
    quantity_on_shelf_int === undefined ||
    quantity_in_order_int === undefined
  ) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const exists = await pool.query(
      'SELECT * FROM stock WHERE product_id = $1 AND shop_id = $2',
      [product_id, shop_id]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found in the shop' });
    }

    const stock = exists.rows[0];
    const newShelfQuantity = stock.quantity_on_shelf - quantity_on_shelf_int;
    const newOrderQuantity = stock.quantity_in_order - quantity_in_order_int;

    if (newShelfQuantity < 0 || newOrderQuantity < 0) {
      return res.status(400).json({ error: 'Insufficient stock quantity' });
    }

    const result = await pool.query(
      'UPDATE stock SET quantity_on_shelf = $3, quantity_in_order = $4 WHERE product_id = $1 AND shop_id = $2 RETURNING *',
      [product_id, shop_id, newShelfQuantity, newOrderQuantity]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  addStocks,
  incStocks,
  decStocks,
};
