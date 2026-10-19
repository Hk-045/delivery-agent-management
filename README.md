# Delivery Agent Management

I built this as a take-home assignment: a small admin tool for managing delivery agents. You can add agents, browse them with search, filters and pagination, open an agent's details, edit them, and delete them. Reads are cached in Redis, and the cache is cleared or refreshed whenever an agent changes.

- Live app: https://delivery-agent-management-eta.vercel.app
- API: https://delivery-agent-management-6hlw.onrender.com (try `/health`)

One heads-up: the API is on Render's free plan, so it sleeps after 15 minutes with no traffic. If the first page load hangs for a while, that's the server waking up. It should be quick after that.

## What it's built with

Backend: Node.js, Express 5, Prisma 6, PostgreSQL, Redis
Frontend: React with Vite, React Router, plain CSS
Hosting: Render for the API, database and Redis; Vercel for the frontend

A few words on why:

**PostgreSQL** because the data has a fixed shape and some rules I wanted the database itself to guarantee. Email and phone have to be unique, and status can only be `active` or `inactive`. If I only checked uniqueness in code, two requests arriving at the same moment could both pass the check and both insert. A unique constraint can't be raced like that.

**Prisma** mainly for migrations. Anyone can clone the repo and get the exact same table with one command. It also uses parameterized queries, so user input never ends up inside the SQL text. I went with Prisma 6, not 7: Prisma 7's default client generator only outputs TypeScript, and this project is plain JavaScript.

**Express** because it's small and doesn't hide anything. I could lay out the folders the way I wanted.

**Plain CSS** because the whole UI is a table, a form and a detail page. One stylesheet with a handful of CSS variables covers it, including the dark theme.

## How the code is laid out

```
backend/
  prisma/schema.prisma     the agents table
  prisma/migrations/       generated SQL migrations
  src/
    app.js                 sets up Express: middleware, routes, error handling
    server.js              connects to Postgres first, then starts listening
    config/env.js          reads env variables and stops at startup if one is missing
    lib/prisma.js          one shared Prisma client
    lib/redis.js           one shared Redis client
    routes/                which URL goes to which controller
    controllers/           the actual work: validate, clean up input, cache, query
    middleware/            404 handler and the central error handler
    utils/                 validation, cache helpers, AppError

frontend/src/
  pages/                   list, form (used for both create and edit), detail, not found
  components/              agent table, dark mode toggle
  utils/constants.js       the API URL
```

`app.js` doesn't call `listen()`. That's `server.js`'s job. Keeping them apart means the app can be imported in a test without starting a real server on a port.

## Running it locally

You'll need:

- Node.js 20.6 or newer (I used 24). The dev script uses Node's `--env-file` flag, which older versions don't have.
- PostgreSQL
- Redis. A local one works (`docker run -p 6379:6379 redis`, Homebrew, or WSL on Windows), and so does a free hosted one like Upstash, which is what I used on Windows. If Redis isn't reachable, the app still runs, just without caching.

**1. Create the database**

```sql
CREATE DATABASE delivery_agents;
```

**2. Start the backend**

```bash
cd backend
cp .env.example .env
```

Then edit `.env`:

```
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/delivery_agents
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:5173
```

