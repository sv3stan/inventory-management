const validateStockData = require('../utils/validate');
const {
  getStockBalance,
  updateLocalRecord,
  updateHistoryService,
  insertLocalRecord,
} = require('../utils/stockservice');

const addStocks = (pool) => async (req, res) => {
  const { product_id, shop_id, quantity_on_shelf, quantity_in_order } =
    req.body;

  try {
    const quantity_on_shelf_int = parseInt(quantity_on_shelf, 10);
    const quantity_in_order_int = parseInt(quantity_in_order, 10);

    const validation = await validateStockData(req.body, pool, 'add');
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: true,
        message: validation.message,
      });
    }

    await insertLocalRecord(
      pool,
      product_id,
      shop_id,
      quantity_on_shelf_int,
      quantity_in_order_int
    );

    const product = await pool.query('SELECT plu FROM products WHERE id = $1', [
      product_id,
    ]);
    const plu = product.rows[0].plu;

    await updateHistoryService(
      plu,
      shop_id,
      'add_stocks',
      quantity_on_shelf_int,
      quantity_in_order_int
    );

    return res.status(200).json({
      success: true,
      error: false,
      message: 'Stocks add successfully updated',
    });
  } catch (error) {
    console.error('Error creating stocks:', error);
    return res.status(500).json({
      success: false,
      error: true,
      message: 'An error occurred while processing the request',
    });
  }
};

const incStocks = (pool) => async (req, res) => {
  const { product_id, shop_id, quantity_on_shelf, quantity_in_order } =
    req.body;

  const quantity_on_shelf_int = parseInt(quantity_on_shelf, 10);
  const quantity_in_order_int = parseInt(quantity_in_order, 10);

  try {
    const validation = await validateStockData(req.body, pool, 'inc');

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: true,
        message: validation.message,
      });
    }

    const { quantity_on_shelf: currentShelf, quantity_in_order: currentOrder } =
      await getStockBalance(pool, product_id, shop_id);

    const newShelfQuantity = currentShelf + quantity_on_shelf_int;
    const newOrderQuantity = currentOrder + quantity_in_order_int;

    await updateLocalRecord(
      pool,
      product_id,
      shop_id,
      newShelfQuantity,
      newOrderQuantity
    );

    const product = await pool.query('SELECT plu FROM products WHERE id = $1', [
      product_id,
    ]);
    const plu = product.rows[0].plu;

    await updateHistoryService(
      plu,
      shop_id,
      'inc_stocks',
      quantity_on_shelf_int,
      quantity_in_order_int
    );

    return res.status(200).json({
      success: true,
      error: false,
      message: 'Stocks increase successfully updated',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: 'An error occurred while processing the request',
    });
  }
};

const decStocks = (pool) => async (req, res) => {
  const { product_id, shop_id, quantity_on_shelf, quantity_in_order } =
    req.body;

  const quantity_on_shelf_int = parseInt(quantity_on_shelf, 10);
  const quantity_in_order_int = parseInt(quantity_in_order, 10);

  try {
    const validation = await validateStockData(req.body, pool, 'dec');

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: true,
        message: validation.message,
      });
    }

    const { quantity_on_shelf: currentShelf, quantity_in_order: currentOrder } =
      await getStockBalance(pool, product_id, shop_id);

    const newShelfQuantity = currentShelf - quantity_on_shelf_int;
    const newOrderQuantity = currentOrder - quantity_in_order_int;

    if (newShelfQuantity < 0 || newOrderQuantity < 0) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Insufficient stock quantity',
      });
    }

    await updateLocalRecord(
      pool,
      product_id,
      shop_id,
      newShelfQuantity,
      newOrderQuantity
    );

    const product = await pool.query('SELECT plu FROM products WHERE id = $1', [
      product_id,
    ]);
    const plu = product.rows[0].plu;

    await updateHistoryService(
      plu,
      shop_id,
      'dec_stocks',
      quantity_in_order_int,
      quantity_in_order_int
    );

    return res.status(200).json({
      success: true,
      error: false,
      message: 'Stocks decrease successfully updated',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: 'An error occurred while processing the request',
    });
  }
};

module.exports = {
  addStocks,
  incStocks,
  decStocks,
};
