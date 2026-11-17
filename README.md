# Wanderlust Travel

A small travel booking demo built with HTML, CSS, and JavaScript.

## Simple file structure

- `index.html` and `home.css` — home page content and styles
- `packages.html` and `packages.css` — trip list and search content and styles
- `package.html` and `package.css` — trip details content and styles (the trip ID is in the URL)
- `rooms.html` and `rooms.css` — room-only listings and search
- `room.html` and `room.css` — details and checkout for a standalone hotel room or villa
- `bookings.html` and `bookings.css` — booking page content and styles
- `wishlist.html` and `wishlist.css` — wishlist page content and styles
- `admin.html` and `admin.css` — admin page content and styles
- `login.html` and `login.css` — sign-in and account creation
- `panel.html` and `panel.css` — signed-in user's account and bookings
- `style.css` — shared colours, layout, and responsive styles
- `app.js` — fills in saved trip data and handles buttons and forms
- `data.js` — sample trips, rooms, bookings, and localStorage functions
- `account.js` — browser-only demo sign-in and account functions

The CSS files have comments above their sections explaining which part of the page each group of styles controls.

## Run

Run `npm install`, then `npm run dev`. Open the local address Vite prints in the terminal. The site uses JavaScript modules, so use the dev server instead of opening the HTML file directly.

The home page has a rotating destination slideshow with arrow and dot controls, plus a prominent stay search form. The design takes general inspiration from hotel booking sites but does not use Hotels.com branding or copy its code.

The assignment brief lists Vue.js as a required technology. This project uses plain JavaScript to avoid `.vue` files; check with your instructor that this is acceptable.

Accounts and checkout are demonstrations that save information in this browser. The checkout does not send payment information anywhere and does not charge money. Do not use a real password or card details.

Travelers can save favorite trips, earn 1 reward point for every $10 on an active booking, and redeem each point for $0.10 off at checkout. They can cancel a booking up to 3 days before its travel date. These demo records are stored in browser localStorage.

Rooms can be booked on their own from the Rooms page. The admin dashboard side menu opens the booking list, package editor, and room editor. Admins can update trip prices, destinations, and departure dates, and room prices, names, types, locations, and available check-in date ranges.

## Demo accounts & dummy payment testing

- **Traveler Demo**: `alex@example.com` / `travel123` (Phone: `+1 555-0144`)
- **Admin Demo**: `admin@wanderlust.com` / `travel123` (Phone: `+1 555-0192`)
- **Demo Payment Card**: Click **"⚡ Autofill Demo Card"** during checkout to auto-populate test card details (`4242 4242 4242 4242`, `12/28`, `123`).
- **Simulated Checkout**: Simulated payment authorization with instant printable booking confirmation vouchers.
- **Promo Codes**: `WELCOME10` (10% off) or `SUMMER2026` ($50 off).

Admin pages open after signing in with the admin account. New accounts are regular traveler accounts and open the member panel. This is a browser-only class project, not secure production authentication.