- `REDIS_URL`: hosted Redis like Upstash needs `rediss://` (two s's, for TLS).
- `CORS_ORIGIN`: no slash at the end, or the browser will block requests (see below).
- `NODE_ENV=development`: Prisma prints every SQL query to the terminal, which is handy for seeing what's going on.

Install, create the table, run:

```bash
npm install
npx prisma migrate deploy
npm run dev
```

If something is missing from `.env`, the server refuses to start and tells you which variable. I'd rather it fail right away than fail later on a random request.

**3. Start the frontend** (in another terminal)

```bash
cd frontend
cp .env.example .env     # contains VITE_API_URL=http://localhost:4000
npm install
npm run dev
```

Then open http://localhost:5173.

## The API

Everything lives under `/api/agents`:

```
POST    /api/agents         create          201
GET     /api/agents         list            200
GET     /api/agents/:id     get one         200
PATCH   /api/agents/:id     update fields   200
DELETE  /api/agents/:id     delete          204
```

An agent has `fullName`, `phone`, `email`, `serviceArea` and `status` (`active` or `inactive`, default `active`). The database fills in `id`, `createdAt` and `updatedAt`.

The list endpoint takes optional query params: `status`, `serviceArea` (exact match), `search` (part of the name, case doesn't matter), `page` (from 1) and `limit` (1 to 100, default 20). It returns the agents plus paging info:

```json
{
  "data": [ ... ],
  "pagination": { "page": 1, "limit": 20, "total": 3, "totalPages": 1 }
}
```

PATCH only changes the fields you send, so two people editing different fields of the same agent don't wipe out each other's changes.

### Cleaning up input

Before saving, names and areas are trimmed, emails are lowercased, and phone numbers are converted to one format, `+919876543210`. So `98765 43210`, `09876543210` and `+91-98765-43210` are all treated as the same number. I added this after noticing that `RAVI@gmail.com` went straight past the unique constraint even though `ravi@gmail.com` already existed. To Postgres those are just two different strings.

Fields that aren't part of an agent, like `id` or `createdAt`, are rejected, so a client can't pick its own id.

### Errors

Every error comes back in the same shape, so the frontend only has to handle one format:

```json
{ "error": { "message": "This email is already in use" } }
```

- 400: bad input, an id that isn't a valid UUID, or broken JSON
- 404: agent doesn't exist, or unknown route
- 409: email or phone already belongs to another agent
- 500: something unexpected. The client only sees "Something went wrong"; the real error goes to the server log.

There's one error handler at the end of the middleware chain, so controllers don't need try/catch. It also translates Prisma's error codes: `P2002` (unique constraint) becomes 409, and `P2025` (record not found on update or delete) becomes 404. For "get one", Prisma returns `null` instead of throwing, so that controller throws the 404 itself.

## Caching

The pattern is cache-aside: look in Redis first, and if it's not there, read from Postgres and put a copy in Redis with a TTL. Postgres is always the source of truth. Redis only ever holds copies, so losing it isn't a problem.

What gets cached:

- `agent:{id}`: a single agent, for 5 minutes
- `agents:list:v{version}:status=..:area=..:search=..:page=..:limit=..`: a full list response including pagination, for 60 seconds
- `agents:list:version`: just a counter (explained below)

The list key is built from the query params in a fixed order, so `?status=active&page=2` and `?page=2&status=active` end up as the same key.

### Keeping it in sync

A single agent is simple. When it's updated or deleted, I delete its key, and the next read fetches fresh data. The database write always happens first; doing it the other way round leaves a gap where another request can put the old value back in the cache.

I delete the key rather than writing the new value into it. If two updates run at the same time, their cache writes can land in the opposite order from their database writes, and the older value would win in Redis. A delete doesn't carry a value, so the order doesn't matter.

Lists were the tricky part. One agent changing can affect a lot of cached lists: different pages, filters, searches. Finding them all would mean scanning Redis, and `KEYS` blocks Redis while it runs. So instead, every list key includes a version number. Creating, updating or deleting an agent runs one `INCR` on the version. New requests build keys with the new number, miss, and load fresh data. The old keys are never read again and expire within a minute. It throws away more than strictly necessary, but writes are rare compared to reads in a tool like this, and it's very hard to get wrong.

If Redis goes down, nothing breaks. The cache helpers catch every Redis error and treat it as a miss, so requests just go to Postgres. The server also starts fine without Redis. It won't start without Postgres, though.

You can watch it work: `GET /api/agents` and `GET /api/agents/:id` send back an `X-Cache` header. The first request is `MISS`, the next one is `HIT`. Update the agent, and the next read is a `MISS` again, with the new data.

## Trying it out

Through the UI is easiest. With curl (on Windows PowerShell, type `curl.exe`, not `curl`):

```bash
# create an agent
curl -i -X POST http://localhost:4000/api/agents \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Ravi Kumar","phone":"98765 43210","email":"Ravi@Gmail.com","serviceArea":"Koramangala"}'
# 201. The phone comes back as +919876543210 and the email in lowercase.

# send the same thing again
# 409, already in use

# list it twice and look at X-Cache: MISS, then HIT
curl -i "http://localhost:4000/api/agents?status=active"

# update, then fetch: MISS, with the new status
curl -i -X PATCH http://localhost:4000/api/agents/<id> \
  -H "Content-Type: application/json" \
  -d '{"status":"inactive"}'
curl -i http://localhost:4000/api/agents/<id>

# delete, then fetch: 404
curl -i -X DELETE http://localhost:4000/api/agents/<id>
curl -i http://localhost:4000/api/agents/<id>
```

A few error cases to poke at:

- `/api/agents/abc`: 400, not a valid id
- `/api/agents/<a real-looking uuid that doesn't exist>`: 404
- `/api/agents?page=-5`: 400
- creating with `"phone": "123"`: 400
- creating with an extra `"id": "x"`: 400

## Deployment

The API, Postgres and Redis are all on Render, in the same region (Singapore), and the API talks to the database and Redis over Render's internal URLs. Keeping them together matters: a cache in a different region can end up slower than just querying the database.

For the API service, the root directory is `backend`. The build command is:

```
npm install --include=dev && npx prisma generate && npx prisma migrate deploy
```

`--include=dev` is there because the Prisma CLI is a dev dependency, and npm skips those when `NODE_ENV=production`. Migrations run during the build because the free plan doesn't offer a separate pre-deploy step. The start command is `npm start`.

The frontend is on Vercel with `frontend` as the root directory and `VITE_API_URL` pointing at the API. `vercel.json` sends every path to `index.html`; without it, refreshing a page like `/agents/123` would give a 404, because that file doesn't exist on the server. Only React Router knows about it.

Two things to know: Vite bakes `VITE_API_URL` into the build, so changing it means rebuilding the frontend. And Render's free Postgres is deleted 30 days after it's created.

## Things that tripped me up

Writing these down because each one taught me something:

- **The first Render deploy failed** with "Could not read package.json". The path in the error showed npm was running at the repo root. Since this is a monorepo, the backend's `package.json` lives in `backend/`. Setting the root directory fixed it.
- **Upstash kept closing the connection** ("Socket closed unexpectedly") until I noticed the URL I'd copied started with `redis://`. Upstash only accepts TLS, which needs `rediss://`.
- **The deployed frontend showed "Failed to fetch"** at first. The browser console said the API only allowed `http://localhost:5173`. Updating `CORS_ORIGIN` to the Vercel URL fixed it. It also has to match exactly: a trailing slash is enough to break it.
- **Uppercase emails got past the unique constraint**, which is why emails are lowercased before saving (see "Cleaning up input").
- **Prisma refused to run my first migration** because it found a table it didn't create: a practice table I'd made by hand in psql earlier. Prisma calls this drift. I dropped the table, and since then I only change the schema through migrations.

## What I'd do with more time

- **Login for managers.** It wasn't in the brief, so right now anyone with the link can edit data. I'd add hashed passwords, a token issued on login, middleware that returns 401 without it, and roles so that only some users can delete.
- **A separate `service_areas` table** with a foreign key. Right now service area is free text, so "Bangalore" and "Bengaluru" both count as different areas.
- **Optimistic locking**, with a version column on each agent, so that if two people edit the same field at once, the second one gets a "this was changed, please refresh" message instead of silently overwriting.
- **Automated tests** for the API and the cache behavior. For now the flows above are what I tested by hand.
- **Soft delete** once agents are tied to deliveries, so history isn't lost. Deleted agents would need partial unique indexes so their email and phone can be reused.
- **Cursor-based pagination** if the table gets large. Offset paging gets slower the deeper you go.