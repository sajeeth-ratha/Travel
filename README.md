# Wanderlust Voyage | Travel Agency Web Application ✈️🌍

A modern, responsive, and feature-rich web application designed and developed for a travel agency. Built using **HTML5, CSS3, JavaScript, and Vue.js (Vue 3)**, running entirely client-side with persistent **browser `localStorage`** (zero external database dependency).

---

## 📋 Course Project Overview

This project was built to satisfy all requirements for the Travel Agency Web Application course project:
- **Customer Portal**: Search, multi-criteria filtering, interactive day-by-day itineraries, dynamic price calculators, multi-step booking checkout with a simulated payment gateway, booking management, and saved favorites (wishlist).
- **Agency Admin Portal**: Staff dashboard featuring business metrics (revenue, active bookings), package inventory content management (full CRUD with itinerary editor), and daily booking operations.
- **Data Persistence**: Uses browser `localStorage` pre-seeded with realistic global destinations and simulated reservations. Features a 1-click **Reset Demo Data** tool for repeatable live presentations.
- **Academic Deliverables**: Includes an integrated **10-Minute Presentation Slides Mode** directly inside the web app and a comprehensive **[PROJECT_REPORT.md](./PROJECT_REPORT.md)** ready for Moodle PDF export.

---

## 🛠️ Technologies Used

| Technology | Purpose in Project |
| :--- | :--- |
| **HTML5** | Semantic structure (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`) |
| **CSS3** | Modern responsive grid & flexbox layouts, custom travel color palette, print voucher stylesheets |
| **JavaScript (ES6+)** | Reactive state, calculations, modular storage services, event handling |
| **Vue.js 3** | Single-File Component architecture (`.vue`), Composition API (`<script setup>`), reactive computations |
| **Vue Router 4** | Client-side routing between Home, Catalog, Details, Bookings, Wishlist, and Admin views |
| **LocalStorage API** | Browser-based JSON data persistence across page reloads and browser sessions |
| **Open-Source Imagery** | Curated high-resolution travel photography from Unsplash with fast CDN links |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have **Node.js** (v18+) installed on your computer.

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173` to explore the application!

### 4. Build for Production / Moodle Submission
```bash
npm run build
```
This produces an optimized, self-contained `dist/` bundle. You can test it locally via:
```bash
npm run preview
```

---

## 🌟 Key Application Features

### 👤 Customer Experience
1. **Interactive Home Page**:
   - Hero search bar with instant query matching for destination, continent, and travel style.
   - Quick category themes (Cultural, Adventure & Nature, Beach & Island, Safari & Wildlife, Luxury Escapes).
   - Featured packages grid with badges (*Special Deal*, *Featured*) and ratings.
   - Promotional newsletter discount code (`WELCOME10` for 10% off).
2. **Explore Packages Catalog (`/packages`)**:
   - Multi-criteria filter sidebar: budget slider ($1,000 to $4,000), continent selector, duration radio buttons, and customer star rating filter.
   - Sorting dropdown: Featured, Price (Low-to-High / High-to-Low), Duration, and Highest Rated.
3. **Package Details Page (`/package/:id`)**:
   - High-resolution photo gallery with interactive thumbnail selection.
   - Expandable day-by-day itinerary timeline.
   - Included vs. Not Included checklist.
   - Sticky live price calculator: adjusts in real-time as travelers change guest counts, room tiers, and add-ons.
   - Customer review submission form that updates package ratings dynamically.
4. **Simulated Payment & Checkout Flow**:
   - Step 1: Traveler contact details and departure date selection.
   - Step 2: Room upgrades (Deluxe Suite, Presidential Villa), add-ons (Airport Chauffeur, Travel Insurance, Private Guide), and promo voucher codes (`SUMMER2026` for 15% off).
   - Step 3: Simulated Payment Gateway (Credit Card with card brand recognition, PayPal, Apple Pay, plus an **"⚡ Autofill Demo Card"** button for quick grading).
   - Step 4: Instant booking confirmation with unique reference code (e.g. `TRV-2026-4819`).
5. **Manage Bookings (`/bookings`)**:
   - View all active and past bookings filtered by status (`All`, `Confirmed`, `Pending`, `Cancelled`).
   - Printable Travel Voucher modal formatted with `@media print` rules.
   - Edit traveler details and special requests.
   - Cancel booking with simulated refund.
6. **Wishlist (`/wishlist`)**:
   - Save favorite dream destinations with heart toggle.
   - Direct booking action from the wishlist.

---

### ⚙️ Agency Admin Portal (`/admin`)
1. **Analytics Dashboard**:
   - Live KPI cards: Gross Simulated Revenue, Total Reservations, Active Packages Count, Average Rating.
   - Status distribution progress breakdown (Confirmed, Pending, Cancelled).
   - Recent bookings table with quick actions.
2. **Package Content Management (CRUD) (`/admin/packages`)**:
   - View all packages in a sortable/searchable inventory table.
   - Add new packages with cover image, pricing, duration, tags, and itinerary.
   - Edit existing package information in real time.
   - Delete packages with confirmation protection.
3. **Daily Agency Operations (`/admin/bookings`)**:
   - Comprehensive customer manifest.
   - Filter by status and search by customer name, email, or booking reference.
   - Change booking statuses (`Confirm`, `Cancel`).
   - Inspect individual travel ticket vouchers.
4. **Presentation Tools**:
   - **"🔄 Reset Demo Data"** button: Instantly restores the baseline catalog and mock bookings if modified during testing.
   - **"📥 Export JSON"**: Backup the entire application state to a local JSON file.

---

## 📄 Academic Project Report for Moodle

The complete academic report is available in **[PROJECT_REPORT.md](./PROJECT_REPORT.md)**.
It covers:
- System Architecture & Data Flow
- Functional & Non-Functional Requirements Traceability
- LocalStorage Schema & Data Dictionary
- Testing & Verification Protocols
- Oral Defense Q&A Cheat Sheet
