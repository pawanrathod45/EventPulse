# EventPulse — Event Finder & Tracker Platform

EventPulse is a full-stack event discovery, RSVP tracking, and social "Vibe Check" friend invitation platform. It integrates with the Ticketmaster Discovery API, caches event feeds, persists user RSVPs in MongoDB, and features a server-driven friend invite tracking system.

---

## ⚡ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, TailwindCSS, `@tanstack/react-query`, Lucide Icons
- **Backend**: Node.js, Express, TypeScript, Zod, Axios, Mongoose
- **Database**: MongoDB (Mongoose schemas with indexes and aggregations)
- **External API**: Ticketmaster Discovery API (with cached in-memory TTL map and resilient fallback)

---

## 📁 Repository Structure

```
EventPulse/
├── client/                     # Frontend Vite + React + TypeScript + TailwindCSS
│   ├── src/
│   │   ├── components/         # Navbar, EventCalendar, EventCard, EventFilterBar
│   │   ├── context/            # UserContext (demo profile switcher)
│   │   ├── pages/              # DiscoverPage, DashboardPage, InviteLandingPage
│   │   ├── services/           # api.ts (React Query data fetching layer)
│   │   └── types/              # TypeScript interface definitions
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
├── server/                     # Backend Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/             # Environment config and MongoDB connection / seeding
│   │   ├── controllers/        # eventController, rsvpController, shareController, userController
│   │   ├── middleware/         # errorHandler.ts, validate.ts (Zod)
│   │   ├── models/             # User.ts, RSVP.ts, ShareLink.ts
│   │   ├── routes/             # eventRoutes, rsvpRoutes, shareRoutes, userRoutes
│   │   ├── services/           # ticketmasterService, eventService, rsvpService, shareService
│   │   ├── types/              # Shared data contracts
│   │   └── app.ts / index.ts   # Express server initialization
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   └── ARCHITECTURE.md         # Architecture diagrams, data flow & system design
├── package.json                # Monorepo root scripts
└── README.md
```

---

## 🔑 Environment Variables

### Server (`server/.env`):
| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/eventpulse` |
| `CLIENT_URL` | Frontend URL for CORS & link generation | `http://localhost:5173` |
| `TICKETMASTER_API_KEY` | Ticketmaster Discovery API Key | *(Optional; falls back to curated mock feed if blank)* |

### Client (`client/.env`):
| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## 🚀 Getting Started

### 1. Install Dependencies
Run from the repository root:
```bash
npm run install:all
```
*(Or install in both folders individually: `cd server && npm install`, then `cd ../client && npm install`)*

### 2. Configure Environment Files
Copy the `.env.example` templates:
```bash
# Server
cp server/.env.example server/.env

# Client
cp client/.env.example client/.env
```

### 3. Start Development Servers
Run both server and client concurrently from the root:
```bash
npm run dev
```

Alternatively, run each service in separate terminals:
```bash
# Terminal 1: Backend API (port 5000)
npm run dev:server

# Terminal 2: Frontend App (port 5173)
npm run dev:client
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌟 Key Features & Verification Guide

### 1. Event Feed & In-Memory Caching
- **Endpoint**: `GET /api/events?city=&keyword=&startDate=&endDate=`
- Fetches from Ticketmaster Discovery API and normalizes the payload into clean internal schema: `{ id, title, venue, date, time, city, imageUrl, friendsAttendingCount }`.
- In-memory TTL caching prevents excessive calls to the external provider.

### 2. Monthly Event Calendar Grid
- Highlights calendar dates containing events with glowing indicators and count badges.
- Clicking any date filters the event feed below to that day.
- Single-click clear date filter resets view.

### 3. RSVP Persistence & Dashboard
- **Create/Update**: `POST /api/rsvp` body: `{ userId, eventId, eventSnapshot, status }` (Zod validated).
- **List Confirmed**: `GET /api/rsvp/:userId` renders confirmed cards in the dedicated **RSVP Dashboard**.
- **Cancel**: `DELETE /api/rsvp/:id` allows instant cancellation.

### 4. Friend Invite / Share System ("The Vibe Check")
- **Generate Link**: `POST /api/share/generate` body: `{ rsvpId, userId }`. Validates confirmed RSVP, generates a unique token, returns `/invite/:token`.
- **Atomic Click Tracking & Deduplication**: `GET /api/share/:token?userId=...` uses MongoDB `$inc` for `clickCount` and `$addToSet` for `clickedByUserIds` to deduplicate visits server-side.
- **Aggregated Friends Badge**: `GET /api/events/:id/friends-count` aggregates unique visitors across all share links for that event and updates the "Friends Attending: N" badge in real-time.
- **Invite Landing Page**: Visiting `/invite/:token` renders inviter info, event snapshot, live vibe metrics, and a one-click RSVP prompt.

### 5. Multi-User Demo Switcher
- The top-right navbar includes an active profile selector (`Alex Rivera`, `Jordan Chen`, `Taylor Reed`) seeded automatically into MongoDB, allowing evaluators to simulate multiple friends clicking and RSVPing on different machines or tabs.

---

## 🧪 Build & Production Validation

Verify type-checking and production bundles:
```bash
npm run build
```
