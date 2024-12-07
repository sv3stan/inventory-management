const shop = require('../router/shop');

const validateStockData = async (reqBody, pool, action) => {
  const { product_id, shop_id, quantity_on_shelf, quantity_in_order } = reqBody;

  const shopId = parseInt(shop_id, 10);
  const productId = parseInt(product_id, 10);

  if (
    !product_id ||
    !shop_id ||
    quantity_on_shelf === undefined ||
    quantity_in_order === undefined
  ) {
    return { isValid: false, message: 'All fields are required' };
  }

  if (isNaN(Number(quantity_on_shelf)) || isNaN(Number(quantity_in_order))) {
    return { isValid: false, message: 'Quantities must be valid numbers' };
  }

  const existingData = await pool.query(
    'SELECT * FROM stock WHERE shop_id = $1 OR product_id = $2',
    [shopId, productId]
  );

  const stockExists = existingData.rows.some(
    (row) =>
      parseInt(row.shop_id, 10) === shopId &&
      parseInt(row.product_id, 10) === productId
  );

  if ((action === 'inc' || action === 'dec') && !stockExists) {
    return { isValid: false, message: 'Product does not exist in the shop' };
  }

  if (action === 'add' && stockExists) {
    return { isValid: false, message: 'Product already exists in the shop' };
  }

  return { isValid: true };
};

module.exports = validateStockData;
