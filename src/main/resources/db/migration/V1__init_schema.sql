-- V1__init_schema.sql: Initial schema for Cherry Cake Bakery & Café

CREATE TABLE regions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    currency_code VARCHAR(10) NOT NULL,
    currency_symbol VARCHAR(10) NOT NULL,
    vat_rate NUMERIC(5, 2) NOT NULL DEFAULT 12.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0
);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_prices (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    region_id BIGINT NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    price NUMERIC(15, 2) NOT NULL,
    CONSTRAINT uq_product_region UNIQUE (product_id, region_id)
);

CREATE TABLE product_modifiers (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price_delta NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    is_default BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE discounts (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    discount_type VARCHAR(30) NOT NULL, -- THRESHOLD, PROMO_CODE
    min_subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    fixed_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(30) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE time_slots (
    id BIGSERIAL PRIMARY KEY,
    slot_time TIMESTAMP NOT NULL,
    capacity INT NOT NULL DEFAULT 10,
    reserved_count INT NOT NULL DEFAULT 0
);

CREATE TABLE pickup_points (
    id BIGSERIAL PRIMARY KEY,
    region_id BIGINT NOT NULL REFERENCES regions(id),
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    working_hours VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE delivery_zones (
    id BIGSERIAL PRIMARY KEY,
    region_id BIGINT NOT NULL REFERENCES regions(id),
    name VARCHAR(100) NOT NULL,
    delivery_fee NUMERIC(15, 2) NOT NULL,
    estimated_minutes INT NOT NULL DEFAULT 45,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE table_bookings (
    id BIGSERIAL PRIMARY KEY,
    booking_number VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT REFERENCES users(id),
    table_number INT NOT NULL,
    guests_count INT NOT NULL,
    booking_time TIMESTAMP NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT REFERENCES users(id),
    region_id BIGINT NOT NULL REFERENCES regions(id),
    slot_id BIGINT REFERENCES time_slots(id),
    pickup_point_id BIGINT REFERENCES pickup_points(id),
    order_type VARCHAR(20) NOT NULL, -- PICKUP, DELIVERY
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    subtotal NUMERIC(15, 2) NOT NULL,
    vat_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    vat_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    amount_incl_vat NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    delivery_fee NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    delivery_address TEXT,
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    product_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL,
    modifiers_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(15, 2) NOT NULL,
    selected_modifiers TEXT
);

CREATE INDEX idx_orders_region_date ON orders (region_id, order_date);
CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_product_prices_region ON product_prices (region_id);
CREATE INDEX idx_bookings_time ON table_bookings (booking_time);
