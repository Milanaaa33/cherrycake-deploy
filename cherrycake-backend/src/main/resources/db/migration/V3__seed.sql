-- CC-7: catalog seed data (5 regions, 3 categories, 12 products, modifiers, discount rules).
-- Prices, modifier deltas and discount thresholds are in conventional units (CU).
-- exchange_rate is how much local currency 1 CU is worth.
-- Rows are linked by natural keys (region code, product name), so the script never depends on generated ids.

INSERT INTO regions (code, name, currency_code, currency_symbol, vat_rate, exchange_rate) VALUES
    ('UZB', 'Uzbekistan', 'UZS', 'so''m', 0.1500, 3000.0000),
    ('KAZ', 'Kazakhstan', 'KZT', '₸',     0.2000,  120.0000),
    ('GEO', 'Georgia',    'GEL', '₾',     0.1200,    0.6500),
    ('UKR', 'Ukraine',    'UAH', '₴',     0.0800,   10.0000),
    ('CHN', 'China',      'CNY', '¥',     0.1800,    1.7500);

INSERT INTO categories (name, sort_order) VALUES
    ('Cakes',    1),
    ('Desserts', 2),
    ('Drinks',   3);

INSERT INTO products (category_id, name, description, photo_url)
SELECT c.id, v.name, v.description, v.photo_url
FROM (VALUES
    ('Cakes',    'Cherry Cake',            'Vanilla sponge with cherry filling and whipped cream.',      '/images/products/cherry-cake.jpg'),
    ('Cakes',    'Chocolate Truffle Cake', 'Dark chocolate sponge with truffle ganache.',                '/images/products/chocolate-truffle-cake.jpg'),
    ('Cakes',    'Red Velvet Cake',        'Red velvet layers with cream cheese frosting.',              '/images/products/red-velvet-cake.jpg'),
    ('Cakes',    'Napoleon Cake',          'Thin puff pastry layers with custard cream.',                '/images/products/napoleon-cake.jpg'),
    ('Cakes',    'Honey Cake',             'Honey layers with sour cream filling.',                      '/images/products/honey-cake.jpg'),
    ('Desserts', 'Cherry Cheesecake',      'Baked cheesecake on a biscuit base with cherry topping.',    '/images/products/cherry-cheesecake.jpg'),
    ('Desserts', 'Tiramisu',               'Savoiardi soaked in espresso with mascarpone cream.',        '/images/products/tiramisu.jpg'),
    ('Desserts', 'Macarons Box',           'Almond macarons in assorted flavours.',                      '/images/products/macarons-box.jpg'),
    ('Desserts', 'Chocolate Eclair',       'Choux pastry with vanilla custard and chocolate glaze.',     '/images/products/chocolate-eclair.jpg'),
    ('Drinks',   'Cappuccino',             'Espresso with steamed milk foam.',                           '/images/products/cappuccino.jpg'),
    ('Drinks',   'Latte',                  'Espresso with steamed milk.',                                '/images/products/latte.jpg'),
    ('Drinks',   'Cherry Lemonade',        'Homemade lemonade with cherry syrup and mint.',              '/images/products/cherry-lemonade.jpg')
) AS v (category, name, description, photo_url)
JOIN categories c ON c.name = v.category;

