<p align="center">
  <img src="docs/assets/banner.svg" alt="Cherry Cake Web Application Banner" width="100%" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21_LTS-b07219?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21" />
  <img src="https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot 3.3.4" />
  <img src="https://img.shields.io/badge/PostgreSQL-16_/_18-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Flyway-Migrations-CC0200?style=for-the-badge&logo=flyway&logoColor=white" alt="Flyway" />
  <img src="https://img.shields.io/badge/Countries-16_Regions-e63960?style=for-the-badge" alt="16 Regions" />
  <img src="https://img.shields.io/badge/JaCoCo-Coverage_Enabled-brightgreen?style=for-the-badge" alt="JaCoCo" />
  <img src="https://img.shields.io/badge/Checkstyle-Compliant-blue?style=for-the-badge" alt="Checkstyle" />
  <img src="https://img.shields.io/badge/Sprint-Week_1_Foundation-4a1537?style=for-the-badge" alt="Week 1" />
</p>

<p align="center">
  <a href="http://localhost:8080/swagger-ui.html"><img src="https://img.shields.io/badge/Explore-Swagger_API-e63960?style=for-the-badge" alt="Swagger" /></a>
  <a href="http://localhost:8080/api/v1/catalog/regions"><img src="https://img.shields.io/badge/GET-/api/v1/catalog/regions-230b1c?style=for-the-badge&logoColor=white" alt="API" /></a>
  <a href="#team--raci-governance"><img src="https://img.shields.io/badge/Team_9-RACI_Governance-4a1537?style=for-the-badge" alt="RACI" /></a>
</p>

<p align="center"><img src="docs/assets/animated-divider.svg" alt="Animated Divider" width="100%" /></p>

# 🌸 Cherry Cake - Bakery & Café Web Application API

> **ITPU Team 9 — Confectionery & Café Web Application (Week 1: Setup & Architecture Baseline)**  
> Welcome to the official repository of **Team 9** (`t09-cherry-cake`). This project represents the foundational deliverable for **Week 1** of our 5-week Scrum lifecycle: establishing the multi-region database architecture across **16 sovereign nations**, versioned Flyway migrations, core domain models, the financial-grade `BigDecimal` calculation engine, interactive Swagger documentation, and automated CI pipelines.

<p align="center"><img src="docs/assets/animated-divider.svg" alt="Animated Divider" width="100%" /></p>

## Global Executive Metrics

<p align="center">
  <img src="docs/assets/metrics-dashboard.svg" alt="Executive Metrics Dashboard" width="100%" />
</p>

<p align="center"><img src="docs/assets/animated-divider.svg" alt="Animated Divider" width="100%" /></p>

## Table of Contents

