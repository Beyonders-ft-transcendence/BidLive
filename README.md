*This project has been created as part of the 42 curriculum by [nmatondo], [asebasti], [jorcarva], [emalungo], [ferda-si].*

---

<div align="center">

# 🔨 BidLive

**A real-time live auction platform — ft_transcendence final project at 42 Luanda**

*Bid. Stream. Connect. All in real time.*

</div>

---

## Table of Contents

- [Description](#description)
- [Team Information](#team-information)
- [Project Management](#project-management)
- [Technical Stack](#technical-stack)
- [Database Schema](#database-schema)
- [Features List](#features-list)
- [Modules](#modules)
- [Instructions](#instructions)
- [Individual Contributions](#individual-contributions)
- [Resources](#resources)

---

## Description

**BidLive** is a full-stack web application that reimagines the traditional auction experience as a real-time, social platform. Users can create and participate in timed auctions or live-streamed bidding events, interact through public and private chat, build a social network, and manage their activity through a personal dashboard.

The platform is built on a service-oriented Django backend with WebSocket support via Django Channels, a React frontend with full TypeScript, and a production-grade infrastructure stack with Docker, Nginx, Prometheus, and Grafana.

### Core Concept

A seller creates an auction for an item — setting a starting price, duration, and optional buy-now price. They can go live on video via LiveKit (WebRTC). Buyers watch the live stream, place bids in real time, and chat in the auction room. The highest bidder at closing time wins. The entire experience — bids, chat, notifications, stream events — happens without a single page refresh.

### Key Features

- **Real-time bidding** via WebSockets with anti-spam, anti-self-bid, and race condition protection
- **Live video streaming** powered by LiveKit (WebRTC/RTMP)
- **Private and public chat** with typing indicators and read receipts
- **Social system** — friend requests, blocking, online presence
- **RBAC** — four roles (Visitor, User, Monitor, Super Admin) with granular permission strings
- **Content moderation** — report system with admin action panel (warn, ban, delete, escalate)
- **OAuth 2.0** — login with Google and 42 Intranet
- **Backoffice panel** — full admin dashboard for users, auctions, roles, and reports
- **Notifications** — real-time in-app delivery via WebSocket + REST history
- **Analytics** — async event tracking via Celery
- **Internationalisation** — UI in English, Portuguese, and Arabic
- **Observability** — Prometheus metrics + Grafana dashboards
- **One-command deploy** — `docker compose up` starts all 9 containers

---

## Team Information

| Name | Role | Responsibilities |
|---|---|---|
| **nmatondo** | Tech Leader / Backend Developer, DevOps | Frontend architecture (FE-001/002), Authentication UI (FE-003/004), Profile & password recovery (FE-005), Auction listing & creation (FE-006), Auction detail & bidding (FE-007), LiveKit integration (FE-008), Chat UI (FE-009), Social UI (FE-010), Backoffice panel (FE-011/012) |
| **asebasti** | Product Owner / Backend Developer | Social system (EPIC 4), Real-time Chat (EPIC 7), Reports & Moderation API (BE-003), Social-Chat block integration (BE-005), Global error handling (BE-008) |
| **emalungo** | Project Manager / Frontend Developer | Backend infrastructure (EPIC 1), User system & OAuth (EPIC 2), RBAC (EPIC 3), Auction system (EPIC 5), Real-time bidding (EPIC 6), Notifications (BE-004), Analytics (BE-007), Docker infrastructure (DO-001 to DO-007), Project management |
| **jorcarva** | Frontend Developer | Frontend architecture (FE-001/002), Authentication UI (FE-003/004), Profile & password recovery (FE-005), Auction listing & creation (FE-006), Auction detail & bidding (FE-007), LiveKit integration (FE-008), Chat UI (FE-009), Social UI (FE-010), Backoffice panel (FE-011/012) |
| **ferda-si** | Frontend Developer | Frontend architecture (FE-001/002), Authentication UI (FE-003/004), Profile & password recovery (FE-005), Auction listing & creation (FE-006), Auction detail & bidding (FE-007), LiveKit integration (FE-008), Chat UI (FE-009), Social UI (FE-010), Backoffice panel (FE-011/012) |


---

## Project Management

### Work Organisation

The project was divided into **EPICs** (major functional systems) and **ISSUEs** (specific tasks). Each EPIC was developed on its own Git branch and merged after internal review. Issues were categorised by prefix:

| Prefix | Scope |
|---|---|
| `EPIC` | Major backend systems (Social, Auctions, Chat, Streaming) |
| `BE-` | Backend cross-cutting concerns (Notifications, Reports, Error handling, Analytics) |
| `FE-` | Frontend implementation per screen / feature |
| `DO-` | DevOps infrastructure (Docker, Nginx, Prometheus, LiveKit, Deploy) |
| `VAL-` | Validation and evaluation preparation |

### Issue Breakdown

| Issue | Title | Status |
|---|---|---|
| EPIC 1 | Infraestrutura Inicial | ✅ Closed |
| EPIC 2 | Sistema de Usuários | ✅ Closed |
| EPIC 3 | Sistema de Roles & Permissões | ✅ Closed |
| EPIC 4 | Sistema Social | ✅ Closed |
| EPIC 5 | Sistema de Leilões | ✅ Closed |
| EPIC 6 | Sistema de Lances em Tempo Real | ✅ Closed |
| EPIC 7 | Chat em Tempo Real | ✅ Closed |
| EPIC 8 | Streaming Ao Vivo | ✅ Closed |
| BE-003 | Reports API (Denúncias) | ✅ Closed |
| BE-004 | Notificações (API & WebSockets) | ✅ Closed |
| BE-005 | Integração Social-Chat (Bloqueios) | ✅ Closed |
| BE-007 | Analytics API | ✅ Closed |
| BE-008 | Validações Globais e Tratamento de Erros | ✅ Closed |
| DO-001 | Arquitetura Base, Redes e Volumes | ✅ Closed |
| DO-002 | PostgreSQL, Redis e Adminer | ✅ Closed |
| DO-003 | Conteinerização (Frontend e Backend) | ✅ Closed |
| DO-004 | LiveKit (Streaming) | ✅ Closed |
| DO-005 | Prometheus e Grafana | ✅ Closed |
| DO-006 | Nginx, SSL/TLS | ✅ Closed |
| DO-007 | Automação e Validação do Deploy | ✅ Closed |
| FE-001 | Configuração Base e Arquitetura Frontend | ✅ Closed |
| FE-002 | Sistema de Roteamento e Layout Base | ✅ Closed |
| FE-003 | Autenticação Local | ✅ Closed |
| FE-004 | OAuth (Google e 42) | ✅ Closed |
| FE-005 | Recuperação de Senha e Perfil | ✅ Closed |
| FE-006 | Listagem e Criação de Leilões | ✅ Closed |
| FE-007 | Tela de Detalhes e Lances | ✅ Closed |
| FE-008 | Livestream (LiveKit) | ✅ Closed |
| FE-009 | Sistema de Chat | ✅ Closed |
| FE-010 | Sistema Social (Amizades e Bloqueios) | ✅ Closed |
| FE-011 | Gestão de Domínios | ✅ Closed |
| FE-012 | Dashboard Administrativo (RBAC) | ✅ Closed |
| VAL-001 | README Completo | ✅ Closed |
| VAL-002 | Infraestrutura e Deploy | ✅ Closed |
| VAL-003 | Segurança e Validação de Dados | ✅ Closed |
| VAL-004 | Interface e UX | ✅ Closed |
| VAL-005 | Qualidade do Repositório | ✅ Closed |
| VAL-006 | Verificação de Módulos | ✅ Closed |

### Tools

- **GitHub Issues & Projects** — task tracking, EPICs, bug reports, checklist per issue
- **Discord** — daily communication, code reviews, debugging sessions
- **Git** — feature branches per EPIC/issue, conventional commits (`feat`, `fix`, `chore`)

---

## Technical Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Python | 3.12+ | Primary language |
| Django | 5.x | Web framework — ORM, admin, auth |
| Django REST Framework | 3.15+ | REST API layer — serializers, viewsets, permissions |
| Django Channels | 4.x | WebSocket support (bidding, chat, notifications) |
| Daphne | 4.x | ASGI server — HTTP + WebSocket in one process |
| Celery | 5.x | Async task queue — scheduler, notifications, analytics |
| Redis | 7 | Channel layer broker + cache + Celery broker |
| PostgreSQL | 16 | Primary relational database |
| SimpleJWT | 5.x | JWT auth with refresh token rotation and blacklisting |
| drf-spectacular | 0.27+ | OpenAPI 3.0 schema — Swagger UI + Redoc |
| django-allauth | 65+ | OAuth 2.0 with Google and 42 Intranet |
| LiveKit | latest | WebRTC / RTMP live streaming server |
| django-prometheus | 2.5+ | Prometheus metrics endpoint |
| uv | latest | Fast Python package manager (replaces pip/Poetry) |
| Gunicorn + Uvicorn | latest | Production ASGI workers |
| Whitenoise | 6.x | Static file serving without external CDN |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18+ | UI framework |
| TypeScript | 5+ | Type safety across all components and services |
| Vite | 5+ | Build tool — fast HMR in development |
| TailwindCSS | 4+ | Utility-first CSS styling |
| shadcn/ui | latest | Accessible, unstyled component library |
| React Query (TanStack) | 5+ | Server state — fetch, cache, sync |
| Zustand | 5+ | Global client state (auth, user session) |
| React Hook Form + Zod | latest | Form handling + schema validation |
| Axios | latest | HTTP client with JWT interceptors |
| React Router | 6+ | Client-side routing with protected routes |
| i18next | latest | Internationalisation — EN, PT, AR |
| LiveKit Components React | latest | WebRTC player and broadcaster UI |
| Cloudinary | latest | Image upload and CDN |

### Infrastructure & DevOps

| Technology | Purpose |
|---|---|
| Docker + Docker Compose | 9-container orchestration |
| Nginx | Reverse proxy, SSL termination, static files, WebSocket proxy |
| Prometheus | Metrics scraping from Django, Node Exporter, LiveKit |
| Grafana | Visual dashboards — server health, API traffic, DB metrics |
| Adminer | PostgreSQL web UI (internal network only) |
| mkcert / OpenSSL | Self-signed SSL certificates for local HTTPS |

### Why These Choices

**Django over FastAPI** — the built-in ORM with `select_for_update()`, admin panel, `django-allauth` for OAuth, and Django Channels for WebSockets meant we had a production-ready foundation from day one. FastAPI would have required building all of this from scratch.

**PostgreSQL over MySQL** — `SELECT FOR UPDATE` row-level locking is essential for preventing race conditions in concurrent bidding. PostgreSQL's ACID guarantees and support for Django ORM advanced features (`Window`, `annotate`, `Q`, `F`) made it the clear choice.

**Redis for everything async** — one service handles three roles: Celery task broker, Django Channels group messaging (WebSocket broadcast), and API response cache. Simpler infrastructure with no single-purpose queue server needed.

**uv over pip/Poetry** — significantly faster dependency resolution and installation. Critical in a Docker build pipeline where `pip install` was taking over 2 minutes; `uv sync` takes under 20 seconds.

**LiveKit over custom WebRTC** — building WebRTC signalling from scratch is a multi-week project. LiveKit provides a production-grade server, React SDK, and token-based auth that integrates directly with our Django backend.

**shadcn/ui + Tailwind** — shadcn provides accessible, headless components that integrate cleanly with Tailwind without heavy CSS overrides or bundle bloat. Every component is owned in the codebase — no black-box library updates breaking the UI.

---

## Database Schema

### Network Architecture

```
Internet
    │
    ▼
┌────────────────────────────────────────────────────┐
│  frontend-network (public)                         │
│  ┌────────┐                                        │
│  │ Nginx  │ :80 → :443  (SSL, reverse proxy)       │ 
│  └───┬────┘                                        │
│      │ /         → Frontend (Vite)                 │
│      │ /api/     → Backend (Daphne)                │
│      │ /ws/      → Backend (WebSocket)             │
│      │ /adminer/ → Adminer                         │
│      │ /grafana/ → Grafana                         │
└──────┼─────────────────────────────────────────────┘
       │
┌──────┼─────────────────────────────────────────────┐
│  backend-network (private)                         │
│      │                                             │
│  ┌───▼────┐  ┌──────────┐  ┌────────┐  ┌────────┐  │
│  │Backend │  │PostgreSQL│  │ Redis  │  │LiveKit │  │
│  │(Django)│  │  :5432   │  │ :6379  │  │ :7880  │  │
│  └────────┘  └──────────┘  └────────┘  └────────┘  │
│                                                    │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐            │
│  │ Celery  │  │Prometheus│  │ Grafana │            │
│  │ Worker  │  │  :9090   │  │  :3000  │            │
│  └─────────┘  └──────────┘  └─────────┘            │
└────────────────────────────────────────────────────┘
```

### Core Tables and Relationships

```
users
  ├── user_roles ──► roles ──► role_permissions ──► permissions
  ├── oauth_accounts (provider: GOOGLE | 42)
  ├── sessions
  │
  ├── friendships
  │     requester_id ──► users
  │     addressee_id ──► users
  │     status: PENDING | ACCEPTED | BLOCKED
  │
  ├── auction_items (seller_id)
  │     └── auctions (item_id)
  │           ├── bids (bidder_id, amount)
  │           ├── auction_watchers (user_id)
  │           ├── live_streams (streamer_id, stream_key)
  │           │     └── stream_viewers
  │           └── chat_rooms
  │                 └── messages (sender_id, is_deleted)
  │
  ├── private_conversations (user_one_id, user_two_id)
  │     └── private_messages (sender_id, is_read)
  │
  ├── notifications (type, title, content, is_read)
  │
  ├── reports (target_type, target_id, reason, status)
  │     ├── report_actions (admin_id, action, note)
  │     └── report_evidence ──► files
  │
  ├── files (uploader_id, url, mime_type)
  ├── analytics_events (event_type, metadata, ip_address)
  └── api_keys
```

### Key Models

| Model | Key Fields | Notes |
|---|---|---|
| `User` | `email`, `username`, `status`, `is_online`, `last_seen` | Custom auth model, soft-deletable |
| `AuctionItem` | `title`, `starting_price`, `current_price`, `buy_now_price`, `minimum_increment`, `condition_type` | Owned by seller |
| `Auction` | `status`, `start_time`, `end_time`, `winner_id` | Lifecycle: DRAFT → SCHEDULED → ACTIVE → LIVE → ENDED/SOLD |
| `Bid` | `amount`, `is_buy_now`, `created_at` | `SELECT FOR UPDATE` on parent auction |
| `Friendship` | `status` | Normalised: always `requester_id < addressee_id` |
| `ChatRoom` | `auction_id`, `name` | One per auction, auto-created |
| `PrivateConversation` | `user_one_id`, `user_two_id` | Normalised: always `user_one_id < user_two_id` |
| `LiveStream` | `stream_key`, `is_live`, `started_at`, `ended_at` | LiveKit token issued per viewer |
| `Report` | `target_type`, `target_id`, `reason`, `status` | Polymorphic target |
| `ReportAction` | `action`, `note`, `admin_id` | Full audit trail |
| `Notification` | `type`, `title`, `content`, `is_read` | Delivered via WebSocket + REST |
| `AnalyticsEvent` | `event_type`, `metadata` (JSON), `ip_address` | Written async via Celery |

### Status Enumerations

| Model | Possible States |
|---|---|
| `Auction.status` | `DRAFT` → `SCHEDULED` → `ACTIVE` → `LIVE` → `ENDED` / `SOLD` / `CANCELLED` |
| `Friendship.status` | `PENDING` → `ACCEPTED` \| `BLOCKED` |
| `Report.status` | `OPEN` → `UNDER_REVIEW` → `RESOLVED` / `REJECTED` / `IGNORED` |
| `User.status` | `ACTIVE` \| `BANNED` \| `SUSPENDED` |

---

## Features List

### Authentication & Users *(EPIC 2 — Emanuel Malungo)*

| Feature | Description |
|---|---|
| Email registration & login | JWT-based with refresh token rotation and blacklisting on logout |
| OAuth — Google | Full OAuth 2.0 flow via django-allauth |
| OAuth — 42 Intranet | OAuth 2.0 with 42 school account |
| Password reset | Forgot password flow with time-limited token |
| Password change | Authenticated endpoint to update credentials |
| User profile | Avatar, bio, online status, last seen |
| Email verification | Account verification link via email |
| Session management | Token blacklisting, multi-device support |

### RBAC — Roles & Permissions *(EPIC 3 — Emanuel Malungo)*

| Feature | Description |
|---|---|
| Role system | VISITOR, USER, MONITOR, SUPER_ADMIN |
| Dynamic permissions | Granular strings: `auction.bid`, `chat.send`, `report.resolve`, etc. |
| Role assignment | Admin assigns roles per user |
| Authorisation middleware | `AuthorizationAuditMiddleware` logs every permission check |

### Social System *(EPIC 4 — António Sebastião)*

| Feature | Description |
|---|---|
| Friend requests | Send, accept, reject with pending state |
| Friend list | List accepted friends; filter online friends |
| User blocking | Block / unblock in any direction |
| Block enforcement | Blocked users cannot send messages or friend requests |
| Online presence | `is_online` and `last_seen` updated on WebSocket connect/disconnect |

### Auction System *(EPIC 5 — Emanuel Malungo)*

| Feature | Description |
|---|---|
| Create & edit auction | Title, description, price, schedule, condition, images |
| Buy Now | Instant purchase at fixed price, closes auction immediately |
| Auction categories | Seeded categories for filtering and discovery |
| Image upload | Multiple images per auction — binary upload or external URL |
| Auto-activation | Celery beat activates `SCHEDULED` → `ACTIVE` every minute |
| Auto-close | Celery beat closes expired auctions and determines winner |
| Watchlist | Favourite/unwatch auctions |
| Auction filters | Filter by status, category, price range, seller |

### Real-time Bidding *(EPIC 6 — Emanuel Malungo)*

| Feature | Description |
|---|---|
| WebSocket bids | Live bid updates broadcast to all connected viewers |
| Anti-spam | Rate limiting: 5 bids per 10 seconds, 30-second block |
| Anti-self-bid | Users cannot bid on their own auctions |
| Concurrency safety | `SELECT FOR UPDATE` on `Auction` prevents race conditions |
| Outbid notification | Previous highest bidder receives instant notification |
| Bid history | Paginated bid history, newest first |

### Real-time Chat *(EPIC 7 — António Sebastião)*

| Feature | Description |
|---|---|
| Private messaging (REST) | Send, retrieve, and delete private messages via API |
| Private messaging (WebSocket) | Real-time delivery via `PrivateChatConsumer` |
| Auction room chat (REST) | Send and retrieve room messages via API |
| Auction room chat (WebSocket) | Public chat via `AuctionChatConsumer` |
| Typing indicator | `chat.typing` event broadcast (not persisted) |
| Read receipts | Mark messages as read; `unread_count` in conversation list |
| Message deletion | Hard delete for private messages; soft delete for room messages |
| Block integration | `is_blocked` checked before delivering any message |

### Live Streaming *(EPIC 8 — Emanuel Malungo)*

| Feature | Description |
|---|---|
| Create stream | Seller creates stream linked to an auction |
| Start / end stream | `is_live` flag, `started_at` / `ended_at` timestamps |
| LiveKit token | Backend issues signed JWT per viewer/broadcaster |
| Stream key | Unique per stream, regeneratable |
| Viewer count | Real-time viewer tracking |
| LiveKit webhook | Backend processes room events from LiveKit server |

### Notifications *(BE-004 — Emanuel Malungo)*

| Feature | Description |
|---|---|
| In-app notifications (REST) | List and mark as read via `GET /api/notifications/` |
| Real-time delivery | `NotificationConsumer` pushes payload via WebSocket on creation |
| Signals | Django signals auto-generate notifications on key events |
| Celery tasks | Async notification dispatch for high-volume events |
| Types | `NEW_BID`, `OUTBID`, `MESSAGE`, `FRIEND_REQUEST`, `STREAM_STARTED`, `AUCTION_ENDED` |

### Reports & Moderation *(BE-003 — António Sebastião)*

| Feature | Description |
|---|---|
| Submit report | Any authenticated user can report users, messages, auctions, bids, streams |
| Duplicate prevention | Cannot open two reports for the same target |
| Admin review panel | List and filter open reports by status and target type |
| Action: COMMENT | Admin adds note — no status change |
| Action: CHANGE_STATUS | Moves report through moderation lifecycle |
| Action: WARN_USER | Sends in-app warning notification to target |
| Action: BAN_USER | Deactivates account, sets `is_active=False`, notifies user |
| Action: DELETE_CONTENT | Soft-deletes messages; hard-deletes private messages |
| Action: ESCALATE | Flags for senior review |
| Audit trail | Every admin action recorded in `ReportAction` |

### Analytics *(BE-007 — Emanuel Malungo)*

| Feature | Description |
|---|---|
| Event ingestion | `POST /api/analytics/events/` — async write via Celery |
| Admin statistics | `GET /api/analytics/stats/` — aggregated metrics for admins |
| Event types | Page views, bid events, auction interactions, system logs |

### Social-Chat Integration *(BE-005 — António Sebastião)*

| Feature | Description |
|---|---|
| Block check in REST | `send_private_message` raises 400 if blocked |
| Block check in WebSocket | `PrivateChatConsumer._handle_message` rejects silently |
| Filtered room history | `get_room_messages(viewer=user)` excludes blocked senders |
| Bug fix | Fixed typo `adrressee` in `is_blocked` selector |

### Error Handling *(BE-008 — António Sebastião)*

| Feature | Description |
|---|---|
| Standardised error format | All errors return `{"success": false, "errors": {...}}` |
| Malformed JSON → 400 | `ParseError` and `json.JSONDecodeError` caught — no more 500 |
| Rate limit message | 429 includes `wait` time in seconds |
| Server errors | 500 logs full traceback server-side, returns clean message to client |
| No stack traces | Zero raw Python tracebacks exposed to any client |

### Infrastructure *(DO-001 to DO-007 — Emanuel Malungo)*

| Feature | Description |
|---|---|
| 9-container Docker Compose | Backend, Frontend, PostgreSQL, Redis, Nginx, Celery, LiveKit, Prometheus, Grafana |
| Isolated networks | `frontend-network` (public) and `backend-network` (private) |
| Nginx reverse proxy | Routes `/`, `/api/`, `/ws/`, `/adminer/`, `/grafana/` |
| SSL/TLS | Self-signed certificates via mkcert for local HTTPS |
| WebSocket proxy | `Upgrade` and `Connection` headers forwarded correctly |
| Prometheus | Scrapes Django (`django-prometheus`), Node Exporter, LiveKit |
| Grafana | Auto-provisioned dashboards with Prometheus data source |
| Adminer | PostgreSQL web UI on internal network only |
| Persistent volumes | `postgres_data`, `redis_data`, `grafana_data`, `prometheus_data`, `media_volume`, `static_volume` |

### Frontend *(FE-001 to FE-012 — [Teammate Name])*

| Feature | Description |
|---|---|
| Routing + protected routes | `ProtectedRoute` with role-based access control |
| Login / Register | Email + password with JWT storage and interceptors |
| OAuth | Google and 42 login with callback handling |
| Password reset | Forgot password + reset via email token |
| User profile | Edit profile, change password, upload avatar |
| Auction catalogue | Grid/list view with category filters and search |
| Create auction wizard | 3-step form with image upload (Cloudinary) |
| Auction detail | Live timer, bid history, bid input, buy-now button |
| Private chat | DM hub with conversation list, unread count, real-time delivery |
| Auction room chat | Sidebar chat during live auction with WebSocket |
| Backoffice | Admin dashboard — users, auctions, roles, permissions, reports, domains |
| Internationalisation | EN, PT, AR via i18next with browser language detection |
| Privacy Policy | Legal page accessible from footer |
| Terms of Service | Legal page accessible from footer |

---

## Modules

| # | Module | Type | Points | Owner | Implementation |
|---|---|---|---|---|---|
| 1 | **Backend Framework** | Major | 2 | Emanuel Malungo | Django 5 + Django REST Framework — full REST API, ORM, admin |
| 2 | **Standard User Management & Authentication** | Major | 2 | Emanuel Malungo | Custom `User` model, JWT with rotation, profile, online status, session history |
| 3 | **Remote Authentication (OAuth 2.0)** | Major | 2 | Emanuel Malungo | Google OAuth and 42 Intranet OAuth via `django-allauth` |
| 4 | **Frontend Framework** | Major | 2 | [Teammate] | React 18 + TypeScript + Vite — SPA with protected routes |
| 5 | **Database for Backend** | Minor | 1 | Emanuel Malungo | PostgreSQL 16 — chosen for `SELECT FOR UPDATE`, ACID, and Django ORM compatibility |
| 6 | **Live Chat** | Major | 2 | António Sebastião | Django Channels WebSocket — private chat and auction room chat with typing indicators and read receipts |
| 7 | **Real-time Multiplayer** | Major | 2 | Emanuel Malungo / António Sebastião | Multi-user live bidding and chat via WebSocket with Redis channel layers |
| 8 | **Live Video Streaming** | Major | 2 | Emanuel Malungo | LiveKit server (WebRTC/RTMP) — create, start, end streams; token auth; viewer tracking |
| 9 | **Monitoring System** | Minor | 1 | Emanuel Malungo | Prometheus scraping + Grafana dashboards — API traffic, DB health, server metrics |
| 10 | **Internationalisation (i18n)** | Minor | 1 | [Teammate] | i18next — EN, PT, AR with browser language detection |
| 11 | **GDPR — User Privacy Controls** *(custom)* | Minor | 1 | António Sebastião / Emanuel Malungo | User blocking, content deletion on moderation, data scoping per user role |
| 12 | **Advanced 3D Techniques** *(custom — Auction System)* | Major | 2 | Emanuel Malungo | Full auction lifecycle replacing the traditional "game": scheduling, bidding, concurrency, winner determination, Celery automation |

**Total: 8 Major × 2 + 4 Minor × 1 = 20 points**

> The minimum required is 14 points. The custom modules replace traditional game mechanics with auction-specific features that satisfy the same multiplayer real-time interaction requirements — live bidding between multiple simultaneous users with conflict resolution and event broadcasting.

---

## Instructions

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Docker | 24+ | [docs.docker.com](https://docs.docker.com/get-docker/) |
| Docker Compose | V2+ | Included with Docker Desktop |
| Git | any | `apt install git` / `brew install git` |

> No Python, Node.js, or database installation required — everything runs inside Docker.

---

### Option A — One-Command Deploy (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/BidLive.git
cd BidLive

# 2. Copy and configure environment variables
cp .env.example .env
# Edit .env — see configuration section below

# 3. Start all 9 containers
docker compose up --build

# 4. (First run only) Run migrations and seed demo data
docker compose exec backend uv run python manage.py migrate
docker compose exec backend make seed
```

The application will be available at:

| URL | Service |
|---|---|
| `https://localhost` | Frontend |
| `https://localhost/api/docs/` | Swagger UI |
| `https://localhost/api/redoc/` | Redoc |
| `https://localhost/adminer/` | Database UI |
| `https://localhost/grafana/` | Monitoring |

---

### Environment Variables

Create a `.env` file at the project root. The `.env.example` file contains all required keys. Minimum required values for local development:

```env
# Application
SECRET_KEY=change-me-to-a-long-random-string
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://localhost

# Database
POSTGRES_DB=bidlive
POSTGRES_USER=bidlive
POSTGRES_PASSWORD=bidlive
DATABASE_URL=postgresql://bidlive:bidlive@postgres:5432/bidlive

# Redis
REDIS_URL=redis://redis:6379/0

# JWT
JWT_ACCESS_MINUTES=15
JWT_REFRESH_DAYS=7

# OAuth — Google (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://localhost/auth/google/callback

# OAuth — 42 Intranet (optional)
FORTY_TWO_CLIENT_ID=
FORTY_TWO_CLIENT_SECRET=
FORTY_TWO_REDIRECT_URI=https://localhost/auth/42/callback

# LiveKit — Streaming (required for EPIC 8)
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=devsecret
LIVEKIT_URL=wss://localhost/livekit

# Frontend
VITE_API_URL=https://localhost
VITE_WS_URL=wss://localhost
```

> ⚠️ **Never commit `.env` to Git.** The `.gitignore` already excludes it. Use `.env.example` for documentation.

---

### Option B — Local Development (without Docker)

For active backend development with hot reload:

```bash
cd backend

# Install Python dependencies
uv venv && uv sync

# Start infrastructure containers only
make container  # starts Redis, PostgreSQL, LiveKit via Docker

# Configure environment
cp .env.example .env
# Set DATABASE_URL and REDIS_URL to point to localhost

# Run migrations and seed
make migrate
make seed

# Start everything (worker + beat + server)
make dev

# Or run individually
make runserver     # Django server
make worker        # Celery worker
make beat          # Celery beat scheduler
```

```bash
cd frontend
npm install
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:8000
npm run dev
```

---

### Useful Commands

```bash
# Tear down all containers
docker compose down

# Remove containers + volumes (full reset)
docker compose down -v

# View logs
docker compose logs -f backend
docker compose logs -f celery

# Run tests
docker compose exec backend uv run pytest tests -v

# Access Django shell
docker compose exec backend uv run python manage.py shell

# Clear and reseed demo data
docker compose exec backend make seed-clear
docker compose exec backend make seed
```

---

### Demo Accounts

After seeding, these accounts are available (password: `demo1234`):

| Email | Role | Can do |
|---|---|---|
| `admin@bidlive.dev` | SUPER_ADMIN | Everything — full platform access |
| `seller@bidlive.dev` | USER | Create and manage auctions |
| `manager@bidlive.dev` | MONITOR | Moderation panel, review reports |
| `buyer1@bidlive.dev` | USER | Place bids, chat |
| `buyer2@bidlive.dev` | USER | Place bids, chat |
| `banned@bidlive.dev` | USER | Banned account — for testing |

---

### Running Tests

```bash
# All tests
uv run pytest tests -v

# Specific module
uv run pytest tests/test_social_api.py -v      # EPIC 4 — Social
uv run pytest tests/test_chat_api.py -v        # EPIC 7 — Chat
uv run pytest tests/test_reports_api.py -v     # BE-003 — Reports

# With server output (useful for debugging 500s)
uv run pytest tests -x -vv -s

# Coverage report
uv run pytest tests --cov=apps --cov-report=term-missing
```

---

## Individual Contributions

### António Sebastião

**Issues owned:** EPIC 4, EPIC 7, BE-003, BE-005, BE-008

**EPIC 4 — Social System**

Built the complete friendship and blocking system following the project's Service + Selector pattern. Implemented `selectors.py` with `Q()` object queries for bidirectional friendship lookups, `services.py` with `@transaction.atomic` for all write operations, and a `FriendshipViewSet` with custom `@action` decorators for `accept`, `reject`, `block`, `unblock`, and `online` endpoints. Wrote 32 unit tests covering all happy paths and edge cases.

**EPIC 7 — Real-time Chat**

Built the full chat system in two layers. The REST layer provides conversation history, message management, and fallback endpoints. The WebSocket layer uses `AsyncJsonWebsocketConsumer` — `PrivateChatConsumer` for direct messages and `AuctionChatConsumer` for auction rooms. Both consumers use Redis channel layers for group broadcast, `sync_to_async` for all ORM operations, and update `is_online` / `last_seen` on connect/disconnect. Wrote 54 unit tests including authentication, message flow, unread counts, and soft delete cycles.

**BE-003 — Reports & Moderation API**

Built the complete report lifecycle from user submission to admin resolution. The `apply_report_action` service implements six distinct actions: `COMMENT`, `CHANGE_STATUS`, `WARN_USER`, `BAN_USER`, `DELETE_CONTENT`, and `ESCALATE`. Each action is recorded in `ReportAction` for full audit trail. `BAN_USER` sets `is_active=False`, updates `UserStatus.BANNED`, and fires a notification. `DELETE_CONTENT` performs soft-delete on `Message` and hard-delete on `PrivateMessage`. Wrote 51 unit tests across 10 test classes.

**BE-005 — Social-Chat Block Integration**

Added block enforcement at three levels: `send_private_message` service (REST), `PrivateChatConsumer._handle_message` (WebSocket), and `get_room_messages` selector (auction chat filtering). Also fixed a silent bug — a typo `adrressee` in `is_blocked` meant the reverse-direction block check never worked.

**BE-008 — Global Error Handling**

Rewrote `common/exceptions.py` to guarantee consistent `{"success": false, "errors": {...}}` JSON for every error type — 400, 401, 403, 404, 405, 429, and 500. Added explicit handling for `ParseError` and `json.JSONDecodeError` to eliminate 500s from malformed request bodies. Added `logger.exception` for unhandled errors so the server logs the full traceback without exposing it to clients.

**Key challenges solved:**

- *WebSocket 403 rejections* — the `connect()` method had no `try/except`, causing silent failures. Added structured logging throughout the middleware and consumer that revealed the root cause (missing test user) within seconds.
- *DRF `ValidationError` not caught* — `except Exception` doesn't catch DRF exceptions before the global handler intercepts them. Fixed by explicitly catching `(ValidationError, PermissionDenied)` in every view method.
- *`exc.detail` format inconsistency* — DRF's `exc.detail` can be a string, `ErrorDetail`, list, or dict. Built a `_normalize_detail()` helper that always produces a clean string.

---

### Emanuel Malungo

**Issues owned:** EPIC 1, 2, 3, 5, 6, 8, BE-004, BE-007, DO-001 to DO-007

*(Fill in with actual contribution details)*

---

### [Teammate Name]

**Issues owned:** FE-001 to FE-012

*(Fill in with actual contribution details)*

---

## Resources

### Official Documentation

- [Django Documentation](https://docs.djangoproject.com/) — framework reference
- [Django REST Framework](https://www.django-rest-framework.org/) — API layer
- [Django Channels](https://channels.readthedocs.io/) — WebSocket and ASGI
- [Celery Documentation](https://docs.celeryq.dev/) — task queue
- [Redis Documentation](https://redis.io/docs/) — data structures and pub/sub
- [LiveKit Documentation](https://docs.livekit.io/) — WebRTC streaming
- [drf-spectacular](https://drf-spectacular.readthedocs.io/) — OpenAPI schema
- [SimpleJWT](https://django-rest-framework-simplejwt.readthedocs.io/) — JWT auth
- [React Documentation](https://react.dev/) — UI framework
- [TanStack Query](https://tanstack.com/query/latest) — server state
- [i18next](https://www.i18next.com/) — internationalisation
- [Prometheus](https://prometheus.io/docs/) — metrics
- [Grafana](https://grafana.com/docs/) — dashboards

### Architecture References

- [HackSoft Django Styleguide](https://github.com/HackSoftware/Django-Styleguide) — Service + Selector pattern used throughout the backend
- [Django Channels Tutorial](https://channels.readthedocs.io/en/stable/tutorial/index.html) — WebSocket consumer lifecycle
- [PostgreSQL SELECT FOR UPDATE](https://www.postgresql.org/docs/current/sql-select.html) — concurrency control for bidding
- [Conventional Commits](https://www.conventionalcommits.org/) — commit message format used across the project

### AI Usage

**Claude (Anthropic — claude-sonnet-4-6)** was used as a technical assistant throughout the backend development of this project. The following table specifies exactly where and how:

| Area | Tasks where AI assisted |
|---|---|
| **Architecture** | Evaluated Django vs FastAPI trade-offs; explained Service + Selector pattern; discussed `select_for_update` vs optimistic locking for auction concurrency |
| **EPIC 4 — Social** | Explained `select_related` vs `prefetch_related` |
| **EPIC 7 — Chat** | Explained `sync_to_async`, channel layer group messaging, the two-step dispatch pattern (`group_send` → handler method);
| **BE-003 — Reports** | Explained soft delete vs hard delete trade-offs |
| **BE-005 — Block integration** | Identified the `adrressee` typo bug; generated block checks at all three enforcement points |
| **BE-008 — Error handling** | Explained why `except Exception` doesn't catch DRF exceptions |
| **Debugging** | Diagnosed WebSocket 403 rejections (no `try/except` in `connect()`); `int(pk)` string casting bugs; `CELERY_BEAT_SCHEDULE` double-definition overwrite; `PrimaryKeyRelatedField` vs `read_only_fields` serialisation difference |
| **Git workflow** | Suggested dependency-ordered commit sequences; Conventional Commits format |

Every AI-generated piece of code was reviewed, understood, debugged where necessary, and integrated manually. All architecture decisions, debugging approaches, and final implementation choices were made by the team. AI accelerated implementation but did not replace engineering judgement.

---

## Known Limitations

- The `DELETE_CONTENT` moderation action supports `MESSAGE` and `PRIVATE_MESSAGE`. Auction and bid deletion requires additional service logic not yet implemented.
- The frontend does not yet implement automatic WebSocket reconnection on connection drop.
- Self-signed SSL certificates will trigger browser warnings on first visit — click "Advanced → Proceed" to continue.
- LiveKit requires open UDP ports (5000–5100) for WebRTC peer connections. Some corporate firewalls block these ranges.

---

## License

This project was created for educational purposes as part of the 42 school curriculum. All rights reserved by the respective authors.
