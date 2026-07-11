# 🔍 Find It — Ugandan Event Discovery Platform

A modern event discovery and hosting platform built for Uganda, allowing users to find, save, and attend local events while giving organizers powerful tools to host and manage them.

## ✨ Features

- 🎉 **Event Discovery** — Browse, search, and filter events by category, city, and date
- 🎟️ **Ticket Checkout** — Built-in checkout flow with promo code support
- ⭐ **Reviews & Ratings** — Attendees can leave reviews; organizers get notified instantly
- 🔔 **Notifications** — Real-time organizer notifications for reviews and ticket sales
- 🗺️ **Mapbox Integration** — Interactive venue maps on every event page
- 📅 **Calendar Export** — Add events to Google, Apple, or Outlook calendar
- 🔐 **Auth Roles** — Separate flows for Guests, Users, Hosts, and Admins
- 📊 **Host Dashboard** — Full event management, analytics, and attendee tools
- 🌐 **Multi-language** — Language context built in
- 📱 **Responsive** — Mobile-first design

## 🛠️ Tech Stack

- **Frontend** — React + TypeScript + Vite
- **Styling** — Vanilla CSS with design tokens
- **Database** — Supabase (PostgreSQL + Auth + RLS)
- **Maps** — Mapbox GL JS (`react-map-gl`)
- **Icons** — Phosphor Icons

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/your-username/find-it.git
cd find-it
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```
Fill in your Supabase and Mapbox credentials in `.env`.

### 4. Run the database migrations
Apply the SQL files in order using the Supabase SQL editor:
1. `supabase_schema.sql` — Core tables (profiles, events)
2. `supabase_saved_events.sql` — Saved events table
3. `supabase_reviews_notifications.sql` — Reviews & notifications tables

### 5. Start the dev server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── account/      # Host & User account panels
│   ├── auth/         # Onboarding flows
│   └── dashboard/    # Host & User dashboards
├── context/          # React context (Events, User, Language, Theme)
├── lib/              # Supabase client & utilities
├── pages/            # Route-level page components
└── index.css         # Global styles & design tokens
```

## 🔑 Environment Variables



## 📄 License

MIT
