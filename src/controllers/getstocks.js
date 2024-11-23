const getStocks = (pool) => async (req, res) => {
  const {
    plu,
    shop_id,
    quantity_on_shelf_min,
    quantity_on_shelf_max,
    quantity_in_order_min,
    quantity_in_order_max,
  } = req.query;

  try {
    let query = `
      SELECT stock.id, 
             stock.quantity_on_shelf, 
             stock.quantity_in_order, 
             products.plu, 
             products.name AS product_name, 
             shops.id AS shop_id, 
             shops.name AS shop_name
      FROM stock
      JOIN products ON stock.product_id = products.id
      JOIN shops ON stock.shop_id = shops.id
    `;
    const params = [];
    const conditions = [];

    if (plu) {
      conditions.push(`products.plu = $${params.length + 1}`);
      params.push(plu);
    }

    if (shop_id) {
      conditions.push(`shops.id = $${params.length + 1}`);
      params.push(shop_id);
    }

    if (quantity_on_shelf_min) {
      conditions.push(`stock.quantity_on_shelf >= $${params.length + 1}`);
      params.push(Number(quantity_on_shelf_min));
    }

    if (quantity_on_shelf_max) {
      conditions.push(`stock.quantity_on_shelf <= $${params.length + 1}`);
      params.push(Number(quantity_on_shelf_max));
    }

    if (quantity_in_order_min) {
      conditions.push(`stock.quantity_in_order >= $${params.length + 1}`);
      params.push(Number(quantity_in_order_min));
    }

    if (quantity_in_order_max) {
      conditions.push(`stock.quantity_in_order <= $${params.length + 1}`);
      params.push(Number(quantity_in_order_max));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching stocks:', err);
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getStocks };
