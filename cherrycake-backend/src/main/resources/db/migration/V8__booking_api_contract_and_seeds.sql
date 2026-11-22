-- Align the reservation table name with the public BE contract.
ALTER TABLE table_bookings RENAME TO bookings;
ALTER INDEX idx_table_bookings_date_slot RENAME TO idx_bookings_date_slot;

-- Normalize existing installations too: V5 may already have been applied before this feature.
-- Temporary unique values avoid collisions with the existing UNIQUE(start_time) constraint.
WITH numbered AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY start_time, id) AS rn
    FROM time_slots
)
UPDATE time_slots ts
SET start_time = (TIME '00:00' + (numbered.rn * INTERVAL '1 minute'))::TIME,
    end_time = (TIME '00:00' + ((numbered.rn + 1) * INTERVAL '1 minute'))::TIME
FROM numbered
WHERE ts.id = numbered.id;

WITH numbered AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY start_time, id) AS rn
    FROM time_slots
)
UPDATE time_slots ts
SET start_time = (TIME '12:00' + ((numbered.rn - 1) * INTERVAL '1 hour'))::TIME,
    end_time = (TIME '13:00' + ((numbered.rn - 1) * INTERVAL '1 hour'))::TIME
FROM numbered
WHERE ts.id = numbered.id AND numbered.rn <= 11;

INSERT INTO time_slots (start_time, end_time, capacity)
SELECT (TIME '12:00' + (hours.hour * INTERVAL '1 hour'))::TIME,
       (TIME '13:00' + (hours.hour * INTERVAL '1 hour'))::TIME,
       5
FROM generate_series(0, 10) AS hours(hour)
WHERE NOT EXISTS (
    SELECT 1 FROM time_slots ts
    WHERE ts.start_time = (TIME '12:00' + (hours.hour * INTERVAL '1 hour'))::TIME
);

UPDATE dining_tables
SET seats = CASE table_number
    WHEN 1 THEN 2 WHEN 2 THEN 4 WHEN 3 THEN 6
    WHEN 4 THEN 8 WHEN 5 THEN 10 WHEN 6 THEN 12
    ELSE seats END;

INSERT INTO dining_tables (pickup_point_id, table_number, seats)
SELECT pp.id, t.table_number, t.seats
FROM pickup_points pp
CROSS JOIN (VALUES (1, 2), (2, 4), (3, 6), (4, 8), (5, 10), (6, 12)) AS t(table_number, seats)
ON CONFLICT (pickup_point_id, table_number)
DO UPDATE SET seats = EXCLUDED.seats;
