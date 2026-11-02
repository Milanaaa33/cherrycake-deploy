-- V3__add_expanded_regions.sql: Add Belarus, Lithuania, Latvia, Estonia, Finland, Sweden, Moldova, Romania, Turkey, Azerbaijan, Armenia
-- Total operating regions: 16 countries with local currencies and tax policies

-- 1. Insert new Regions
INSERT INTO regions (code, name, currency_code, currency_symbol, vat_rate, is_active) VALUES
('BLR', 'Belarus', 'BYN', 'Br', 20.00, TRUE),
('LTU', 'Lithuania', 'EUR', '€', 21.00, TRUE),
('LVA', 'Latvia', 'EUR', '€', 21.00, TRUE),
('EST', 'Estonia', 'EUR', '€', 22.00, TRUE),
('FIN', 'Finland', 'EUR', '€', 25.50, TRUE),
('SWE', 'Sweden', 'SEK', 'kr', 25.00, TRUE),
('MDA', 'Moldova', 'MDL', 'L', 20.00, TRUE),
('ROU', 'Romania', 'RON', 'lei', 19.00, TRUE),
('TUR', 'Turkey', 'TRY', '₺', 20.00, TRUE),
('AZE', 'Azerbaijan', 'AZN', '₼', 18.00, TRUE),
('ARM', 'Armenia', 'AMD', '֏', 20.00, TRUE);

-- Helper procedure: Insert product prices using region codes
-- Products:
-- 1 = CHERRY_BLOSSOM (Signature Cake)
-- 2 = BLACK_FOREST (Classic Cake)
-- 3 = RED_VELVET (Red Velvet Cake)
-- 4 = CHERRY_DANISH (Fresh Pastry)
-- 5 = BUTTER_CROISSANT (Fresh Pastry)
-- 6 = CHERRY_LATTE (Beverage)
-- 7 = ESPRESSO_SPECIALTY (Beverage)

-- Belarus (BLR - BYN)
INSERT INTO product_prices (product_id, region_id, price)
SELECT p.id, r.id, val.price
FROM products p
CROSS JOIN regions r
JOIN (VALUES
    ('CHERRY_BLOSSOM', 52.00),
    ('BLACK_FOREST', 47.00),
    ('RED_VELVET', 49.00),
    ('CHERRY_DANISH', 9.50),
    ('BUTTER_CROISSANT', 6.80),
    ('CHERRY_LATTE', 11.00),
    ('ESPRESSO_SPECIALTY', 7.50)
) AS val(code, price) ON p.code = val.code
WHERE r.code = 'BLR';

-- Lithuania (LTU - EUR)
INSERT INTO product_prices (product_id, region_id, price)
SELECT p.id, r.id, val.price
FROM products p
CROSS JOIN regions r
JOIN (VALUES
    ('CHERRY_BLOSSOM', 16.50),
    ('BLACK_FOREST', 15.00),
    ('RED_VELVET', 15.50),
    ('CHERRY_DANISH', 3.50),
    ('BUTTER_CROISSANT', 2.50),
    ('CHERRY_LATTE', 4.20),
    ('ESPRESSO_SPECIALTY', 2.80)
) AS val(code, price) ON p.code = val.code
WHERE r.code = 'LTU';

-- Latvia (LVA - EUR)
INSERT INTO product_prices (product_id, region_id, price)
SELECT p.id, r.id, val.price
FROM products p
CROSS JOIN regions r
JOIN (VALUES
    ('CHERRY_BLOSSOM', 16.50),
    ('BLACK_FOREST', 15.00),
    ('RED_VELVET', 15.50),
    ('CHERRY_DANISH', 3.50),
    ('BUTTER_CROISSANT', 2.50),
    ('CHERRY_LATTE', 4.20),
    ('ESPRESSO_SPECIALTY', 2.80)
) AS val(code, price) ON p.code = val.code
WHERE r.code = 'LVA';

