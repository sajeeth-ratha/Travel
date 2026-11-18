# Wanderlust Travel

A travel agency web application built with **Vue 3**, Vite, HTML5 and CSS3 for the
EFREI web programming project. Customers can browse and search trips and rooms,
book them, and manage their reservations. An admin workspace manages content and
daily operations.

## Technology

- Vue 3 single-file components (`.vue`)
- Vite multi-page build (one Vue app per page)
- HTML5 and CSS3 (the existing responsive stylesheets are preserved)
- Browser `localStorage` for all demo data — no database or real payment gateway

## Project structure

```
index.html, packages.html, …     Vite page entries (one per screen)
src/entries/                     Bootstraps a Vue app for each page
src/views/                       Page-level Vue components
src/components/                  Shared SFCs (header, footer, cards, dialogs)
src/lib/data.js                  Trips, rooms, bookings, wishlist, promos
src/lib/account.js               Demo accounts and sessions
src/lib/store.js                 Small shared reactive store
src/lib/ui.js                    Money/date formatting helpers
src/styles/                      Per-page and shared stylesheets
public/assets/                   Logo and static assets
```

Each HTML file is a separate Vite entry, so a page only loads its own stylesheet
while still sharing Vue components with the other pages.

## Run

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the local address Vite prints (usually `http://localhost:5173`). To check the
production build, run `npm run build` and then `npm run preview`. The site uses
ES modules, so use the dev/preview server instead of opening the HTML files
directly.

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Home page with a destination carousel, search and featured trips |
| `packages.html` | Trip catalogue with keyword search |
| `package.html?id=…` | Trip details, itinerary and checkout |
| `rooms.html` | Room search with country, price, amenity, type and rating filters |
| `room.html?id=…` | Room details and standalone room checkout |
| `bookings.html` | The signed-in traveler's reservations |
| `wishlist.html` | Saved trips and rooms |
| `login.html` | Sign in or create a demo account |
| `panel.html` | Member dashboard: bookings, rewards, wishlist and settings |
| `admin.html` | Admin workspace: bookings, packages and room inventory |

## Features

- Browse and search travel packages and hotel rooms.
- Simulated checkout (no real payment), printable booking vouchers.
- Cancel a booking up to 3 days before the travel date.
- Members earn 1 point per $10 spent; points are worth $0.10 each at checkout.
- Promo codes: `WELCOME10`, `SUMMER2026`, `EXPLORE50`.
- Wishlist, rewards, member profile and password settings.
- Admin can search and update bookings, and add, edit or delete packages and rooms.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Traveler | `alex@example.com` | `travel123` |
| Admin | `admin@wanderlust.com` | `travel123` |

Demo payment card: click **⚡ Autofill Demo Card** at checkout
(`4242 4242 4242 4242`, `12/28`, `123`).

All accounts, bookings and payment results are stored in this browser only. This
is a class demonstration: do not use a real password or card.
