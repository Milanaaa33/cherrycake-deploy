# CC-74 — Bonus Stage 4 Scenarios (Fulfillment, Time Slots & Table Bookings)

**Scope:** Platform Stage 4 Bonus (executed independently after mandatory core checks pass).  
**Controllers:** `FulfillmentController` (`/api/pickup-points`, `/api/delivery-zones`, `/api/time-slots`), `CartController` (`/api/cart/calculate`), `OrderController` (`/api/orders`), `BookingController` (`/api/bookings`).

---

## 1. Pickup Points & Delivery Zones (`GET /api/pickup-points`, `GET /api/delivery-zones`)

| ID | Scenario | Request | Expected Status & Assertions |
|---|---|---|---|
| **BON-01** | Get pickup points for `UZB` | `GET /api/pickup-points?region=UZB` | `200 OK`; returns open points for `UZB` with `id`, `name`, `address`, `openingHours` |
| **BON-02** | Get delivery zones for `UZB` (cheapest first) | `GET /api/delivery-zones?region=UZB` | `200 OK`; `Center` (`15000.00 UZS`) before `Suburbs` (`25000.00 UZS`) |
| **BON-03** | Regional currency conversion for zones | `GET /api/delivery-zones?region=KAZ` | `200 OK`; `Center` `600.00 KZT`, `Suburbs` `1000.00 KZT` |
| **BON-04** | Missing or unknown region error | `GET /api/delivery-zones` / `?region=XYZ` | `400 Bad Request` / `404 Not Found` (`ErrorResponse`) |

---

## 2. Time Slots & Capacity (`GET /api/time-slots`)

| ID | Scenario | Request | Expected Status & Assertions |
|---|---|---|---|
| **BON-05** | Get time slots for a future date | `GET /api/time-slots?date=<YYYY-MM-DD>` | `200 OK`; slots sorted chronologically with `id`, `startTime`, `endTime`, `capacity`, `remaining`, `isAvailable` |
| **BON-06** | Reject past date | `GET /api/time-slots?date=2020-01-01` | `400 Bad Request` (`date must not be in the past`) |
| **BON-07** | Missing or malformed date | `GET /api/time-slots?date=invalid` | `400 Bad Request` (`ErrorResponse`) |

---

## 3. Cart & Order with Fulfillment (`DELIVERY` / `PICKUP`)

| ID | Scenario | Endpoint & Payload | Expected Status & Assertions |
|---|---|---|---|
| **BON-08** | Cart calculation includes delivery fee without shifting discount threshold | `POST /api/cart/calculate` (`region: "UZB"`, `Tiramisu x2`, `deliveryZoneId: <Suburbs>`) | `200 OK`; `amountInclVat: 207000.00` (< `300000.00` threshold -> `discountRate: 0.0000`), `deliveryFee: 25000.00`, `total: 232000.00` |
| **BON-09** | Order with `DELIVERY` + `deliveryZoneId` + `timeSlotId` | `POST /api/orders` | `201 Created`; persists `fulfillmentType: "DELIVERY"`, adds zone fee after discount, decrements `remaining` in `GET /api/time-slots` by 1 |
| **BON-10** | Order with `PICKUP` + `pickupPointId` + `timeSlotId` | `POST /api/orders` | `201 Created`; persists `fulfillmentType: "PICKUP"`, `deliveryFee: 0.00` |
| **BON-11** | Validation: `PICKUP` missing `pickupPointId` | `POST /api/orders` (`fulfillmentType: "PICKUP"`, no `pickupPointId`) | `400 Bad Request` (`pickupPointId is required for PICKUP`) |
| **BON-12** | Validation: `DELIVERY` missing `deliveryZoneId` | `POST /api/orders` (`fulfillmentType: "DELIVERY"`, no `deliveryZoneId`) | `400 Bad Request` (`deliveryZoneId is required for DELIVERY`) |
| **BON-13** | Slot capacity conflict on checkout | Place `capacity` orders (or bookings + orders) in one slot on date `D`, then submit one more | `409 Conflict` (`Time slot ... is full`); verified in `FulfillmentOrderTests` & `ConcurrentSlotTests` |

---

## 4. Table Bookings (`POST /api/bookings` & `/booking` UI)

| ID | Scenario | Input / Action | Expected Result |
|---|---|---|---|
| **BON-14** | Valid table booking | `POST /api/bookings` with future `date`, valid `timeSlotId`, `guestsCount: 4`, valid `customer` (`name`, `phone`, `email`), optional `region: "GEO"` | `201 Created`; returns `{ bookingNumber, tableNumber, date, time, guestsCount }` |
| **BON-15** | Table capacity & conflict (`409`) | Request `guestsCount: 12` repeatedly for same `date` + `timeSlotId` until no 12-seat table remains | First bookings succeed (`201`); once exhausted returns `409 Conflict`; verified in `BookingControllerTests` |
| **BON-16** | Invalid guest count (`0` or `13`) | `guestsCount: 0` or `guestsCount: 13` | `400 Bad Request` (API) & field error on `/booking` UI |
| **BON-17** | Past date / invalid contact | Past `date`, empty `name`, bad `phone`, bad `email` | `400 Bad Request` (API) & inline field errors (`aria-invalid="true"`) on `/booking` UI |
| **BON-18** | UI 409 conflict handling (`/booking`) | Submit when API returns `409` | Alert displays `"Selected time slot is no longer available..."` and disables that slot without crashing |