-- One price per product and region. Napoleon Cake is sold out in GEO and Macarons Box in CHN (for the 409 case).
INSERT INTO regional_prices (product_id, region_id, price, in_stock)
SELECT p.id, r.id, v.price, v.in_stock
FROM (VALUES
    ('Cherry Cake',            'UZB', 120.00, TRUE), ('Cherry Cake',            'KAZ', 126.00, TRUE),
    ('Cherry Cake',            'GEO', 132.00, TRUE), ('Cherry Cake',            'UKR', 114.00, TRUE),
    ('Cherry Cake',            'CHN', 138.00, TRUE),
    ('Chocolate Truffle Cake', 'UZB', 135.00, TRUE), ('Chocolate Truffle Cake', 'KAZ', 142.00, TRUE),
    ('Chocolate Truffle Cake', 'GEO', 148.50, TRUE), ('Chocolate Truffle Cake', 'UKR', 128.50, TRUE),
    ('Chocolate Truffle Cake', 'CHN', 155.50, TRUE),
    ('Red Velvet Cake',        'UZB', 125.00, TRUE), ('Red Velvet Cake',        'KAZ', 131.50, TRUE),
    ('Red Velvet Cake',        'GEO', 137.50, TRUE), ('Red Velvet Cake',        'UKR', 119.00, TRUE),
    ('Red Velvet Cake',        'CHN', 144.00, TRUE),
    ('Napoleon Cake',          'UZB', 110.00, TRUE), ('Napoleon Cake',          'KAZ', 115.50, TRUE),
    ('Napoleon Cake',          'GEO', 121.00, FALSE), ('Napoleon Cake',         'UKR', 104.50, TRUE),
    ('Napoleon Cake',          'CHN', 126.50, TRUE),
    ('Honey Cake',             'UZB', 100.00, TRUE), ('Honey Cake',             'KAZ', 105.00, TRUE),
    ('Honey Cake',             'GEO', 110.00, TRUE), ('Honey Cake',             'UKR',  95.00, TRUE),
    ('Honey Cake',             'CHN', 115.00, TRUE),
    ('Cherry Cheesecake',      'UZB',  32.00, TRUE), ('Cherry Cheesecake',      'KAZ',  33.50, TRUE),
    ('Cherry Cheesecake',      'GEO',  35.00, TRUE), ('Cherry Cheesecake',      'UKR',  30.50, TRUE),
    ('Cherry Cheesecake',      'CHN',  37.00, TRUE),
    ('Tiramisu',               'UZB',  30.00, TRUE), ('Tiramisu',               'KAZ',  31.50, TRUE),
    ('Tiramisu',               'GEO',  33.00, TRUE), ('Tiramisu',               'UKR',  28.50, TRUE),
    ('Tiramisu',               'CHN',  34.50, TRUE),
    ('Macarons Box',           'UZB',  28.00, TRUE), ('Macarons Box',           'KAZ',  29.50, TRUE),
    ('Macarons Box',           'GEO',  31.00, TRUE), ('Macarons Box',           'UKR',  26.50, TRUE),
    ('Macarons Box',           'CHN',  32.00, FALSE),
    ('Chocolate Eclair',       'UZB',  12.00, TRUE), ('Chocolate Eclair',       'KAZ',  12.50, TRUE),
    ('Chocolate Eclair',       'GEO',  13.00, TRUE), ('Chocolate Eclair',       'UKR',  11.50, TRUE),
    ('Chocolate Eclair',       'CHN',  14.00, TRUE),
    ('Cappuccino',             'UZB',  14.00, TRUE), ('Cappuccino',             'KAZ',  14.50, TRUE),
    ('Cappuccino',             'GEO',  15.50, TRUE), ('Cappuccino',             'UKR',  13.50, TRUE),
    ('Cappuccino',             'CHN',  16.00, TRUE),
    ('Latte',                  'UZB',  15.00, TRUE), ('Latte',                  'KAZ',  16.00, TRUE),
    ('Latte',                  'GEO',  16.50, TRUE), ('Latte',                  'UKR',  14.50, TRUE),
    ('Latte',                  'CHN',  17.50, TRUE),
    ('Cherry Lemonade',        'UZB',  12.00, TRUE), ('Cherry Lemonade',        'KAZ',  12.50, TRUE),
    ('Cherry Lemonade',        'GEO',  13.00, TRUE), ('Cherry Lemonade',        'UKR',  11.50, TRUE),
    ('Cherry Lemonade',        'CHN',  14.00, TRUE)
) AS v (product, region, price, in_stock)
JOIN products p ON p.name = v.product
JOIN regions r ON r.code = v.region;

INSERT INTO modifier_groups (product_id, name, type, is_required)
SELECT p.id, v.name, v.type, v.is_required
FROM (VALUES
    ('Cherry Cake',            'Size',    'SINGLE', TRUE),
    ('Cherry Cake',            'Extras',  'MULTI',  FALSE),
    ('Chocolate Truffle Cake', 'Size',    'SINGLE', TRUE),
    ('Chocolate Truffle Cake', 'Extras',  'MULTI',  FALSE),
    ('Red Velvet Cake',        'Size',    'SINGLE', TRUE),
    ('Red Velvet Cake',        'Extras',  'MULTI',  FALSE),
    ('Napoleon Cake',          'Size',    'SINGLE', TRUE),
    ('Honey Cake',             'Size',    'SINGLE', TRUE),
    ('Cherry Cheesecake',      'Topping', 'SINGLE', FALSE),
    ('Macarons Box',           'Box',     'SINGLE', TRUE),
    ('Cappuccino',             'Size',    'SINGLE', TRUE),
    ('Cappuccino',             'Milk',    'SINGLE', FALSE),
    ('Cappuccino',             'Syrup',   'MULTI',  FALSE),
    ('Latte',                  'Size',    'SINGLE', TRUE),
    ('Latte',                  'Milk',    'SINGLE', FALSE),
    ('Latte',                  'Syrup',   'MULTI',  FALSE),
    ('Cherry Lemonade',        'Size',    'SINGLE', TRUE)
) AS v (product, name, type, is_required)
JOIN products p ON p.name = v.product;

