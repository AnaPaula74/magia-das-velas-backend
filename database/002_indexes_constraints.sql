USE magia_das_velas;

ALTER TABLE wishlist
ADD CONSTRAINT unique_wishlist_user_product
UNIQUE (user_id, product_id);

ALTER TABLE reviews
ADD CONSTRAINT unique_review_user_product
UNIQUE (user_id, product_id);

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_wishlist_product_id ON wishlist(product_id);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);

CREATE INDEX idx_payments_payment_id ON payments(payment_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