- [Week 1 Milestone Deliverables](#week-1-milestone-deliverables)
- [16 Operating Countries & Regional Matrix](#16-operating-countries--regional-matrix)
- [Mathematical Pricing & Calculation Pipeline](#mathematical-pricing--calculation-pipeline)
- [Interactive Swagger UI & API Status](#interactive-swagger-ui--api-status)
- [System Architecture & Directory Structure](#system-architecture--directory-structure)
- [Database Schema & Flyway Evolution](#database-schema--flyway-evolution)
- [5-Week Project Roadmap](#5-week-project-roadmap)
- [Team & RACI Governance](#team--raci-governance)
- [Technology Stack](#technology-stack)
- [Getting Started & Local Setup](#getting-started--local-setup)
- [Testing & Quality Assurance](#testing--quality-assurance)

<p align="center"><img src="docs/assets/animated-divider.svg" alt="Animated Divider" width="100%" /></p>

## Week 1 Milestone Deliverables

During **Week 1** (Project Setup & Foundation), Team 9 accomplished the following core baseline engineering targets:

- **16-Country Relational Database Baseline**: Normalized relational schema implemented and auto-migrated via Flyway (`V1__init_schema.sql`, `V2__seed_data.sql`, `V3__add_expanded_regions.sql`).
- **Financial-Grade Server-Side Calculation**: Zero floating-point rounding errors through Java `BigDecimal` with strict `RoundingMode.HALF_UP` to two decimal places, verified by unit tests across regional currencies.
- **Dynamic Localization Engine**: Seeding of 16 countries across Europe, Central Asia, and the Caucasus with national currencies and statutory VAT rates (8.00% to 25.50%).
- **Interactive Administrator Web Panel & Swagger UI**: Customized dark-themed administration landing view (`index.html`) embedded with SpringDoc OpenAPI 3.0 documentation.
- **Domain Persistence Layer**: 12 Spring Data JPA entities, repositories, and centralized error handling with `ApiResponse<T>`.
- **Engineering Standards & CI Pipelines**: Automated GitHub Actions CI workflow, Checkstyle compliance rules (`checkstyle.xml`), and JaCoCo code coverage reporting.

<p align="center"><img src="docs/assets/animated-divider.svg" alt="Animated Divider" width="100%" /></p>

## 16 Operating Countries & Regional Matrix

<p align="center">
  <img src="https://img.shields.io/badge/UZB-Uzbekistan_(soʻm)_15%25_VAT-2d0e24?style=flat-square&logoColor=white" alt="UZB" />
  <img src="https://img.shields.io/badge/KAZ-Kazakhstan_(₸)_20%25_VAT-2d0e24?style=flat-square&logoColor=white" alt="KAZ" />
  <img src="https://img.shields.io/badge/GEO-Georgia_(₾)_12%25_VAT-2d0e24?style=flat-square&logoColor=white" alt="GEO" />
  <img src="https://img.shields.io/badge/UKR-Ukraine_(₴)_8%25_VAT-2d0e24?style=flat-square&logoColor=white" alt="UKR" />
  <img src="https://img.shields.io/badge/CHN-China_(¥)_18%25_VAT-2d0e24?style=flat-square&logoColor=white" alt="CHN" />
  <img src="https://img.shields.io/badge/BLR-Belarus_(Br)_20%25_VAT-2d0e24?style=flat-square&logoColor=white" alt="BLR" />
  <img src="https://img.shields.io/badge/LTU-Lithuania_(€)_21%25_VAT-2d0e24?style=flat-square&logoColor=white" alt="LTU" />
  <img src="https://img.shields.io/badge/LVA-Latvia_(€)_21%25_VAT-2d0e24?style=flat-square&logoColor=white" alt="LVA" />
  <img src="https://img.shields.io/badge/EST-Estonia_(€)_22%25_VAT-2d0e24?style=flat-square&logoColor=white" alt="EST" />
  <img src="https://img.shields.io/badge/FIN-Finland_(€)_25.5%25_VAT-2d0e24?style=flat-square&logoColor=white" alt="FIN" />
  <img src="https://img.shields.io/badge/SWE-Sweden_(kr)_25%25_VAT-2d0e24?style=flat-square&logoColor=white" alt="SWE" />
  <img src="https://img.shields.io/badge/MDA-Moldova_(L)_20%25_VAT-2d0e24?style=flat-square&logoColor=white" alt="MDA" />
  <img src="https://img.shields.io/badge/ROU-Romania_(lei)_19%25_VAT-2d0e24?style=flat-square&logoColor=white" alt="ROU" />
  <img src="https://img.shields.io/badge/TUR-Turkey_(₺)_20%25_VAT-2d0e24?style=flat-square&logoColor=white" alt="TUR" />
  <img src="https://img.shields.io/badge/AZE-Azerbaijan_(₼)_18%25_VAT-2d0e24?style=flat-square&logoColor=white" alt="AZE" />
  <img src="https://img.shields.io/badge/ARM-Armenia_(֏)_20%25_VAT-2d0e24?style=flat-square&logoColor=white" alt="ARM" />
</p>

The database schema is seeded with 16 operating countries, localized pricing matrices, flagship pickup points, and delivery logistics zones:

| Country | Code | Currency | Symbol | Legal VAT | Flagship Hub Address | Delivery Zone |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **Uzbekistan** | `UZB` | `UZS` | `soʻm` | 15.00% | Central Bakery Tashkent (Amir Temur Ave 45) | Tashkent Central Ring |
| **Kazakhstan** | `KAZ` | `KZT` | `₸` | 20.00% | Almaty Downtown Flagship (Dostyk Ave 89) | Almaty Central District |
| **Georgia** | `GEO` | `GEL` | `₾` | 12.00% | Tbilisi Old Town Bakery (Rustaveli Ave 14) | Tbilisi Central |
| **Ukraine** | `UKR` | `UAH` | `₴` | 8.00% | Kyiv Podil Café (Sahaidachnoho St 22) | Kyiv Central |
| **China** | `CHN` | `CNY` | `¥` | 18.00% | Beijing Chaoyang Boutique (Sanlitun Rd 19) | Beijing Inner Ring |
| **Belarus** | `BLR` | `BYN` | `Br` | 20.00% | Central Bakery Minsk (Nezavisimosti Ave 25) | Minsk Central Zone |
| **Lithuania** | `LTU` | `EUR` | `€` | 21.00% | Vilnius Old Town Bakery (Pilies g. 12) | Vilnius Central |
| **Latvia** | `LVA` | `EUR` | `€` | 21.00% | Riga Art Nouveau Café (Elizabetes iela 33) | Riga Central |
| **Estonia** | `EST` | `EUR` | `€` | 22.00% | Tallinn Rotermann Boutique (Rotermanni 8) | Tallinn Kesklinn |
| **Finland** | `FIN` | `EUR` | `€` | 25.50% | Helsinki Esplanadi Café (Pohjoisesplanadi 21) | Helsinki Kamppi & Center |
| **Sweden** | `SWE` | `SEK` | `kr` | 25.00% | Stockholm Gamla Stan Bakery (Stortorget 7) | Stockholm Inner City |
| **Moldova** | `MDA` | `MDL` | `L` | 20.00% | Chisinau Central Boutique (bd. Stefan cel Mare 105) | Chisinau Centru |
| **Romania** | `ROU` | `RON` | `lei` | 19.00% | Bucharest Lipscani Café (Strada Lipscani 45) | Bucharest Sector 1 & Central |
| **Turkey** | `TUR` | `TRY` | `₺` | 20.00% | Istanbul Nisantasi Flagship (Abdi Ipekci Cd. 38) | Istanbul Besiktas & Sisli |
| **Azerbaijan** | `AZE` | `AZN` | `₼` | 18.00% | Baku Nizami Street Bakery (Nizami St. 68) | Baku Sabail & Central |
| **Armenia** | `ARM` | `AMD` | `֏` | 20.00% | Yerevan Abovyan Café (Abovyan St. 14) | Yerevan Kentron |

<p align="center"><img src="docs/assets/animated-divider.svg" alt="Animated Divider" width="100%" /></p>

## Mathematical Pricing & Calculation Pipeline

<p align="center">
  <img src="docs/assets/calculation-pipeline.svg" alt="Calculation Pipeline" width="100%" />
</p>

All computations in `PriceCalculatorService` use Java `BigDecimal` with `RoundingMode.HALF_UP` to two decimal places:

### 1. Line Item Subtotal
$$\text{LineTotal}_i = (P_{i,\text{region}} + \sum \Delta M_k) \times Q_i$$

### 2. Order Subtotal
$$\text{Subtotal} = \sum_{i=1}^{n} \text{LineTotal}_i$$

### 3. Statutory VAT Computation
$$\text{VAT} = \text{Subtotal} \times \left( \frac{\text{VAT\_Rate}_{\text{region}}}{100} \right)$$

### 4. Amount Including VAT
$$\text{Amount}_{\text{incl\_VAT}} = \text{Subtotal} + \text{VAT}$$

### 5. Tiered Threshold & Promo Discounts
Threshold discounts are evaluated progressively against $\text{Amount}_{\text{incl\_VAT}}$:

| Threshold Condition | Discount Tier Name | Applied Percentage |
| :--- | :--- | :---: |
| $\text{Amount}_{\text{incl\_VAT}} \ge 100$ | Tier 1 Threshold Discount | 3.00% |
| $\text{Amount}_{\text{incl\_VAT}} \ge 500$ | Tier 2 Threshold Discount | 5.00% |
| $\text{Amount}_{\text{incl\_VAT}} \ge 700$ | Tier 3 Threshold Discount | 7.00% |
| $\text{Amount}_{\text{incl\_VAT}} \ge 1000$ | Tier 4 Threshold Discount | 10.00% |
| $\text{Amount}_{\text{incl\_VAT}} \ge 5000$ | Tier 5 Threshold Discount | 15.00% |
| Valid Code `WELCOME10` | Promo Code Discount | 10.00% |

$$\text{DiscountAmount} = \text{Amount}_{\text{incl\_VAT}} \times \left( \frac{\text{DiscountRate}}{100} \right)$$

### 6. Final Order Total
$$\text{Total} = \text{Amount}_{\text{incl\_VAT}} - \text{DiscountAmount} + \text{DeliveryFee}$$

> [!NOTE]
> Delivery fees are applied strictly after discounts and taxes have been computed. For bakery pickup orders, delivery fee evaluates to `0.00`.

<p align="center"><img src="docs/assets/animated-divider.svg" alt="Animated Divider" width="100%" /></p>

## Interactive Swagger UI & API Status

<p align="center">
  <img src="docs/assets/swagger-preview.svg" alt="Interactive Swagger UI Preview" width="100%" />
</p>

### Week 1 Active & Planned REST Endpoints

| HTTP Method | Route | Description | Sprint Target | Status |
| :--- | :--- | :--- | :---: | :---: |
| `GET` | `/api/v1/catalog/regions` | Retrieve list of 16 operating countries, currencies, and tax rates | **Week 1** | **Active Baseline** |
| `GET` | `/api/v1/catalog/categories` | Retrieve active confectionery and bakery categories | **Week 1** | **Active Baseline** |
| `POST` | `/api/v1/cart/calculate` | Recalculate subtotal, regional statutory VAT, discount tiers, and totals | **Week 1** | **Active Baseline** |
| `GET` | `/api/v1/catalog/products` | Retrieve catalog items with regional prices (`?region=UZB`) | **Week 2 (Sprint 1)** | Planned |
| `GET` | `/api/v1/catalog/products/{id}` | Retrieve single product details with modifier add-ons | **Week 2 (Sprint 1)** | Planned |
| `POST` | `/api/v1/orders` | Submit new order with server-side validation and price lock | **Week 3 (Sprint 2)** | Planned |
| `POST` | `/api/v1/bookings` | Book table with date-time slot verification and conflict checks | **Week 3 (Sprint 2)** | Planned |
| `GET` | `/api/v1/catalog/pickup-points` | Retrieve physical bakery pickup locations for a specified region | **Week 4 (Sprint 3)** | Planned |
| `GET` | `/api/v1/catalog/delivery-zones` | Retrieve delivery logistics zones and rates for a specified region | **Week 4 (Sprint 3)** | Planned |
| `POST` | `/api/v1/auth/login` | Authenticate with credentials and receive Bearer JWT | **Week 4 (Sprint 3)** | Planned |
| `GET` | `/api/v1/reports/sales` | Aggregate monthly revenue, order volume, and regional breakdown | **Week 5 (Sprint 4)** | Planned |

<p align="center"><img src="docs/assets/animated-divider.svg" alt="Animated Divider" width="100%" /></p>

## System Architecture & Directory Structure

```mermaid
flowchart TD
    Client["Client Web Browser / Mobile App"] --> WebSecurity["Spring Security 6 (Stateless)"]
    WebSecurity --> Controllers["REST Controllers Layer (/api/v1)"]

    subgraph BusinessLayer ["Core Service Layer"]
        Controllers --> CatalogService["CatalogService"]
        Controllers --> CartService["Cart & PriceCalculatorService"]
        Controllers --> OrderService["Order & BookingService (Planned)"]
        Controllers --> ReportService["Sales & ExportService (Planned)"]
    end

    subgraph DataLayer ["Persistence & Domain Layer"]
        CatalogService --> Repositories["Spring Data JPA Repositories"]
        CartService --> Repositories
        OrderService --> Repositories
        ReportService --> Repositories
        Repositories --> Database[("PostgreSQL / H2 Database")]
    end

    Flyway["Flyway Engine (V1, V2, V3)"] -.->|Auto-Migrates| Database
```

### Directory Structure

```text
t09-cherry-cake/
├── .github/
│   ├── CODEOWNERS                  # Team code ownership rules
│   ├── PULL_REQUEST_TEMPLATE.md    # PR checklist and task CC-id tracker
│   └── workflows/
│       └── backend-ci.yml          # GitHub Actions CI (build, checkstyle, tests)
├── docs/
│   └── assets/                     # Animated SVG banners, dashboards, and diagrams
├── checkstyle.xml                  # Team code formatting and style rules
├── pom.xml                         # Maven dependencies & build plugins
├── README.md                       # Week 1 project documentation & architecture guide
└── src/
    ├── main/
    │   ├── java/uz/itpu/cherrycake/
    │   │   ├── CherryCakeApplication.java
    │   │   ├── common/
    │   │   │   ├── exception/      # Unified error handling (@RestControllerAdvice)
    │   │   │   └── response/       # Consistent ApiResponse<T> payloads
    │   │   ├── config/             # SecurityConfig, CORS, OpenAPI Swagger
    │   │   ├── controller/         # Catalog, Cart, Order, Booking, Report
    │   │   ├── dto/                # Request & Response Data Transfer Objects
    │   │   ├── model/entity/       # 12 JPA Entities (Region, Product, Price, etc.)
    │   │   ├── repository/         # Spring Data JPA Repository Interfaces
    │   │   ├── security/           # JWT Provider, Token Filter, UserDetails
    │   │   └── service/            # Business Services & PriceCalculatorService
    │   └── resources/
    │       ├── application.yml     # Application configuration (PostgreSQL)
    │       ├── application-h2.yml  # In-memory H2 configuration
    │       ├── db/migration/       # Flyway schema (V1), seed (V2), expansion (V3)
    │       └── static/             # Frontend assets, playlist, themed error views
    └── test/
        ├── java/uz/itpu/cherrycake/
        │   ├── CherryCakeApplicationTests.java
        │   ├── controller/CartControllerTest.java
        │   └── service/PriceCalculatorServiceTest.java
        └── resources/
            └── application-test.yml
```

<p align="center"><img src="docs/assets/animated-divider.svg" alt="Animated Divider" width="100%" /></p>

## Database Schema & Flyway Evolution

Database evolution is versioned through Flyway migrations located in `src/main/resources/db/migration/`:

```text
db/migration/
├── V1__init_schema.sql            # Creates 12 normalized relational tables, constraints, indexes
├── V2__seed_data.sql              # Seeds baseline 5 countries, products, modifiers, discount tiers
└── V3__add_expanded_regions.sql   # Expands catalog with 11 European and Caucasian countries (16 total)
```

### Relational Schema Design

```mermaid
erDiagram
    REGIONS ||--o{ PRODUCT_PRICES : contains
    REGIONS ||--o{ PICKUP_POINTS : operates
    REGIONS ||--o{ DELIVERY_ZONES : covers
    REGIONS ||--o{ ORDERS : bills
    CATEGORIES ||--o{ PRODUCTS : groups
    PRODUCTS ||--o{ PRODUCT_PRICES : priced_in
    PRODUCTS ||--o{ PRODUCT_MODIFIERS : offers
    PRODUCTS ||--o{ ORDER_ITEMS : contains
    ORDERS ||--o{ ORDER_ITEMS : includes
    USERS ||--o{ ORDERS : places
    USERS ||--o{ TABLE_BOOKINGS : reserves
    TIME_SLOTS ||--o{ ORDERS : fulfills
    TIME_SLOTS ||--o{ TABLE_BOOKINGS : schedules
```

<p align="center"><img src="docs/assets/animated-divider.svg" alt="Animated Divider" width="100%" /></p>

## 5-Week Project Roadmap

The repository serves Team 9 across our 5-week Scrum development roadmap:

| Stage | Timeline | Focus Area | Technical Deliverables & Outcomes | Status |
| :---: | :---: | :--- | :--- | :---: |
| **Week 1** | Current | Project Setup & Foundation | RACI Matrix, Git repo, DB schema (V1–V3 16 regions), `PriceCalculatorService`, CI pipeline | **Completed** |
| **Week 2** | Sprint 1 | Catalog & Pricing API | Dynamic catalog endpoints (`/api/v1/catalog`), cart calculation contract (`/api/v1/cart/calculate`), UI Kit integration | Planned |
| **Week 3** | Sprint 2 | Orders & Reservations | Order placement, server price locks, table reservations, double-booking prevention | Planned |
| **Week 4** | Sprint 3 | Fulfillment & Security | Pickup slots, delivery zone validation, JWT authentication filters, customer dashboard | Planned |
| **Week 5** | Sprint 4 | Analytics & Final Review | Sales reports, CSV/PDF export, stress testing, Project Plan Alignment Analysis | Planned |

<p align="center"><img src="docs/assets/animated-divider.svg" alt="Animated Divider" width="100%" /></p>

## Team & RACI Governance

The project is developed by **Team 9** (`t09-cherry-cake`) following Scrum methodologies and RACI governance:

| Role Code | Team Member | Primary Domain & Responsibilities |
| :---: | :--- | :--- |
| **TL** | **Milana Ulubabyan** | Team Lead: Architecture decisions, code review checklist, branch protection |
| **AS** | **Andrei Varnavskiy** | Deputy Team Lead: Task tracking, UI prototype, technical documentation |
| **BE1** | **Adrian Zakirov** | Backend Dev 1: Catalog API, PriceCalculatorService (BigDecimal), Cart API, Flyway |
| **BE2** | **Anvar Makhamatjonov** | Backend Dev 2: Order fulfillment, time slots, table booking, reports & exports |
| **FE1** | **Shovkat Khabidullaev** | Frontend Dev 1: Design tokens, layouts, UI kit, regional switcher |
| **FE2** | **Arjumandbonu Narzullaeva** | Frontend Dev 2: Product cards, modifiers dialog, live cart counter, admin views |
| **FE3** | **Mukhammademin Emminov** | Frontend Dev 3: Multi-step checkout, validators, account history, responsive UI |
| **QAJ** | **Muhammadyusuf Ismatov** | QA Backend: API test plans, Postman collections, calculation formula validation |
| **QAF** | **Asadbek Yulchiev** | QA Frontend: WCAG AA accessibility, responsive breakpoints (320/768/1200px), axe |

### RACI Accountability Matrix

| Task Domain | TL | AS | BE1 | BE2 | FE1 | FE2 | FE3 | QAJ | QAF |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| DB Architecture & Flyway Migrations | A | I | R | C | I | I | I | C | I |
| PriceCalculatorService (BigDecimal) | A | I | R | C | C | C | I | R | I |
| Catalog & Multi-Region APIs | A | I | R | C | C | C | I | C | I |
| Order Fulfillment & Booking Engine | A | I | C | R | I | C | C | C | I |
| Sales Reports, CSV & PDF Exports | A | I | C | R | I | C | I | C | I |
| Design Tokens & UI Layouts | A | C | I | I | R | C | C | I | C |
| Product Modifiers & Cart UI | A | I | C | I | C | R | C | I | C |
| Multi-Step Checkout & Auth UI | A | I | I | C | C | C | R | I | C |
| API & Calculation QA Verification | A | C | C | C | I | I | I | R | I |
| UI/UX & Cross-Device Accessibility | A | C | I | I | C | C | C | I | R |

> Legend: **R** = Responsible, **A** = Accountable, **C** = Consulted, **I** = Informed.

<p align="center"><img src="docs/assets/animated-divider.svg" alt="Animated Divider" width="100%" /></p>

## Technology Stack

- **Java Web Application**: OpenJDK 21 LTS
- **Build & Dependency Management**: Apache Maven 3.9+
- **Core Framework**: Spring Boot 3.3.4 (Spring MVC, Spring Data JPA, Spring Security 6)
- **Database Engine**: PostgreSQL 16+ (Production / Development), H2 In-Memory (Automated Testing)
- **Database Migrations**: Flyway Core (Versioned SQL migrations)
- **Security & Tokens**: Stateless JWT (`io.jsonwebtoken` JJWT 0.12.6) with BCrypt password hashing
- **API Documentation**: SpringDoc OpenAPI 3.0 / Swagger UI 2.6.0
- **Testing & Quality**: JUnit 5, Mockito, AssertJ, MockMvc, JaCoCo, Checkstyle

<p align="center"><img src="docs/assets/animated-divider.svg" alt="Animated Divider" width="100%" /></p>

## Getting Started & Local Setup

### Prerequisites
- **Java**: OpenJDK 21 LTS
- **Build Tool**: Apache Maven 3.9+
- **Database**: PostgreSQL 15+ (or run tests directly with bundled H2)

### Build and Run

```bash
# 1. Clone the repository
git clone https://github.com/itpu-cherry-cake/t09-cherry-cake.git
cd t09-cherry-cake

# 2. Compile and package the application
mvn clean package

# 3. Launch the Spring Boot application
mvn spring-boot:run
```

### Interactive Documentation & Health Endpoints

Once the application is running:
- **Web Landing Page**: `http://localhost:8080`
- **Interactive Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **Raw OpenAPI 3.0 Specification**: `http://localhost:8080/v3/api-docs`

<p align="center"><img src="docs/assets/animated-divider.svg" alt="Animated Divider" width="100%" /></p>

## Testing & Quality Assurance

The codebase includes automated test suites covering repository layers, `PriceCalculatorService` rounding rules, and REST API controllers:

```bash
# Run unit and integration test suites
mvn clean test

# Execute Checkstyle code formatting validation
mvn checkstyle:check

# Generate JaCoCo test execution coverage report
mvn jacoco:report
```

HTML coverage reports are generated at:
`target/site/jacoco/index.html`

<p align="center"><img src="docs/assets/animated-divider.svg" alt="Animated Divider" width="100%" /></p>

<p align="center">
  <img src="https://img.shields.io/badge/TL-Milana_Ulubabyan-2d0e24?style=flat-square" alt="TL" />
  <img src="https://img.shields.io/badge/AS-Andrei_Varnavskiy-2d0e24?style=flat-square" alt="AS" />
  <img src="https://img.shields.io/badge/BE1-Adrian_Zakirov-e63960?style=flat-square" alt="BE1" />
  <img src="https://img.shields.io/badge/BE2-Anvar_Makhamatjonov-2d0e24?style=flat-square" alt="BE2" />
  <img src="https://img.shields.io/badge/FE1-Shovkat_Khabidullaev-2d0e24?style=flat-square" alt="FE1" />
  <img src="https://img.shields.io/badge/FE2-Arjumandbonu_Narzullaeva-2d0e24?style=flat-square" alt="FE2" />
  <img src="https://img.shields.io/badge/FE3-Mukhammademin_Emminov-2d0e24?style=flat-square" alt="FE3" />
  <img src="https://img.shields.io/badge/QAJ-Muhammadyusuf_Ismatov-2d0e24?style=flat-square" alt="QAJ" />
  <img src="https://img.shields.io/badge/QAF-Asadbek_Yulchiev-2d0e24?style=flat-square" alt="QAF" />
</p>

<p align="center">
  <i>ITPU University Teamwork Project &bull; Scrum Team 9 (t09-cherry-cake) &bull; Spring Boot 3.3.4 &bull; Java 21 LTS</i><br>
  <strong>🌸 Cherry Cake Bakery &amp; Café Web Application</strong>
</p>
