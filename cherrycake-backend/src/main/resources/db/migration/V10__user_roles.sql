-- RBAC for the admin panel and reports. Additive: a new table only.
-- A customer who signs in by email code has no row here and gets the implicit CUSTOMER role.
-- ADMIN > STAFF > VIEWER. Emails listed in the ADMIN_EMAILS environment variable are always ADMIN
-- (bootstrap: the first administrator does not need a row in this table).
CREATE TABLE user_roles (
    email      VARCHAR(150) NOT NULL,
    role       VARCHAR(10)  NOT NULL,
    granted_by VARCHAR(150),
    granted_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_user_roles PRIMARY KEY (email),
    CONSTRAINT ck_user_roles_role CHECK (role IN ('ADMIN', 'STAFF', 'VIEWER'))
);
