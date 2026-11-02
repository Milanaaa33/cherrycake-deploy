-- V2__seed_data.sql: Seed data for Cherry Cake Bakery & Café
-- Regions & VAT Rates (Stage 3 Reference Table)
-- UZB: 15% | KAZ: 20% | GEO: 12% | UKR: 8% | CHN: 18%

INSERT INTO regions (code, name, currency_code, currency_symbol, vat_rate, is_active) VALUES
('UZB', 'Uzbekistan', 'UZS', 'soʻm', 15.00, TRUE),
('KAZ', 'Kazakhstan', 'KZT', '₸', 20.00, TRUE),
('GEO', 'Georgia', 'GEL', '₾', 12.00, TRUE),
('UKR', 'Ukraine', 'UAH', '₴', 8.00, TRUE),
('CHN', 'China', 'CNY', '¥', 18.00, TRUE);

-- Categories
INSERT INTO categories (code, name, description, display_order) VALUES
('CAKES', 'Signature Cakes', 'Handcrafted celebration and artisan cakes', 1),
('PASTRIES', 'Fresh Pastries', 'Baked fresh every morning with french butter', 2),
('BEVERAGES', 'Coffee & Tea', 'Specialty barista-crafted coffees and herbal teas', 3);

-- Products
INSERT INTO products (category_id, code, name, description, image_url, is_available) VALUES
(1, 'CHERRY_BLOSSOM', 'Cherry Blossom Signature Cake', 'Layers of delicate sponge, cherry compote and white chocolate mascarpone cream', '/assets/cakes/cherry_blossom.jpg', TRUE),
(1, 'BLACK_FOREST', 'Classic Black Forest Gateau', 'Rich chocolate sponge with dark cherries and whipped kirsch cream', '/assets/cakes/black_forest.jpg', TRUE),
(1, 'RED_VELVET', 'Red Velvet Cherry Dream', 'Velvety crimson cake filled with tart cherry puree and cream cheese frosting', '/assets/cakes/red_velvet.jpg', TRUE),
(2, 'CHERRY_DANISH', 'Cherry & Almond Danish', 'Flaky puff pastry topped with spiced cherries and toasted almonds', '/assets/pastries/cherry_danish.jpg', TRUE),
(2, 'BUTTER_CROISSANT', 'Parisian Butter Croissant', 'Traditional golden, buttery and flaky viennoiserie', '/assets/pastries/butter_croissant.jpg', TRUE),
(3, 'CHERRY_LATTE', 'Cherry Blossom Vanilla Latte', 'Espresso with steamed milk, cherry blossom infusion and Madagascar vanilla', '/assets/beverages/cherry_latte.jpg', TRUE),
(3, 'ESPRESSO_SPECIALTY', 'Signature Espresso Double', 'Single origin beans roasted to perfection with fruity notes', '/assets/beverages/espresso.jpg', TRUE);

-- Regional Prices
-- Product 1: Cherry Blossom Signature Cake
-- UZB: 200,000 UZS | KAZ: 7,500 KZT | GEO: 45 GEL | UKR: 650 UAH | CHN: 120 CNY
INSERT INTO product_prices (product_id, region_id, price) VALUES
(1, 1, 200000.00),
(1, 2, 7500.00),
(1, 3, 45.00),
(1, 4, 650.00),
(1, 5, 120.00),
-- Product 2: Black Forest Gateau
-- UZB: 180,000 UZS | KAZ: 6,800 KZT | GEO: 40 GEL | UKR: 580 UAH | CHN: 110 CNY
(2, 1, 180000.00),
(2, 2, 6800.00),
(2, 3, 40.00),
(2, 4, 580.00),
(2, 5, 110.00),
-- Product 3: Red Velvet
-- UZB: 190,000 UZS | KAZ: 7,000 KZT | GEO: 42 GEL | UKR: 600 UAH | CHN: 115 CNY
(3, 1, 190000.00),
(3, 2, 7000.00),
(3, 3, 42.00),
(3, 4, 600.00),
(3, 5, 115.00),
-- Product 4: Cherry Danish
-- UZB: 35,000 UZS | KAZ: 1,500 KZT | GEO: 9 GEL | UKR: 120 UAH | CHN: 25 CNY
(4, 1, 35000.00),
(4, 2, 1500.00),
(4, 3, 9.00),
(4, 4, 120.00),
(4, 5, 25.00),
-- Product 5: Butter Croissant
-- UZB: 25,000 UZS | KAZ: 1,100 KZT | GEO: 7 GEL | UKR: 90 UAH | CHN: 18 CNY
(5, 1, 25000.00),
(5, 2, 1100.00),
(5, 3, 7.00),
(5, 4, 90.00),
(5, 5, 18.00),
-- Product 6: Cherry Latte
-- UZB: 42,000 UZS | KAZ: 1,800 KZT | GEO: 11 GEL | UKR: 140 UAH | CHN: 30 CNY
(6, 1, 42000.00),
(6, 2, 1800.00),
(6, 3, 11.00),
(6, 4, 140.00),
(6, 5, 30.00),
-- Product 7: Espresso Double
-- UZB: 28,000 UZS | KAZ: 1,200 KZT | GEO: 8 GEL | UKR: 95 UAH | CHN: 20 CNY
(7, 1, 28000.00),
(7, 2, 1200.00),
(7, 3, 8.00),
(7, 4, 95.00),
(7, 5, 20.00);

