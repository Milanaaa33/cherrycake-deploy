-- Twelve more regions (ported from the extended project). Additive only: nothing existing is changed.
-- Every statement is idempotent (NOT EXISTS guards), so the migration is safe on a database
-- where some of these rows were already added by hand. Plain SQL only, so the H2 test profile runs it too.
-- Rates follow the V3 convention: vat_rate is a fraction, exchange_rate says how much local currency one CU is worth.

INSERT INTO regions (code, name, currency_code, currency_symbol, vat_rate, exchange_rate)
SELECT v.code, v.name, v.currency_code, v.currency_symbol, v.vat_rate, v.exchange_rate
FROM (VALUES
    ('ARM', 'Armenia',    'AMD', '֏',   0.2000, 100.0000),
    ('AZE', 'Azerbaijan', 'AZN', '₼',   0.1800,   0.4250),
    ('TUR', 'Turkey',     'TRY', '₺',   0.1800,   8.5000),
    ('MDA', 'Moldova',    'MDL', 'L',   0.2000,   4.5000),
    ('ROU', 'Romania',    'RON', 'lei', 0.1900,   1.1500),
    ('EST', 'Estonia',    'EUR', '€',   0.2200,   0.2300),
    ('LVA', 'Latvia',     'EUR', '€',   0.2100,   0.2300),
    ('LTU', 'Lithuania',  'EUR', '€',   0.2100,   0.2300),
    ('FIN', 'Finland',    'EUR', '€',   0.2400,   0.2300),
    ('SWE', 'Sweden',     'SEK', 'kr',  0.2500,   2.6000),
    ('BLR', 'Belarus',    'BYN', 'Br',  0.2000,   0.8200),
    ('RUS', 'Russia',     'RUB', '₽',   0.2000,  24.0000)
) AS v (code, name, currency_code, currency_symbol, vat_rate, exchange_rate)
WHERE NOT EXISTS (SELECT 1 FROM regions r WHERE r.code = v.code);

