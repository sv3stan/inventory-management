const API_URL = 'http://localhost:3000';

document.getElementById('addShopForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const shopName = document.getElementById('shopName').value;
  await fetch(`${API_URL}/shop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: shopName }),
  });
  console.log('Shop added!');
});

document
  .getElementById('addProductForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const productPLU = document.getElementById('productPLU').value;
    const productName = document.getElementById('productName').value;
    await fetch(`${API_URL}/product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plu: productPLU, name: productName }),
    });
    console.log('Product added!');
  });

document.querySelectorAll('.stock-action').forEach((button) => {
  button.addEventListener('click', async (e) => {
    const action = e.target.getAttribute('data-action');
    const shopId = document.getElementById('shopId').value;
    const productID = document.getElementById('productID').value;
    const shelfQuantity = parseInt(
      document.getElementById('shelfQuantity').value || '0',
      10
    );
    const orderQuantity = parseInt(
      document.getElementById('orderQuantity').value || '0',
      10
    );
    if (!shopId || !productID || isNaN(shelfQuantity) || isNaN(orderQuantity)) {
      console.error('Incorrect data');
      console.log('Please fill out all fields correctly');
      return;
    }
    try {
      const actions = {
        add: { url: `${API_URL}/stocks/`, method: 'POST' },
        increase: { url: `${API_URL}/stocks/inc`, method: 'PUT' },
        decrease: { url: `${API_URL}/stocks/dec`, method: 'PUT' },
      };
      const { url, method } = actions[action] || {};
      if (!url || !method) {
        console.error('Unknown error');
        console.log('Unknown error');
        return;
      }
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shopId,
          product_id: productID,
          quantity_on_shelf: shelfQuantity,
          quantity_in_order: orderQuantity,
        }),
      });
      if (response.ok) {
        console.log(`Operation "${action}" completed successfully!`);
      } else {
        const errorText = await response.text();
        console.error('Error during operation:', errorText);
        console.log(`Error: ${errorText}`);
      }
    } catch (err) {
      console.error('Request Error:', err);
      console.log('An error occurred while executing the request');
    }
  });
});

const updateStocksTable = (stocks) => {
  const tableBody = document.querySelector('#stocksTable tbody');
  tableBody.innerHTML = '';
  stocks.forEach((stock) => {
    const row = document.createElement('tr');
    row.innerHTML = `
            <td>${stock.shop_name}</td>
            <td>${stock.product_name}</td>
            <td>${stock.plu}</td>
            <td>${stock.quantity_on_shelf}</td>
            <td>${stock.quantity_in_order}</td>
        `;
    tableBody.appendChild(row);
  });
};

document
  .getElementById('filterShopAndPLUForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const shopId = document.getElementById('filterShopId').value;
    const productPLU = document.getElementById('filterPLU').value;
    const query = new URLSearchParams({
      shop_id: shopId,
      plu: productPLU,
    }).toString();
    const response = await fetch(`${API_URL}/stocks?${query}`);
    const stocks = await response.json();
    updateStocksTable(stocks);
  });

document
  .getElementById('filterShelfForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const quantityOnShelfMin =
      document.getElementById('quantityOnShelfMin').value;
    const quantityOnShelfMax =
      document.getElementById('quantityOnShelfMax').value;

    const query = new URLSearchParams({
      quantity_on_shelf_min: quantityOnShelfMin,
      quantity_on_shelf_max: quantityOnShelfMax,
    }).toString();
    const response = await fetch(`${API_URL}/stocks?${query}`);
    const stocks = await response.json();
    updateStocksTable(stocks);
  });

document
  .getElementById('filterOrderForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const quantityInOrderMin =
      document.getElementById('quantityInOrderMin').value;
    const quantityInOrderMax =
      document.getElementById('quantityInOrderMax').value;

    const query = new URLSearchParams({
      quantity_in_order_min: quantityInOrderMin,
      quantity_in_order_max: quantityInOrderMax,
    }).toString();
    const response = await fetch(`${API_URL}/stocks?${query}`);
    const stocks = await response.json();
    updateStocksTable(stocks);
  });

document.getElementById('clearFilters').addEventListener('click', (e) => {
  document.getElementById('filterShopId').value = '';
  document.getElementById('filterPLU').value = '';
  document.getElementById('quantityInOrderMin').value = '';
  document.getElementById('quantityInOrderMax').value = '';
  document.getElementById('quantityOnShelfMin').value = '';
  document.getElementById('quantityOnShelfMax').value = '';

  updateStocksTable([]);
});