-- Product Modifiers
INSERT INTO product_modifiers (product_id, name, price_delta, is_default) VALUES
(1, 'Extra Cherry Compote', 15000.00, FALSE),
(1, 'Personalized Message Plaque', 10000.00, FALSE),
(6, 'Oat Milk Alternative', 5000.00, FALSE),
(6, 'Extra Espresso Shot', 8000.00, FALSE);

-- Stage 3 Discount Reference Table
-- Order Cost >= 100 -> 3%
-- Order Cost >= 500 -> 5%
-- Order Cost >= 700 -> 7%
-- Order Cost >= 1000 -> 10%
-- Order Cost >= 5000 -> 15%
INSERT INTO discounts (code, name, discount_type, min_subtotal, percentage, fixed_amount, is_active) VALUES
(NULL, 'Tier 1 Discount (Cost >= 100)', 'THRESHOLD', 100.00, 3.00, 0.00, TRUE),
(NULL, 'Tier 2 Discount (Cost >= 500)', 'THRESHOLD', 500.00, 5.00, 0.00, TRUE),
(NULL, 'Tier 3 Discount (Cost >= 700)', 'THRESHOLD', 700.00, 7.00, 0.00, TRUE),
(NULL, 'Tier 4 Discount (Cost >= 1000)', 'THRESHOLD', 1000.00, 10.00, 0.00, TRUE),
(NULL, 'Tier 5 Discount (Cost >= 5000)', 'THRESHOLD', 5000.00, 15.00, 0.00, TRUE),
('WELCOME10', 'Welcome 10% Promo', 'PROMO_CODE', 0.00, 10.00, 0.00, TRUE);

-- Users (BCrypt hashed passwords for 'password123')
INSERT INTO users (email, password_hash, full_name, phone, role) VALUES
('admin@cherrycake.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Administrator', '+998901234567', 'ROLE_ADMIN'),
('customer@cherrycake.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Cherry Guest', '+998907654321', 'ROLE_USER');

-- Pickup Points
INSERT INTO pickup_points (region_id, name, address, working_hours, is_active) VALUES
(1, 'Central Bakery & Café Tashkent', 'Amir Temur Avenue 45, Tashkent', '08:00 - 22:00', TRUE),
(1, 'Mirzo Ulugbek Boutique', 'Buyuk Ipak Yoli 112, Tashkent', '09:00 - 21:00', TRUE),
(2, 'Almaty Downtown Flagship', 'Dostyk Avenue 89, Almaty', '08:30 - 22:00', TRUE),
(3, 'Tbilisi Old Town Bakery', 'Rustaveli Avenue 14, Tbilisi', '08:00 - 21:00', TRUE),
(4, 'Kyiv Podil Café', 'Sahaidachnoho St 22, Kyiv', '08:00 - 21:00', TRUE),
(5, 'Beijing Chaoyang Boutique', 'Sanlitun Road 19, Beijing', '07:30 - 22:00', TRUE);

-- Delivery Zones
INSERT INTO delivery_zones (region_id, name, delivery_fee, estimated_minutes, is_active) VALUES
(1, 'Tashkent City Center', 20000.00, 30, TRUE),
(1, 'Tashkent Outer Ring', 35000.00, 50, TRUE),
(2, 'Almaty Center', 1200.00, 35, TRUE),
(3, 'Tbilisi Central', 6.00, 30, TRUE),
(4, 'Kyiv Center', 80.00, 35, TRUE),
(5, 'Beijing Inner Ring', 20.00, 40, TRUE);

-- Initial Time Slots for table bookings / order pickup
INSERT INTO time_slots (slot_time, capacity, reserved_count) VALUES
(CURRENT_TIMESTAMP + INTERVAL '1 hour', 10, 0),
(CURRENT_TIMESTAMP + INTERVAL '2 hour', 10, 0),
(CURRENT_TIMESTAMP + INTERVAL '3 hour', 10, 0),
(CURRENT_TIMESTAMP + INTERVAL '4 hour', 10, 0);