-- Product prices in the new regions: the same conventional-unit prices as UZB (the catalog's base region).
INSERT INTO regional_prices (product_id, region_id, price, in_stock)
SELECT rp.product_id, r.id, rp.price, TRUE
FROM regional_prices rp
JOIN regions base ON base.id = rp.region_id AND base.code = 'UZB'
CROSS JOIN regions r
WHERE r.code IN ('ARM', 'AZE', 'TUR', 'MDA', 'ROU', 'EST', 'LVA', 'LTU', 'FIN', 'SWE', 'BLR', 'RUS')
  AND NOT EXISTS (SELECT 1 FROM regional_prices x WHERE x.product_id = rp.product_id AND x.region_id = r.id);

-- Modifier price deltas in the new regions, again copied from UZB.
INSERT INTO modifier_regional_prices (modifier_id, region_id, price_delta)
SELECT mrp.modifier_id, r.id, mrp.price_delta
FROM modifier_regional_prices mrp
JOIN regions base ON base.id = mrp.region_id AND base.code = 'UZB'
CROSS JOIN regions r
WHERE r.code IN ('ARM', 'AZE', 'TUR', 'MDA', 'ROU', 'EST', 'LVA', 'LTU', 'FIN', 'SWE', 'BLR', 'RUS')
  AND NOT EXISTS (SELECT 1 FROM modifier_regional_prices x WHERE x.modifier_id = mrp.modifier_id AND x.region_id = r.id);

-- Two pickup points per new region, like the five original regions in V5.
INSERT INTO pickup_points (region_id, name, address, opening_hours)
SELECT r.id, v.name, v.address, v.opening_hours
FROM (VALUES
    ('ARM', 'Cherry Cake Northern Avenue', 'Yerevan, Northern Avenue 5',             '09:00-21:00'),
    ('ARM', 'Cherry Cake Cascade',         'Yerevan, Tamanyan Street 10',            '10:00-20:00'),
    ('AZE', 'Cherry Cake Nizami',          'Baku, Nizami Street 70',                 '09:00-21:00'),
    ('AZE', 'Cherry Cake Boulevard',       'Baku, Neftchilar Avenue 24',             '10:00-20:00'),
    ('TUR', 'Cherry Cake Taksim',          'Istanbul, Istiklal Avenue 112',          '09:00-21:00'),
    ('TUR', 'Cherry Cake Kadikoy',         'Istanbul, Bahariye Street 31',           '10:00-20:00'),
    ('MDA', 'Cherry Cake Stefan cel Mare', 'Chisinau, Stefan cel Mare Boulevard 64', '09:00-21:00'),
    ('MDA', 'Cherry Cake Botanica',        'Chisinau, Dacia Boulevard 18',           '10:00-20:00'),
    ('ROU', 'Cherry Cake Lipscani',        'Bucharest, Lipscani Street 21',          '09:00-21:00'),
    ('ROU', 'Cherry Cake Herastrau',       'Bucharest, Kiseleff Road 7',             '10:00-20:00'),
    ('EST', 'Cherry Cake Old Town',        'Tallinn, Viru Street 14',                '09:00-21:00'),
    ('EST', 'Cherry Cake Kalamaja',        'Tallinn, Kalamaja Street 3',             '10:00-20:00'),
    ('LVA', 'Cherry Cake Vecriga',         'Riga, Kalku Street 9',                   '09:00-21:00'),
    ('LVA', 'Cherry Cake Agenskalns',      'Riga, Nometnu Street 27',                '10:00-20:00'),
    ('LTU', 'Cherry Cake Gedimino',        'Vilnius, Gedimino Avenue 33',            '09:00-21:00'),
    ('LTU', 'Cherry Cake Uzupis',          'Vilnius, Uzupio Street 8',               '10:00-20:00'),
    ('FIN', 'Cherry Cake Esplanadi',       'Helsinki, Pohjoisesplanadi 19',          '09:00-21:00'),
    ('FIN', 'Cherry Cake Kallio',          'Helsinki, Helsinginkatu 12',             '10:00-20:00'),
    ('SWE', 'Cherry Cake Gamla Stan',      'Stockholm, Vasterlanggatan 40',          '09:00-21:00'),
    ('SWE', 'Cherry Cake Sodermalm',       'Stockholm, Gotgatan 25',                 '10:00-20:00'),
    ('BLR', 'Cherry Cake Nezavisimosti',   'Minsk, Nezavisimosti Avenue 28',         '09:00-21:00'),
    ('BLR', 'Cherry Cake Zybitskaya',      'Minsk, Zybitskaya Street 6',             '10:00-20:00'),
    ('RUS', 'Cherry Cake Tverskaya',       'Moscow, Tverskaya Street 16',            '09:00-21:00'),
    ('RUS', 'Cherry Cake Arbat',           'Moscow, Arbat Street 29',                '10:00-20:00')
) AS v (region_code, name, address, opening_hours)
JOIN regions r ON r.code = v.region_code
WHERE NOT EXISTS (SELECT 1 FROM pickup_points x WHERE x.region_id = r.id AND x.name = v.name);

-- Delivery zones with the same CU fees as every other region (Center 15 000 UZS-equivalent, Suburbs 25 000).
INSERT INTO delivery_zones (region_id, name, delivery_fee)
SELECT r.id, v.name, v.delivery_fee
FROM regions r
CROSS JOIN (VALUES
    ('Center',  5.000000),
    ('Suburbs', 8.333333)
) AS v (name, delivery_fee)
WHERE r.code IN ('ARM', 'AZE', 'TUR', 'MDA', 'ROU', 'EST', 'LVA', 'LTU', 'FIN', 'SWE', 'BLR', 'RUS')
  AND NOT EXISTS (SELECT 1 FROM delivery_zones x WHERE x.region_id = r.id AND x.name = v.name);

-- Six dining tables per new pickup point (the V8 layout: 2 to 12 seats).
INSERT INTO dining_tables (pickup_point_id, table_number, seats)
SELECT pp.id, t.table_number, t.seats
FROM pickup_points pp
JOIN regions r ON r.id = pp.region_id
CROSS JOIN (VALUES (1, 2), (2, 4), (3, 6), (4, 8), (5, 10), (6, 12)) AS t (table_number, seats)
WHERE r.code IN ('ARM', 'AZE', 'TUR', 'MDA', 'ROU', 'EST', 'LVA', 'LTU', 'FIN', 'SWE', 'BLR', 'RUS')
  AND NOT EXISTS (SELECT 1 FROM dining_tables x WHERE x.pickup_point_id = pp.id AND x.table_number = t.table_number);