-- Modifier names and deltas are the same for every product that has the group, so they are listed once per group kind.
CREATE TEMPORARY TABLE seed_modifiers (
    product_kind VARCHAR(10)    NOT NULL,
    group_name   VARCHAR(100)   NOT NULL,
    name         VARCHAR(100)   NOT NULL,
    price_delta  NUMERIC(12, 2) NOT NULL
);

INSERT INTO seed_modifiers (product_kind, group_name, name, price_delta) VALUES
    ('cake',      'Size',    'Small, 6 slices',      0.00),
    ('cake',      'Size',    'Medium, 10 slices',   40.00),
    ('cake',      'Size',    'Large, 14 slices',    80.00),
    ('cake',      'Extras',  'Fresh cherries',       8.00),
    ('cake',      'Extras',  'Chocolate drip',       6.00),
    ('cake',      'Extras',  'Custom inscription',   5.00),
    ('dessert',   'Topping', 'Cherry sauce',         3.00),
    ('dessert',   'Topping', 'Salted caramel',       3.00),
    ('dessert',   'Box',     '6 pieces',             0.00),
    ('dessert',   'Box',     '12 pieces',           24.00),
    ('coffee',    'Size',    'Small, 250 ml',        0.00),
    ('coffee',    'Size',    'Medium, 350 ml',       3.00),
    ('coffee',    'Size',    'Large, 450 ml',        5.00),
    ('coffee',    'Milk',    'Oat milk',             2.00),
    ('coffee',    'Milk',    'Almond milk',          2.50),
    ('coffee',    'Syrup',   'Cherry syrup',         1.50),
    ('coffee',    'Syrup',   'Vanilla syrup',        1.50),
    ('coffee',    'Syrup',   'Caramel syrup',        1.50),
    ('lemonade',  'Size',    'Small, 300 ml',        0.00),
    ('lemonade',  'Size',    'Large, 500 ml',        4.00);

CREATE TEMPORARY TABLE seed_product_kinds (
    product      VARCHAR(150) NOT NULL,
    product_kind VARCHAR(10)  NOT NULL
);

INSERT INTO seed_product_kinds (product, product_kind) VALUES
    ('Cherry Cake',            'cake'),
    ('Chocolate Truffle Cake', 'cake'),
    ('Red Velvet Cake',        'cake'),
    ('Napoleon Cake',          'cake'),
    ('Honey Cake',             'cake'),
    ('Cherry Cheesecake',      'dessert'),
    ('Macarons Box',           'dessert'),
    ('Cappuccino',             'coffee'),
    ('Latte',                  'coffee'),
    ('Cherry Lemonade',        'lemonade');

INSERT INTO modifiers (group_id, name)
SELECT g.id, m.name
FROM modifier_groups g
JOIN products p ON p.id = g.product_id
JOIN seed_product_kinds k ON k.product = p.name
JOIN seed_modifiers m ON m.product_kind = k.product_kind AND m.group_name = g.name;

-- Deltas are the same in every region for now; the table still allows a different delta per region.
INSERT INTO modifier_regional_prices (modifier_id, region_id, price_delta)
SELECT mo.id, r.id, m.price_delta
FROM modifiers mo
JOIN modifier_groups g ON g.id = mo.group_id
JOIN products p ON p.id = g.product_id
JOIN seed_product_kinds k ON k.product = p.name
JOIN seed_modifiers m ON m.product_kind = k.product_kind AND m.group_name = g.name AND m.name = mo.name
CROSS JOIN regions r;

DROP TABLE seed_modifiers;
DROP TABLE seed_product_kinds;

INSERT INTO discount_rules (threshold, rate) VALUES
    ( 100.00, 0.0300),
    ( 500.00, 0.0500),
    ( 700.00, 0.0700),
    (1000.00, 0.1000),
    (5000.00, 0.1500);
