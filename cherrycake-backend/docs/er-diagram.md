# Catalog ER diagram (V1)

Migration: `src/main/resources/db/migration/V1__catalog.sql`.

```mermaid
erDiagram
    regions {
        BIGINT id PK
        VARCHAR(3) code UK "UZB, KAZ, GEO, UKR, CHN"
        VARCHAR(100) name
        VARCHAR(3) currency_code "UZS, KZT, GEL, UAH, CNY"
        VARCHAR(10) currency_symbol
        NUMERIC(5_4) vat_rate "fraction, 0.15 = 15 %"
        NUMERIC(12_4) exchange_rate "local currency per 1 CU"
    }
    categories {
        BIGINT id PK
        VARCHAR(100) name
        INTEGER sort_order
    }
    products {
        BIGINT id PK
        BIGINT category_id FK
        VARCHAR(150) name
        VARCHAR(1000) description
        VARCHAR(500) photo_url
    }
    regional_prices {
        BIGINT product_id PK "FK to products"
        BIGINT region_id PK "FK to regions"
        NUMERIC(12_2) price
        BOOLEAN in_stock
    }
    modifier_groups {
        BIGINT id PK
        BIGINT product_id FK
        VARCHAR(100) name
        VARCHAR(10) type "SINGLE or MULTI"
        BOOLEAN is_required
    }
    modifiers {
        BIGINT id PK
        BIGINT group_id FK
        VARCHAR(100) name
    }
    modifier_regional_prices {
        BIGINT modifier_id PK "FK to modifiers"
        BIGINT region_id PK "FK to regions"
        NUMERIC(12_2) price_delta
    }
    discount_rules {
        BIGINT id PK
        NUMERIC(12_2) threshold UK
        NUMERIC(5_4) rate
    }

    categories ||--o{ products : contains
    products ||--o{ regional_prices : "priced in"
    regions ||--o{ regional_prices : "sets price"
    products ||--o{ modifier_groups : has
    modifier_groups ||--|{ modifiers : contains
    modifiers ||--o{ modifier_regional_prices : "priced in"
    regions ||--o{ modifier_regional_prices : "sets delta"
```

## Rules

- Money is `NUMERIC(12,2)`, rates are `NUMERIC(5,4)` stored as a fraction.
- `price`, `price_delta` and `threshold` are stored in conventional units (CU). `regions.exchange_rate` is how much local currency one CU is worth, for example 3000 for UZB (1 CU = 3000 UZS). It must be greater than 0.
- The calculator converts prices to the local currency first (`price × exchange_rate`), then runs the formula from the spec. It compares `amountInclVat` with `threshold × exchange_rate`. All amounts in the API are in the local currency, so the frontend never recalculates them.
- A product has one price per region. `in_stock` is set per region too, so a product can be sold out in one country only.
- A modifier adds `price_delta` per unit, in CU.
- `discount_rules` is one table for every region. The calculator picks the highest converted `threshold` that `amountInclVat` reaches.
- Deleting a product removes its prices, modifier groups, modifiers and modifier prices. Regions and categories that are still referenced can't be deleted.
