# EventPulse System Architecture & Data Flow

This document details the system design, directory organization, and end-to-end data flow of **EventPulse**.

---

## 1. High-Level Architecture

EventPulse follows a clean layered architecture with a strict boundary between presentation (Client) and domain/business logic (Server). All computations, validations, deduplication, and atomic aggregations are strictly enforced on the server.

```
       +-------------------------------------------------------------+
       |               Frontend React 18 Application                 |
       |  (Vite + TailwindCSS + @tanstack/react-query + Lucide Icons) |
       +------------------------------+------------------------------+
                                      |
                      HTTP / REST (JSON API Contracts)
                                      |
       +------------------------------v------------------------------+
       |                   Express TypeScript Server                 |
       |  +-------------------------------------------------------+  |
       |  |  Middleware Layer (CORS, JSON Parser, Zod Validator,  |  |
       |  |                   Central Error Handler)              |  |
       |  +---------------------------+---------------------------+  |
       |                              |                              |
       |  +---------------------------v---------------------------+  |
       |  |  Controllers (HTTP Request/Response Orchestration)    |  |
       |  +---------------------------+---------------------------+  |
       |                              |                              |
       |  +---------------------------v---------------------------+  |
       |  |  Service Layer (Business Logic, Deduplication, Cache) |  |
       |  +---------------------------+---------------------------+  |
       +------------------------------+------------------------------+
                       |                               |
       +---------------v---------------+     +---------v-------------+
       |  Ticketmaster Discovery API   |     |    MongoDB Database   |
       |  (External Feed + TTL Cache)  |     |  (User, RSVP, Share)  |
       +-------------------------------+     +-----------------------+
```

---

## 2. End-to-End Data Flow

```
[User Action in Browser]
          │
          ▼
1. GET /api/events?city=...&keyword=...
          │
          ├────► Check In-Memory Cache (TTL: 2 mins)
          │         │
          │         ├─► [HIT]  Return cached EventSnapshot[]
          │         └─► [MISS] Call Ticketmaster Discovery API /discovery/v2/events.json
          │                    Normalize fields: { id, title, venue, date, time, city, imageUrl }
          │                    Store in Cache Map
          │
          ├────► Aggregate friendsAttendingCount from ShareLink collection
          │         (Batch aggregate unique clickedByUserIds matching eventId)
          │
          ▼
   Client receives normalized EventItem[]
          │
          ├────► Highlights event dates on Monthly Calendar Grid
          └────► Renders responsive EventCards with "Friends Attending: N" badge

─────────────────────────────────────────────────────────────────────────────

2. RSVP Flow:
   User clicks "Interested (RSVP)"
          │
          ▼
   POST /api/rsvp (Validated by Zod schema)
          │
          ▼
   Server upserts RSVP in MongoDB:
     - Collection: `rsvps`
     - Fields: { userId, eventId, eventSnapshot, status: "interested", createdAt }
     - Unique compound index: `{ userId: 1, eventId: 1 }`
          │
          ▼
   Frontend updates state via React Query cache invalidation
   Button updates to "RSVP Confirmed" and displays "Share with Friends"

─────────────────────────────────────────────────────────────────────────────

3. The Vibe Check (Friend Invite & Click Tracking Flow):
   User clicks "Share with Friends"
          │
          ▼
   POST /api/share/generate { rsvpId, userId }
          │
          ├────► Verify user actually RSVP'd to that event
          ├────► Generate unique 8-character token (crypto.randomBytes)
          ├────► Persist ShareLink doc:
          │         { token, rsvpId, eventId, ownerUserId, clickCount: 0, clickedByUserIds: [] }
          └────► Return share URL: `http://localhost:5173/invite/:token`
          │
          ▼
   Frontend copies URL to clipboard with Toast confirmation

─────────────────────────────────────────────────────────────────────────────

4. Invite Resolution & Atomic Click Tracking:
   Friend opens `http://localhost:5173/invite/:token`
          │
          ▼
   Frontend calls `GET /api/share/:token?userId=...`
          │
          ▼
   Server performs atomic single-operation update:
     - `$inc: { clickCount: 1 }` -> Guarantees no race conditions
     - `$addToSet: { clickedByUserIds: visitorUserId }` -> Deduplicates user clicks
          │
          ▼
   Server resolves inviter info (from User collection) & Event details (from RSVP snapshot)
          │
          ▼
   Friend sees personal invitation page with live vibe metrics & "RSVP Now" button
```

---

## 3. Directory Layout Details

- `server/src/models`:
  - `User.ts`: Profiles and preference settings.
  - `RSVP.ts`: Attendance records storing normalized `eventSnapshot` for historical integrity.
  - `ShareLink.ts`: Invite links storing atomic click counters and unique user IDs.
- `server/src/services`:
  - `ticketmasterService.ts`: External API integration, fallback mock data, in-memory TTL caching.
  - `eventService.ts`: Aggregates friends attending counts with event feeds.
  - `rsvpService.ts`: Upsert, retrieve, and delete logic.
  - `shareService.ts`: Token generation, link resolution, `$inc` and `$addToSet` tracking.
- `server/src/middleware`:
  - `errorHandler.ts`: Standardized error JSON responses (`{ success: false, error: { message, code } }`).
  - `validate.ts`: Zod schema enforcement on request payloads.
- `client/src/components`:
  - `Navbar.tsx`: Sticky navigation with active user switcher.
  - `EventCalendar.tsx`: Monthly grid highlighting dates with events and interactive date filtering.
  - `EventFilterBar.tsx`: Keyword, city, and date range filters.
  - `EventCard.tsx`: Event presentation, friends counter badge, and RSVP/share triggers.
- `client/src/pages`:
  - `DiscoverPage.tsx`: Feed discovery hub.
  - `DashboardPage.tsx`: Confirmed RSVP management and cancellation.
  - `InviteLandingPage.tsx`: Vibe Check landing page with inviter context and RSVP CTA.