-- Estonia (EST - EUR)
INSERT INTO product_prices (product_id, region_id, price)
SELECT p.id, r.id, val.price
FROM products p
CROSS JOIN regions r
JOIN (VALUES
    ('CHERRY_BLOSSOM', 17.00),
    ('BLACK_FOREST', 15.50),
    ('RED_VELVET', 16.00),
    ('CHERRY_DANISH', 3.60),
    ('BUTTER_CROISSANT', 2.60),
    ('CHERRY_LATTE', 4.40),
    ('ESPRESSO_SPECIALTY', 3.00)
) AS val(code, price) ON p.code = val.code
WHERE r.code = 'EST';

-- Finland (FIN - EUR)
INSERT INTO product_prices (product_id, region_id, price)
SELECT p.id, r.id, val.price
FROM products p
CROSS JOIN regions r
JOIN (VALUES
    ('CHERRY_BLOSSOM', 18.50),
    ('BLACK_FOREST', 17.00),
    ('RED_VELVET', 17.50),
    ('CHERRY_DANISH', 4.20),
    ('BUTTER_CROISSANT', 3.20),
    ('CHERRY_LATTE', 5.20),
    ('ESPRESSO_SPECIALTY', 3.50)
) AS val(code, price) ON p.code = val.code
WHERE r.code = 'FIN';

-- Sweden (SWE - SEK)
INSERT INTO product_prices (product_id, region_id, price)
SELECT p.id, r.id, val.price
FROM products p
CROSS JOIN regions r
JOIN (VALUES
    ('CHERRY_BLOSSOM', 185.00),
    ('BLACK_FOREST', 170.00),
    ('RED_VELVET', 175.00),
    ('CHERRY_DANISH', 42.00),
    ('BUTTER_CROISSANT', 32.00),
    ('CHERRY_LATTE', 52.00),
    ('ESPRESSO_SPECIALTY', 35.00)
) AS val(code, price) ON p.code = val.code
WHERE r.code = 'SWE';

-- Moldova (MDA - MDL)
INSERT INTO product_prices (product_id, region_id, price)
SELECT p.id, r.id, val.price
FROM products p
CROSS JOIN regions r
JOIN (VALUES
    ('CHERRY_BLOSSOM', 295.00),
    ('BLACK_FOREST', 265.00),
    ('RED_VELVET', 275.00),
    ('CHERRY_DANISH', 55.00),
    ('BUTTER_CROISSANT', 38.00),
    ('CHERRY_LATTE', 65.00),
    ('ESPRESSO_SPECIALTY', 42.00)
) AS val(code, price) ON p.code = val.code
WHERE r.code = 'MDA';

-- Romania (ROU - RON)
INSERT INTO product_prices (product_id, region_id, price)
SELECT p.id, r.id, val.price
FROM products p
CROSS JOIN regions r
JOIN (VALUES
    ('CHERRY_BLOSSOM', 78.00),
    ('BLACK_FOREST', 72.00),
    ('RED_VELVET', 75.00),
    ('CHERRY_DANISH', 16.00),
    ('BUTTER_CROISSANT', 12.00),
    ('CHERRY_LATTE', 19.50),
    ('ESPRESSO_SPECIALTY', 13.50)
) AS val(code, price) ON p.code = val.code
WHERE r.code = 'ROU';

-- Turkey (TUR - TRY)
INSERT INTO product_prices (product_id, region_id, price)
SELECT p.id, r.id, val.price
FROM products p
CROSS JOIN regions r
JOIN (VALUES
    ('CHERRY_BLOSSOM', 560.00),
    ('BLACK_FOREST', 510.00),
    ('RED_VELVET', 530.00),
    ('CHERRY_DANISH', 115.00),
    ('BUTTER_CROISSANT', 85.00),
    ('CHERRY_LATTE', 140.00),
    ('ESPRESSO_SPECIALTY', 95.00)
) AS val(code, price) ON p.code = val.code
WHERE r.code = 'TUR';

