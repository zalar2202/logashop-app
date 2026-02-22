# Country, State & City (Geo) API

LogaShop uses the [Country State City API](https://countrystatecity.in/) to power address selection in checkout and geographic region selection in shipping zones. This document describes the integration, configuration, and usage.

> **Implementation notes:** For the full implementation story (checkout focus fix, chip UX for shipping zones, MongoDB index fix), see **[COUNTRY_STATE_FEATURE.md](COUNTRY_STATE_FEATURE.md)**.

---

## Overview

| Feature | Where it's used |
| ------- | ---------------- |
| **Countries** | Checkout shipping/billing address; shipping zone coverage |
| **States** | Checkout address (dropdown when available); optional state limits in shipping zones |
| **Cities** | Checkout address (autocomplete, with "type your city" fallback) |

The geo data is fetched from the external API, proxied through Next.js routes to keep the API key server-side, and cached for 24 hours.

---

## Configuration

### Environment variable

Set **`CSC_API_KEY`** in `.env.local` (or `.env`). This is the official name used in the [Country State City API docs](https://countrystatecity.in/docs/api/).

```env
CSC_API_KEY=your_api_key_here
```

> **Legacy:** The app also accepts `COUNTRY_API_KEY` for backward compatibility, but `CSC_API_KEY` is preferred and matches the official documentation for consistency.

### Obtaining the API key

1. Register at [countrystatecity.in](https://countrystatecity.in/)
2. Generate an API key from your dashboard
3. Add it to `.env.local`

---

## API Routes (Next.js proxy)

All geo routes are under `/api/geo/` and use the `X-CSCAPI-KEY` header when calling the external API.

| Route | Method | Params | Description |
| ----- | ------ | ------ | ------------ |
| `/api/geo/countries` | GET | — | List all countries (ISO codes, names) |
| `/api/geo/states` | GET | `country` (required) | List states/provinces for a country |
| `/api/geo/cities` | GET | `country`, `state` (required) | List cities for a country + state |

### Response format

Success:

```json
{ "success": true, "data": [...] }
```

Error:

```json
{ "success": false, "error": "Error message" }
```

### Caching

Responses are cached for **24 hours** using Next.js `revalidate: 86400` to reduce API usage and improve performance.

---

## Frontend usage

### `useGeoData` hook

Shared hook for fetching geo data. Used by checkout and shipping zone forms.

**Location:** `src/hooks/useGeoData.js`

```javascript
const {
  countries,        // Array of { iso2, name, ... }
  loadingCountries,  // boolean
  fetchStates,     // (countryCode) => Promise<state[]>
  fetchCities,     // (countryCode, stateCode) => Promise<city[]>
} = useGeoData();
```

- `countries` is loaded on mount.
- `fetchStates` and `fetchCities` are callbacks you invoke when the user selects a country (and optionally a state).

### Checkout form

- **Country:** Dropdown populated from `useGeoData().countries`.
- **State:** Dropdown when the API returns states for the selected country; otherwise a text input.
- **City:** Autocomplete when state has cities; user can type a custom city if not listed.

State display: When the API returns a state code (e.g. `23` for Tehran) instead of a name, the checkout uses `getStateDisplayName()` to show the state name in the address summary and review step.

### Shipping zones (admin)

- **Countries:** Chip-style input with search (`ChipSelectInput`). User types to filter and adds countries as removable chips.
- **States:** Same chip input, shown only when at least one country is selected. States are loaded per selected country; when multiple countries are selected, labels show `Country — State` for clarity.

**Components:**

- `ChipSelectInput` — Reusable chip + autocomplete input (in `components/shipping/ChipSelectInput.js`)
- `ShippingZoneForm` — Uses `ChipSelectInput` for countries and states (in `components/shipping/ShippingZoneForm.js`)

---

## Data model notes

- **Countries:** ISO 3166-1 alpha-2 codes (e.g. `US`, `CA`, `IR`).
- **States:** API returns `iso2` or `id`; used as stored value. Some APIs return numeric codes (e.g. Iran states).
- **Cities:** Used for autocomplete only; full city list may be large; "type your city" fallback when not listed.

---

## Shipping zone model

`ShippingZone` stores:

- `countries: [String]` — ISO codes
- `states: [String]` — State codes (optional; when empty, zone covers all states in selected countries)

**Index note:** MongoDB does not allow compound indexes on two array fields ("parallel arrays" error). The model uses `{ countries: 1, isActive: 1 }` only; state filtering is done in-memory. See `models/ShippingZone.js`.

---

## Files reference

| Path | Purpose |
| ---- | ------- |
| `src/app/api/geo/countries/route.js` | Proxy: list countries |
| `src/app/api/geo/states/route.js` | Proxy: list states by country |
| `src/app/api/geo/cities/route.js` | Proxy: list cities by country + state |
| `src/hooks/useGeoData.js` | Shared hook for geo data |
| `src/components/shipping/ChipSelectInput.js` | Chip + autocomplete input |
| `src/components/shipping/ShippingZoneForm.js` | Zone form (countries, states, methods) |
| `src/app/(storefront)/checkout/page.js` | Checkout with address form |
