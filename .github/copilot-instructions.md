# Caly AI Coding Instructions

## Project Overview
**Caly** is a production multi-tenant, multi-sector voice AI call agent platform for e-commerce customer support. It handles inbound calls in Hindi/Hinglish, performs agentic tasks (order lookup, cancellations, returns), and streams real-time audio processing with a parallel pipeline architecture.

**Tech Stack:** Node.js/Express + PostgreSQL + React + OpenAI Realtime API + Exotel (telephony)

---

## Critical Architecture Patterns

### 1. Multi-Tenancy & Multi-Sector Design
- **Tenant Isolation:** Every route enforces `authMiddleware` → `req.user.client_id` for data filtering
  - Example: `routes/analytics.js` line 20 uses `WHERE c.client_id = $1`
  - Use `enforceClientAccess()` middleware in `auth/authMiddleware.js` for individual resource verification
- **Sector-Based Agents:** 11+ sectors (healthcare, realestate, fintech, etc.) have dedicated agent classes in `agents/{sector}/`
  - `AgentFactory.js` registers 54+ agents with sector metadata and capabilities
  - `intentDetectorV2.js` loads intent patterns from DB per sector (caches to avoid repeated queries)
  - When adding routes: always include sector in where clauses and context

### 2. Module Resolution Pattern
- Use `const resolve = require('./utils/moduleResolver')` to resolve paths
- Example: `const db = require(resolve('db/postgres'))` not `require('../db/postgres')`
- **Why:** Fixes MODULE_NOT_FOUND on Railway where directory structure differs; works in both dev and production
- Apply consistently across all file imports

### 3. Error Handling & Resilience
- **Timeouts:** All external API calls wrapped with `withTimeout()` from `utils/timeoutUtil.js`
  - Sets 30-second timeout on analytics queries (see `routes/analytics.js` line 14-16)
  - Use: `await withTimeout((async () => { /* api call */ })(), 30000, 'operation name')`
- **Circuit Breaker:** Use `CircuitBreakerManager` from `utils/circuitBreaker.js` for Wasabi/Exotel/Shopify APIs
  - Prevents cascading failures; auto-resets after backoff window
- **Retry Logic:** `executeWithTimeoutAndRetry()` in `timeoutUtil.js` for transient failures

### 4. Agent Execution Model
- **Base Class:** All agents inherit from `BaseAgent.js` (EventEmitter-based)
  - Constructor: `new Agent(callId, initialData={}, clientId=null)` 
  - Must call `hasRequiredData()` before processing; emit events for state transitions
  - 30-second execution timeout; cancellation via `this.isCancelled` flag
- **Orchestration:** `orchestrator.js` chains agents sequentially; `orchestratorV2.js` for parallel execution
- **Factory Pattern:** `AgentFactory.registerAgent()` to register new agents with metadata (sector, capabilities, languages)

---

## Key Developer Workflows

### Database & Migrations
```bash
# Local development
npm run init-db          # Idempotent: creates schema, validates tables, runs migrations
npm run dev              # Start with nodemon for hot reload

# Testing
npm test                 # Jest with coverage
npm run test:watch      # Watch mode

# Production deployment
NODE_ENV=production npm run deploy  # Runs migrations then starts server
```

**Important:** 
- DB init in `db/initDatabase.js` uses robust SQL parsing (not naive semicolon split)
- All migrations in `migrations/` auto-run on startup; use `migrationsystem.js` to add new migrations
- Never assume table existence; always run init on new environments

### Frontend Development
```bash
# Frontend
cd Frontend
npm start                # Dev server on :3000
npm run build           # Production build
npm test                # React Testing Library tests
```

**Key Practice:** 
- Lazy-load pages with React.lazy() (see `App.js`) for code splitting
- Always wrap routes with `ProtectedRoute` or `OnboardingGuard` components
- Use `context/` for global state (Auth, Theme, I18n)

---

## Project-Specific Conventions

### 1. Logging
- Use `const logger = require(resolve('utils/logger'))` everywhere
- Call: `logger.info()`, `logger.warn()`, `logger.error()` with structured metadata
- Winston-based; console output + file rotation in dev; console only in production (Railway)
- Always log auth failures, external API errors, and state transitions

### 2. API Response Format
- Use `utils/apiResponse.js` for consistent responses: `{ success: bool, data: {}, error: string }`
- Status codes: 200 (OK), 400 (validation), 401 (auth), 403 (forbidden/tenant violation), 500 (server)
- Attach correlation IDs via `middleware/requestId.js` for tracing

### 3. Authentication & OAuth
- JWT tokens (HS256): generated in `auth/jwtUtils.js`, verified in `authMiddleware`
- Google OAuth flow in `config/passport-google.js`: auto-creates client+user if first signup, links if email exists
- **Critical Fix:** `password_hash` is nullable (NULL for OAuth users, hashed string for password users)
- Bearer token format: `Authorization: Bearer <JWT>`

