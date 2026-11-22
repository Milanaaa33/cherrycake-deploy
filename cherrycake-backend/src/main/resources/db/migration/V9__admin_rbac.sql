-- Role registry for the existing passwordless email-session authentication.
CREATE TABLE user_roles (
    email VARCHAR(150) PRIMARY KEY,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'STAFF', 'VIEWER')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_roles_role ON user_roles(role);
