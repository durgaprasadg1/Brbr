CREATE DATABASE IF NOT EXISTS barber_shop;
USE barber_shop;

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE,
    role ENUM('CUSTOMER','OWNER','ADMIN') NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME,
    updated_at DATETIME
);

CREATE TABLE shops (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    owner_id BIGINT NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    is_opened BOOLEAN NOT NULL DEFAULT FALSE,
    average_rating DECIMAL(2,1) NOT NULL DEFAULT 0.0,
    total_ratings INT NOT NULL DEFAULT 0,
    status ENUM('PENDING','ACTIVE','REJECTED','DISABLED') NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE shop_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shop_id BIGINT NOT NULL,
    image_url TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at DATETIME,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

CREATE TABLE services (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shop_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration_minutes INT NOT NULL,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

CREATE TABLE queue_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    shop_id BIGINT NOT NULL,
    status ENUM('REQUESTED','ACCEPTED','REJECTED','EXPIRED','CANCELLED') NOT NULL DEFAULT 'REQUESTED',
    requested_at DATETIME NOT NULL,
    expires_at DATETIME NULL,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (shop_id) REFERENCES shops(id),
    INDEX idx_queue_requests_customer (customer_id),
    INDEX idx_queue_requests_shop_status (shop_id,status)
);

CREATE TABLE queue_request_services (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    queue_request_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    price_at_booking DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (queue_request_id) REFERENCES queue_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE queue_entries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    queue_request_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    shop_id BIGINT NOT NULL,
    queue_position INT NOT NULL,
    status ENUM('WAITING','IN_SERVICE','COMPLETED','SKIPPED','CANCELLED','PAYMENT_PENDING') NOT NULL DEFAULT 'WAITING',
    joined_at DATETIME NOT NULL,
    FOREIGN KEY (queue_request_id) REFERENCES queue_requests(id),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (shop_id) REFERENCES shops(id),
    INDEX idx_queue_entries_shop_status_position (shop_id,status,queue_position)
);

CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    queue_request_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('CREATED','SUCCESS','FAILED','REFUND_PENDING','REFUNDED') NOT NULL DEFAULT 'CREATED',
    payment_type ENUM('QUEUE_PAYMENT','EXTRA_SERVICE_PAYMENT') NOT NULL,
    razorpay_order_id VARCHAR(100) NULL,
    razorpay_payment_id VARCHAR(100) NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (queue_request_id) REFERENCES queue_requests(id),
    INDEX idx_payments_queue_request (queue_request_id),
    INDEX idx_payments_razorpay_order (razorpay_order_id),
    INDEX idx_payments_razorpay_payment (razorpay_payment_id)
);

CREATE TABLE service_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    queue_entry_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    start_time DATETIME NULL,
    end_time DATETIME NULL,
    actual_duration INT NULL,
    status ENUM('PENDING','IN_SERVICE','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    FOREIGN KEY (queue_entry_id) REFERENCES queue_entries(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    shop_id BIGINT NOT NULL,
    queue_entry_id BIGINT NOT NULL UNIQUE,
    rating TINYINT NOT NULL,
    feedback_text TEXT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (shop_id) REFERENCES shops(id),
    FOREIGN KEY (queue_entry_id) REFERENCES queue_entries(id),
    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE favorites (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    shop_id BIGINT NOT NULL,
    UNIQUE (customer_id,shop_id),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (shop_id) REFERENCES shops(id)
);

CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_notifications_user_read (user_id,is_read)
);
