# Country / State / City Feature — Implementation Notes

This document describes the implementation of the Country, State, and City selection feature in LogaShop — used in **checkout** (shipping/billing address) and **shipping zones** (zone coverage). For configuration and API reference, see **[GEO_API.md](GEO_API.md)**.

---

## Overview

| Area | What was implemented |
| ---- | --------------------- |
| **Checkout** | Country dropdown, State dropdown (or text fallback), City autocomplete with "type your city" fallback |
| **Shipping zones** | Chip-style input for countries and states (search + add as removable chips) — replaces long scroll lists |
| **Geo API** | Next.js proxy routes for countries, states, cities; `useGeoData` hook; env key `CSC_API_KEY` |

---

## Environment Configuration

Use **`CSC_API_KEY`** in `.env.local` — this matches the [Country State City API official docs](https://countrystatecity.in/docs/api/).

```env
CSC_API_KEY=your_api_key_here
```

The app also accepts `COUNTRY_API_KEY` for backward compatibility, but `CSC_API_KEY` is the preferred name for consistency with the official documentation.

---

## Implementation Highlights

### 1. Checkout form

- **Country:** Dropdown populated from `/api/geo/countries` via `useGeoData().countries`.
- **State:** Dropdown when the API returns states for the selected country; otherwise falls back to a text input (e.g. for countries without state data).
- **City:** Autocomplete when country + state have city data; user can type a custom city if not listed.
- **State display:** When the API returns a code (e.g. `23` for Iran's Tehran) instead of a name, `getStateDisplayName()` shows the state name in the address summary and review step.
- **Focus fix:** Input components were moved to module scope so they keep a stable reference and do not cause focus loss on re-render.

### 2. Shipping zones (admin)

- **Countries & states:** Replaced the long grid of clickable pills with `ChipSelectInput` — a tag-style input where the user types to search and adds values as removable chips.
- **Benefits:** Compact layout, works well on small screens, no long scroll, consistent with Product Tags UX.
- **Components:** `ChipSelectInput` (reusable), `ShippingZoneForm` (uses it for countries and states).

### 3. MongoDB index fix (parallel arrays)

MongoDB does not allow compound indexes on two array fields ("cannot index parallel arrays [states] [countries]").

**Changes:**
- **Model:** Removed `states` from the compound index. Now: `{ countries: 1, isActive: 1 }` and `{ isDefault: 1 }`. State filtering is done in-memory after documents are found by country.
- **API:** Added `ShippingZone.syncIndexes()` before zone creation so any existing old compound index is dropped and the new indexes are applied. Run once per environment; subsequent calls are effectively no-ops.

---

## Key Files

| Path | Purpose |
| ---- | ------- |
| `src/hooks/useGeoData.js` | Shared hook: countries, fetchStates, fetchCities |
| `src/app/api/geo/countries/route.js` | Proxy: list countries |
| `src/app/api/geo/states/route.js` | Proxy: list states by country |
| `src/app/api/geo/cities/route.js` | Proxy: list cities by country + state |
| `src/components/shipping/ChipSelectInput.js` | Reusable chip + autocomplete input |
| `src/components/shipping/ShippingZoneForm.js` | Zone form with chip inputs for countries/states |
| `src/app/(storefront)/checkout/page.js` | Checkout with address form |
| `src/models/ShippingZone.js` | Zone schema; index uses `countries` only |

---

## Data Model

- **Countries:** ISO 3166-1 alpha-2 codes (e.g. `US`, `CA`, `IR`).
- **States:** API returns `iso2` or `id`; used as stored value. Some countries use numeric codes (e.g. Iran).
- **Zone matching:** Zone matches when address country is in `zone.countries` and either `zone.states` is empty or address state is in `zone.states`.

---

## Related Documentation

- **[GEO_API.md](GEO_API.md)** — Geo API configuration, routes, and frontend usage
- **[DATA_MODELS.md](DATA_MODELS.md)** — ShippingZone schema and indexes
