-- Таблица товаров
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    plu VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL
);
-- Таблица магазинов
CREATE TABLE IF NOT EXISTS shops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);
-- Таблица остатков
CREATE TABLE IF NOT EXISTS stock (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    shop_id INT REFERENCES shops(id) ON DELETE CASCADE,
    quantity_on_shelf INT NOT NULL,
    quantity_in_order INT NOT NULL
);
