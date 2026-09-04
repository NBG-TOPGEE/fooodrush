# FoodRush — Food Delivery Platform

A production-style full-stack food delivery marketplace.

| Component | Location | Stack |
|---|---|---|
| Web API (runnable here) | `/` (root) | Next.js + TypeScript + Drizzle ORM |
| Database | `src/db/` | PostgreSQL |
| Java backend (run locally) | `backend/` | Spring Boot 3.2 (JDK 21) + JPA |

## Architecture

```
        Client (React / browser)
                 │
                 ▼
        Nginx (load balancer)          ← deploy/nginx.conf
         │            │
         ▼            ▼
   foodrush-web-1  foodrush-web-2      ← 2+ replicas (docker-compose)
         │            │
         └─────┬──────┘
               ▼
     PostgreSQL  +  Redis
```

## Load Balancing

The backend is horizontally scalable. Two things make real-time work correctly
across multiple instances:

1. **Redis pub/sub** (`src/lib/events.ts`) — real-time order/SSE events are
   fanned out over Redis so a client connected to replica A still receives
   updates published on replica B. With no `REDIS_URL`, it falls back to an
   in-memory bus for single-instance runs.
2. **Distributed rate limiting** (`src/lib/rate-limit.ts`) — auth throttling is
   enforced globally across replicas via Redis (atomic INCR/EXPIRE), falling
   back to in-memory otherwise.

The load balancer (Nginx) is SSE-aware: `proxy_buffering off`, a 1-hour read
timeout, and `least_conn` to spread long-lived connections. Sticky sessions are
**not** required because events are shared over Redis.

### Run the load-balanced stack

```bash
docker compose up --build
```

This starts PostgreSQL, Redis, **two** web replicas, and Nginx on port 80.

## Health & Readiness

- `GET /api/health` — liveness (process up, version, uptime, Redis status).
- `GET /api/health/ready` — readiness (checks DB + Redis); the load balancer
  removes an instance from the pool when this returns 503.

## Environment

Copy `.env.example` → `.env`. Set `REDIS_URL` in production to enable
cross-instance real-time and distributed rate limiting.

## CI/CD

`.github/workflows/ci.yml` runs lint → type check → build → Docker build on every
push/PR. Never merge code that fails these checks.
