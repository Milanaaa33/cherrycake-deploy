# CC-16 / CC-17 — Standardized Bug Report Template (GitHub Issues)

All QAJ and QAF defects must be logged in **GitHub Issues** using this structure (also available directly as `.github/ISSUE_TEMPLATE/bug_report.md`).

---

## Required Fields

| Field | Description |
|---|---|
| **Title** | `[BUG] <Module>: <Concise problem description>` |
| **Priority** | `Critical` \| `High` \| `Medium` \| `Low` |
| **Module** | `Catalog` \| `Cart Calculation` \| `Orders` \| `Reports & PDF` \| `Fulfillment (Bonus)` \| `Table Booking (Bonus)` \| `Frontend UI / A11y` |
| **Environment** | Staging (`cherrycake-deploy.onrender.com` / `cherrycake-deploy.vercel.app`) or Local (`localhost:8080` / `localhost:5173`), Region, Viewport, Browser/Postman |
| **Steps to Reproduce** | Numbered, deterministic reproduction steps |
| **Expected Result** | Expected HTTP status, calculated numbers, or UI behavior |
| **Actual Result** | Observed status, payload, UI state, or console error |
| **Evidence** | Screenshot (for QAF/PDF) or raw API request + `ErrorResponse` / JSON response (for QAJ) |

## Priority Definitions

- **Critical**: Blocks release. Wrong monetary/VAT/discount/total calculation, unhandled `500`, SQL vs Web vs PDF mismatch, order/booking persistence failure, or checkout completely unusable.
- **High**: Core flow degraded, missing validation allowing invalid data, broken layout with horizontal scroll at `320px`, or critical axe-core accessibility violation.
- **Medium**: Non-blocking UI misalignment, secondary validation message unclear, minor responsive spacing issue.
- **Low**: Cosmetic polish, non-blocking copy/translation tweak.

## Markdown Copy-Paste Template

```markdown
### Summary
<Short description of the issue>

### Metadata
- **Module:** <Catalog | Cart | Orders | Reports | Fulfillment | Booking | UI/A11y>
- **Priority:** <Critical | High | Medium | Low>
- **Task ID:** <CC-33 | CC-47 | CC-56 | CC-17 | CC-34 | CC-48 | CC-57 | CC-63 | CC-74>

### Environment
- **URL:** <https://cherrycake-deploy.onrender.com | https://cherrycake-deploy.vercel.app | localhost>
- **Region / Currency:** <e.g., UZB / UZS>
- **Browser / Tool & Viewport:** <e.g., Chrome 131 @ 320px | Postman / Newman>

### Steps to Reproduce
1. ...
2. ...
3. ...

### Expected Result
...

### Actual Result
...

### Screenshot / API Evidence
```json
{
  "request": "...",
  "response": "..."
}
```
```
