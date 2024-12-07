const axios = require('axios');
const config = require('../config');
const BASE_HISTORY_URL = `http://${config.History_URL}:${config.History_PORT}/stocks`;

function createHistoryData(
  plu,
  shop_id,
  action,
  quantity_on_shelf,
  quantity_in_order
) {
  return {
    plu,
    shop_id,
    action,
    quantity_on_shelf,
    quantity_in_order,
  };
}

const getStockBalance = async (pool, product_id, shop_id) => {
  try {
    const result = await pool.query(
      'SELECT quantity_on_shelf, quantity_in_order FROM stock WHERE product_id = $1 AND shop_id = $2',
      [product_id, shop_id]
    );

    if (result.rows.length === 0) {
      throw new Error('No stock record found for the given product and shop.');
    }

    return {
      quantity_on_shelf: result.rows[0].quantity_on_shelf,
      quantity_in_order: result.rows[0].quantity_in_order,
    };
  } catch (error) {
    console.error('Error fetching stock balance:', error);
    throw new Error('Failed to fetch stock balance.');
  }
};

const insertLocalRecord = async (
  pool,
  product_id,
  shop_id,
  newShelfQuantity,
  newOrderQuantity
) => {
  try {
    const result = await pool.query(
      'INSERT INTO stock (product_id, shop_id, quantity_on_shelf, quantity_in_order) VALUES ($1, $2, $3, $4) RETURNING *',
      [product_id, shop_id, newShelfQuantity, newOrderQuantity]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error in updateStock:', error.message);
    throw new Error('Failed to update stock in the database');
  }
};

const updateLocalRecord = async (
  pool,
  product_id,
  shop_id,
  quantity_on_shelf,
  quantity_in_order
) => {
  try {
    const result = await pool.query(
      'UPDATE stock SET quantity_on_shelf = $3, quantity_in_order = $4 WHERE product_id = $1 AND shop_id = $2 RETURNING *',
      [product_id, shop_id, quantity_on_shelf, quantity_in_order]
    );
    if (result.rows.length === 0) {
      throw new Error('Failed to update stock');
    }
    return result.rows[0];
  } catch (error) {
    console.error('Error in updateStock:', error.message);
    throw new Error('Failed to update stock in the database');
  }
};

const updateHistoryService = async (
  plu,
  shop_id,
  action,
  quantity_on_shelf,
  quantity_in_order
) => {
  const historyData = createHistoryData(
    plu,
    shop_id,
    action,
    quantity_on_shelf,
    quantity_in_order
  );
  const historyServiceUrl = `${BASE_HISTORY_URL}/${action}`;
  const method = action === 'add_stocks' ? 'post' : 'put';

  try {
    const response = await axios({
      method: method,
      url: historyServiceUrl,
      data: historyData,
    });

    console.log('History created:', response.data);
    return response;
  } catch (error) {
    console.error('Error creating history:', error);
    throw new Error('Failed to send data to history service.');
  }
};

module.exports = {
  getStockBalance,
  updateLocalRecord,
  updateHistoryService,
  insertLocalRecord,
};
