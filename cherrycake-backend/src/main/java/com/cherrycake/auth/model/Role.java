package com.cherrycake.auth.model;

/**
 * Access level of a signed-in user. Levels are ordered: ADMIN can do everything STAFF can, and so on.
 * CUSTOMER is the implicit role of any signed-in email without a row in user_roles.
 */
public enum Role {
    CUSTOMER(0),
    VIEWER(1),
    STAFF(2),
    ADMIN(3);

    private final int level;

    Role(int level) {
        this.level = level;
    }

    /**
     * True when this role is the given one or a higher one (ADMIN covers STAFF, STAFF covers VIEWER).
     */
    public boolean atLeast(Role minimum) {
        return level >= minimum.level;
    }
}