### 4. Database Patterns
- All queries use parameterized statements: `db.query(sql, params)` to prevent SQL injection
- Multi-tenant queries always filter by `client_id`; double-check WHERE clauses
- Use connection pooling via `db/pooling.js` (not individual connections)
- Call `db.connect()` once on startup; pool auto-manages connections
- **Critical:** Schema column names must match exactly (see Pitfall #6 below for examples)

### 5. Real-Time & WebSocket
- `sessions/CallSessionManager.js` manages active call WebSocket connections
- Events: `call:start`, `call:audio`, `call:end` streamed to connected clients
- `middleware/requestId.js` ensures same correlation ID across HTTP and WebSocket layers

---

## Integration Points & External Dependencies

### Telephony (Exotel)
- Inbound: Webhook receives call data at `POST /api/calls/webhook`
- Audio stream: RTP/Opus frames sent as multipart or base64
- Outbound TTS: `POST https://api.exotel.com/v2/accounts/{SID}/calls` with `dial_music_url`
- See `routes/exotel.js` for webhook parsing; wrap Exotel calls with circuit breaker

### Storage (Wasabi S3)
- Recordings stored at `s3://caly-recordings/{clientId}/{callId}.wav`
- Use `services/wasabiStorage.js` with signed URLs for playback
- Always apply timeout + retry to S3 operations (transient network failures common)

### Shopify Integration
- Call `/admin/api/graphql.json` with OAuth token (per client)
- Agents look up orders, returns, inventory via Shopify APIs
- `agents/RetailAgents.js` has example implementation
- Rate limit: 2 requests/second per client (implement backoff)

### Analytics & Monitoring
- Sentry integration in `utils/sentryIntegration.js`: auto-captures errors and performance
- Initialize Sentry FIRST in `server.js` before any code runs
- APM middleware in `utils/apmMonitoring.js` for latency tracking
- KPI routes in `routes/analytics*.js` (8+ analytics endpoints for dashboard)

---

## Common Pitfalls & Fixes

1. **Tenant Isolation Violations**
   - ❌ Forget to filter by `client_id` → data leaks between companies
   - ✅ Always add `WHERE client_id = req.user.client_id` in SELECT; verify in PUT/DELETE

2. **Module Resolution Errors on Railway**
   - ❌ Use relative paths: `require('../../../utils/logger')`
   - ✅ Always use: `const resolve = require('./utils/moduleResolver'); const logger = require(resolve('utils/logger'))`

3. **Agent Timeouts in Production**
   - ❌ Blocking operations without timeout → cascading failures
   - ✅ Wrap all external calls: `await withTimeout(apiCall(), 30000, 'operation')`

4. **Database Connection Leaks**
   - ❌ Create new connections per query
   - ✅ Use pooling: `db.query()` auto-borrows/returns from pool

5. **OAuth Token Expiration**
   - ❌ Hardcode tokens in agents
   - ✅ Refresh tokens before expiry; store in DB with TTL; use JWTUtils.refreshToken()

6. **Schema Column Name Mismatches** ⚠️ CRITICAL FIX (Nov 30, 2025)
   - ❌ Code queries `is_available` column that doesn't exist → 💥 crashes
   - ✅ Schema uses `enabled` in `sector_agents`; code updated to use correct name
   - ❌ Code queries `call_status` column that doesn't exist → 💥 crashes
   - ✅ Schema uses `resolved` (boolean) in `calls`; added `escalated` column for escalation tracking
   - 🔧 Also added: `agent_type`, `team_member_id`, `team_id` to `calls` table for performance aggregation
   - 🔧 Also added: `success_rate`, `avg_handling_time` to `sector_agents` for routing optimization

---

## Testing & Verification Commands

```bash
# Quick health check
curl http://localhost:8080/health

# Test analytics KPIs (requires valid JWT)
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/analytics/kpis

# Run all tests with coverage
npm test -- --coverage

# Lint check
npm run lint

# Format code
npm run format
```

---

## File Structure Quick Reference

```
Backend/
├── agents/          # 54+ agents (BaseAgent.js, AgentFactory.js, sector-specific/)
├── auth/            # JWT, OAuth, authMiddleware
├── db/              # PostgreSQL driver, pooling, initDatabase.js, migrationsystem.js
├── routes/          # 25+ API endpoints (analytics, calls, clients, agents, etc.)
├── utils/           # logger, moduleResolver, timeoutUtil, circuitBreaker, etc.
├── services/        # Wasabi storage, external API wrappers
├── middleware/      # Request ID, auth, CORS, rate limiting
├── config/          # Passport strategies, constants
└── server.js        # Main entry point

Frontend/
├── src/
│   ├── pages/       # React pages (Dashboard, Analytics, Teams, etc.)
│   ├── components/  # Reusable UI (ProtectedRoute, ErrorBoundary, etc.)
│   ├── context/     # Global state (Auth, Theme, I18n)
│   ├── services/    # API client wrappers
│   ├── hooks/       # Custom React hooks
│   └── utils/       # Formatting, validation helpers
```

---

## Next Steps When Adding Features

1. **New Agent Type?** → Copy `agents/BaseAgent.js`, override `execute()`, register in `AgentFactory.js`
2. **New Route Endpoint?** → Add to `routes/`, apply `authMiddleware`, filter by `client_id`, use `apiResponse()` format
3. **New External API?** → Add to `services/`, wrap with `circuitBreaker` + `timeoutUtil`, log errors with Sentry
4. **New Database Table?** → Create migration in `migrations/`, run `npm run init-db`, test idempotency
5. **New Dashboard Metric?** → Add query to `routes/analytics*.js`, expose via `GET /api/analytics/{metric}`