-- Azerbaijan (AZE - AZN)
INSERT INTO product_prices (product_id, region_id, price)
SELECT p.id, r.id, val.price
FROM products p
CROSS JOIN regions r
JOIN (VALUES
    ('CHERRY_BLOSSOM', 28.00),
    ('BLACK_FOREST', 25.50),
    ('RED_VELVET', 26.50),
    ('CHERRY_DANISH', 5.50),
    ('BUTTER_CROISSANT', 3.80),
    ('CHERRY_LATTE', 6.50),
    ('ESPRESSO_SPECIALTY', 4.20)
) AS val(code, price) ON p.code = val.code
WHERE r.code = 'AZE';

-- Armenia (ARM - AMD)
INSERT INTO product_prices (product_id, region_id, price)
SELECT p.id, r.id, val.price
FROM products p
CROSS JOIN regions r
JOIN (VALUES
    ('CHERRY_BLOSSOM', 6500.00),
    ('BLACK_FOREST', 5900.00),
    ('RED_VELVET', 6200.00),
    ('CHERRY_DANISH', 1250.00),
    ('BUTTER_CROISSANT', 900.00),
    ('CHERRY_LATTE', 1500.00),
    ('ESPRESSO_SPECIALTY', 950.00)
) AS val(code, price) ON p.code = val.code
WHERE r.code = 'ARM';

-- Pickup Points for New Regions
INSERT INTO pickup_points (region_id, name, address, working_hours, is_active)
SELECT r.id, val.name, val.address, val.hours, TRUE
FROM regions r
JOIN (VALUES
    ('BLR', 'Central Bakery Minsk', 'Nezavisimosti Avenue 25, Minsk', '08:00 - 22:00'),
    ('LTU', 'Vilnius Old Town Bakery', 'Pilies g. 12, Vilnius', '08:00 - 21:00'),
    ('LVA', 'Riga Art Nouveau Café', 'Elizabetes iela 33, Riga', '08:00 - 21:00'),
    ('EST', 'Tallinn Rotermann Boutique', 'Rotermanni 8, Tallinn', '08:00 - 21:00'),
    ('FIN', 'Helsinki Esplanadi Café', 'Pohjoisesplanadi 21, Helsinki', '07:30 - 21:00'),
    ('SWE', 'Stockholm Gamla Stan Bakery', 'Stortorget 7, Stockholm', '08:00 - 20:00'),
    ('MDA', 'Chisinau Central Boutique', 'bd. Stefan cel Mare 105, Chisinau', '08:00 - 22:00'),
    ('ROU', 'Bucharest Lipscani Café', 'Strada Lipscani 45, Bucharest', '08:00 - 22:00'),
    ('TUR', 'Istanbul Nisantasi Flagship', 'Abdi Ipekci Cd. 38, Istanbul', '08:00 - 23:00'),
    ('AZE', 'Baku Nizami Street Bakery', 'Nizami St. 68, Baku', '08:00 - 22:00'),
    ('ARM', 'Yerevan Abovyan Café', 'Abovyan St. 14, Yerevan', '08:30 - 22:00')
) AS val(code, name, address, hours) ON r.code = val.code;

-- Delivery Zones for New Regions
INSERT INTO delivery_zones (region_id, name, delivery_fee, estimated_minutes, is_active)
SELECT r.id, val.name, val.fee, val.minutes, TRUE
FROM regions r
JOIN (VALUES
    ('BLR', 'Minsk Central Zone', 8.00, 35),
    ('LTU', 'Vilnius Central', 3.00, 30),
    ('LVA', 'Riga Central', 3.00, 30),
    ('EST', 'Tallinn Kesklinn', 3.50, 30),
    ('FIN', 'Helsinki Kamppi & Center', 4.50, 35),
    ('SWE', 'Stockholm Inner City', 45.00, 35),
    ('MDA', 'Chisinau Centru', 40.00, 35),
    ('ROU', 'Bucharest Sector 1 & Central', 12.00, 35),
    ('TUR', 'Istanbul Besiktas & Sisli', 60.00, 40),
    ('AZE', 'Baku Sabail & Central', 3.50, 35),
    ('ARM', 'Yerevan Kentron', 800.00, 35)
) AS val(code, name, fee, minutes) ON r.code = val.code;

