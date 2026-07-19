*This project has been created as part of the 42 curriculum by [nmatondo], [asebasti], [emalungo], [jorcarva], [ferda-si].*

---

<div align="center">

# 🔨 BidLive

**A real-time live auction platform with streaming, chat, and social features — ft_transcendence final project at 42 Luanda**

*Bid. Stream. Connect. All in real time.*

</div>

---

## Table of Contents

- [Description](#description)
- [Instructions](#instructions)
- [Resources](#resources)
- [Team Information](#team-information)
- [Project Management](#project-management)
- [Technical Stack](#technical-stack)
- [Database Schema](#database-schema)
- [Features List](#features-list)
- [Modules](#modules)
- [Individual Contributions](#individual-contributions)
- [Known Limitations](#known-limitations)
- [License](#license)

---

## Description

**BidLive** is a full-stack web application that reimagines the traditional auction experience as a real-time, social platform. Users can create and participate in timed auctions or live-streamed bidding events, interact through public and private chat, build a social network, and manage their activity through a personal dashboard.

The platform is built on a service-oriented Django backend with WebSocket support via Django Channels, a React frontend with full TypeScript, and a production-grade infrastructure stack with Docker, Nginx, Prometheus, Grafana, and an ELK logging stack.

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
- **Observability** — Prometheus metrics + Grafana dashboards + ELK logging
- **One-command deploy** — `docker compose up --build` starts all 20 containers

---

## Instructions

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Docker | 24+ | [docs.docker.com/get-docker](https://docs.docker.com/get-docker/) |
| Docker Compose | V2+ | Included with Docker Desktop |
| Git | any | `apt install git` / `brew install git` |

> No Python, Node.js, or database installation required — everything runs inside Docker containers.

---

### 1. Clone the Repository

```bash
git clone https://github.com/nmatondo/BidLive.git
cd BidLive
```

The project root contains a `Makefile` that orchestrates the full stack. The Docker Compose file lives at `srcs/docker-compose.yml`.

---

### 2. Configure the Domain Name

The platform is configured to serve on the domain `bidlive.42.fr`. You must map this domain to your local machine:

| OS | File to edit | Line to add |
|---|---|---|
| Linux / macOS | `/etc/hosts` | `127.0.0.1 bidlive.42.fr` |
| Windows | `C:\Windows\System32\drivers\etc\hosts` | `127.0.0.1 bidlive.42.fr` |

Open the file with administrator/root privileges and append the line above. Without this step, Nginx will reject requests because the `server_name` directive matches only `bidlive.42.fr`.

> If you need a different domain, update `server_name` in `srcs/requirements/nginx/conf/nginx.conf` and the `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, and `FRONTEND_URL` values in `srcs/.env.backend`.

---

### 3. Create and Configure Environment Variables

All environment files live in `srcs/` and are named `.env.<service>`. The repository includes committed `.env.*` files with development defaults — review them and adjust as needed:

| File | Purpose | Key variables |
|---|---|---|
| `.env.backend` | Django settings, CORS, JWT | `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `FRONTEND_URL` |
| `.env.db` | PostgreSQL connection | `DATABASE_DB`, `DATABASE_USER`, `DATABASE_HOST` |
| `.env.redis` | Redis connection | `REDIS_USER`, `REDIS_HOST`, `REDIS_PORT` |
| `.env.livekit` | LiveKit streaming server | `LIVEKIT_URL`, `LIVEKIT_API_KEY` (loaded from secrets) |
| `.env.frontend` | Vite / React config | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_BASE_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID` |
| `.env.nginx` | Nginx exporter scrape URI | `NGINX_EXPORTER_SCRAPE_URI` |
| `.env.grafana` | Grafana server config | `GF_SERVER_DOMAIN`, `GF_SERVER_ROOT_URL` |
| `.env.email` | SMTP / Alertmanager email | `SMTP_SMARTHOST`, `EMAIL_TO` |
| `.env.webhook` | Alertmanager webhook | Discord/Slack webhook URL |

> Database passwords, JWT secrets, and API keys are **not** in `.env` files. They are managed via Docker secrets — see the next step.

---

### 4. Set Up Secrets and Credential Files

Sensitive credentials are stored in the `secrets/` directory (gitignored). Create each file with the exact variable names the containers expect:

#### Required secrets files

| File | Variables | Example |
|---|---|---|
| `secrets/db_credenciais.txt` | `POSTGRES_PASSWORD` | `POSTGRES_PASSWORD=bidlive` |
| `secrets/redis_credenciais.txt` | `REDIS_PASSWORD` | `REDIS_PASSWORD=1234567890` |
| `secrets/backend_credenciais.txt` | `SECRET_KEY` | `SECRET_KEY=<your-django-secret>` |
| `secrets/livekit_credenciais.txt` | `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` | `LIVEKIT_API_KEY=devkey` |
| `secrets/grafana_credenciais.txt` | `GF_SECURITY_ADMIN_USER`, `GF_SECURITY_ADMIN_PASSWORD` | `GF_SECURITY_ADMIN_USER=bidlive` |
| `secrets/email_credenciais.txt` | `EMAIL_USER`, `EMAIL_PASSWORD` | `EMAIL_USER=you@gmail.com` |
| `secrets/elasticsearch_credenciais.txt` | `ELASTICSEARCH_USER`, `ELASTICSEARCH_PASSWORD` | `ELASTICSEARCH_USER=bidlive` |
| `secrets/portainer_credenciais.txt` | `PORTAINER_USER`, `PORTAINER_PASSWORD` | `PORTAINER_USER=admin_bidlive` |
| `secrets/42_credenciais.txt` | `FORTY_TWO_CLIENT_ID`, `FORTY_TWO_CLIENT_SECRET`, `FORTY_TWO_REDIRECT_URI` | Obtain from 42 API settings |
| `secrets/google_credenciais.txt` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Obtain from Google Cloud Console |
| `secrets/webhook_credenciais.txt` | `APIURL` | Discord/Slack webhook URL |

Each file contains plain `KEY=VALUE` pairs, one per line. The Docker Compose file mounts these as Docker secrets at `/run/secrets/<name>` inside the containers.

#### TLS certificates (auto-generated)

The `Makefile` `all` target runs `make ca` before building, which invokes `srcs/ca/generate_ca.sh`. This script uses `cfssl` in Docker to generate a self-signed Root CA (`ca.pem` + `ca-key.pem`) in the `secrets/` directory. Individual service certificates are generated at container startup by each container's `entrypoint.sh`.

> You do **not** need to manually generate certificates. The `make all` command handles this automatically.

---

### 5. Run the Project

The Makefile provides a single command that generates the Root CA, builds all 20 Docker images, and starts every container:

```bash
make all
```

This is equivalent to:

```bash
make ca       # Generate Root CA certificates (requires Docker)
make build    # Build all 20 Docker images
make up       # Start all containers in detached mode
```

On first run (or after a full reset), run migrations and seed the demo data:

```bash
# Wait for PostgreSQL to be healthy (~15 seconds after containers start)
docker compose -p bidlive -f srcs/docker-compose.yml exec backend uv run python manage.py migrate
docker compose -p bidlive -f srcs/docker-compose.yml exec backend make seed
```

> On Windows, use `make all` from PowerShell or Git Bash. The `make` targets call `docker compose` with the correct project name and compose file path automatically.

Once all containers are healthy, the platform is accessible at the URLs listed in the [Services](#main-services) table below.

---

### Main Services

| Service | URL | Credentials / Access Notes |
|---|---|---|
| **Frontend** (React) | `https://bidlive.42.fr` | Self-signed certificate — browser will warn on first visit; click "Advanced" -> "Proceed" |
| **Backend API** | `https://bidlive.42.fr/api/` | JWT-authenticated. Register or use demo accounts below |
| **Swagger UI** | `https://bidlive.42.fr/api/docs/` | No auth required |
| **Redoc** | `https://bidlive.42.fr/api/redoc/` | No auth required |
| **Grafana** | `https://bidlive.42.fr/grafana/` | User: `bidlive`, Password: from `secrets/grafana_credenciais.txt` |
| **Kibana** | `https://bidlive.42.fr/kibana/` | User: `elastic`, Password: from `secrets/elasticsearch_credenciais.txt` |
| **Adminer** | `https://bidlive.42.fr/adminer/` | Server: `postgres`, User: `bidlive`, Password: from `secrets/db_credenciais.txt` |
| **Portainer** | `https://bidlive.42.fr/portainer/` | User: from `secrets/portainer_credenciais.txt`, Password: same file |
| **LiveKit** | Internal only (`livekit:7880`) | Not exposed externally; tokens issued by the backend |
| **Prometheus** | Internal only (`backend-network`) | Scrapes metrics from all exporters; accessed via Grafana dashboards |

> All services are behind Nginx reverse proxy with HTTPS (port 443). The Nginx container is the only service exposed to the host via `ports: "443:443"`.

---

### Demo Accounts

After seeding, these accounts are available (password: `demo1234`):

| Email | Role | Capabilities |
|---|---|---|
| `admin@bidlive.dev` | SUPER_ADMIN | Full platform access, backoffice |
| `seller@bidlive.dev` | USER | Create and manage auctions |
| `manager@bidlive.dev` | MONITOR | Moderation panel, review reports |
| `buyer1@bidlive.dev` | USER | Place bids, chat |
| `buyer2@bidlive.dev` | USER | Place bids, chat |
| `buyer3@bidlive.dev` | USER | Place bids, chat |
| `buyer4@bidlive.dev` | USER | Place bids, chat |
| `banned@bidlive.dev` | USER | Banned account (for testing moderation) |

---

### Useful Commands

```bash
# Full rebuild (tear down, remove volumes, rebuild, restart)
make re

# Stop all containers
make down

# Remove containers + volumes (full reset, no rebuild)
make clean

# Nuclear option — removes all Docker data on the system
make fclean

# View all logs
make logs

# View logs for a specific container
docker compose -p bidlive -f srcs/docker-compose.yml logs -f backend
docker compose -p bidlive -f srcs/docker-compose.yml logs -f celery_worker

# Run tests inside the backend container
docker compose -p bidlive -f srcs/docker-compose.yml exec backend uv run pytest tests -v

# Access Django shell
docker compose -p bidlive -f srcs/docker-compose.yml exec backend uv run python manage.py shell

# Clear and reseed demo data
docker compose -p bidlive -f srcs/docker-compose.yml exec backend make seed-clear
docker compose -p bidlive -f srcs/docker-compose.yml exec backend make seed
```

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

## Resources

### Official Documentation

- [Django Documentation](https://docs.djangoproject.com/) — web framework
- [Django REST Framework](https://www.django-rest-framework.org/) — API layer
- [Django Channels](https://channels.readthedocs.io/) — WebSocket and ASGI
- [Celery Documentation](https://docs.celeryq.dev/) — async task queue
- [Redis Documentation](https://redis.io/docs/) — data structures and pub/sub
- [LiveKit Documentation](https://docs.livekit.io/) — WebRTC streaming
- [drf-spectacular](https://drf-spectacular.readthedocs.io/) — OpenAPI schema
- [SimpleJWT](https://django-rest-framework-simplejwt.readthedocs.io/) — JWT auth
- [React Documentation](https://react.dev/) — UI framework
- [TanStack Query](https://tanstack.com/query/latest) — server state management
- [i18next](https://www.i18next.com/) — internationalisation
- [Prometheus](https://prometheus.io/docs/) — metrics collection
- [Grafana](https://grafana.com/docs/) — dashboards and visualization
- [Elasticsearch](https://www.elastic.co/guide/) — log storage and search

### Architecture References

- [HackSoft Django Styleguide](https://github.com/HackSoftware/Django-Styleguide) — Service + Selector pattern used throughout the backend
- [Django Channels Tutorial](https://channels.readthedocs.io/en/stable/tutorial/index.html) — WebSocket consumer lifecycle
- [PostgreSQL SELECT FOR UPDATE](https://www.postgresql.org/docs/current/sql-select.html) — concurrency control for bidding
- [Conventional Commits](https://www.conventionalcommits.org/) — commit message format

### AI Usage

**Claude (Anthropic)** was used as a technical assistant throughout the backend development of this project:

| Area | Tasks where AI assisted |
|---|---|
| **Architecture** | Evaluated Django vs FastAPI trade-offs; explained Service + Selector pattern; discussed `select_for_update` vs optimistic locking for auction concurrency |
| **EPIC 4 — Social** | Explained `select_related` vs `prefetch_related` |
| **EPIC 7 — Chat** | Explained `sync_to_async`, channel layer group messaging, the two-step dispatch pattern |
| **BE-003 — Reports** | Explained soft delete vs hard delete trade-offs |
| **BE-005 — Block integration** | Identified the `adrressee` typo bug; generated block checks at all three enforcement points |
| **BE-008 — Error handling** | Explained why `except Exception` doesn't catch DRF exceptions |
| **Debugging** | Diagnosed WebSocket 403 rejections; `int(pk)` string casting bugs; `CELERY_BEAT_SCHEDULE` double-definition overwrite; `PrimaryKeyRelatedField` vs `read_only_fields` serialisation difference |
| **Git workflow** | Suggested dependency-ordered commit sequences; Conventional Commits format |

Every AI-generated piece of code was reviewed, understood, debugged where necessary, and integrated manually. All architecture decisions, debugging approaches, and final implementation choices were made by the team.

---

## Team Information

| Name | Role | Responsibilities |
|---|---|---|
| **nmatondo** | Tech Leader / Backend Developer, DevOps | Backend architecture and infrastructure. Owned EPIC 1 (Infrastructure), EPIC 2 (User System), EPIC 3 (RBAC), EPIC 5 (Auctions), EPIC 6 (Real-time Bidding), EPIC 8 (Live Streaming), BE-004 (Notifications), BE-007 (Analytics), and DO-001 through DO-007 (Docker, Nginx, Prometheus, Grafana, LiveKit, SSL, Deploy). |
| **asebasti** | Product Owner / Backend Developer | Social and communication systems. Owned EPIC 4 (Social System), EPIC 7 (Real-time Chat), BE-003 (Reports & Moderation), BE-005 (Social-Chat Block Integration), BE-008 (Global Error Handling). |
| **emalungo** | Project Manager / Frontend Developer | Frontend implementation and project coordination. Owned FE-001 through FE-009, FE-011 (Frontend Architecture, Routing, Auth UI, OAuth, Profile, Auctions, Bidding, Chat, Social, Domains). Co-owned FE-012 (Admin Dashboard). |
| **jorcarva** | Frontend Developer | Frontend streaming and admin features. Owned FE-008 (LiveKit Livestream Integration) and co-owned FE-012 (Admin Dashboard with RBAC). |
| **ferda-si** | Frontend Developer | Frontend authentication and profile features. Co-owned FE-005 (Password Recovery and Profile). |

---

## Project Management

### Work Organisation

The project was divided into **EPICs** (major functional systems) and **Issues** (specific tasks). Each EPIC was developed on its own Git branch and merged after internal review. Issues were categorised by prefix:

| Prefix | Scope |
|---|---|
| `EPIC` | Major backend systems (Social, Auctions, Chat, Streaming) |
| `BE-` | Backend cross-cutting concerns (Notifications, Reports, Error handling, Analytics) |
| `FE-` | Frontend implementation per screen / feature |
| `DO-` | DevOps infrastructure (Docker, Nginx, Prometheus, LiveKit, Deploy) |
| `VAL-` | Validation and evaluation preparation |

### Issue Breakdown

| Issue | Title | Owner |
|---|---|---|
| EPIC 1 | Infrastructure Setup | nmatondo |
| EPIC 2 | User System | nmatondo |
| EPIC 3 | Roles & Permissions (RBAC) | nmatondo |
| EPIC 4 | Social System | asebasti |
| EPIC 5 | Auction System | nmatondo |
| EPIC 6 | Real-time Bidding | nmatondo |
| EPIC 7 | Real-time Chat | asebasti |
| EPIC 8 | Live Streaming | nmatondo |
| BE-003 | Reports API | asebasti |
| BE-004 | Notifications (API & WebSockets) | nmatondo |
| BE-005 | Social-Chat Block Integration | nmatondo, asebasti |
| BE-007 | Analytics API | nmatondo |
| BE-008 | Global Error Handling | asebasti |
| DO-001 | Base Architecture, Networks and Volumes | nmatondo |
| DO-002 | PostgreSQL, Redis and Adminer | nmatondo |
| DO-003 | Containerisation (Frontend and Backend) | nmatondo |
| DO-004 | LiveKit (Streaming) | nmatondo |
| DO-005 | Prometheus and Grafana | nmatondo |
| DO-006 | Nginx, SSL/TLS | nmatondo |
| DO-007 | Deploy Automation and Validation | nmatondo |
| FE-001 | Frontend Base Configuration and Architecture | emalungo |
| FE-002 | Routing and Base Layout | emalungo |
| FE-003 | Local Authentication | emalungo |
| FE-004 | OAuth (Google and 42) | emalungo |
| FE-005 | Password Recovery and Profile | emalungo, ferda-si |
| FE-006 | Auction Listing and Creation | emalungo |
| FE-007 | Auction Detail and Bidding | emalungo |
| FE-008 | Livestream (LiveKit) | jorcarva |
| FE-009 | Chat System | emalungo |
| FE-010 | Social System (Friends and Blocks) | emalungo |
| FE-011 | Domain Management | emalungo |
| FE-012 | Admin Dashboard (RBAC) | emalungo, jorcarva |
| VAL-001 through VAL-006 | Validation and Evaluation Preparation | Team |

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
| uv | latest | Fast Python package manager |
| Gunicorn + Uvicorn | latest | Production ASGI workers |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19+ | UI framework |
| TypeScript | 6+ | Type safety across all components and services |
| Vite | 8+ | Build tool — fast HMR in development |
| TailwindCSS | 4+ | Utility-first CSS styling |
| shadcn/ui | latest | Accessible, unstyled component library (built on Radix UI) |
| React Query (TanStack) | 5+ | Server state — fetch, cache, sync |
| Zustand | 5+ | Global client state (auth, user session) |
| React Hook Form + Zod | latest | Form handling + schema validation |
| Axios | latest | HTTP client with JWT interceptors |
| React Router | 7+ | Client-side routing with protected routes |
| i18next | latest | Internationalisation — EN, PT, AR |
| LiveKit Components React | latest | WebRTC player and broadcaster UI |
| Sonner | latest | Toast notifications |
| Lucide React | latest | Icon library |

### Infrastructure & DevOps

| Technology | Purpose |
|---|---|
| Docker + Docker Compose | 20-container orchestration |
| Nginx | Reverse proxy, SSL termination, static files, WebSocket proxy |
| Prometheus | Metrics scraping from Django, Node Exporter, LiveKit, and exporters |
| Grafana | Visual dashboards — server health, API traffic, DB metrics |
| Elasticsearch | Log storage and full-text search |
| Logstash | Log collection and transformation (GELF input) |
| Kibana | Log visualization and exploration dashboards |
| Alertmanager | Alert routing and notification (email, webhooks) |
| Adminer | PostgreSQL web UI (internal network only) |
| Portainer | Docker container management UI |
| Docker Secrets | Secure credential management for all services |
| Nginx Exporter | Prometheus metrics for Nginx |
| PostgreSQL Exporter | Prometheus metrics for PostgreSQL |
| Redis Exporter | Prometheus metrics for Redis |
| Celery Exporter | Prometheus metrics for Celery workers |

### Why These Choices

**Django over FastAPI** — the built-in ORM with `select_for_update()`, admin panel, `django-allauth` for OAuth, and Django Channels for WebSockets meant we had a production-ready foundation from day one. FastAPI would have required building all of this from scratch.

**PostgreSQL over MySQL** — `SELECT FOR UPDATE` row-level locking is essential for preventing race conditions in concurrent bidding. PostgreSQL's ACID guarantees and support for Django ORM advanced features (`Window`, `annotate`, `Q`, `F`) made it the clear choice.

**Redis for everything async** — one service handles three roles: Celery task broker, Django Channels group messaging (WebSocket broadcast), and API response cache. Simpler infrastructure with no single-purpose queue server needed.

**uv over pip/Poetry** — significantly faster dependency resolution and installation. Critical in a Docker build pipeline where `pip install` was taking over 2 minutes; `uv sync` takes under 20 seconds.

**LiveKit over custom WebRTC** — building WebRTC signalling from scratch is a multi-week project. LiveKit provides a production-grade server, React SDK, and token-based auth that integrates directly with our Django backend.

**shadcn/ui + Tailwind** — shadcn provides accessible, headless components that integrate cleanly with Tailwind without heavy CSS overrides or bundle bloat. Every component is owned in the codebase — no black-box library updates breaking the UI.

**ELK Stack for logging** — Elasticsearch, Logstash, and Kibana provide centralized log management across all containers. GELF drivers on application containers feed logs through Logstash into Elasticsearch, with Kibana providing exploration and dashboards.

---

## Database Schema

### Network Architecture

```
Internet
    |
    v
+----------------------------------------------------------+
|  frontend-network (public)                               |
|  +--------+                                              |
|  | Nginx  | :80 -> :443  (SSL, reverse proxy)            |
|  +---+----+                                              |
|      | /         -> Frontend (Vite)                      |
|      | /api/     -> Backend (Daphne)                     |
|      | /ws/      -> Backend (WebSocket)                  |
|      | /grafana/ -> Grafana                              |
+------+---------------------------------------------------+
       |
+------+---------------------------------------------------+
|  backend-network (private)                               |
|      |                                                   |
|  +---v-----+  +----------+  +--------+  +--------+       |
|  | Backend |  |PostgreSQL|  | Redis  |  |LiveKit |       |
|  | (Django)|  |  :5432   |  | :6379  |  | :7880  |       |
|  +---------+  +----------+  +--------+  +--------+       |
|                                                          |
|  +---------+  +----------+  +---------+  +-------------+ |
|  | Celery  |  |Prometheus|  | Grafana |  |Elasticsearch| |
|  | Worker  |  |  :9090   |  |  :3000  |  |  :9200      | |
|  +---------+  +----------+  +---------+  +-------------+ |
|                                                          |
|  +----------+  +----------+  +----------+  +---------+   |
|  | Logstash |  |Kibana    |  |Alertmgr  |  |Portainer|   |
|  |  :5000   |  |  :5601   |  |  :9093   |  | :9000   |   |
|  +----------+  +----------+  +----------+  +---------+   |
+----------------------------------------------------------+
```

### Core Tables and Relationships

```
users
  |-- user_roles --> roles --> role_permissions --> permissions
  |-- oauth_accounts (provider: GOOGLE | 42)
  |-- sessions
  |
  |-- friendships
  |     requester_id --> users
  |     addressee_id --> users
  |     status: PENDING | ACCEPTED | BLOCKED
  |
  |-- auction_items (seller_id)
  |     +-- auctions (item_id)
  |           |-- bids (bidder_id, amount)
  |           |-- auction_watchers (user_id)
  |           |-- live_streams (streamer_id, stream_key)
  |           |     +-- stream_viewers
  |           +-- chat_rooms
  |                 +-- messages (sender_id, is_deleted)
  |
  |-- private_conversations (user_one_id, user_two_id)
  |     +-- private_messages (sender_id, is_read)
  |
  |-- notifications (type, title, content, is_read)
  |
  |-- reports (target_type, target_id, reason, status)
  |     |-- report_actions (admin_id, action, note)
  |     +-- report_evidence --> files
  |
  |-- files (uploader_id, url, mime_type)
  |-- analytics_events (event_type, metadata, ip_address)
  +-- api_keys
```

### Key Models

| Model | Key Fields | Notes |
|---|---|---|
| `User` | `email`, `username`, `status`, `is_online`, `last_seen` | Custom auth model, soft-deletable |
| `AuctionItem` | `title`, `starting_price`, `current_price`, `buy_now_price`, `minimum_increment`, `condition_type` | Owned by seller |
| `Auction` | `status`, `start_time`, `end_time`, `winner_id` | Lifecycle: DRAFT -> SCHEDULED -> ACTIVE -> LIVE -> ENDED/SOLD |
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
| `Auction.status` | `DRAFT` -> `SCHEDULED` -> `ACTIVE` -> `LIVE` -> `ENDED` / `SOLD` / `CANCELLED` |
| `Friendship.status` | `PENDING` -> `ACCEPTED` \| `BLOCKED` |
| `Report.status` | `OPEN` -> `UNDER_REVIEW` -> `RESOLVED` / `REJECTED` / `IGNORED` |
| `User.status` | `ACTIVE` \| `BANNED` \| `SUSPENDED` |

---

## Features List

### Authentication & Users *(EPIC 2 — nmatondo)*

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

### RBAC — Roles & Permissions *(EPIC 3 — nmatondo)*

| Feature | Description |
|---|---|
| Role system | VISITOR, USER, MONITOR, SUPER_ADMIN |
| Dynamic permissions | Granular strings: `auction.bid`, `chat.send`, `report.resolve`, etc. |
| Role assignment | Admin assigns roles per user |
| Authorisation middleware | `AuthorizationAuditMiddleware` logs every permission check |

### Social System *(EPIC 4 — asebasti)*

| Feature | Description |
|---|---|
| Friend requests | Send, accept, reject with pending state |
| Friend list | List accepted friends; filter online friends |
| User blocking | Block / unblock in any direction |
| Block enforcement | Blocked users cannot send messages or friend requests |
| Online presence | `is_online` and `last_seen` updated on WebSocket connect/disconnect |

### Auction System *(EPIC 5 — nmatondo)*

| Feature | Description |
|---|---|
| Create & edit auction | Title, description, price, schedule, condition, images |
| Buy Now | Instant purchase at fixed price, closes auction immediately |
| Auction categories | Seeded categories for filtering and discovery |
| Image upload | Multiple images per auction — binary upload or external URL |
| Auto-activation | Celery beat activates `SCHEDULED` -> `ACTIVE` every minute |
| Auto-close | Celery beat closes expired auctions and determines winner |
| Watchlist | Favourite/unwatch auctions |
| Auction filters | Filter by status, category, price range, seller |

### Real-time Bidding *(EPIC 6 — nmatondo)*

| Feature | Description |
|---|---|
| WebSocket bids | Live bid updates broadcast to all connected viewers |
| Anti-spam | Rate limiting: 5 bids per 10 seconds, 30-second block |
| Anti-self-bid | Users cannot bid on their own auctions |
| Concurrency safety | `SELECT FOR UPDATE` on `Auction` prevents race conditions |
| Outbid notification | Previous highest bidder receives instant notification |
| Bid history | Paginated bid history, newest first |

### Real-time Chat *(EPIC 7 — asebasti)*

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

### Live Streaming *(EPIC 8 — nmatondo)*

| Feature | Description |
|---|---|
| Create stream | Seller creates stream linked to an auction |
| Start / end stream | `is_live` flag, `started_at` / `ended_at` timestamps |
| LiveKit token | Backend issues signed JWT per viewer/broadcaster |
| Stream key | Unique per stream, regeneratable |
| Viewer count | Real-time viewer tracking |
| LiveKit webhook | Backend processes room events from LiveKit server |

### Notifications *(BE-004 — nmatondo)*

| Feature | Description |
|---|---|
| In-app notifications (REST) | List and mark as read via `GET /api/notifications/` |
| Real-time delivery | `NotificationConsumer` pushes payload via WebSocket on creation |
| Signals | Django signals auto-generate notifications on key events |
| Celery tasks | Async notification dispatch for high-volume events |
| Types | `NEW_BID`, `OUTBID`, `MESSAGE`, `FRIEND_REQUEST`, `STREAM_STARTED`, `AUCTION_ENDED` |

### Reports & Moderation *(BE-003 — asebasti)*

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

### Analytics *(BE-007 — nmatondo)*

| Feature | Description |
|---|---|
| Event ingestion | `POST /api/analytics/events/` — async write via Celery |
| Admin statistics | `GET /api/analytics/stats/` — aggregated metrics for admins |
| Event types | Page views, bid events, auction interactions, system logs |

### Social-Chat Integration *(BE-005 — nmatondo, asebasti)*

| Feature | Description |
|---|---|
| Block check in REST | `send_private_message` raises 400 if blocked |
| Block check in WebSocket | `PrivateChatConsumer._handle_message` rejects silently |
| Filtered room history | `get_room_messages(viewer=user)` excludes blocked senders |
| Bug fix | Fixed typo `adrressee` in `is_blocked` selector |

### Error Handling *(BE-008 — asebasti)*

| Feature | Description |
|---|---|
| Standardised error format | All errors return `{"success": false, "errors": {...}}` |
| Malformed JSON -> 400 | `ParseError` and `json.JSONDecodeError` caught — no more 500 |
| Rate limit message | 429 includes `wait` time in seconds |
| Server errors | 500 logs full traceback server-side, returns clean message to client |
| No stack traces | Zero raw Python tracebacks exposed to any client |

### Infrastructure *(DO-001 to DO-007 — nmatondo)*

| Feature | Description |
|---|---|
| Docker Compose | 20-container orchestration with isolated networks |
| Isolated networks | `frontend-network` (public) and `backend-network` (private) |
| Nginx reverse proxy | Routes `/`, `/api/`, `/ws/`, `/grafana/` |
| SSL/TLS | Self-signed certificates via Docker secrets for local HTTPS |
| WebSocket proxy | `Upgrade` and `Connection` headers forwarded correctly |
| Prometheus | Scrapes Django (`django-prometheus`), exporters, LiveKit |
| Grafana | Auto-provisioned dashboards with Prometheus data source |
| ELK Stack | Elasticsearch + Logstash + Kibana for centralized logging |
| Alertmanager | Alert routing with email and webhook notifications |
| Adminer | PostgreSQL web UI on internal network only |
| Portainer | Docker container management UI |
| Docker Secrets | Secure credential management for all services |
| Persistent volumes | `postgres_data`, `redis_data`, `grafana_data`, `prometheus_data`, `elasticsearch_data`, and more |

### Frontend *(FE-001 to FE-012 — emalungo, jorcarva, ferda-si)*

| Feature | Description | Owner(s) |
|---|---|---|
| Base architecture | Vite + React + TypeScript + TailwindCSS + shadcn/ui | emalungo |
| Routing + protected routes | `ProtectedRoute` with role-based access control | emalungo |
| Login / Register | Email + password with JWT storage and interceptors | emalungo |
| OAuth | Google and 42 login with callback handling | emalungo |
| Password reset | Forgot password + reset via email token | emalungo, ferda-si |
| User profile | Edit profile, change password, upload avatar | emalungo, ferda-si |
| Auction catalogue | Grid/list view with category filters and search | emalungo |
| Create auction wizard | Multi-step form with image upload | emalungo |
| Auction detail | Live timer, bid history, bid input, buy-now button | emalungo |
| Private chat | DM hub with conversation list, unread count, real-time delivery | emalungo |
| Auction room chat | Sidebar chat during live auction with WebSocket | emalungo |
| Livestream | LiveKit video player and broadcaster integration | jorcarva |
| Social system | Friend requests, blocking, online presence UI | emalungo |
| Backoffice | Admin dashboard — users, auctions, roles, permissions, reports, domains | emalungo, jorcarva |
| Domain management | Backoffice domain configuration | emalungo |
| Internationalisation | EN, PT, AR via i18next with browser language detection | emalungo |
| RTL support | Arabic RTL layout with mirrored icons and alignment | emalungo |
| Custom design system | 13+ reusable components (Button, Input, Dialog, Modal, Avatar, etc.) | emalungo |
| Advanced search & filters | Text search, category/status/price/date filters, sorting, pagination | emalungo |
| File upload | Avatar and auction image upload via Cloudinary with progress indicator | emalungo, jorcarva |

---

## Modules

| # | Module | Category | Type | Points | Owner(s) |
|---|---|---|---|---|---|
| 1 | **Framework for Frontend and Backend** | Web | Major | 2 | nmatondo, emalungo |
| 2 | **Real-time Features via WebSockets** | Web | Major | 2 | nmatondo, asebasti |
| 3 | **User Interaction (Chat, Profile, Friends)** | Web | Major | 2 | asebasti, emalungo |
| 4 | **Public API (5+ endpoints)** | Web | Major | 2 | nmatondo |
| 5 | **Standard User Management & Authentication** | User Management | Major | 2 | nmatondo |
| 6 | **Advanced Permissions (RBAC)** | User Management | Major | 2 | nmatondo |
| 7 | **Live Video Streaming** | Custom | Major | 2 | nmatondo, jorcarva |
| 8 | **Monitoring with Prometheus and Grafana** | DevOps | Major | 2 | nmatondo |
| 9 | **ELK Stack (Elasticsearch, Logstash, Kibana)** | DevOps | Major | 2 | nmatondo |
| 10 | **ORM** | Web | Minor | 1 | nmatondo |
| 11 | **Notification System** | Web | Minor | 1 | nmatondo |
| 12 | **Remote Authentication (OAuth 2.0)** | User Management | Minor | 1 | nmatondo, emalungo |
| 13 | **Multiple Languages (i18n)** | Accessibility & i18n | Minor | 1 | emalungo |
| 14 | **Custom Design System** | Web | Minor | 1 | emalungo |
| 15 | **Advanced Search (Filters, Sorting, Pagination)** | Web | Minor | 1 | emalungo |
| 16 | **RTL Support** | Accessibility & i18n | Secondary | 1 | emalungo |
| 17 | **File Upload and Management** | Web | Minor | 1 | emalungo, jorcarva |

**Total: 9 Major x 2 + 7 Minor x 1 + 1 Secondary x 1 = 26 points**

> The minimum required is 14 points. We exceeded this target to provide a safety margin in case some modules are not validated during evaluation.

### Module Justifications

**1. Framework for Frontend and Backend (Major, 2 pts)** — Django 5 with Django REST Framework on the backend; React 19 with TypeScript on the frontend. Both are full-featured frameworks with established ecosystems, conventions, and tooling. This satisfies the requirement of using a framework on both sides of the application.

**2. Real-time Features via WebSockets (Major, 2 pts)** — Django Channels with Redis channel layer provides WebSocket support for real-time bidding, chat, and notifications. The `BidConsumer`, `AuctionChatConsumer`, `PrivateChatConsumer`, and `NotificationConsumer` handle concurrent connections with proper group broadcasting and disconnect handling.

**3. User Interaction (Major, 2 pts)** — The platform provides private and auction room chat (send/receive messages), user profiles (avatar, bio, online status, last seen), and a social system (friend requests, friend list, blocking). All three required sub-features — chat, profile, and friends — are fully implemented.

**4. Public API (Major, 2 pts)** — The backend exposes a comprehensive REST API with OpenAPI 3.0 documentation via drf-spectacular. Endpoints include authentication, users, roles, permissions, auctions, bids, chat, social, reports, notifications, analytics, and streams — well over the 5-endpoint minimum. API docs are available at `/api/docs/` (Swagger) and `/api/redoc/` (Redoc).

**5. Standard User Management (Major, 2 pts)** — Custom `User` model with email-based authentication, JWT access/refresh tokens with rotation and blacklisting, profile management (avatar, bio, online status), password reset flow, email verification, and session management.

**6. Advanced Permissions / RBAC (Major, 2 pts)** — Four-tier role system (VISITOR, USER, MONITOR, SUPER_ADMIN) with granular permission strings. Roles are assignable per user, and the `AuthorizationAuditMiddleware` logs every permission check. The backoffice admin panel allows full CRUD on users, roles, and permissions.

**7. Live Video Streaming (Major, 2 pts)** — Custom module using LiveKit for WebRTC/RTMP live streaming. Sellers can create streams linked to auctions, broadcast live video, and buyers can watch in real time with viewer count tracking. The backend issues signed JWT tokens per viewer/broadcaster and processes LiveKit webhook events. This is a custom module because no standard subject module covers live video streaming, and it required significant technical complexity: token-based auth, WebRTC peer connections, and real-time viewer tracking.

**8. Monitoring with Prometheus and Grafana (Major, 2 pts)** — Prometheus scrapes metrics from Django (`django-prometheus`), Nginx, PostgreSQL, Redis, Celery, and LiveKit via dedicated exporters. Grafana provides auto-provisioned dashboards for API traffic, database health, server metrics, and Celery task performance.

**9. ELK Stack (Major, 2 pts)** — Elasticsearch, Logstash, and Kibana provide centralized log management. Application containers use the GELF logging driver to send structured logs to Logstash, which transforms and indexes them into Elasticsearch. Kibana provides exploration, search, and visualization dashboards for operational logs.

**10. ORM (Minor, 1 pt)** — Django ORM with advanced features: `select_for_update()` for auction concurrency, `select_related` / `prefetch_related` for query optimization, `Q()` objects for complex queries, `annotate` / `Window` for analytics, and custom managers for domain-specific queries.

**11. Notification System (Minor, 1 pt)** — Complete notification system with real-time WebSocket delivery and REST API for history. Django signals auto-generate notifications on key events (new bid, outbid, message, friend request, stream started, auction ended). Celery tasks handle async dispatch for high-volume events.

**12. Remote Authentication / OAuth 2.0 (Minor, 1 pt)** — Google OAuth and 42 Intranet OAuth via `django-allauth`. The frontend handles OAuth callbacks and integrates with the JWT auth flow. Users can link OAuth accounts or use them as primary login methods.

**13. Multiple Languages / i18n (Minor, 1 pt)** — i18next with English, Portuguese, and Arabic translations. The language switcher is accessible from the navigation bar and footer. Browser language detection is enabled via `i18next-browser-languagedetector`. All user-visible text is translatable.

**14. Custom Design System (Minor, 1 pt)** — The frontend includes 13+ reusable components built on shadcn/ui and Radix UI: `Button`, `Input`, `Dialog`, `Popover`, `Select`, `Avatar`, `Modal`, `SideDrawer`, `TableSection`, `StatsGrid`, `ConfirmModal`, `ReportModal`, and `LanguageSwitcher`. All components use a consistent design token system with TailwindCSS, supporting light/dark themes. Components are owned in the codebase — no external library updates can break the UI.

**15. Advanced Search / Filters / Sorting / Pagination (Minor, 1 pt)** — The auction catalogue page (`Auctions.tsx`) provides a full-featured search and filter system: text search, category filter, status filter (Live/Scheduled/Ended), price range (min/max), date range (starts after/ends before), featured filter, and sorting (recent, price ascending, price descending, ending soon). Results are paginated with page navigation. The backoffice admin pages (Users, Auctions, Domains, Reports) each include search and status filters with server-side pagination via `StandardResultsSetPagination` (page_size=20, max=100).

**16. RTL Support (Secondary, 1 pt)** — Arabic is supported as a right-to-left language. The i18n system sets `document.documentElement.dir = 'rtl'` when Arabic is selected. Tailwind's `rtl:` variant is used throughout the UI: icons mirror with `rtl:-scale-x-100` and `rtl:rotate-180`, layout alignment switches with `rtl:items-start`, and the language switcher exposes the direction per locale. The layout mirrors cleanly between LTR and RTL modes.

**17. File Upload and Management (Minor, 1 pt)** — Users can upload avatars and auction images via Cloudinary integration (`uploadImageToCloudinary`). The upload flow supports file selection, progress indication, and returns a hosted URL stored in the backend. Auction creation supports multiple images via binary upload or external URL. Stream thumbnails support file upload, external URL, or referencing an existing `File` record. Server-side validation enforces file type and size constraints.

---

## Individual Contributions

### nmatondo

**Role:** Tech Leader / Backend Developer, DevOps

**Issues owned:** EPIC 1, 2, 3, 5, 6, 8, BE-004, BE-007, DO-001 to DO-007

**Backend Architecture and Core Systems**

Designed and implemented the backend architecture following the HackSoft Django Styleguide (Service + Selector pattern). Built the domain-driven app structure under `apps/` with clear separation between `views.py` (request handling), `services.py` (business logic), `selectors.py` (reusable queries), and `serializers.py` (validation/representation).

**EPIC 1 — Infrastructure Setup**

Set up the initial Django project with DRF, JWT auth, CORS, OpenAPI documentation, and the modular app structure. Configured the development and production settings split, ASGI entrypoint for WebSocket support, and Celery integration.

**EPIC 2 — User System**

Built the custom `User` model with email-based auth, JWT token rotation with blacklisting, password reset flow, email verification, and profile management. Integrated `django-allauth` for OAuth 2.0 with Google and 42 Intranet.

**EPIC 3 — Roles & Permissions (RBAC)**

Implemented the four-tier role system (VISITOR, USER, MONITOR, SUPER_ADMIN) with granular permission strings. Built the `AuthorizationAuditMiddleware` that logs every permission check, and the admin endpoints for role assignment.

**EPIC 5 — Auction System**

Built the complete auction lifecycle: `AuctionItem` creation with image upload (binary or URL), `Auction` scheduling with Celery beat auto-activation and auto-close, `Bid` placement with `SELECT FOR UPDATE` concurrency control, Buy Now functionality, watchlist, and category filtering.

**EPIC 6 — Real-time Bidding**

Implemented WebSocket-based real-time bidding via `BidConsumer`. Added anti-spam rate limiting (5 bids per 10 seconds with 30-second block), anti-self-bid validation, outbid notifications, and bid history pagination.

**EPIC 8 — Live Streaming**

Integrated LiveKit for WebRTC/RTMP live streaming. Built the `LiveStream` model with token-based auth (signed JWT per viewer/broadcaster), stream key management, viewer count tracking, and LiveKit webhook processing.

**BE-004 — Notifications**

Built the notification system with Django signals for auto-generation on key events, `NotificationConsumer` for real-time WebSocket delivery, REST API for history, and Celery tasks for async dispatch.

**BE-007 — Analytics**

Built the analytics event ingestion endpoint (`POST /api/analytics/events/`) with async write via Celery, and the admin statistics endpoint for aggregated metrics.

**DO-001 to DO-007 — DevOps**

Designed and implemented the entire Docker Compose infrastructure: 20-container orchestration with isolated networks (frontend/public and backend/private), Nginx reverse proxy with SSL termination and WebSocket proxy, Prometheus + Grafana monitoring with dedicated exporters, ELK stack (Elasticsearch, Logstash, Kibana) for centralized logging, Alertmanager for alert routing, Docker secrets for credential management, and persistent volumes for stateful services.

**Key challenges solved:**

- Designed `SELECT FOR UPDATE` concurrency control for auction bidding to prevent race conditions
- Diagnosed and fixed WebSocket 403 rejections caused by missing `try/except` in `connect()`
- Resolved `CELERY_BEAT_SCHEDULE` double-definition overwrite that silently broke scheduled tasks
- Fixed `PrimaryKeyRelatedField` vs `read_only_fields` serialisation inconsistency

---

### asebasti

**Role:** Product Owner / Backend Developer

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

- WebSocket 403 rejections — the `connect()` method had no `try/except`, causing silent failures. Added structured logging throughout the middleware and consumer that revealed the root cause within seconds.
- DRF `ValidationError` not caught — `except Exception` doesn't catch DRF exceptions before the global handler intercepts them. Fixed by explicitly catching `(ValidationError, PermissionDenied)` in every view method.
- `exc.detail` format inconsistency — DRF's `exc.detail` can be a string, `ErrorDetail`, list, or dict. Built a `_normalize_detail()` helper that always produces a clean string.

---

### emalungo

**Role:** Project Manager / Frontend Developer

**Issues owned:** FE-001 to FE-009, FE-011, FE-012 (co-owner)

**Frontend Architecture (FE-001, FE-002)**

Set up the React 19 + TypeScript + Vite project with TailwindCSS 4, shadcn/ui component library, and the project's folder structure. Implemented client-side routing with React Router 7, protected routes with role-based access control, and the base layout with navigation, sidebar, and footer.

**Authentication UI (FE-003, FE-004)**

Built the login and registration pages with email + password, JWT token storage in localStorage, and Axios interceptors for automatic token refresh. Implemented OAuth callback handling for Google and 42 Intranet login flows.

**Password Recovery and Profile (FE-005)**

Built the forgot password flow (email submission, token-based reset), password change endpoint, and user profile page with avatar upload, bio editing, and online status display.

**Auction Listing and Creation (FE-006)**

Built the auction catalogue with grid/list view, category filters, search, and pagination. Implemented the multi-step auction creation wizard with image upload (binary or URL), price configuration, scheduling, and condition selection.

**Auction Detail and Bidding (FE-007)**

Built the auction detail page with live countdown timer, bid history, bid input with validation, buy-now button, and watcher count. Integrated WebSocket connection for real-time bid updates.

**Chat System (FE-009)**

Built the private messaging hub with conversation list, unread counts, and real-time message delivery via WebSocket. Implemented the auction room chat sidebar with WebSocket integration and typing indicators.

**Social System (FE-010)**

Built the friend request interface, friend list with online status indicators, and blocking/unblocking functionality.

**Domain Management (FE-011)**

Built the backoffice domain configuration page for managing auction categories and platform settings.

**Admin Dashboard (FE-012, co-owner)**

Co-built the backoffice admin dashboard with user management (list, search, ban/unban), auction management, role and permission assignment, and report review panels with role-based access control.

---

### jorcarva

**Role:** Frontend Developer

**Issues owned:** FE-008, FE-012 (co-owner)

**LiveKit Livestream Integration (FE-008)**

Built the livestream UI for both broadcasters and viewers. Implemented the LiveKit React component integration for real-time video streaming within auction pages, including stream creation, start/stop controls, viewer count display, and token-based authentication with the backend.

**Admin Dashboard (FE-012, co-owner)**

Co-built the backoffice admin dashboard, implementing the reports review panel and contributing to the user management interface with role-based access control.

---

### ferda-si

**Role:** Frontend Developer

**Issues owned:** FE-005 (co-owner)

**Password Recovery and Profile (FE-005, co-owner)**

Contributed to the password recovery flow and user profile implementation, working on form validation, API integration, and UI components for the forgot password and profile editing screens.

---

## Known Limitations

- **Privacy Policy and Terms of Service pages** — The 42 subject requires these pages to be accessible from the application. These pages are not yet implemented in the frontend. They must be added before evaluation.
- The `DELETE_CONTENT` moderation action supports `MESSAGE` and `PRIVATE_MESSAGE`. Auction and bid deletion requires additional service logic not yet implemented.
- The frontend does not implement automatic WebSocket reconnection on connection drop.
- Self-signed SSL certificates will trigger browser warnings on first visit — click "Advanced -> Proceed" to continue.
- LiveKit requires open UDP ports (5000-5100) for WebRTC peer connections. Some corporate firewalls block these ranges.

---

## License

This project was created for educational purposes as part of the 42 school curriculum. All rights reserved by the respective authors.
