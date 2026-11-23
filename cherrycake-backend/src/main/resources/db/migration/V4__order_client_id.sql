-- Order history without registration: every browser gets a random client id (UUID stored in localStorage).
-- The id is saved with each guest order and used to list "my orders". Nullable, so existing orders stay valid.
ALTER TABLE orders ADD COLUMN client_id VARCHAR(64);

CREATE INDEX idx_orders_client_id_created_at ON orders (client_id, created_at);
