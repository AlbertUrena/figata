# Analytics Commerce Funnel

> Read this doc when working on homepage featured commerce instrumentation, the `/menu/` commercial funnel, or edge cases around cart, checkout, and purchase tracking.

## Objective

Keep one reusable commerce tracker for home and menu so Figata can calculate:
- featured impression -> preview detail
- menu impression -> detail
- detail -> add to cart
- cart -> checkout
- checkout -> purchase

## Runtime Ownership

| Artifact | Responsibility |
|------|----------------|
| `shared/analytics-commerce.js` | Canonical helper for `item_impression`, `item_detail_open`, `item_detail_close`, `add_to_cart`, `remove_from_cart`, `cart_view`, `begin_checkout`, and `purchase` |
| `js/home-featured.js` | Homepage featured-card impressions (`list_id=home_featured`) |
| `js/mas-pedidas.js` | Desktop homepage preview detail-open tracking |
| `js/menu-page.js` | Menu catalog/detail/account/WhatsApp checkout instrumentation |
| `scripts/generate-home-featured.js` | Derives `category` and `categoryLabel` into `data/home-featured.json` so homepage events never emit without category context |

## Event Coverage

| Surface | Event | Notes |
|------|------|-------|
| Homepage featured card in viewport | `item_impression` | Uses `home_featured` list context and card position |
| Homepage desktop preview open | `item_detail_open` | `detail_origin=home_featured_preview` |
| Menu catalog card in viewport | `item_impression` | Uses category/subgroup-aware list ids such as `menu_entradas` |
| Menu detail hard load or list open | `item_detail_open` | `detail_origin` distinguishes direct route, grid, undo/account, etc. |
| Menu detail CTA | `add_to_cart` | Includes `detail_origin`, `cart_id`, quantity, and unit price |
| Account modal remove/decrement-to-zero | `remove_from_cart` | Uses `detail_origin=account_modal` or `detail_origin=menu_undo` when restored |
| Account modal open with items | `cart_view` | Uses current cart snapshot totals |
| WhatsApp checkout CTA | `begin_checkout` | Uses the same normalized cart snapshot as purchase |
| WhatsApp checkout CTA success path | `purchase` | Emits synthetic order id derived from `cart_id + snapshot_key` unless an explicit order id is provided |
| Menu detail story card in viewport | `item_story_view` | Dedupe by `session_id + item_id + story_id` |
| Menu detail pairing entry in viewport | `item_pairing_view` | Fires per pairing row once per session |
| Menu detail editorial carousel after first slide | `item_gallery_expand` | Uses the active slide `media_id` and the current `detail_depth_index` |
| Menu detail editorial video playback | `item_video_play`, `item_video_complete` | Media ids come from normalized slide assets so replay/video QA stays route-agnostic |

## Decision Summary

`/__analytics/inspect` derives a session-level decision summary directly from the local event log so QA can verify:
- `detailOpens`
- `uniqueDetailOpens`
- `detailOpensBeforeAddToCart`
- `detailOpensBeforePurchase`
- `timeFromFirstDetailToAddToCartMs`
- `timeFromFirstDetailToPurchaseMs`
- editorial interaction counts per session
- `behaviorProfile` (`decidido`, `explorador`, `indeciso`)

Current limitation:
- Device segmentation is still unavailable locally because the shared analytics envelope does not yet emit a device dimension.

## Data Requirements

Every critical commerce event must include:
- `item_id`
- `item_name`
- `category`

Cart and checkout events also require:
- `cart_id`
- `currency`
- `value`
- `items[]`

## Edge Cases

| Case | Current behavior |
|------|------------------|
| Re-rendered cards | `shared/analytics-commerce.js` dedupes impressions by `item_id + list_id + list_position` |
| Detail reopened from the same origin | Detail-open/detail-close use origin-aware dedupe keys |
| Menu catalog initial render | Menu cards defer impression observation until the card node is connected to the live DOM |
| Tall cards near the fold | Impression fires only after the visibility threshold is actually met; a small scroll may be required on desktop |
| Hidden/internal traffic | Base SDK/governance still classifies and flags the events before batching |
| Empty cart modal | `cart_view`, `begin_checkout`, and `purchase` are skipped when the normalized snapshot has no items |
| WhatsApp retries | Checkout and purchase dedupe off cart snapshot identity, so repeated clicks on the same snapshot do not create ambiguous duplicate events |
| Remove then undo | `remove_from_cart` fires on removal and `add_to_cart` fires again when undo restores the item |
| Future `/reservas`-style route | Reuse `shared/analytics-commerce.js` with new list/detail/cart adapters instead of inventing route-local event names |

## Validation Checklist

- `node --check shared/analytics-commerce.js`
- `node --check js/home-featured.js`
- `node --check js/mas-pedidas.js`
- `node --check js/menu-page.js`
- Manual dev validation against `/__analytics/inspect` or the local NDJSON log for:
  - homepage featured impressions
  - homepage preview detail open
  - menu catalog impressions
  - menu detail open
  - story / pairing / gallery / video editorial events
  - decision summary (`detailOpensBeforeAddToCart`, `detailOpensBeforePurchase`, `behaviorProfile`)
  - add to cart
  - cart view
  - begin checkout
  - purchase
  - remove from cart
